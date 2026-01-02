import { ref } from 'vue'
import type { Coupon } from '~/types'

/**
 * クーポンの管理と検証
 */
export const useCoupon = () => {
  const error = ref<string | null>(null)

  /**
   * クーポンコードを検証
   */
  function validateCoupon(
    couponCode: string,
    totalAmount: number
  ): { isValid: boolean; coupon?: Coupon; discountRate?: number; discountAmount?: number; error?: string } {
    error.value = null

    if (!couponCode) {
      return { isValid: false, error: 'クーポンコードを入力してください' }
    }

    // ローカルストレージからクーポンを読み込み
    let coupons: Coupon[] = []
    try {
      const stored = localStorage.getItem('coupons')
      if (stored) {
        coupons = JSON.parse(stored)
      }
    } catch (e) {
      console.error('クーポンの読み込みエラー:', e)
      return { isValid: false, error: 'クーポンの読み込みに失敗しました' }
    }

    // クーポンを検索
    const coupon = coupons.find(c => c.code === couponCode.toUpperCase())

    if (!coupon) {
      return { isValid: false, error: 'クーポンコードが見つかりません' }
    }

    // 有効性チェック
    if (!coupon.isActive) {
      return { isValid: false, error: 'このクーポンは無効です' }
    }

    // 有効期間チェック
    const now = new Date()
    const validFrom = coupon.validFrom.toDate ? coupon.validFrom.toDate() : new Date(coupon.validFrom)
    const validUntil = coupon.validUntil.toDate ? coupon.validUntil.toDate() : new Date(coupon.validUntil)

    if (now < validFrom) {
      return { isValid: false, error: 'このクーポンはまだ利用できません' }
    }

    if (now > validUntil) {
      return { isValid: false, error: 'このクーポンの有効期限が切れています' }
    }

    // 使用回数制限チェック
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { isValid: false, error: 'このクーポンは使用回数の上限に達しています' }
    }

    // 最低利用金額チェック
    if (coupon.minAmount && totalAmount < coupon.minAmount) {
      return {
        isValid: false,
        error: `このクーポンは¥${coupon.minAmount.toLocaleString()}以上の予約でのみ利用できます`
      }
    }

    // 割引額を計算
    let discountAmount = 0
    let discountRate = 0

    if (coupon.discountType === 'percentage') {
      // 割引率の場合
      discountRate = coupon.discountValue / 100
      discountAmount = Math.floor(totalAmount * discountRate)

      // 最大割引額の制限
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
    } else {
      // 固定額の場合
      discountAmount = Math.min(coupon.discountValue, totalAmount)
      discountRate = discountAmount / totalAmount
    }

    return {
      isValid: true,
      coupon,
      discountRate,
      discountAmount
    }
  }

  /**
   * クーポンの使用回数をインクリメント
   */
  function incrementCouponUsage(couponCode: string): void {
    try {
      const stored = localStorage.getItem('coupons')
      if (!stored) return

      const coupons: Coupon[] = JSON.parse(stored)
      const coupon = coupons.find(c => c.code === couponCode.toUpperCase())

      if (coupon) {
        coupon.usageCount++
        localStorage.setItem('coupons', JSON.stringify(coupons))
      }
    } catch (e) {
      console.error('クーポン使用回数の更新エラー:', e)
    }
  }

  return {
    error,
    validateCoupon,
    incrementCouponUsage
  }
}
