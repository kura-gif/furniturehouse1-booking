/**
 * Payment Intent作成テストAPI（Firebase Admin不要）
 * 開発環境での料金計算とStripe統合のテスト用
 */

import Stripe from 'stripe'
import { calculateBookingAmount, DEFAULT_PRICING } from '~/server/utils/pricing'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  try {
    const body = await readBody(event)
    const { checkInDate, checkOutDate, guestCount, couponDiscount = 0 } = body

    // 入力検証
    if (!checkInDate || !checkOutDate || !guestCount) {
      throw createError({
        statusCode: 400,
        message: 'checkInDate, checkOutDate, guestCount are required',
      })
    }

    // サーバーサイドで金額を計算
    const calculatedAmount = calculateBookingAmount(
      new Date(checkInDate),
      new Date(checkOutDate),
      guestCount,
      DEFAULT_PRICING,
      couponDiscount
    )

    console.log('💰 Calculated amount:', calculatedAmount)

    // Payment Intentを作成
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculatedAmount,
      currency: 'jpy',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        checkInDate,
        checkOutDate,
        guestCount: guestCount.toString(),
        calculatedAmount: calculatedAmount.toString(),
        test: 'true',
      },
    })

    console.log('✅ Payment Intent created:', paymentIntent.id)

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: calculatedAmount,
      breakdown: {
        baseAmount: calculatedAmount + couponDiscount - DEFAULT_PRICING.cleaningFee,
        cleaningFee: DEFAULT_PRICING.cleaningFee,
        couponDiscount,
        total: calculatedAmount,
      },
    }
  } catch (error: any) {
    console.error('❌ Payment Intent creation error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '決済の準備に失敗しました',
    })
  }
})
