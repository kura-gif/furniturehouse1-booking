/**
 * Stripe Webhook エンドポイント
 * 決済イベントを非同期で処理
 *
 * 処理するイベント:
 * - payment_intent.succeeded: 決済成功
 * - payment_intent.payment_failed: 決済失敗
 * - charge.refunded: 返金処理
 * - payment_intent.canceled: 決済キャンセル
 */

import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  try {
    // 1. Webhook署名を検証
    const sig = getHeader(event, 'stripe-signature')
    const body = await readRawBody(event)

    if (!sig || !body) {
      throw createError({
        statusCode: 400,
        message: 'Invalid request: Missing signature or body',
      })
    }

    // 2. Stripeイベントを構築（署名検証を含む）
    let stripeEvent: Stripe.Event

    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        sig,
        config.stripeWebhookSecret
      )
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message)
      throw createError({
        statusCode: 400,
        message: `Webhook Error: ${err.message}`,
      })
    }

    console.log('✅ Webhook received:', stripeEvent.type)

    // 3. イベントタイプに応じて処理を分岐
    const db = getFirestoreAdmin()

    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(
          stripeEvent.data.object as Stripe.PaymentIntent,
          db
        )
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(
          stripeEvent.data.object as Stripe.PaymentIntent,
          db
        )
        break

      case 'charge.refunded':
        await handleRefund(
          stripeEvent.data.object as Stripe.Charge,
          db
        )
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(
          stripeEvent.data.object as Stripe.PaymentIntent,
          db
        )
        break

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    // 4. Webhookログを記録
    await db.collection('webhookLogs').add({
      eventType: stripeEvent.type,
      eventId: stripeEvent.id,
      processed: true,
      timestamp: FieldValue.serverTimestamp(),
    })

    return { received: true }
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error)

    // エラーログを記録
    try {
      const db = getFirestoreAdmin()
      await db.collection('webhookLogs').add({
        eventType: 'error',
        error: error.message,
        processed: false,
        timestamp: FieldValue.serverTimestamp(),
      })
    } catch (logError) {
      console.error('Failed to log webhook error:', logError)
    }

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Webhook processing failed',
    })
  }
})

/**
 * 決済成功時の処理
 */
async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  db: FirebaseFirestore.Firestore
) {
  console.log('💳 Payment succeeded:', paymentIntent.id)

  // Payment IntentIDで予約を検索
  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    console.warn('⚠️ Booking not found for payment intent:', paymentIntent.id)
    return
  }

  const bookingDoc = bookingQuery.docs[0]
  const bookingData = bookingDoc.data()

  // 予約ステータスを更新
  await bookingDoc.ref.update({
    status: 'confirmed',
    paymentStatus: 'paid',
    paidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log('✅ Booking confirmed:', bookingDoc.id)

  // TODO: 確認メールを送信
  // await sendBookingConfirmationEmail(bookingData)
}

/**
 * 決済失敗時の処理
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  db: FirebaseFirestore.Firestore
) {
  console.log('❌ Payment failed:', paymentIntent.id)

  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    console.warn('⚠️ Booking not found for payment intent:', paymentIntent.id)
    return
  }

  const bookingDoc = bookingQuery.docs[0]

  // 予約ステータスを更新
  await bookingDoc.ref.update({
    status: 'payment_failed',
    paymentStatus: 'failed',
    paymentError: paymentIntent.last_payment_error?.message || 'Unknown error',
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log('⚠️ Booking payment failed:', bookingDoc.id)

  // TODO: エラーメールを送信
  // await sendPaymentFailedEmail(bookingDoc.data())
}

/**
 * 返金処理
 */
async function handleRefund(
  charge: Stripe.Charge,
  db: FirebaseFirestore.Firestore
) {
  console.log('💰 Refund processed:', charge.id)

  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) {
    console.warn('⚠️ No payment intent ID in charge')
    return
  }

  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    console.warn('⚠️ Booking not found for payment intent:', paymentIntentId)
    return
  }

  const bookingDoc = bookingQuery.docs[0]

  // 予約ステータスを更新
  await bookingDoc.ref.update({
    status: 'refunded',
    paymentStatus: 'refunded',
    refundedAt: FieldValue.serverTimestamp(),
    refundAmount: charge.amount_refunded,
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log('✅ Booking refunded:', bookingDoc.id)

  // TODO: 返金完了メールを送信
  // await sendRefundConfirmationEmail(bookingDoc.data())
}

/**
 * 決済キャンセル時の処理
 */
async function handlePaymentCanceled(
  paymentIntent: Stripe.PaymentIntent,
  db: FirebaseFirestore.Firestore
) {
  console.log('🚫 Payment canceled:', paymentIntent.id)

  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    console.warn('⚠️ Booking not found for payment intent:', paymentIntent.id)
    return
  }

  const bookingDoc = bookingQuery.docs[0]

  // 予約ステータスを更新
  await bookingDoc.ref.update({
    status: 'cancelled',
    paymentStatus: 'canceled',
    canceledAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log('✅ Booking canceled:', bookingDoc.id)
}
