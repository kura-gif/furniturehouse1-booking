/**
 * 定期実行: データ整合性チェック
 *
 * 毎日実行して、Stripe/Firestoreの整合性を確認し、
 * 問題があれば管理者に通知する
 *
 * POST /api/cron/consistency-check
 * Headers: x-cron-secret: <CRON_SECRET>
 *
 * 外部Cronサービス（Vercel Cron、Cloud Scheduler等）から呼び出す
 */

import Stripe from "stripe";
import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import {
  getErrorMessage,
  getStripeErrorCode,
} from "~/server/utils/error-handling";
import { cronLogger, systemLogger } from "~/server/utils/operation-logger";

const JOB_NAME = "consistency-check";

interface InconsistencyReport {
  bookingId: string;
  bookingReference: string;
  type:
    | "status_mismatch"
    | "missing_payment"
    | "amount_mismatch"
    | "stale_authorization";
  firestoreStatus: string;
  stripeStatus?: string;
  description: string;
  severity: "low" | "medium" | "high";
}

interface BookingData {
  status: string;
  paymentStatus?: string;
  stripePaymentIntentId?: string;
  bookingReference: string;
  totalAmount?: number;
  authorizedAt?: { toDate?: () => Date };
  guestName?: string;
  guestEmail?: string;
  checkInDate?: { toDate?: () => Date };
}

export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  const config = useRuntimeConfig();

  // Cron認証チェック
  const vercelCronAuth = getHeader(event, "authorization");
  const cronSecret = getHeader(event, "x-cron-secret");
  const isVercelCron = vercelCronAuth === `Bearer ${config.cronSecret}`;
  const isCustomCron =
    cronSecret === config.cronSecret || cronSecret === config.internalApiSecret;

  if (!isVercelCron && !isCustomCron) {
    throw createError({
      statusCode: 401,
      message: "認証が必要です",
    });
  }

  const db = getFirestoreAdmin();
  const stripe = new Stripe(config.stripeSecretKey);

  const results = {
    checked: 0,
    issues: 0,
    autoFixed: 0,
    errors: [] as string[],
  };

  const inconsistencies: InconsistencyReport[] = [];

  // ジョブ開始ログ
  await cronLogger.started(JOB_NAME);

  try {
    // 直近14日間の予約を取得
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const bookingsSnapshot = await db
      .collection("bookings")
      .where("createdAt", ">=", fourteenDaysAgo)
      .orderBy("createdAt", "desc")
      .limit(300)
      .get();

    for (const bookingDoc of bookingsSnapshot.docs) {
      results.checked++;
      const booking = bookingDoc.data() as BookingData;
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

        // ステータス整合性チェック
        const statusIssue = checkStatusConsistency(booking, paymentIntent);
        if (statusIssue) {
          inconsistencies.push({
            bookingId,
            bookingReference: booking.bookingReference,
            type: "status_mismatch",
            firestoreStatus: booking.status,
            stripeStatus: paymentIntent.status,
            description: statusIssue.description,
            severity: statusIssue.severity,
          });

          // 自動修復可能な場合は修復
          if (statusIssue.autoFix) {
            await bookingDoc.ref.update({
              ...statusIssue.autoFix,
              consistencyFixedAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
            results.autoFixed++;
          }
        }

        // 金額整合性チェック
        if (booking.totalAmount && paymentIntent.amount) {
          const firestoreAmount = Math.round(booking.totalAmount);
          const stripeAmount = paymentIntent.amount;

          if (firestoreAmount !== stripeAmount) {
            inconsistencies.push({
              bookingId,
              bookingReference: booking.bookingReference,
              type: "amount_mismatch",
              firestoreStatus: booking.status,
              stripeStatus: paymentIntent.status,
              description: `金額不一致: Firestore=${firestoreAmount}円, Stripe=${stripeAmount}円`,
              severity: "high",
            });
          }
        }

        // 与信期限チェック（5日以上経過）
        if (
          paymentIntent.status === "requires_capture" &&
          booking.status === "pending_review"
        ) {
          const authorizedAt = booking.authorizedAt?.toDate?.() || new Date();
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
              description: `与信確保から${daysSinceAuth}日経過。早急な対応が必要です。`,
              severity: "high",
            });
          }
        }
      } catch (stripeError: unknown) {
        if (getStripeErrorCode(stripeError) === "resource_missing") {
          inconsistencies.push({
            bookingId,
            bookingReference: booking.bookingReference,
            type: "missing_payment",
            firestoreStatus: booking.status,
            description: "StripeにPayment Intentが存在しません",
            severity: "high",
          });
        } else {
          const errorMsg = getErrorMessage(stripeError);
          results.errors.push(`${booking.bookingReference}: ${errorMsg}`);
        }
      }
    }

    results.issues = inconsistencies.length;

    // レポートをFirestoreに保存
    const reportId = `cron_check_${Date.now()}`;
    await db.collection("consistencyReports").doc(reportId).set({
      checkedBy: "cron",
      checkedAt: FieldValue.serverTimestamp(),
      totalChecked: results.checked,
      inconsistenciesFound: results.issues,
      autoFixed: results.autoFixed,
      type: "automated",
      inconsistencies,
    });

    // 問題が見つかった場合は管理者に通知
    if (inconsistencies.length > 0) {
      const highSeverity = inconsistencies.filter((i) => i.severity === "high");

      if (highSeverity.length > 0) {
        try {
          await $fetch("/api/emails/send-admin-notification", {
            method: "POST",
            headers: {
              "x-internal-secret": config.internalApiSecret,
            },
            body: {
              subject: `【要対応】データ整合性チェックで${highSeverity.length}件の重要な問題を検出`,
              message: `
自動整合性チェックで以下の問題が検出されました。

■ チェック結果
- チェック件数: ${results.checked}件
- 検出された問題: ${results.issues}件
- 自動修復済み: ${results.autoFixed}件
- 重要度「高」: ${highSeverity.length}件

■ 重要度「高」の問題一覧
${highSeverity
  .map(
    (i) => `
・${i.bookingReference}
  種類: ${i.type}
  状況: ${i.description}
`,
  )
  .join("")}

■ 対応方法
管理画面から整合性チェック結果を確認し、適切な対応を行ってください。
${config.public.siteUrl}/admin/system

レポートID: ${reportId}
              `.trim(),
            },
          });
        } catch (emailError) {
          console.error("Failed to send admin notification:", emailError);
        }
      }
    }

    const duration = Date.now() - startTime;
    await cronLogger.completed(JOB_NAME, results, duration);
    await systemLogger.consistencyCheckCompleted(
      results.issues,
      results.autoFixed,
    );

    return {
      success: true,
      reportId,
      message: `整合性チェック完了: ${results.issues}件の問題を検出、${results.autoFixed}件を自動修復`,
      results,
    };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMsg = getErrorMessage(error);
    await cronLogger.failed(JOB_NAME, errorMsg, duration);

    throw createError({
      statusCode: 500,
      message: errorMsg || "整合性チェックに失敗しました",
    });
  }
});

/**
 * ステータス整合性チェック
 */
function checkStatusConsistency(
  booking: BookingData,
  paymentIntent: Stripe.PaymentIntent,
): {
  description: string;
  severity: "low" | "medium" | "high";
  autoFix?: Record<string, unknown>;
} | null {
  const firestoreStatus = booking.status;
  const stripeStatus = paymentIntent.status;

  // 正常な組み合わせ
  const validCombinations: Record<string, string[]> = {
    pending_review: ["requires_capture"],
    confirmed: ["succeeded"],
    cancelled: ["canceled", "requires_capture"],
    refunded: ["succeeded"],
    completed: ["succeeded"],
    payment_failed: ["requires_payment_method", "canceled"],
  };

  const validStripeStatuses = validCombinations[firestoreStatus];

  if (!validStripeStatuses || validStripeStatuses.includes(stripeStatus)) {
    return null;
  }

  // 自動修復可能なケース
  if (
    stripeStatus === "succeeded" &&
    !["confirmed", "refunded", "completed"].includes(firestoreStatus)
  ) {
    return {
      description: `Stripeは決済完了だが、Firestoreは「${firestoreStatus}」`,
      severity: "medium",
      autoFix: {
        status: "confirmed",
        paymentStatus: "paid",
      },
    };
  }

  if (stripeStatus === "canceled" && firestoreStatus !== "cancelled") {
    return {
      description: `Stripeはキャンセル済みだが、Firestoreは「${firestoreStatus}」`,
      severity: "medium",
      autoFix: {
        status: "cancelled",
        paymentStatus: "canceled",
      },
    };
  }

  return {
    description: `ステータス不一致: Firestore=${firestoreStatus}, Stripe=${stripeStatus}`,
    severity: "high",
  };
}
