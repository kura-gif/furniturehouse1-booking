/**
 * 返金額計算APIエンドポイント
 * キャンセルポリシーに基づいて返金額を計算する
 *
 * POST /api/bookings/calculate-refund
 * Body: { bookingId: string }
 */

// キャンセルポリシールール
interface CancellationPolicyRule {
  daysBeforeCheckIn: number;
  refundPercentage: number;
}

// キャンセルポリシー
interface CancellationPolicy {
  name: string;
  rules: CancellationPolicyRule[];
  isActive: boolean;
}

// デフォルトポリシー
const defaultPolicy: CancellationPolicy = {
  name: "標準",
  rules: [
    { daysBeforeCheckIn: 5, refundPercentage: 100 },
    { daysBeforeCheckIn: 3, refundPercentage: 50 },
    { daysBeforeCheckIn: 0, refundPercentage: 0 },
  ],
  isActive: true,
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { bookingId } = body;

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: "予約IDが必要です",
      });
    }

    const db = getFirestoreAdmin();

    // 1. 予約情報を取得
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();

    if (!bookingDoc.exists) {
      throw createError({
        statusCode: 404,
        message: "予約が見つかりません",
      });
    }

    const booking = bookingDoc.data()!;

    // 2. キャンセルポリシーを取得
    let policy = defaultPolicy;
    const policiesSnapshot = await db
      .collection("cancellationPolicies")
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (!policiesSnapshot.empty) {
      const policyData = policiesSnapshot.docs[0].data() as CancellationPolicy;
      policy = policyData;
    }

    // 3. チェックイン日までの日数を計算
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let checkInDate: Date;
    if (booking.startDate && typeof booking.startDate.toDate === "function") {
      checkInDate = booking.startDate.toDate();
    } else if (booking.checkInDate && typeof booking.checkInDate.toDate === "function") {
      checkInDate = booking.checkInDate.toDate();
    } else {
      throw createError({
        statusCode: 400,
        message: "チェックイン日が設定されていません",
      });
    }
    checkInDate.setHours(0, 0, 0, 0);

    const diffTime = checkInDate.getTime() - now.getTime();
    const daysBeforeCheckIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 4. 適用されるルールを取得
    const sortedRules = [...policy.rules].sort(
      (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn,
    );

    let appliedRule = { daysBeforeCheckIn: 0, refundPercentage: 0 };
    for (const rule of sortedRules) {
      if (daysBeforeCheckIn >= rule.daysBeforeCheckIn) {
        appliedRule = rule;
        break;
      }
    }

    // 5. 返金額を計算
    const totalAmount = booking.totalAmount || 0;
    const refundPercentage = appliedRule.refundPercentage;
    const refundAmount = Math.floor(totalAmount * (refundPercentage / 100));

    return {
      success: true,
      calculation: {
        bookingId,
        bookingReference: booking.bookingReference,
        guestName: booking.guestName,
        checkInDate: checkInDate.toISOString(),
        daysBeforeCheckIn,
        originalAmount: totalAmount,
        refundPercentage,
        refundAmount,
        nonRefundableAmount: totalAmount - refundAmount,
        appliedRule,
        policyName: policy.name,
        isCancellable: daysBeforeCheckIn >= 0,
      },
    };
  } catch (error: unknown) {
    console.error("❌ Refund calculation error:", error);
    // 4xxエラー（createErrorで意図的に作成）はそのまま再スロー
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    // 内部エラーは詳細を漏洩させない
    throw createError({
      statusCode: 500,
      message: "返金計算に失敗しました",
    });
  }
});
