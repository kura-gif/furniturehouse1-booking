/**
 * 定期実行: チェックアウト後お礼メール送信
 *
 * 毎日実行して、チェックアウト日の翌日にお礼メールを送信
 *
 * POST /api/cron/send-thankyou
 * Headers: x-cron-secret: <CRON_SECRET>
 *
 * 外部Cronサービス（Vercel Cron、Cloud Scheduler等）から呼び出す
 */

import { getErrorMessage } from "~/server/utils/error-handling";
import {
  cronLogger,
  emailOperationLogger,
} from "~/server/utils/operation-logger";

const JOB_NAME = "send-thankyou";

export default defineEventHandler(async (event) => {
  const startTime = Date.now();
  const config = useRuntimeConfig();

  // Cron認証チェック（Vercel Cronまたはカスタムシークレット）
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
  const results = {
    processed: 0,
    sent: 0,
    errors: [] as string[],
  };

  // ジョブ開始ログ
  await cronLogger.started(JOB_NAME);

  try {
    // 昨日の日付を取得（日本時間）
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstNow = new Date(now.getTime() + jstOffset);
    jstNow.setHours(0, 0, 0, 0);

    // 昨日（チェックアウト日）
    const yesterday = new Date(jstNow);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfYesterday = new Date(yesterday);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // 昨日チェックアウトした予約を取得
    const bookingsSnapshot = await db
      .collection("bookings")
      .where("status", "==", "confirmed")
      .where("checkOutDate", ">=", startOfYesterday)
      .where("checkOutDate", "<=", endOfYesterday)
      .get();

    for (const doc of bookingsSnapshot.docs) {
      const booking = doc.data();
      results.processed++;

      // 既にお礼メール送信済みかチェック
      if (booking.thankyouEmailSent) {
        continue;
      }

      try {
        // 日付をフォーマット
        const checkInDate =
          booking.checkInDate?.toDate?.() || new Date(booking.checkInDate);
        const checkOutDate =
          booking.checkOutDate?.toDate?.() || new Date(booking.checkOutDate);
        const formatDate = (date: Date) =>
          `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

        // お礼メール送信
        await $fetch("/api/emails/send-checkout-thankyou", {
          method: "POST",
          headers: {
            "x-internal-secret": config.internalApiSecret,
          },
          body: {
            to: booking.guestEmail,
            bookingReference: booking.bookingReference,
            guestName: booking.guestName,
            checkInDate: formatDate(checkInDate),
            checkOutDate: formatDate(checkOutDate),
            reviewUrl: booking.reviewUrl || null, // レビューURLがあれば
          },
        });

        // 送信済みフラグとステータスを更新
        await doc.ref.update({
          thankyouEmailSent: true,
          thankyouEmailSentAt: new Date(),
          status: "completed", // 滞在完了に変更
        });

        results.sent++;
        await emailOperationLogger.sent(
          "checkout-thankyou",
          booking.guestEmail,
          booking.bookingReference,
        );
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        results.errors.push(`${booking.bookingReference}: ${errorMsg}`);
        await emailOperationLogger.failed(
          "checkout-thankyou",
          booking.guestEmail,
          errorMsg,
          booking.bookingReference,
        );
      }
    }

    const duration = Date.now() - startTime;
    await cronLogger.completed(JOB_NAME, results, duration);

    return {
      success: true,
      message: `お礼メール処理完了: ${results.sent}件送信`,
      results,
    };
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMsg = getErrorMessage(error);
    await cronLogger.failed(JOB_NAME, errorMsg, duration);

    throw createError({
      statusCode: 500,
      message: errorMsg || "お礼メール処理に失敗しました",
    });
  }
});
