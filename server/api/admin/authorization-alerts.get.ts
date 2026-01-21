/**
 * 与信期限アラートAPI
 *
 * 承認待ち（pending_review）の予約のうち、
 * 与信確保から5日以上経過したものを警告として返す
 *
 * Stripeの与信は通常7日で期限切れになるため、
 * 5日を超えたものは早急な対応が必要
 *
 * GET /api/admin/authorization-alerts
 * Headers: Authorization: Bearer <Firebase ID Token>
 */

import { requireAdmin } from "~/server/utils/auth";

interface AuthorizationAlert {
  bookingId: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
  authorizedAt: Date;
  daysSinceAuth: number;
  urgencyLevel: "warning" | "critical" | "expired";
  message: string;
}

export default defineEventHandler(async (event) => {
  try {
    // 管理者認証
    await requireAdmin(event);

    const db = getFirestoreAdmin();
    const alerts: AuthorizationAlert[] = [];

    // 承認待ちの予約を取得
    const pendingBookings = await db
      .collection("bookings")
      .where("status", "==", "pending_review")
      .get();

    const now = new Date();

    for (const doc of pendingBookings.docs) {
      const booking = doc.data();

      // authorizedAtがない場合はスキップ
      if (!booking.authorizedAt) {
        continue;
      }

      // 与信確保からの経過日数を計算
      const authorizedAt = booking.authorizedAt.toDate
        ? booking.authorizedAt.toDate()
        : new Date(booking.authorizedAt);

      const daysSinceAuth = Math.floor(
        (now.getTime() - authorizedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      // 5日以上経過した予約のみアラート対象
      if (daysSinceAuth >= 5) {
        let urgencyLevel: "warning" | "critical" | "expired";
        let message: string;

        if (daysSinceAuth >= 7) {
          urgencyLevel = "expired";
          message = `与信期限切れの可能性あり（${daysSinceAuth}日経過）。新しい決済が必要な場合があります。`;
        } else if (daysSinceAuth >= 6) {
          urgencyLevel = "critical";
          message = `与信期限まで残り約1日（${daysSinceAuth}日経過）。今すぐ対応が必要です。`;
        } else {
          urgencyLevel = "warning";
          message = `与信期限が近づいています（${daysSinceAuth}日経過）。早めの対応をお勧めします。`;
        }

        // チェックイン日をフォーマット
        const checkIn = booking.checkInDate?.toDate
          ? booking.checkInDate.toDate()
          : new Date(booking.checkInDate);
        const checkOut = booking.checkOutDate?.toDate
          ? booking.checkOutDate.toDate()
          : new Date(booking.checkOutDate);

        alerts.push({
          bookingId: doc.id,
          bookingReference: booking.bookingReference,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          checkInDate: checkIn.toLocaleDateString("ja-JP"),
          checkOutDate: checkOut.toLocaleDateString("ja-JP"),
          totalAmount: booking.totalAmount,
          authorizedAt,
          daysSinceAuth,
          urgencyLevel,
          message,
        });
      }
    }

    // 緊急度の高い順にソート（expired > critical > warning）
    const urgencyOrder = { expired: 0, critical: 1, warning: 2 };
    alerts.sort((a, b) => {
      const orderDiff =
        urgencyOrder[a.urgencyLevel] - urgencyOrder[b.urgencyLevel];
      if (orderDiff !== 0) return orderDiff;
      // 同じ緊急度なら経過日数の多い順
      return b.daysSinceAuth - a.daysSinceAuth;
    });

    return {
      success: true,
      totalPendingReview: pendingBookings.size,
      alertCount: alerts.length,
      alerts,
    };
  } catch (error: unknown) {
    console.error("❌ Authorization alerts error:", error);
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    throw createError({
      statusCode,
      message:
        error instanceof Error
          ? error.message
          : "与信アラートの取得に失敗しました",
    });
  }
});
