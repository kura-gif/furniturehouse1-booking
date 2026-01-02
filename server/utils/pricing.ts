/**
 * 料金計算ユーティリティ
 * セキュリティ: サーバーサイドで金額を検証・計算
 */

export interface PricingRule {
  basePrice: number // 基本料金（平日1泊）
  weekendSurcharge: number // 週末追加料金
  extraGuestCharge: number // 追加ゲスト料金
  maxIncludedGuests: number // 基本料金に含まれる最大人数
  cleaningFee: number // クリーニング料金
}

/**
 * 予約金額を計算
 * @param checkInDate チェックイン日
 * @param checkOutDate チェックアウト日
 * @param guestCount ゲスト人数
 * @param pricingRule 料金設定
 * @param couponDiscount クーポン割引額
 * @returns 合計金額
 */
export const calculateBookingAmount = (
  checkInDate: Date,
  checkOutDate: Date,
  guestCount: number,
  pricingRule: PricingRule,
  couponDiscount: number = 0
): number => {
  // 宿泊数を計算
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (nights < 1) {
    throw new Error('チェックアウト日はチェックイン日より後でなければなりません')
  }

  if (guestCount < 1) {
    throw new Error('ゲスト数は1名以上である必要があります')
  }

  let totalAmount = 0

  // 各泊の料金を計算（平日・週末で料金が異なる）
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkInDate)
    currentDate.setDate(currentDate.getDate() + i)
    const dayOfWeek = currentDate.getDay()

    // 金曜日（5）と土曜日（6）は週末料金
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
    const nightPrice = pricingRule.basePrice + (isWeekend ? pricingRule.weekendSurcharge : 0)

    totalAmount += nightPrice
  }

  // 追加ゲスト料金を計算
  if (guestCount > pricingRule.maxIncludedGuests) {
    const extraGuests = guestCount - pricingRule.maxIncludedGuests
    totalAmount += extraGuests * pricingRule.extraGuestCharge
  }

  // クリーニング料金を追加
  totalAmount += pricingRule.cleaningFee

  // クーポン割引を適用
  totalAmount -= couponDiscount

  // 金額が負にならないようにする
  return Math.max(totalAmount, 0)
}

/**
 * デフォルトの料金設定
 */
export const DEFAULT_PRICING: PricingRule = {
  basePrice: 18000, // 平日1泊18,000円
  weekendSurcharge: 3000, // 週末+3,000円
  extraGuestCharge: 3000, // 追加ゲスト1名につき3,000円
  maxIncludedGuests: 6, // 6名まで基本料金に含む
  cleaningFee: 5000, // クリーニング料金5,000円
}

/**
 * 金額を検証（クライアントから送信された金額との差をチェック）
 * @param calculatedAmount サーバーで計算した金額
 * @param clientAmount クライアントから送信された金額
 * @param tolerance 許容誤差（デフォルト1円）
 */
export const validateAmount = (
  calculatedAmount: number,
  clientAmount: number,
  tolerance: number = 1
): boolean => {
  const diff = Math.abs(calculatedAmount - clientAmount)
  return diff <= tolerance
}
