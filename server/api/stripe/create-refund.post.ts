/**
 * Stripe返金APIエンドポイント
 * 管理者が予約をキャンセルして返金処理を行う
 *
 * POST /api/stripe/create-refund
 * Body: { bookingId: string, reason?: string, amount?: number }
 */

import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  try {
    // 1. リクエストボディを取得
    const body = await readBody(event)
    const { bookingId, reason, amount } = body

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: '予約IDが必要です',
      })
    }

    console.log('💰 Refund request:', { bookingId, reason, amount })

    // 2. Firestoreから予約情報を取得
    const db = getFirestoreAdmin()
    const bookingDoc = await db.collection('bookings').doc(bookingId).get()

    if (!bookingDoc.exists) {
      throw createError({
        statusCode: 404,
        message: '予約が見つかりません',
      })
    }

    const booking = bookingDoc.data()!

    // 3. 返金可能かチェック
    if (!booking.stripePaymentIntentId) {
      throw createError({
        statusCode: 400,
        message: 'この予約にはStripe決済情報がありません',
      })
    }

    if (booking.paymentStatus === 'refunded') {
      throw createError({
        statusCode: 400,
        message: 'この予約は既に返金済みです',
      })
    }

    if (booking.paymentStatus !== 'paid') {
      throw createError({
        statusCode: 400,
        message: '決済が完了していない予約は返金できません',
      })
    }

    // 4. Stripe Payment Intentを取得して返金額を決定
    const paymentIntent = await stripe.paymentIntents.retrieve(
      booking.stripePaymentIntentId
    )

    // 返金額（指定がなければ全額返金）
    const refundAmount = amount || paymentIntent.amount

    // 既に返金された額をチェック
    const charges = await stripe.charges.list({
      payment_intent: booking.stripePaymentIntentId,
      limit: 1,
    })

    if (charges.data.length === 0) {
      throw createError({
        statusCode: 400,
        message: '決済情報が見つかりません',
      })
    }

    const charge = charges.data[0]
    const availableForRefund = charge.amount - charge.amount_refunded

    if (refundAmount > availableForRefund) {
      throw createError({
        statusCode: 400,
        message: `返金可能額（¥${availableForRefund.toLocaleString()}）を超えています`,
      })
    }

    // 5. Stripe返金を実行
    console.log('🔄 Creating refund:', {
      chargeId: charge.id,
      amount: refundAmount,
      reason,
    })

    const refund = await stripe.refunds.create({
      charge: charge.id,
      amount: refundAmount,
      reason: reason === 'duplicate' ? 'duplicate' :
              reason === 'fraudulent' ? 'fraudulent' :
              'requested_by_customer',
      metadata: {
        bookingId,
        bookingReference: booking.bookingReference || '',
        requestedAt: new Date().toISOString(),
      },
    })

    console.log('✅ Refund created:', {
      refundId: refund.id,
      amount: refund.amount,
      status: refund.status,
    })

    // 6. 予約ステータスを更新（Webhookでも更新されるが、即時反映のため）
    const isFullRefund = refundAmount === paymentIntent.amount

    await bookingDoc.ref.update({
      status: isFullRefund ? 'refunded' : 'confirmed',
      paymentStatus: isFullRefund ? 'refunded' : 'paid',
      refundedAt: FieldValue.serverTimestamp(),
      refundAmount: refundAmount,
      refundReason: reason || 'customer_request',
      refundId: refund.id,
      updatedAt: FieldValue.serverTimestamp(),
    })

    // 7. 返金ログを記録
    await db.collection('refundLogs').add({
      bookingId,
      bookingReference: booking.bookingReference,
      stripeRefundId: refund.id,
      amount: refundAmount,
      isFullRefund,
      reason: reason || 'customer_request',
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      createdAt: FieldValue.serverTimestamp(),
    })

    // 8. 返金完了メールを送信
    try {
      const baseUrl = config.public.siteUrl || 'http://localhost:3000'
      await $fetch(`${baseUrl}/api/emails/send-refund-confirmation`, {
        method: 'POST',
        headers: {
          'x-internal-secret': config.internalApiSecret,
        },
        body: {
          to: booking.guestEmail,
          bookingReference: booking.bookingReference,
          guestName: booking.guestName,
          refundAmount: refundAmount,
        },
      })
      console.log('✅ Refund confirmation email sent')
    } catch (emailError: any) {
      console.error('⚠️ Failed to send refund email:', emailError.message)
      // メール送信失敗は返金処理自体には影響させない
    }

    return {
      success: true,
      refundId: refund.id,
      amount: refundAmount,
      status: refund.status,
      isFullRefund,
    }
  } catch (error: any) {
    console.error('❌ Refund error:', error)

    // Stripeエラーの詳細をログ
    if (error.type === 'StripeInvalidRequestError') {
      console.error('Stripe API Error:', error.message)
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '返金処理に失敗しました',
    })
  }
})
