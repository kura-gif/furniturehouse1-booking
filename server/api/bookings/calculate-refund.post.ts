/**
 * 返金額計算APIエンドポイント
 * キャンセルポリシーに基づいて返金額を計算する
 *
 * POST /api/bookings/calculate-refund
 * Body: { bookingId: string }
 */

import { FieldValue } from "firebase-admin/firestore";

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

    console.log("🔍 calculate-refund: Starting calculation for bookingId:", bookingId);

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: "予約IDが必要です",
      });
    }

    let db;
    try {
      db = getFirestoreAdmin();
      console.log("✅ calculate-refund: Firestore initialized successfully");
    } catch (firestoreError) {
      console.error("❌ calculate-refund: Firestore initialization failed:", firestoreError);
      throw firestoreError;
    }

    // 1. 予約情報を取得
    console.log("🔍 calculate-refund: Fetching booking document...");
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();

    if (!bookingDoc.exists) {
      throw createError({
        statusCode: 404,
        message: "予約が見つかりません",
      });
    }

    const booking = bookingDoc.data()!;
    console.log("✅ calculate-refund: Booking found:", {
      bookingReference: booking.bookingReference,
      status: booking.status,
      startDate: booking.startDate,
      checkInDate: booking.checkInDate,
      totalAmount: booking.totalAmount,
    });

    // 2. キャンセルポリシーを取得
    console.log("🔍 calculate-refund: Fetching cancellation policy...");
    let policy = defaultPolicy;
    try {
      const policiesSnapshot = await db
        .collection("cancellationPolicies")
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (!policiesSnapshot.empty) {
        const policyData = policiesSnapshot.docs[0].data() as CancellationPolicy;
        policy = policyData;
      }
      console.log("✅ calculate-refund: Using policy:", policy.name);
    } catch (policyError) {
      console.error("⚠️ calculate-refund: Policy fetch failed, using default:", policyError);
      // デフォルトポリシーを使用して続行
    }

    // 3. チェックイン日までの日数を計算
    console.log("🔍 calculate-refund: Parsing check-in date...");
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let checkInDate: Date;
    if (booking.startDate && typeof booking.startDate.toDate === "function") {
      checkInDate = booking.startDate.toDate();
      console.log("✅ calculate-refund: Using startDate:", checkInDate);
    } else if (booking.checkInDate && typeof booking.checkInDate.toDate === "function") {
      checkInDate = booking.checkInDate.toDate();
      console.log("✅ calculate-refund: Using checkInDate:", checkInDate);
    } else {
      console.error("❌ calculate-refund: No valid check-in date found:", {
        startDate: booking.startDate,
        startDateType: typeof booking.startDate,
        checkInDate: booking.checkInDate,
        checkInDateType: typeof booking.checkInDate,
      });
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

    console.log("💰 Refund calculation:", {
      bookingId,
      checkInDate: checkInDate.toISOString(),
      daysBeforeCheckIn,
      totalAmount,
      refundPercentage,
      refundAmount,
      policyName: policy.name,
    });

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
    console.error("❌ Refund calculation error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
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
