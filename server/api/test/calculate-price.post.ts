/**
 * 料金計算テストAPI
 * サーバーサイドの料金計算ロジックをテスト
 */

import { calculateBookingAmount, DEFAULT_PRICING, validateAmount } from '~/server/utils/pricing'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { checkInDate, checkOutDate, guestCount, couponDiscount = 0, clientAmount } = body

    // 入力検証
    if (!checkInDate || !checkOutDate || !guestCount) {
      throw createError({
        statusCode: 400,
        message: 'checkInDate, checkOutDate, guestCount are required',
      })
    }

    // 料金計算
    const calculatedAmount = calculateBookingAmount(
      new Date(checkInDate),
      new Date(checkOutDate),
      guestCount,
      DEFAULT_PRICING,
      couponDiscount
    )

    // クライアント金額が提供されている場合は検証
    let amountValid = null
    if (clientAmount !== undefined) {
      amountValid = validateAmount(calculatedAmount, clientAmount)
    }

    // 宿泊数を計算
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      success: true,
      calculatedAmount,
      breakdown: {
        nights,
        basePrice: DEFAULT_PRICING.basePrice,
        weekendSurcharge: DEFAULT_PRICING.weekendSurcharge,
        extraGuestCharge: DEFAULT_PRICING.extraGuestCharge,
        maxIncludedGuests: DEFAULT_PRICING.maxIncludedGuests,
        cleaningFee: DEFAULT_PRICING.cleaningFee,
        guestCount,
        couponDiscount,
      },
      validation: amountValid !== null ? {
        clientAmount,
        calculatedAmount,
        isValid: amountValid,
        difference: clientAmount !== undefined ? Math.abs(calculatedAmount - clientAmount) : null,
      } : null,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '料金計算に失敗しました',
    })
  }
})
