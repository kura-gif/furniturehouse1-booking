/**
 * 予約審査承認API
 * - 与信確保済みのPayment Intentをキャプチャ（決済確定）
 * - 予約ステータスをconfirmedに更新
 * - 清掃タスクを自動生成
 * - ゲストに承認通知メールを送信
 *
 * POST /api/bookings/approve
 * Body: { bookingId: string }
 * Headers: Authorization: Bearer <Firebase ID Token>
 */

import Stripe from "stripe";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { requireAdmin } from "~/server/utils/auth";
import { sendEmailWithRetry } from "~/server/utils/email-retry";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey);

  try {
    // 管理者認証を確認
    const admin = await requireAdmin(event);
    console.log("👤 Admin authenticated:", admin.uid, admin.displayName);

    const body = await readBody(event);
    const { bookingId } = body;

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: "予約IDが必要です",
      });
    }

    console.log("✅ Approving booking:", bookingId);

    // 1. 予約情報を取得
    const db = getFirestoreAdmin();
    const bookingRef = db.collection("bookings").doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      throw createError({
        statusCode: 404,
        message: "予約が見つかりません",
      });
    }

    const booking = bookingDoc.data()!;

    // 2. 審査可能な状態かチェック
    if (booking.reviewStatus !== "pending_review") {
      throw createError({
        statusCode: 400,
        message: `この予約は審査できません（現在のステータス: ${booking.reviewStatus || booking.status}）`,
      });
    }

    if (!booking.stripePaymentIntentId) {
      throw createError({
        statusCode: 400,
        message: "決済情報がありません",
      });
    }

    // 3. Payment Intentをキャプチャ（決済確定）
    console.log("💳 Capturing payment:", booking.stripePaymentIntentId);

    const paymentIntent = await stripe.paymentIntents.capture(
      booking.stripePaymentIntentId,
    );

    if (paymentIntent.status !== "succeeded") {
      throw createError({
        statusCode: 400,
        message: `決済の確定に失敗しました（ステータス: ${paymentIntent.status}）`,
      });
    }

    console.log("✅ Payment captured successfully");

    // 4. 予約ステータスを更新
    await bookingRef.update({
      status: "confirmed",
      paymentStatus: "paid",
      reviewStatus: "approved",
      reviewedAt: FieldValue.serverTimestamp(),
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 5. 審査ログを記録
    await db.collection("reviewLogs").add({
      bookingId,
      bookingReference: booking.bookingReference,
      action: "approved",
      adminId: admin.uid,
      adminName: admin.displayName || admin.email,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 6. 清掃タスクを自動生成
    try {
      const defaultChecklist = [
        { item: "ベッドシーツ交換", completed: false },
        { item: "枕カバー交換", completed: false },
        { item: "タオル交換", completed: false },
        { item: "床掃除", completed: false },
        { item: "トイレ掃除", completed: false },
        { item: "キッチン掃除", completed: false },
        { item: "ゴミ回収", completed: false },
        { item: "備品チェック", completed: false },
      ];

      // チェックイン前タスク（pre_checkin）
      const preCheckinTask = {
        bookingId,
        bookingReference: booking.bookingReference,
        taskType: "pre_checkin",
        status: "pending",
        scheduledDate: booking.checkInDate,
        estimatedDuration: 120, // 2時間
        checklist: defaultChecklist,
        suppliesUsed: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      // チェックアウト後タスク（post_checkout）
      const postCheckoutTask = {
        bookingId,
        bookingReference: booking.bookingReference,
        taskType: "post_checkout",
        status: "pending",
        scheduledDate: booking.checkOutDate,
        estimatedDuration: 180, // 3時間
        checklist: defaultChecklist,
        suppliesUsed: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await Promise.all([
        db.collection("cleaningTasks").add(preCheckinTask),
        db.collection("cleaningTasks").add(postCheckoutTask),
      ]);

      console.log(
        "✅ 清掃タスク自動生成完了:",
        booking.bookingReference,
      );
    } catch (taskError) {
      // 清掃タスク生成失敗は承認処理自体には影響させない
      console.error("⚠️ 清掃タスク生成に失敗:", taskError);
    }

    // 7. 承認通知メールを送信（リトライ付き）
    try {
      const baseUrl = config.public.siteUrl || "http://localhost:3000";

      // 日付をフォーマット
      const checkInDate =
        booking.checkInDate?.toDate?.() || new Date(booking.checkInDate);
      const checkOutDate =
        booking.checkOutDate?.toDate?.() || new Date(booking.checkOutDate);
      const formatDate = (date: Date) =>
        `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

      await sendEmailWithRetry(`${baseUrl}/api/emails/send-booking-approved`, {
        method: "POST",
        headers: {
          "x-internal-secret": config.internalApiSecret,
        },
        body: {
          to: booking.guestEmail,
          bookingId,
          bookingReference: booking.bookingReference,
          bookingToken: booking.bookingToken,
          guestName: booking.guestName,
          checkInDate: formatDate(checkInDate),
          checkOutDate: formatDate(checkOutDate),
          totalAmount: booking.totalAmount,
        },
      });
      console.log("✅ Approval email sent to:", booking.guestEmail);
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send approval email (after retries):",
        emailError,
      );
      // メール送信失敗は承認処理自体には影響させない
    }

    // 8. 管理者にも通知（リトライ付き）
    try {
      const baseUrl = config.public.siteUrl || "http://localhost:3000";
      await sendEmailWithRetry(
        `${baseUrl}/api/emails/send-admin-notification`,
        {
          method: "POST",
          headers: {
            "x-internal-secret": config.internalApiSecret,
          },
          body: {
            type: "booking_approved",
            bookingId,
            bookingReference: booking.bookingReference,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            totalAmount: booking.totalAmount,
          },
        },
      );
    } catch (emailError) {
      console.error(
        "⚠️ Failed to send admin notification (after retries):",
        emailError,
      );
    }

    return {
      success: true,
      bookingId,
      status: "confirmed",
      paymentStatus: "paid",
      message: "予約を承認し、決済を確定しました",
    };
  } catch (error: unknown) {
    console.error("❌ Approval error:", error);

    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    throw createError({
      statusCode,
      message:
        "予約の承認に失敗しました。しばらく待ってから再度お試しください。",
    });
  }
});
