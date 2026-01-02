import Stripe from 'stripe'

/**
 * Payment Intent更新API
 *
 * ⚠️ セキュリティ: このAPIはCSRF保護されています
 * - 既存のPayment IntentのmetadataのみをAPI更新可能
 * - CSRFトークンによる認証が必要
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  try {
    const body = await readBody(event)
    const { paymentIntentId, metadata } = body

    if (!paymentIntentId) {
      throw createError({
        statusCode: 400,
        message: 'Payment Intent IDが必要です'
      })
    }

    // metadataの検証（許可されたキーのみ）
    const allowedKeys = [
      'bookingId',
      'bookingReference',
      'guestEmail',
      'guestName',
      'guestPhone',
      'checkIn',
      'checkOut',
      'guests',
      'totalAmount'
    ]
    const metadataKeys = Object.keys(metadata || {})
    const invalidKeys = metadataKeys.filter(key => !allowedKeys.includes(key))

    if (invalidKeys.length > 0) {
      throw createError({
        statusCode: 400,
        message: `許可されていないmetadataキー: ${invalidKeys}`
      })
    }

    // Payment Intentのmetadataを更新
    const paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
      metadata
    })

    return {
      success: true,
      paymentIntentId: paymentIntent.id
    }
  } catch (error: any) {
    console.error('Payment Intent更新エラー:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Payment Intentの更新に失敗しました'
    })
  }
})
