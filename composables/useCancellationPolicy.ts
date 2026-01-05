import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  limit
} from 'firebase/firestore'
import type { CancellationPolicy, CancellationPolicyRule, RefundCalculation } from '~/types'

/**
 * キャンセルポリシー管理用composable
 */
export const useCancellationPolicy = () => {
  const { $db } = useNuxtApp()

  // デフォルトポリシー（Firestoreに設定がない場合に使用）
  const defaultPolicy: CancellationPolicy = {
    name: '標準',
    description: 'チェックイン5日前まで全額返金、3日前まで50%返金',
    rules: [
      { daysBeforeCheckIn: 5, refundPercentage: 100 },
      { daysBeforeCheckIn: 3, refundPercentage: 50 },
      { daysBeforeCheckIn: 0, refundPercentage: 0 }
    ],
    isActive: true
  }

  /**
   * 有効なキャンセルポリシーを取得
   */
  const getActivePolicy = async (): Promise<CancellationPolicy> => {
    try {
      const policiesRef = collection($db, 'cancellationPolicies')
      const q = query(policiesRef, where('isActive', '==', true), limit(1))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return defaultPolicy
      }

      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as CancellationPolicy
    } catch (error) {
      console.error('キャンセルポリシー取得エラー:', error)
      return defaultPolicy
    }
  }

  /**
   * キャンセルポリシーを保存
   */
  const savePolicy = async (policy: CancellationPolicy): Promise<string> => {
    const policiesRef = collection($db, 'cancellationPolicies')

    // 既存の有効なポリシーを無効化
    if (policy.isActive) {
      const activeQuery = query(policiesRef, where('isActive', '==', true))
      const activeSnapshot = await getDocs(activeQuery)
      for (const docSnap of activeSnapshot.docs) {
        if (docSnap.id !== policy.id) {
          await updateDoc(doc($db, 'cancellationPolicies', docSnap.id), {
            isActive: false,
            updatedAt: serverTimestamp()
          })
        }
      }
    }

    if (policy.id) {
      // 更新
      const policyRef = doc($db, 'cancellationPolicies', policy.id)
      await updateDoc(policyRef, {
        name: policy.name,
        description: policy.description || '',
        rules: policy.rules,
        isActive: policy.isActive,
        updatedAt: serverTimestamp()
      })
      return policy.id
    } else {
      // 新規作成
      const newDocRef = doc(policiesRef)
      await setDoc(newDocRef, {
        name: policy.name,
        description: policy.description || '',
        rules: policy.rules,
        isActive: policy.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return newDocRef.id
    }
  }

  /**
   * チェックイン日までの日数を計算
   */
  const getDaysBeforeCheckIn = (checkInDate: Date): number => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const checkIn = new Date(checkInDate)
    checkIn.setHours(0, 0, 0, 0)

    const diffTime = checkIn.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  /**
   * 適用されるルールを取得
   */
  const getApplicableRule = (
    rules: CancellationPolicyRule[],
    daysBeforeCheckIn: number
  ): CancellationPolicyRule => {
    // ルールを日数の降順でソート
    const sortedRules = [...rules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn)

    // 該当するルールを探す
    for (const rule of sortedRules) {
      if (daysBeforeCheckIn >= rule.daysBeforeCheckIn) {
        return rule
      }
    }

    // デフォルト: 返金なし
    return { daysBeforeCheckIn: 0, refundPercentage: 0 }
  }

  /**
   * 返金額を計算
   */
  const calculateRefund = async (
    checkInDate: Date,
    totalAmount: number
  ): Promise<RefundCalculation> => {
    const policy = await getActivePolicy()
    const daysBeforeCheckIn = getDaysBeforeCheckIn(checkInDate)
    const appliedRule = getApplicableRule(policy.rules, daysBeforeCheckIn)

    const refundPercentage = appliedRule.refundPercentage
    const refundAmount = Math.floor(totalAmount * (refundPercentage / 100))

    return {
      originalAmount: totalAmount,
      refundPercentage,
      refundAmount,
      daysBeforeCheckIn,
      appliedRule,
      isCancellable: true // チェックイン後はキャンセル不可にする場合はここで判定
    }
  }

  /**
   * 同期的に返金額を計算（ポリシーを渡す場合）
   */
  const calculateRefundSync = (
    policy: CancellationPolicy,
    checkInDate: Date,
    totalAmount: number
  ): RefundCalculation => {
    const daysBeforeCheckIn = getDaysBeforeCheckIn(checkInDate)
    const appliedRule = getApplicableRule(policy.rules, daysBeforeCheckIn)

    const refundPercentage = appliedRule.refundPercentage
    const refundAmount = Math.floor(totalAmount * (refundPercentage / 100))

    return {
      originalAmount: totalAmount,
      refundPercentage,
      refundAmount,
      daysBeforeCheckIn,
      appliedRule,
      isCancellable: daysBeforeCheckIn >= 0
    }
  }

  /**
   * ポリシーの説明文を生成
   */
  const generatePolicyDescription = (rules: CancellationPolicyRule[]): string => {
    const sortedRules = [...rules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn)

    return sortedRules
      .map((rule) => {
        if (rule.refundPercentage === 100) {
          return `チェックイン${rule.daysBeforeCheckIn}日前まで: 全額返金`
        } else if (rule.refundPercentage === 0) {
          return `チェックイン${rule.daysBeforeCheckIn}日前以降: 返金なし`
        } else {
          return `チェックイン${rule.daysBeforeCheckIn}日前まで: ${rule.refundPercentage}%返金`
        }
      })
      .join('\n')
  }

  return {
    defaultPolicy,
    getActivePolicy,
    savePolicy,
    getDaysBeforeCheckIn,
    getApplicableRule,
    calculateRefund,
    calculateRefundSync,
    generatePolicyDescription
  }
}
