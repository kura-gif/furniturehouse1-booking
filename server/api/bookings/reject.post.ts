/**
 * 予約審査却下API
 * - 与信確保済みのPayment Intentをキャンセル（与信解放）
 * - 予約ステータスをrejectedに更新
 * - ゲストに却下通知メールを送信
 *
 * POST /api/bookings/reject
 * Body: { bookingId: string, reason: string, category?: string }
 * Headers: Authorization: Bearer <Firebase ID Token>
 */

import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  try {
    // 管理者認証を確認
    const admin = await requireAdmin(event)
    console.log('👤 Admin authenticated:', admin.uid, admin.displayName)

    const body = await readBody(event)
    const { bookingId, reason, category } = body

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: '予約IDが必要です',
      })
    }

    if (!reason) {
      throw createError({
        statusCode: 400,
        message: '却下理由が必要です',
      })
    }

    console.log('❌ Rejecting booking:', bookingId)

    // 1. 予約情報を取得
    const db = getFirestoreAdmin()
    const bookingRef = db.collection('bookings').doc(bookingId)
    const bookingDoc = await bookingRef.get()

    if (!bookingDoc.exists) {
      throw createError({
        statusCode: 404,
        message: '予約が見つかりません',
      })
    }

    const booking = bookingDoc.data()!

    // 2. 審査可能な状態かチェック
    if (booking.reviewStatus !== 'pending_review') {
      throw createError({
        statusCode: 400,
        message: `この予約は審査できません（現在のステータス: ${booking.reviewStatus || booking.status}）`,
      })
    }

    // 3. Payment Intentをキャンセル（与信解放）
    if (booking.stripePaymentIntentId) {
      console.log('💳 Canceling payment intent:', booking.stripePaymentIntentId)

      try {
        await stripe.paymentIntents.cancel(booking.stripePaymentIntentId)
        console.log('✅ Payment intent canceled (authorization released)')
      } catch (stripeError: any) {
        // 既にキャンセル済みの場合はスキップ
        if (stripeError.code !== 'payment_intent_unexpected_state') {
          throw stripeError
        }
        console.log('⚠️ Payment intent already canceled')
      }
    }

    // 4. 予約ステータスを更新
    await bookingRef.update({
      status: 'rejected',
      paymentStatus: 'pending', // 与信解放済み
      reviewStatus: 'rejected',
      reviewedAt: FieldValue.serverTimestamp(),
      rejectionReason: reason,
      rejectionCategory: category || 'other',
      updatedAt: FieldValue.serverTimestamp(),
    })

    // 5. 審査ログを記録
    await db.collection('reviewLogs').add({
      bookingId,
      bookingReference: booking.bookingReference,
      action: 'rejected',
      reason,
      category: category || 'other',
      adminId: admin.uid,
      adminName: admin.displayName || admin.email,
      createdAt: FieldValue.serverTimestamp(),
    })

    // 6. 却下通知メールを送信
    try {
      const baseUrl = config.public.siteUrl || 'http://localhost:3000'

      // 日付をフォーマット
      const checkInDate = booking.checkInDate?.toDate?.() || new Date(booking.checkInDate)
      const checkOutDate = booking.checkOutDate?.toDate?.() || new Date(booking.checkOutDate)
      const formatDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

      await $fetch(`${baseUrl}/api/emails/send-booking-rejected`, {
        method: 'POST',
        headers: {
          'x-internal-secret': config.internalApiSecret,
        },
        body: {
          to: booking.guestEmail,
          bookingId,
          bookingReference: booking.bookingReference,
          bookingToken: booking.bookingToken,
          guestName: booking.guestName,
          checkInDate: formatDate(checkInDate),
          checkOutDate: formatDate(checkOutDate),
          totalAmount: booking.totalAmount,
          rejectionReason: reason,
        },
      })
      console.log('✅ Rejection email sent to:', booking.guestEmail)
    } catch (emailError: any) {
      console.error('⚠️ Failed to send rejection email:', emailError.message)
      // メール送信失敗は却下処理自体には影響させない
    }

    // 7. 管理者にも通知
    try {
      const baseUrl = config.public.siteUrl || 'http://localhost:3000'
      await $fetch(`${baseUrl}/api/emails/send-admin-notification`, {
        method: 'POST',
        headers: {
          'x-internal-secret': config.internalApiSecret,
        },
        body: {
          type: 'booking_rejected',
          bookingId,
          bookingReference: booking.bookingReference,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          rejectionReason: reason,
        },
      })
    } catch (emailError: any) {
      console.error('⚠️ Failed to send admin notification:', emailError.message)
    }

    return {
      success: true,
      bookingId,
      status: 'rejected',
      message: '予約を却下し、与信を解放しました',
    }
  } catch (error: any) {
    console.error('❌ Rejection error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '予約の却下に失敗しました',
    })
  }
})
