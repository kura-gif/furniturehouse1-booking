/**
 * 管理者による予約キャンセルAPIエンドポイント
 * キャンセル処理とゲストへのメール通知を行う
 *
 * POST /api/bookings/admin-cancel
 * Body: { bookingId: string, reason?: string }
 */

import { FieldValue } from "firebase-admin/firestore";
import {
  getErrorMessage,
  getErrorStatusCode,
} from "~/server/utils/error-handling";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  try {
    const body = await readBody(event);
    const { bookingId, reason } = body;

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

    // 2. キャンセル可能かチェック
    if (booking.status === "cancelled" || booking.status === "refunded") {
      throw createError({
        statusCode: 400,
        message: "この予約は既にキャンセル済みです",
      });
    }

    // 3. チェックイン・チェックアウト日を取得
    let checkInDate: Date;
    if (booking.startDate && booking.startDate.toDate) {
      checkInDate = booking.startDate.toDate();
    } else if (booking.checkInDate && booking.checkInDate.toDate) {
      checkInDate = booking.checkInDate.toDate();
    } else {
      checkInDate = new Date();
    }

    let checkOutDate: Date;
    if (booking.endDate && booking.endDate.toDate) {
      checkOutDate = booking.endDate.toDate();
    } else if (booking.checkOutDate && booking.checkOutDate.toDate) {
      checkOutDate = booking.checkOutDate.toDate();
    } else {
      checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 1);
    }

    // 4. 予約ステータスを更新
    const updateData: Record<string, unknown> = {
      status: "cancelled",
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: "admin",
      cancelReason: reason || "管理者によるキャンセル",
      updatedAt: FieldValue.serverTimestamp(),
    };

    await bookingDoc.ref.update(updateData);

    console.log("✅ Admin cancelled booking:", bookingId);

    // 5. ゲストにキャンセル通知メールを送信
    const checkInFormatted = `${checkInDate.getFullYear()}年${checkInDate.getMonth() + 1}月${checkInDate.getDate()}日`;
    const checkOutFormatted = `${checkOutDate.getFullYear()}年${checkOutDate.getMonth() + 1}月${checkOutDate.getDate()}日`;

    try {
      await $fetch("/api/emails/send-booking-cancelled", {
        method: "POST",
        headers: {
          "x-internal-secret": config.internalApiSecret,
        },
        body: {
          to: booking.guestEmail,
          bookingReference: booking.bookingReference,
          guestName: booking.guestName,
          checkInDate: checkInFormatted,
          checkOutDate: checkOutFormatted,
          refundAmount: 0,
          refundPercentage: 0,
        },
      });
      console.log("✅ Cancellation email sent to guest:", booking.guestEmail);
    } catch (emailError: unknown) {
      console.error(
        "⚠️ Guest cancellation email error:",
        getErrorMessage(emailError),
      );
      // メール送信失敗してもキャンセル処理は成功とする
    }

    // 6. キャンセルログを記録
    await db.collection("cancellationLogs").add({
      bookingId,
      bookingReference: booking.bookingReference,
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      cancelledBy: "admin",
      cancelReason: reason || "管理者によるキャンセル",
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "予約をキャンセルしました",
      booking: {
        id: bookingId,
        status: "cancelled",
      },
    };
  } catch (error: unknown) {
    console.error("❌ Admin cancel error:", error);

    throw createError({
      statusCode: getErrorStatusCode(error),
      message: getErrorMessage(error) || "キャンセル処理に失敗しました",
    });
  }
});
