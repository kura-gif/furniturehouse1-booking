/**
 * 予約変更API
 *
 * 管理者が予約の日程・人数を変更する
 * 金額が変更になる場合は差額精算または返金が必要
 *
 * POST /api/bookings/modify
 * Headers: Authorization: Bearer <Firebase ID Token>
 * Body: {
 *   bookingId: string,
 *   newCheckInDate?: string (YYYY-MM-DD),
 *   newCheckOutDate?: string (YYYY-MM-DD),
 *   newGuestCount?: number,
 *   reason: string
 * }
 */

import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'
import { requireAdmin } from '~/server/utils/auth'
import { calculateBookingAmount, DEFAULT_PRICING } from '~/server/utils/pricing'

interface ModifyRequest {
  bookingId: string
  newCheckInDate?: string
  newCheckOutDate?: string
  newGuestCount?: number
  reason: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  try {
    // 管理者認証
    const admin = await requireAdmin(event)

    const body = await readBody<ModifyRequest>(event)
    const { bookingId, newCheckInDate, newCheckOutDate, newGuestCount, reason } = body

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: '予約IDは必須です'
      })
    }

    if (!reason) {
      throw createError({
        statusCode: 400,
        message: '変更理由は必須です'
      })
    }

    // 少なくとも1つの変更が必要
    if (!newCheckInDate && !newCheckOutDate && newGuestCount === undefined) {
      throw createError({
        statusCode: 400,
        message: '変更内容を指定してください'
      })
    }

    const db = getFirestoreAdmin()
    const bookingRef = db.collection('bookings').doc(bookingId)
    const bookingDoc = await bookingRef.get()

    if (!bookingDoc.exists) {
      throw createError({
        statusCode: 404,
        message: '予約が見つかりません'
      })
    }

    const booking = bookingDoc.data()!

    // 変更可能なステータスかチェック
    if (!['confirmed', 'pending_review'].includes(booking.status)) {
      throw createError({
        statusCode: 400,
        message: 'この予約は変更できません（ステータス: ' + booking.status + '）'
      })
    }

    // 現在の値を取得
    const currentCheckIn = booking.checkInDate?.toDate
      ? booking.checkInDate.toDate()
      : new Date(booking.checkInDate)
    const currentCheckOut = booking.checkOutDate?.toDate
      ? booking.checkOutDate.toDate()
      : new Date(booking.checkOutDate)
    const currentGuestCount = booking.guestCount

    // 新しい値を決定
    const finalCheckIn = newCheckInDate ? new Date(newCheckInDate) : currentCheckIn
    const finalCheckOut = newCheckOutDate ? new Date(newCheckOutDate) : currentCheckOut
    const finalGuestCount = newGuestCount !== undefined ? newGuestCount : currentGuestCount

    // 日程の妥当性チェック
    if (finalCheckOut <= finalCheckIn) {
      throw createError({
        statusCode: 400,
        message: 'チェックアウト日はチェックイン日より後にしてください'
      })
    }

    // 人数チェック
    if (finalGuestCount < 1 || finalGuestCount > 6) {
      throw createError({
        statusCode: 400,
        message: '宿泊人数は1〜6名の範囲で指定してください'
      })
    }

    // 新しい金額を計算
    const newAmount = calculateBookingAmount(
      finalCheckIn,
      finalCheckOut,
      finalGuestCount,
      DEFAULT_PRICING,
      booking.couponDiscount || 0
    )

    const currentAmount = booking.totalAmount
    const amountDifference = newAmount - currentAmount

    // 変更履歴を作成
    const modificationRecord = {
      modifiedAt: FieldValue.serverTimestamp(),
      modifiedBy: admin.uid,
      modifiedByName: admin.displayName || admin.email,
      reason,
      changes: {
        checkInDate: newCheckInDate ? {
          from: currentCheckIn.toISOString().split('T')[0],
          to: newCheckInDate
        } : null,
        checkOutDate: newCheckOutDate ? {
          from: currentCheckOut.toISOString().split('T')[0],
          to: newCheckOutDate
        } : null,
        guestCount: newGuestCount !== undefined ? {
          from: currentGuestCount,
          to: newGuestCount
        } : null,
        amount: amountDifference !== 0 ? {
          from: currentAmount,
          to: newAmount,
          difference: amountDifference
        } : null
      }
    }

    // 金額差額の処理
    let paymentAction: 'none' | 'refund' | 'additional_charge' = 'none'
    let refundAmount = 0
    let additionalChargeAmount = 0

    if (amountDifference < 0) {
      // 金額が減少 → 差額を返金
      paymentAction = 'refund'
      refundAmount = Math.abs(amountDifference)

      if (booking.stripePaymentIntentId && booking.paymentStatus === 'paid') {
        try {
          const refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentIntentId,
            amount: refundAmount,
            reason: 'requested_by_customer',
            metadata: {
              bookingId,
              type: 'modification_refund',
              modifiedBy: admin.uid
            }
          })
          console.log('✅ Partial refund created:', refund.id)
        } catch (stripeError: any) {
          console.error('❌ Stripe refund error:', stripeError)
          throw createError({
            statusCode: 500,
            message: '返金処理に失敗しました: ' + stripeError.message
          })
        }
      }
    } else if (amountDifference > 0) {
      // 金額が増加 → 追加請求が必要（手動対応フラグを設定）
      paymentAction = 'additional_charge'
      additionalChargeAmount = amountDifference
      // 注: 自動追加決済は複雑なため、管理者に手動対応を促す
    }

    // Firestoreを更新
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
      totalAmount: newAmount
    }

    if (newCheckInDate) {
      updateData.checkInDate = new Date(newCheckInDate)
    }
    if (newCheckOutDate) {
      updateData.checkOutDate = new Date(newCheckOutDate)
    }
    if (newGuestCount !== undefined) {
      updateData.guestCount = newGuestCount
    }

    // 追加請求が必要な場合はフラグを設定
    if (paymentAction === 'additional_charge') {
      updateData.additionalPaymentRequired = true
      updateData.additionalPaymentAmount = additionalChargeAmount
    }

    await bookingRef.update(updateData)

    // 変更履歴を保存
    await bookingRef.collection('modifications').add(modificationRecord)

    console.log(`✅ Booking ${bookingId} modified by ${admin.uid}`)

    // ゲストに変更通知メールを送信
    try {
      const formatDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

      await $fetch('/api/emails/send-booking-modified', {
        method: 'POST',
        headers: {
          'x-internal-secret': config.internalApiSecret,
        },
        body: {
          to: booking.guestEmail,
          bookingReference: booking.bookingReference,
          bookingToken: booking.bookingToken,
          guestName: booking.guestName,
          changes: {
            checkInDate: newCheckInDate ? {
              from: formatDate(currentCheckIn),
              to: formatDate(finalCheckIn)
            } : null,
            checkOutDate: newCheckOutDate ? {
              from: formatDate(currentCheckOut),
              to: formatDate(finalCheckOut)
            } : null,
            guestCount: newGuestCount !== undefined ? {
              from: currentGuestCount,
              to: newGuestCount
            } : null
          },
          previousAmount: currentAmount,
          newAmount: newAmount,
          amountDifference: amountDifference,
          refundAmount: paymentAction === 'refund' ? refundAmount : 0,
          additionalChargeAmount: paymentAction === 'additional_charge' ? additionalChargeAmount : 0,
          reason: reason
        },
      })
      console.log('✅ Guest modification notification sent')
    } catch (emailError: any) {
      console.error('⚠️ Guest email send error:', emailError.message)
    }

    // 管理者に変更完了通知を送信
    try {
      await $fetch('/api/emails/send-admin-notification', {
        method: 'POST',
        headers: {
          'x-internal-secret': config.internalApiSecret,
        },
        body: {
          type: 'booking_modified',
          bookingId,
          bookingReference: booking.bookingReference,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          totalAmount: newAmount,
        },
      })
      console.log('✅ Admin modification notification sent')
    } catch (emailError: any) {
      console.error('⚠️ Admin email send error:', emailError.message)
    }

    return {
      success: true,
      bookingId,
      changes: {
        checkIn: newCheckInDate ? {
          from: currentCheckIn.toISOString().split('T')[0],
          to: newCheckInDate
        } : null,
        checkOut: newCheckOutDate ? {
          from: currentCheckOut.toISOString().split('T')[0],
          to: newCheckOutDate
        } : null,
        guestCount: newGuestCount !== undefined ? {
          from: currentGuestCount,
          to: newGuestCount
        } : null
      },
      amount: {
        previous: currentAmount,
        new: newAmount,
        difference: amountDifference
      },
      paymentAction,
      refundAmount: paymentAction === 'refund' ? refundAmount : 0,
      additionalChargeRequired: paymentAction === 'additional_charge' ? additionalChargeAmount : 0,
      message: paymentAction === 'additional_charge'
        ? `予約を変更しました。追加料金 ¥${additionalChargeAmount.toLocaleString()} の請求が必要です。`
        : paymentAction === 'refund'
          ? `予約を変更しました。¥${refundAmount.toLocaleString()} を返金しました。`
          : '予約を変更しました。'
    }
  } catch (error: any) {
    console.error('❌ Booking modification error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '予約変更に失敗しました'
    })
  }
})
