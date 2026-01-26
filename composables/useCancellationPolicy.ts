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
  limit,
} from "firebase/firestore";
import type {
  CancellationPolicy,
  CancellationPolicyRule,
  RefundCalculation,
} from "~/types";

/**
 * キャンセルポリシー表示用テキスト（settings/facility用）
 */
export interface CancelPolicyTexts {
  cancelPolicyFree: string;
  cancelPolicyFreeDesc: string;
  cancelPolicyPartial: string;
  cancelPolicyPartialDesc: string;
  cancelPolicyNoShow: string;
  cancelPolicyNoShowDesc: string;
  cancelPolicyProcedure: string;
  cancelPolicyExceptions: string;
  cancelPolicyNotes: string;
}

/**
 * キャンセルポリシー管理用composable
 */
export const useCancellationPolicy = () => {
  const { $db } = useNuxtApp();

  // デフォルトポリシー（Firestoreに設定がない場合に使用）
  const defaultPolicy: CancellationPolicy = {
    name: "標準",
    description: "チェックイン5日前まで全額返金、3日前まで50%返金",
    rules: [
      { daysBeforeCheckIn: 5, refundPercentage: 100 },
      { daysBeforeCheckIn: 3, refundPercentage: 50 },
      { daysBeforeCheckIn: 0, refundPercentage: 0 },
    ],
    isActive: true,
  };

  /**
   * 有効なキャンセルポリシーを取得
   */
  const getActivePolicy = async (): Promise<CancellationPolicy> => {
    if (!$db) return defaultPolicy;
    try {
      const policiesRef = collection($db, "cancellationPolicies");
      const q = query(policiesRef, where("isActive", "==", true), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return defaultPolicy;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CancellationPolicy;
    } catch (error) {
      console.error("キャンセルポリシー取得エラー:", error);
      return defaultPolicy;
    }
  };

  /**
   * キャンセルポリシーを保存
   */
  const savePolicy = async (policy: CancellationPolicy): Promise<string> => {
    if (!$db) throw new Error("Firestore is not initialized");
    const policiesRef = collection($db, "cancellationPolicies");

    // 既存の有効なポリシーを無効化
    if (policy.isActive) {
      const activeQuery = query(policiesRef, where("isActive", "==", true));
      const activeSnapshot = await getDocs(activeQuery);
      for (const docSnap of activeSnapshot.docs) {
        if (docSnap.id !== policy.id) {
          await updateDoc(doc($db, "cancellationPolicies", docSnap.id), {
            isActive: false,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    if (policy.id) {
      // 更新
      const policyRef = doc($db, "cancellationPolicies", policy.id);
      await updateDoc(policyRef, {
        name: policy.name,
        description: policy.description || "",
        rules: policy.rules,
        isActive: policy.isActive,
        updatedAt: serverTimestamp(),
      });
      return policy.id;
    } else {
      // 新規作成
      const newDocRef = doc(policiesRef);
      await setDoc(newDocRef, {
        name: policy.name,
        description: policy.description || "",
        rules: policy.rules,
        isActive: policy.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return newDocRef.id;
    }
  };

  /**
   * チェックイン日までの日数を計算
   */
  const getDaysBeforeCheckIn = (checkInDate: Date): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    const diffTime = checkIn.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  /**
   * 適用されるルールを取得
   */
  const getApplicableRule = (
    rules: CancellationPolicyRule[],
    daysBeforeCheckIn: number,
  ): CancellationPolicyRule => {
    // ルールを日数の降順でソート
    const sortedRules = [...rules].sort(
      (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn,
    );

    // 該当するルールを探す
    for (const rule of sortedRules) {
      if (daysBeforeCheckIn >= rule.daysBeforeCheckIn) {
        return rule;
      }
    }

    // デフォルト: 返金なし
    return { daysBeforeCheckIn: 0, refundPercentage: 0 };
  };

  /**
   * 返金額を計算
   */
  const calculateRefund = async (
    checkInDate: Date,
    totalAmount: number,
  ): Promise<RefundCalculation> => {
    const policy = await getActivePolicy();
    const daysBeforeCheckIn = getDaysBeforeCheckIn(checkInDate);
    const appliedRule = getApplicableRule(policy.rules, daysBeforeCheckIn);

    const refundPercentage = appliedRule.refundPercentage;
    const refundAmount = Math.floor(totalAmount * (refundPercentage / 100));

    return {
      originalAmount: totalAmount,
      refundPercentage,
      refundAmount,
      daysBeforeCheckIn,
      appliedRule,
      isCancellable: true, // チェックイン後はキャンセル不可にする場合はここで判定
    };
  };

  /**
   * 同期的に返金額を計算（ポリシーを渡す場合）
   */
  const calculateRefundSync = (
    policy: CancellationPolicy,
    checkInDate: Date,
    totalAmount: number,
  ): RefundCalculation => {
    const daysBeforeCheckIn = getDaysBeforeCheckIn(checkInDate);
    const appliedRule = getApplicableRule(policy.rules, daysBeforeCheckIn);

    const refundPercentage = appliedRule.refundPercentage;
    const refundAmount = Math.floor(totalAmount * (refundPercentage / 100));

    return {
      originalAmount: totalAmount,
      refundPercentage,
      refundAmount,
      daysBeforeCheckIn,
      appliedRule,
      isCancellable: daysBeforeCheckIn >= 0,
    };
  };

  /**
   * ポリシーの説明文を生成
   */
  const generatePolicyDescription = (
    rules: CancellationPolicyRule[],
  ): string => {
    const sortedRules = [...rules].sort(
      (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn,
    );

    return sortedRules
      .map((rule) => {
        if (rule.refundPercentage === 100) {
          return `チェックイン${rule.daysBeforeCheckIn}日前まで: 全額返金`;
        } else if (rule.refundPercentage === 0) {
          return `チェックイン${rule.daysBeforeCheckIn}日前以降: 返金なし`;
        } else {
          return `チェックイン${rule.daysBeforeCheckIn}日前まで: ${rule.refundPercentage}%返金`;
        }
      })
      .join("\n");
  };

  /**
   * 返金ルールから表示用テキストを自動生成
   */
  const generateDisplayTexts = (
    rules: CancellationPolicyRule[],
  ): Pick<CancelPolicyTexts, 'cancelPolicyFree' | 'cancelPolicyFreeDesc' | 'cancelPolicyPartial' | 'cancelPolicyPartialDesc' | 'cancelPolicyNoShow' | 'cancelPolicyNoShowDesc'> => {
    const sortedRules = [...rules].sort(
      (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn,
    );

    // 100%返金（無料キャンセル）のルールを探す
    const freeRule = sortedRules.find((r) => r.refundPercentage === 100);
    // 0%返金のルールを探す
    const noRefundRule = sortedRules.find((r) => r.refundPercentage === 0);
    // 部分返金のルールを探す（100%でも0%でもない）
    const partialRule = sortedRules.find(
      (r) => r.refundPercentage > 0 && r.refundPercentage < 100,
    );

    // 無料キャンセル期間のテキスト生成
    let cancelPolicyFree = "";
    let cancelPolicyFreeDesc = "";
    if (freeRule) {
      cancelPolicyFree = `利用日の${freeRule.daysBeforeCheckIn}日前まで`;
      cancelPolicyFreeDesc = "無料";
    }

    // 有料キャンセル期間のテキスト生成
    let cancelPolicyPartial = "";
    let cancelPolicyPartialDesc = "";
    if (freeRule && noRefundRule) {
      // 無料キャンセル期間の翌日から当日まで
      const partialStart = freeRule.daysBeforeCheckIn - 1;
      if (partialStart > 0) {
        cancelPolicyPartial = `利用日の${partialStart}日前〜当日`;
      } else {
        cancelPolicyPartial = "利用日当日";
      }

      if (partialRule) {
        cancelPolicyPartialDesc = `利用料金の${100 - partialRule.refundPercentage}%`;
      } else {
        cancelPolicyPartialDesc = "利用料金の100%（清掃料等を含む）";
      }
    }

    // 無断キャンセルのテキスト
    const cancelPolicyNoShow = "無断キャンセル（不泊）";
    const cancelPolicyNoShowDesc = "利用料金の100%";

    return {
      cancelPolicyFree,
      cancelPolicyFreeDesc,
      cancelPolicyPartial,
      cancelPolicyPartialDesc,
      cancelPolicyNoShow,
      cancelPolicyNoShowDesc,
    };
  };

  /**
   * settings/facilityから現在のキャンセルポリシーテキストを取得
   */
  const getPolicyTexts = async (): Promise<CancelPolicyTexts> => {
    const defaultTexts: CancelPolicyTexts = {
      cancelPolicyFree: "利用日の3日前まで",
      cancelPolicyFreeDesc: "無料",
      cancelPolicyPartial: "利用日の2日前〜当日",
      cancelPolicyPartialDesc: "利用料金の100%（清掃料等を含む）",
      cancelPolicyNoShow: "無断キャンセル（不泊）",
      cancelPolicyNoShowDesc: "利用料金の100%",
      cancelPolicyProcedure:
        "予約サイトからキャンセル\nご予約時にご利用いただいた予約サイトにログインし、「予約の管理」または「キャンセル」メニューからお手続きください。",
      cancelPolicyExceptions:
        "- 悪天候や自然災害等で当社が施設の利用が危険と判断した場合\n- 施設の設備故障等により利用が不可能となった場合\n- その他、やむを得ない事由により当社が利用不可と判断した場合",
      cancelPolicyNotes:
        "- キャンセル料の計算は、施設利用日を基準とします\n- キャンセル料には、基本利用料金および清掃料等の追加料金が含まれます\n- 返金処理には、決済方法により数日〜数週間かかる場合があります",
    };

    if (!$db) return defaultTexts;

    try {
      const settingsDoc = await getDoc(doc($db, "settings", "facility"));
      if (!settingsDoc.exists()) {
        return defaultTexts;
      }

      const data = settingsDoc.data();
      return {
        cancelPolicyFree: data?.cancelPolicyFree || defaultTexts.cancelPolicyFree,
        cancelPolicyFreeDesc: data?.cancelPolicyFreeDesc || defaultTexts.cancelPolicyFreeDesc,
        cancelPolicyPartial: data?.cancelPolicyPartial || defaultTexts.cancelPolicyPartial,
        cancelPolicyPartialDesc: data?.cancelPolicyPartialDesc || defaultTexts.cancelPolicyPartialDesc,
        cancelPolicyNoShow: data?.cancelPolicyNoShow || defaultTexts.cancelPolicyNoShow,
        cancelPolicyNoShowDesc: data?.cancelPolicyNoShowDesc || defaultTexts.cancelPolicyNoShowDesc,
        cancelPolicyProcedure: data?.cancelPolicyProcedure || defaultTexts.cancelPolicyProcedure,
        cancelPolicyExceptions: data?.cancelPolicyExceptions || defaultTexts.cancelPolicyExceptions,
        cancelPolicyNotes: data?.cancelPolicyNotes || defaultTexts.cancelPolicyNotes,
      };
    } catch (error) {
      console.error("キャンセルポリシーテキスト取得エラー:", error);
      return defaultTexts;
    }
  };

  /**
   * settings/facilityにキャンセルポリシーテキストを保存
   */
  const savePolicyTexts = async (texts: Partial<CancelPolicyTexts>): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    const settingsRef = doc($db, "settings", "facility");
    const settingsDoc = await getDoc(settingsRef);

    if (settingsDoc.exists()) {
      await updateDoc(settingsRef, {
        ...texts,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(settingsRef, {
        ...texts,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  };

  /**
   * キャンセルポリシーと表示テキストを同時に保存
   */
  const savePolicyWithTexts = async (
    policy: CancellationPolicy,
    additionalTexts: Pick<CancelPolicyTexts, 'cancelPolicyProcedure' | 'cancelPolicyExceptions' | 'cancelPolicyNotes'>,
  ): Promise<string> => {
    // 返金ルールから表示テキストを自動生成
    const generatedTexts = generateDisplayTexts(policy.rules);

    // キャンセルポリシー（返金ルール）を保存
    const policyId = await savePolicy(policy);

    // 表示テキストを保存（自動生成テキスト + 追加情報）
    await savePolicyTexts({
      ...generatedTexts,
      ...additionalTexts,
    });

    return policyId;
  };

  return {
    defaultPolicy,
    getActivePolicy,
    savePolicy,
    getDaysBeforeCheckIn,
    getApplicableRule,
    calculateRefund,
    calculateRefundSync,
    generatePolicyDescription,
    generateDisplayTexts,
    getPolicyTexts,
    savePolicyTexts,
    savePolicyWithTexts,
  };
};
