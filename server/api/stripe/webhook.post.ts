/**
 * Stripe Webhook エンドポイント
 * 決済イベントを非同期で処理
 *
 * 処理するイベント:
 * - payment_intent.amount_capturable_updated: 与信確保成功（審査フロー）
 * - payment_intent.succeeded: 決済成功（審査承認後のcapture）
 * - payment_intent.payment_failed: 決済失敗
 * - charge.refunded: 返金処理
 * - payment_intent.canceled: 決済キャンセル（審査却下）
 */

import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'
import { stripeLogger as logger } from '~/server/utils/logger'

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
      logger.error('Webhook signature verification failed:', err.message)
      throw createError({
        statusCode: 400,
        message: `Webhook Error: ${err.message}`,
      })
    }

    logger.info('Webhook received:', stripeEvent.type, stripeEvent.id)

    // 3. イベントタイプに応じて処理を分岐
    const db = getFirestoreAdmin()

    // 4. 冪等性チェック（同じイベントIDが既に処理済みかどうか）
    const existingLog = await db
      .collection('webhookLogs')
      .where('eventId', '==', stripeEvent.id)
      .where('processed', '==', true)
      .limit(1)
      .get()

    if (!existingLog.empty) {
      logger.debug('Event already processed, skipping:', stripeEvent.id)
      return { received: true, skipped: true, reason: 'already_processed' }
    }

    switch (stripeEvent.type) {
      case 'payment_intent.amount_capturable_updated':
        // 与信確保成功（審査フロー: カード認証成功、審査待ち）
        await handleAuthorizationSuccess(
          stripeEvent.data.object as Stripe.PaymentIntent,
          db
        )
        break

      case 'payment_intent.succeeded':
        // 決済成功（審査承認後のcaptureによる確定）
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
        logger.debug(`Unhandled event type: ${stripeEvent.type}`)
    }

    // 4. Webhookログを記録
    await db.collection('webhookLogs').add({
      eventType: stripeEvent.type,
      eventId: stripeEvent.id,
      processed: true,
      timestamp: FieldValue.serverTimestamp(),
    })

    return { received: true }
  } catch (error: unknown) {
    logger.error('Webhook processing error:', error)

    // エラーログを記録
    try {
      const db = getFirestoreAdmin()
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await db.collection('webhookLogs').add({
        eventType: 'error',
        error: errorMessage,
        processed: false,
        timestamp: FieldValue.serverTimestamp(),
      })
    } catch (_logError) {
      logger.error('Failed to log webhook error')
    }

    const statusCode = error instanceof Error && 'statusCode' in error
      ? (error as { statusCode: number }).statusCode
      : 500
    throw createError({
      statusCode,
      message: 'Webhook processing failed',
    })
  }
})

/**
 * 与信確保成功時の処理（審査フロー）
 * カード認証が成功し、審査待ち状態になる
 */
async function handleAuthorizationSuccess(
  paymentIntent: Stripe.PaymentIntent,
  db: FirebaseFirestore.Firestore
) {
  const config = useRuntimeConfig()
  logger.info('Authorization succeeded:', paymentIntent.id)

  // Payment IntentIDで予約を検索
  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    logger.warn('Booking not found for payment intent:', paymentIntent.id)
    return
  }

  const bookingDoc = bookingQuery.docs[0]
  const bookingData = bookingDoc.data()

  // 予約ステータスを「審査中」に更新
  await bookingDoc.ref.update({
    status: 'pending_review',
    reviewStatus: 'pending_review',
    paymentStatus: 'authorized',
    authorizedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  logger.event('booking_pending_review', { bookingId: bookingDoc.id })

  // ゲストへ予約リクエスト受付メール送信（審査中の旨を通知）
  try {
    const checkInDate = bookingData.checkInDate?.toDate?.() || new Date(bookingData.checkInDate)
    const checkOutDate = bookingData.checkOutDate?.toDate?.() || new Date(bookingData.checkOutDate)
    const formatDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

    const baseUrl = config.public.siteUrl || 'http://localhost:3000'
    await $fetch(`${baseUrl}/api/emails/send-booking-confirmation`, {
      method: 'POST',
      headers: {
        'x-internal-secret': config.internalApiSecret
      },
      body: {
        to: bookingData.guestEmail,
        bookingId: bookingDoc.id,
        bookingReference: bookingData.bookingReference,
        bookingToken: bookingData.bookingToken,
        guestName: bookingData.guestName,
        checkInDate: formatDate(checkInDate),
        checkOutDate: formatDate(checkOutDate),
        totalAmount: bookingData.totalAmount,
        isPendingReview: true // 審査中フラグ
      }
    })
    logger.debug('Booking request email sent to:', bookingData.guestEmail)

    // 管理者への新規予約リクエスト通知
    await $fetch(`${baseUrl}/api/emails/send-admin-notification`, {
      method: 'POST',
      headers: {
        'x-internal-secret': config.internalApiSecret
      },
      body: {
        type: 'new_booking_request',
        bookingId: bookingDoc.id,
        bookingReference: bookingData.bookingReference,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        checkInDate: formatDate(checkInDate),
        checkOutDate: formatDate(checkOutDate),
        guestCount: bookingData.guestCount,
        totalAmount: bookingData.totalAmount,
        notes: bookingData.notes
      }
    })
    logger.debug('Admin notification sent for review')
  } catch (emailError: any) {
    logger.error('Email sending failed:', emailError.message)
    await db.collection('emailLogs').add({
      type: 'booking_request_email_failed',
      bookingId: bookingDoc.id,
      error: emailError.message,
      timestamp: FieldValue.serverTimestamp(),
    })
  }
}

/**
 * 決済成功時の処理（審査承認後のcapture）
 * 審査承認API経由でcaptureされた後に発火
 */
async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  db: FirebaseFirestore.Firestore
) {
  logger.info('Payment captured/succeeded:', paymentIntent.id)

  // Payment IntentIDで予約を検索
  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    logger.warn('Booking not found for payment intent:', paymentIntent.id)
    return
  }

  const bookingDoc = bookingQuery.docs[0]
  const bookingData = bookingDoc.data()

  // 既にconfirmedの場合はスキップ（承認APIで既に更新済み）
  if (bookingData.status === 'confirmed' && bookingData.paymentStatus === 'paid') {
    logger.debug('Booking already confirmed, skipping webhook update')
    return
  }

  // 予約ステータスを更新（フォールバック）
  await bookingDoc.ref.update({
    status: 'confirmed',
    paymentStatus: 'paid',
    paidAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  logger.event('booking_confirmed', { bookingId: bookingDoc.id })
}

/**
 * 決済失敗時の処理
 */
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  db: FirebaseFirestore.Firestore
) {
  const config = useRuntimeConfig()
  logger.warn('Payment failed:', paymentIntent.id)

  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    logger.warn('Booking not found for payment intent:', paymentIntent.id)
    return
  }

  const bookingDoc = bookingQuery.docs[0]
  const bookingData = bookingDoc.data()

  // エラーメッセージを日本語に変換
  const errorMessage = translateStripeError(
    paymentIntent.last_payment_error?.code,
    paymentIntent.last_payment_error?.message
  )

  // 予約ステータスを更新
  await bookingDoc.ref.update({
    status: 'payment_failed',
    paymentStatus: 'failed',
    paymentError: errorMessage,
    paymentErrorCode: paymentIntent.last_payment_error?.code || 'unknown',
    failedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  logger.event('booking_payment_failed', { bookingId: bookingDoc.id })

  // 決済失敗メールを送信
  try {
    const baseUrl = config.public.siteUrl || 'http://localhost:3000'
    const checkInDate = bookingData.checkInDate?.toDate?.() || new Date(bookingData.checkInDate)
    const checkOutDate = bookingData.checkOutDate?.toDate?.() || new Date(bookingData.checkOutDate)
    const formatDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

    await $fetch(`${baseUrl}/api/emails/send-payment-failed`, {
      method: 'POST',
      headers: {
        'x-internal-secret': config.internalApiSecret
      },
      body: {
        to: bookingData.guestEmail,
        bookingReference: bookingData.bookingReference,
        guestName: bookingData.guestName,
        checkInDate: formatDate(checkInDate),
        checkOutDate: formatDate(checkOutDate),
        totalAmount: bookingData.totalAmount,
        errorMessage,
        retryUrl: `${baseUrl}/booking`
      }
    })
    logger.debug('Payment failed email sent to:', bookingData.guestEmail)

    // 管理者にも通知
    await $fetch(`${baseUrl}/api/emails/send-admin-notification`, {
      method: 'POST',
      headers: {
        'x-internal-secret': config.internalApiSecret
      },
      body: {
        type: 'payment_failed',
        bookingId: bookingDoc.id,
        bookingReference: bookingData.bookingReference,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        totalAmount: bookingData.totalAmount,
        errorMessage
      }
    })
    logger.debug('Admin notification sent for payment failure')
  } catch (emailError: any) {
    logger.error('Payment failed email sending failed:', emailError.message)
    await db.collection('emailLogs').add({
      type: 'payment_failed_email_error',
      bookingId: bookingDoc.id,
      error: emailError.message,
      timestamp: FieldValue.serverTimestamp(),
    })
  }
}

/**
 * Stripeエラーコードを日本語に変換
 */
function translateStripeError(code?: string, fallbackMessage?: string): string {
  const errorMessages: Record<string, string> = {
    'card_declined': 'カードが拒否されました。別のカードをお試しください。',
    'insufficient_funds': '残高不足です。別のカードをお試しください。',
    'expired_card': 'カードの有効期限が切れています。',
    'incorrect_cvc': 'セキュリティコード（CVC）が正しくありません。',
    'incorrect_number': 'カード番号が正しくありません。',
    'processing_error': '処理中にエラーが発生しました。しばらく経ってから再度お試しください。',
    'authentication_required': '3Dセキュア認証が必要です。認証を完了してください。',
    'payment_intent_authentication_failure': '本人認証に失敗しました。カード会社にお問い合わせください。',
    'rate_limit': '短時間に多くのリクエストがありました。しばらく経ってから再度お試しください。',
  }

  if (code && errorMessages[code]) {
    return errorMessages[code]
  }

  return fallbackMessage || 'カード決済処理中にエラーが発生しました。'
}

/**
 * 返金処理
 */
async function handleRefund(
  charge: Stripe.Charge,
  db: FirebaseFirestore.Firestore
) {
  const config = useRuntimeConfig()
  logger.info('Refund processed:', charge.id)

  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) {
    logger.warn('No payment intent ID in charge')
    return
  }

  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    logger.warn('Booking not found for payment intent:', paymentIntentId)
    return
  }

  const bookingDoc = bookingQuery.docs[0]
  const bookingData = bookingDoc.data()

  // 予約ステータスを更新
  await bookingDoc.ref.update({
    status: 'refunded',
    paymentStatus: 'refunded',
    refundedAt: FieldValue.serverTimestamp(),
    refundAmount: charge.amount_refunded,
    updatedAt: FieldValue.serverTimestamp(),
  })

  logger.event('booking_refunded', { bookingId: bookingDoc.id, amount: charge.amount_refunded })

  // 返金完了メールを送信
  try {
    const baseUrl = config.public.siteUrl || 'http://localhost:3000'

    // ゲストへ返金通知メール送信
    await $fetch(`${baseUrl}/api/emails/send-refund-confirmation`, {
      method: 'POST',
      headers: {
        'x-internal-secret': config.internalApiSecret
      },
      body: {
        to: bookingData.guestEmail,
        bookingReference: bookingData.bookingReference,
        guestName: bookingData.guestName,
        refundAmount: charge.amount_refunded
      }
    })
    logger.debug('Refund confirmation email sent to:', bookingData.guestEmail)

    // 管理者へ返金完了通知
    await $fetch(`${baseUrl}/api/emails/send-admin-notification`, {
      method: 'POST',
      headers: {
        'x-internal-secret': config.internalApiSecret
      },
      body: {
        type: 'refund_completed',
        bookingId: bookingDoc.id,
        bookingReference: bookingData.bookingReference,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        refundAmount: charge.amount_refunded
      }
    })
    logger.debug('Admin refund notification sent')
  } catch (emailError: any) {
    logger.error('Refund email sending failed:', emailError.message)
  }
}

/**
 * 決済キャンセル時の処理
 */
async function handlePaymentCanceled(
  paymentIntent: Stripe.PaymentIntent,
  db: FirebaseFirestore.Firestore
) {
  logger.info('Payment canceled:', paymentIntent.id)

  const bookingQuery = await db
    .collection('bookings')
    .where('stripePaymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (bookingQuery.empty) {
    logger.warn('Booking not found for payment intent:', paymentIntent.id)
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

  logger.event('booking_canceled', { bookingId: bookingDoc.id })
}
