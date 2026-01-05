/**
 * 予約審査承認API
 * - 与信確保済みのPayment Intentをキャプチャ（決済確定）
 * - 予約ステータスをconfirmedに更新
 * - ゲストに承認通知メールを送信
 *
 * POST /api/bookings/approve
 * Body: { bookingId: string }
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
    const { bookingId } = body

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: '予約IDが必要です',
      })
    }

    console.log('✅ Approving booking:', bookingId)

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

    if (!booking.stripePaymentIntentId) {
      throw createError({
        statusCode: 400,
        message: '決済情報がありません',
      })
    }

    // 3. Payment Intentをキャプチャ（決済確定）
    console.log('💳 Capturing payment:', booking.stripePaymentIntentId)

    const paymentIntent = await stripe.paymentIntents.capture(
      booking.stripePaymentIntentId
    )

    if (paymentIntent.status !== 'succeeded') {
      throw createError({
        statusCode: 400,
        message: `決済の確定に失敗しました（ステータス: ${paymentIntent.status}）`,
      })
    }

    console.log('✅ Payment captured successfully')

    // 4. 予約ステータスを更新
    await bookingRef.update({
      status: 'confirmed',
      paymentStatus: 'paid',
      reviewStatus: 'approved',
      reviewedAt: FieldValue.serverTimestamp(),
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // 5. 審査ログを記録
    await db.collection('reviewLogs').add({
      bookingId,
      bookingReference: booking.bookingReference,
      action: 'approved',
      adminId: admin.uid,
      adminName: admin.displayName || admin.email,
      createdAt: FieldValue.serverTimestamp(),
    })

    // 6. 承認通知メールを送信
    try {
      const baseUrl = config.public.siteUrl || 'http://localhost:3000'

      // 日付をフォーマット
      const checkInDate = booking.checkInDate?.toDate?.() || new Date(booking.checkInDate)
      const checkOutDate = booking.checkOutDate?.toDate?.() || new Date(booking.checkOutDate)
      const formatDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

      await $fetch(`${baseUrl}/api/emails/send-booking-approved`, {
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
        },
      })
      console.log('✅ Approval email sent to:', booking.guestEmail)
    } catch (emailError: any) {
      console.error('⚠️ Failed to send approval email:', emailError.message)
      // メール送信失敗は承認処理自体には影響させない
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
          type: 'booking_approved',
          bookingId,
          bookingReference: booking.bookingReference,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          totalAmount: booking.totalAmount,
        },
      })
    } catch (emailError: any) {
      console.error('⚠️ Failed to send admin notification:', emailError.message)
    }

    return {
      success: true,
      bookingId,
      status: 'confirmed',
      paymentStatus: 'paid',
      message: '予約を承認し、決済を確定しました',
    }
  } catch (error: any) {
    console.error('❌ Approval error:', error)

    // Stripeエラーの詳細処理
    if (error.type === 'StripeInvalidRequestError') {
      throw createError({
        statusCode: 400,
        message: `決済エラー: ${error.message}`,
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '予約の承認に失敗しました',
    })
  }
})
