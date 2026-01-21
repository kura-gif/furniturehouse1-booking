/**
 * Stripe/Firestore 整合性チェックAPI
 *
 * 決済システムとデータベースの整合性を確認し、
 * 不整合があれば報告・修復する
 *
 * POST /api/admin/consistency-check
 * Headers: Authorization: Bearer <Firebase ID Token>
 */

import Stripe from "stripe";
import { requireAdmin } from "~/server/utils/auth";
import { FieldValue } from "firebase-admin/firestore";
import {
  getErrorMessage,
  getErrorStatusCode,
  getStripeErrorCode,
} from "~/server/utils/error-handling";

interface InconsistencyReport {
  bookingId: string;
  bookingReference: string;
  type:
    | "status_mismatch"
    | "missing_payment"
    | "orphan_payment"
    | "amount_mismatch"
    | "stale_authorization";
  firestoreStatus: string;
  stripeStatus?: string;
  firestoreAmount?: number;
  stripeAmount?: number;
  description: string;
  suggestedAction: string;
  autoFixable: boolean;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey);

  try {
    // 管理者認証
    const admin = await requireAdmin(event);
    console.log("🔍 Consistency check started by:", admin.uid);

    const body = await readBody(event);
    const { autoFix = false, dateFrom, dateTo } = body;

    const db = getFirestoreAdmin();
    const inconsistencies: InconsistencyReport[] = [];
    const checkedCount = { bookings: 0, fixed: 0 };

    // 1. Firestoreの予約を取得（直近30日間または指定期間）
    let bookingsQuery = db.collection("bookings").orderBy("createdAt", "desc");

    if (dateFrom) {
      bookingsQuery = bookingsQuery.where(
        "createdAt",
        ">=",
        new Date(dateFrom),
      );
    } else {
      // デフォルト: 直近30日
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      bookingsQuery = bookingsQuery.where("createdAt", ">=", thirtyDaysAgo);
    }

    if (dateTo) {
      bookingsQuery = bookingsQuery.where("createdAt", "<=", new Date(dateTo));
    }

    const bookingsSnapshot = await bookingsQuery.limit(500).get();

    console.log(`📊 Checking ${bookingsSnapshot.size} bookings...`);

    for (const bookingDoc of bookingsSnapshot.docs) {
      checkedCount.bookings++;
      const booking = bookingDoc.data();
      const bookingId = bookingDoc.id;

      // Payment Intent IDがない予約はスキップ
      if (!booking.stripePaymentIntentId) {
        continue;
      }

      try {
        // Stripeから Payment Intent を取得
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.stripePaymentIntentId,
        );

        // 2. ステータスの整合性チェック
        const statusMismatch = checkStatusMismatch(
          booking as BookingData,
          paymentIntent,
        );
        if (statusMismatch) {
          inconsistencies.push({
            bookingId,
            bookingReference: booking.bookingReference,
            type: "status_mismatch",
            firestoreStatus: booking.status,
            stripeStatus: paymentIntent.status,
            description: statusMismatch.description,
            suggestedAction: statusMismatch.action,
            autoFixable: statusMismatch.autoFixable,
          });

          // 自動修復が有効な場合
          if (autoFix && statusMismatch.autoFixable && statusMismatch.fixData) {
            await bookingDoc.ref.update({
              ...statusMismatch.fixData,
              consistencyFixedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
            checkedCount.fixed++;
            console.log(`✅ Auto-fixed booking ${bookingId}`);
          }
        }

        // 3. 金額の整合性チェック
        if (booking.totalAmount && paymentIntent.amount) {
          const firestoreAmount = Math.round(booking.totalAmount);
          const stripeAmount = paymentIntent.amount;

          if (firestoreAmount !== stripeAmount) {
            inconsistencies.push({
              bookingId,
              bookingReference: booking.bookingReference,
              type: "amount_mismatch",
              firestoreStatus: booking.status,
              firestoreAmount,
              stripeAmount,
              description: `金額不一致: Firestore=${firestoreAmount}円, Stripe=${stripeAmount}円`,
              suggestedAction: "手動で確認し、正しい金額に修正してください",
              autoFixable: false,
            });
          }
        }

        // 4. 与信期限切れチェック（7日以上経過した未処理の与信）
        if (
          paymentIntent.status === "requires_capture" &&
          booking.status === "pending_review"
        ) {
          const authorizedAt =
            booking.authorizedAt?.toDate?.() || new Date(booking.authorizedAt);
          const daysSinceAuth = Math.floor(
            (Date.now() - authorizedAt.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (daysSinceAuth >= 5) {
            inconsistencies.push({
              bookingId,
              bookingReference: booking.bookingReference,
              type: "stale_authorization",
              firestoreStatus: booking.status,
              stripeStatus: paymentIntent.status,
              description: `与信確保から${daysSinceAuth}日経過。Stripeの与信は通常7日で期限切れになります。`,
              suggestedAction: "早急に承認または却下の判断をしてください",
              autoFixable: false,
            });
          }
        }
      } catch (stripeError: unknown) {
        // Payment Intentが見つからない場合
        if (getStripeErrorCode(stripeError) === "resource_missing") {
          inconsistencies.push({
            bookingId,
            bookingReference: booking.bookingReference,
            type: "missing_payment",
            firestoreStatus: booking.status,
            description: "StripeにPayment Intentが存在しません",
            suggestedAction:
              "手動で確認し、予約をキャンセルするか新規決済を作成してください",
            autoFixable: false,
          });
        } else {
          console.error(
            `Error checking booking ${bookingId}:`,
            getErrorMessage(stripeError),
          );
        }
      }
    }

    // 5. レポートをFirestoreに保存
    const reportId = `check_${Date.now()}`;
    await db
      .collection("consistencyReports")
      .doc(reportId)
      .set({
        checkedBy: admin.uid,
        checkedByName: admin.displayName || admin.email,
        checkedAt: FieldValue.serverTimestamp(),
        totalChecked: checkedCount.bookings,
        inconsistenciesFound: inconsistencies.length,
        autoFixApplied: autoFix,
        fixedCount: checkedCount.fixed,
        dateRange: {
          from: dateFrom || "last_30_days",
          to: dateTo || "now",
        },
        inconsistencies,
      });

    console.log(
      `✅ Consistency check completed: ${inconsistencies.length} issues found`,
    );

    return {
      success: true,
      reportId,
      summary: {
        totalChecked: checkedCount.bookings,
        inconsistenciesFound: inconsistencies.length,
        autoFixed: checkedCount.fixed,
      },
      inconsistencies,
    };
  } catch (error: unknown) {
    console.error("❌ Consistency check error:", error);
    throw createError({
      statusCode: getErrorStatusCode(error),
      message: getErrorMessage(error) || "整合性チェックに失敗しました",
    });
  }
});

/**
 * ステータスの整合性をチェック
 */
interface BookingData {
  status: string;
  paymentStatus?: string;
}

function checkStatusMismatch(
  booking: BookingData,
  paymentIntent: Stripe.PaymentIntent,
): {
  description: string;
  action: string;
  autoFixable: boolean;
  fixData?: Record<string, unknown>;
} | null {
  const firestoreStatus = booking.status;
  const stripeStatus = paymentIntent.status;

  // 正常なステータスの組み合わせ
  const validCombinations: Record<string, string[]> = {
    pending_review: ["requires_capture"],
    confirmed: ["succeeded"],
    cancelled: ["canceled", "requires_capture"], // キャンセル時は与信が残っている場合もある
    refunded: ["succeeded"], // 返金済みでもpayment_intentはsucceededのまま
    payment_failed: ["requires_payment_method", "canceled"],
  };

  const validStripeStatuses = validCombinations[firestoreStatus];

  if (!validStripeStatuses) {
    return null; // 未知のステータスはスキップ
  }

  if (!validStripeStatuses.includes(stripeStatus)) {
    // 自動修復可能なケース
    if (
      stripeStatus === "succeeded" &&
      firestoreStatus !== "confirmed" &&
      firestoreStatus !== "refunded"
    ) {
      return {
        description: `Stripeは決済完了だが、Firestoreは「${firestoreStatus}」`,
        action: "Firestoreのステータスを「confirmed」に更新",
        autoFixable: true,
        fixData: {
          status: "confirmed",
          paymentStatus: "paid",
        },
      };
    }

    if (stripeStatus === "canceled" && firestoreStatus !== "cancelled") {
      return {
        description: `Stripeはキャンセル済みだが、Firestoreは「${firestoreStatus}」`,
        action: "Firestoreのステータスを「cancelled」に更新",
        autoFixable: true,
        fixData: {
          status: "cancelled",
          paymentStatus: "canceled",
        },
      };
    }

    return {
      description: `ステータス不一致: Firestore=${firestoreStatus}, Stripe=${stripeStatus}`,
      action: "手動で確認し、適切なステータスに更新してください",
      autoFixable: false,
    };
  }

  return null;
}
