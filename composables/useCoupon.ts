import { ref } from 'vue'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  increment,
  Timestamp
} from 'firebase/firestore'
import type { Coupon } from '~/types'

/**
 * クーポンの管理と検証（Firestore対応版）
 */
export const useCoupon = () => {
  const { $db } = useNuxtApp()
  const $firestore = $db as ReturnType<typeof import('firebase/firestore').getFirestore>
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  /**
   * クーポンコードを検証（Firestoreから取得）
   */
  async function validateCoupon(
    couponCode: string,
    totalAmount: number
  ): Promise<{ isValid: boolean; coupon?: Coupon; discountRate?: number; discountAmount?: number; error?: string }> {
    error.value = null
    isLoading.value = true

    if (!couponCode) {
      isLoading.value = false
      return { isValid: false, error: 'クーポンコードを入力してください' }
    }

    try {
      // Firestoreからクーポンを検索
      const couponsRef = collection($firestore, 'coupons')
      const q = query(
        couponsRef,
        where('code', '==', couponCode.toUpperCase()),
        where('isActive', '==', true)
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return { isValid: false, error: 'クーポンコードが見つかりません' }
      }

      const couponDoc = snapshot.docs[0]
      const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon

      // 有効期間チェック
      const now = new Date()
      const validFrom = coupon.validFrom instanceof Timestamp
        ? coupon.validFrom.toDate()
        : new Date(coupon.validFrom as any)
      const validUntil = coupon.validUntil instanceof Timestamp
        ? coupon.validUntil.toDate()
        : new Date(coupon.validUntil as any)

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
    } catch (e: any) {
      console.error('クーポン検証エラー:', e)
      error.value = 'クーポンの検証に失敗しました'
      return { isValid: false, error: 'クーポンの検証に失敗しました' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * クーポンの使用回数をインクリメント（Firestore）
   */
  async function incrementCouponUsage(couponId: string): Promise<void> {
    try {
      const couponRef = doc($firestore, 'coupons', couponId)
      await updateDoc(couponRef, {
        usageCount: increment(1),
        updatedAt: Timestamp.now()
      })
      console.log('✅ クーポン使用回数を更新:', couponId)
    } catch (e) {
      console.error('クーポン使用回数の更新エラー:', e)
    }
  }

  return {
    error,
    isLoading,
    validateCoupon,
    incrementCouponUsage
  }
}
