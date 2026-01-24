/**
 * セキュアな予約作成API
 * - 楽観的ロックによる同時予約防止（Race Condition対策）
 * - トランザクションによる整合性保証
 * - サーバーサイド金額検証
 * - 入力値の厳格なバリデーション
 */

import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type { CreateBookingInput } from "~/server/utils/validation";
import { sendEmailWithRetry } from "~/server/utils/email-retry";

/**
 * 予約期間のロックキーを生成
 * 日付範囲をソートして一意のキーを作成
 */
function generateLockKey(checkIn: string, checkOut: string): string {
  return `${checkIn}_${checkOut}`;
}

/**
 * ロックを取得（楽観的ロック）
 * @returns lockId if acquired, null if failed
 */
async function acquireBookingLock(
  db: FirebaseFirestore.Firestore,
  lockKey: string,
  requestId: string,
  ttlMs: number = 30000,
): Promise<boolean> {
  const lockRef = db.collection("bookingLocks").doc(lockKey);
  const now = Date.now();

  try {
    await db.runTransaction(async (transaction) => {
      const lockDoc = await transaction.get(lockRef);

      if (lockDoc.exists) {
        const lockData = lockDoc.data();
        // ロックが期限切れでなければ取得失敗
        if (lockData && lockData.expiresAt > now) {
          throw new Error("LOCK_HELD");
        }
      }

      // ロックを取得
      transaction.set(lockRef, {
        requestId,
        acquiredAt: now,
        expiresAt: now + ttlMs,
      });
    });
    return true;
  } catch (error) {
    if (error instanceof Error && error.message === "LOCK_HELD") {
      return false;
    }
    throw error;
  }
}

/**
 * ロックを解放
 */
async function releaseBookingLock(
  db: FirebaseFirestore.Firestore,
  lockKey: string,
  requestId: string,
): Promise<void> {
  const lockRef = db.collection("bookingLocks").doc(lockKey);
  try {
    await db.runTransaction(async (transaction) => {
      const lockDoc = await transaction.get(lockRef);
      if (lockDoc.exists && lockDoc.data()?.requestId === requestId) {
        transaction.delete(lockRef);
      }
    });
  } catch (error) {
    // ロック解放失敗はログのみ（TTLで自動解放される）
    console.warn("Failed to release lock:", lockKey, error);
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  let rawBody: unknown = null;
  let lockKey: string | null = null;
  const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  let firestoreDb: FirebaseFirestore.Firestore | null = null;

  try {
    // 1. リクエストボディを取得
    rawBody = await readBody(event);

    // 2. 入力検証
    const validatedData = validateInput(createBookingSchema, rawBody);

    // 3. Firebase Admin初期化
    const db = getFirestoreAdmin();
    if (!db) {
      throw createError({
        statusCode: 500,
        message: "Firebase Admin SDK is not initialized",
      });
    }
    firestoreDb = db;

    // 4. Race Condition対策: 予約期間のロックを取得
    lockKey = generateLockKey(
      validatedData.checkInDate,
      validatedData.checkOutDate,
    );

    const maxRetries = 3;
    let lockAcquired = false;

    for (let i = 0; i < maxRetries; i++) {
      lockAcquired = await acquireBookingLock(db, lockKey, requestId);
      if (lockAcquired) break;

      // ロック取得失敗時は少し待ってリトライ
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    if (!lockAcquired) {
      throw createError({
        statusCode: 409,
        message:
          "この日程は現在他の予約処理中です。しばらくしてから再度お試しください。",
      });
    }

    // 5. 料金設定を取得
    const pricingDoc = await db.collection("pricing").doc("default").get();
    const pricingRule = pricingDoc.exists
      ? (pricingDoc.data() as PricingRule)
      : DEFAULT_PRICING;

    // 6. クーポン割引を計算
    let couponDiscount = 0;
    let couponId = "";
    if (validatedData.couponCode) {
      const couponSnapshot = await db
        .collection("coupons")
        .where("code", "==", validatedData.couponCode)
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (!couponSnapshot.empty) {
        const coupon = couponSnapshot.docs[0].data();
        couponId = couponSnapshot.docs[0].id;

        // クーポン有効期限チェック
        if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
          throw createError({
            statusCode: 400,
            message: "クーポンの有効期限が切れています",
          });
        }

        // 使用回数制限チェック
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          throw createError({
            statusCode: 400,
            message: "クーポンの使用回数が上限に達しています",
          });
        }

        couponDiscount = coupon.discountAmount || 0;
      } else {
        throw createError({
          statusCode: 400,
          message: "無効なクーポンコードです",
        });
      }
    }

    // 7. サーバーサイドで金額を再計算
    const calculatedAmount = calculateBookingAmount(
      new Date(validatedData.checkInDate),
      new Date(validatedData.checkOutDate),
      validatedData.guestCount,
      pricingRule,
      couponDiscount,
    );

    // 8. クライアントから送信された金額と検証（改ざん防止）
    if (
      validatedData.amount &&
      !validateAmount(calculatedAmount, validatedData.amount)
    ) {
      console.error("金額の不一致:", {
        calculated: calculatedAmount,
        client: validatedData.amount,
      });
      throw createError({
        statusCode: 400,
        message: "金額の検証に失敗しました。ページを再読み込みしてください。",
      });
    }

    // 9. トランザクションで予約を作成（同時予約防止）
    const result = await db.runTransaction(async (transaction) => {
      const checkInDate = Timestamp.fromDate(
        new Date(validatedData.checkInDate),
      );
      const checkOutDate = Timestamp.fromDate(
        new Date(validatedData.checkOutDate),
      );

      // 9-1. 同じ期間の予約を検索
      const conflictingBookingsRef = db
        .collection("bookings")
        .where("status", "in", ["pending", "confirmed"])
        .where("checkInDate", "<", checkOutDate)
        .where("checkOutDate", ">", checkInDate);

      const conflictingBookings = await transaction.get(conflictingBookingsRef);

      // 9-2. 重複があればエラー
      if (!conflictingBookings.empty) {
        throw new Error(
          "この期間は既に予約されています。別の日程をお選びください。",
        );
      }

      // 9-3. 予約データを作成
      const bookingRef = db.collection("bookings").doc();
      const bookingData = {
        checkInDate,
        checkOutDate,
        guestName: validatedData.guestName,
        guestEmail: validatedData.guestEmail,
        guestPhone: validatedData.guestPhone,
        guestCount: validatedData.guestCount,
        notes: validatedData.notes || "",

        // 金額情報
        totalAmount: calculatedAmount,
        baseAmount: calculatedAmount + couponDiscount - pricingRule.cleaningFee,
        cleaningFee: pricingRule.cleaningFee,
        couponDiscount,
        couponId,
        couponCode: validatedData.couponCode || "",

        // ステータス
        status: "pending",
        paymentStatus: "pending",

        // 審査ステータス（与信確保後に審査開始）
        reviewStatus: "pending_review",
        reviewDeadline: Timestamp.fromDate(
          new Date(Date.now() + 48 * 60 * 60 * 1000),
        ), // 48時間後

        // システム情報
        bookingReference: generateBookingReference(),
        bookingToken: generateSecureToken(),
        stripePaymentIntentId: "", // 後で設定

        // タイムスタンプ
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      transaction.set(bookingRef, bookingData);

      // クーポン使用回数を増加
      if (couponId) {
        const couponRef = db.collection("coupons").doc(couponId);
        transaction.update(couponRef, {
          usedCount: FieldValue.increment(1),
        });
      }

      return {
        bookingId: bookingRef.id,
        bookingReference: bookingData.bookingReference,
        amount: calculatedAmount,
      };
    });

    // 10. メール送信
    const checkIn = new Date(validatedData.checkInDate);
    const checkOut = new Date(validatedData.checkOutDate);
    const formattedCheckIn = `${checkIn.getFullYear()}年${checkIn.getMonth() + 1}月${checkIn.getDate()}日`;
    const formattedCheckOut = `${checkOut.getFullYear()}年${checkOut.getMonth() + 1}月${checkOut.getDate()}日`;

    // 10-1. ゲストに予約受付確認メールを送信
    try {
      // bookingTokenを取得
      const bookingDoc = await firestoreDb
        .collection("bookings")
        .doc(result.bookingId)
        .get();
      const bookingToken = bookingDoc.data()?.bookingToken || "";

      await sendEmailWithRetry("/api/emails/send-booking-confirmation", {
        method: "POST",
        headers: {
          "x-internal-secret": config.internalApiSecret,
        },
        body: {
          to: validatedData.guestEmail,
          bookingId: result.bookingId,
          bookingReference: result.bookingReference,
          bookingToken,
          guestName: validatedData.guestName,
          checkInDate: formattedCheckIn,
          checkOutDate: formattedCheckOut,
          totalAmount: calculatedAmount,
          isPendingReview: true,
        },
      });
      console.log("✅ ゲストへの予約受付確認メール送信成功");
    } catch (emailError) {
      console.error("⚠️ ゲスト確認メール送信失敗（リトライ後）:", emailError);
    }

    // 10-2. 管理者に新規予約通知メールを送信
    try {
      await sendEmailWithRetry("/api/emails/send-admin-notification", {
        method: "POST",
        headers: {
          "x-internal-secret": config.internalApiSecret,
        },
        body: {
          type: "new_booking_request",
          bookingId: result.bookingId,
          bookingReference: result.bookingReference,
          guestName: validatedData.guestName,
          guestEmail: validatedData.guestEmail,
          guestPhone: validatedData.guestPhone || "",
          checkInDate: formattedCheckIn,
          checkOutDate: formattedCheckOut,
          guestCount: validatedData.guestCount,
          totalAmount: calculatedAmount,
          notes: validatedData.notes || "",
        },
      });
    } catch (emailError) {
      // メール送信失敗は予約作成の成功に影響させない（リトライ済み）
      console.error("⚠️ 管理者通知メール送信失敗（リトライ後）:", emailError);
    }

    // 11. ロックを解放
    if (lockKey && firestoreDb) {
      await releaseBookingLock(firestoreDb, lockKey, requestId);
    }

    // 12. 成功レスポンス
    console.log("✅ 予約作成成功:", result);

    return {
      success: true,
      bookingId: result.bookingId,
      bookingReference: result.bookingReference,
      amount: result.amount,
    };
  } catch (error: unknown) {
    // エラー時もロックを解放
    if (lockKey && firestoreDb) {
      await releaseBookingLock(firestoreDb, lockKey, requestId);
    }

    console.error("❌ 予約作成エラー:", error);

    // エラーログをFirestoreに記録（オプション）
    try {
      const errorDb = getFirestoreAdmin();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await errorDb.collection("errorLogs").add({
        type: "booking_creation_failed",
        error: errorMessage,
        timestamp: FieldValue.serverTimestamp(),
      });
    } catch (_logError) {
      console.error("エラーログ記録失敗");
    }

    // クライアントへのエラーレスポンス
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    throw createError({
      statusCode,
      message: "予約の作成に失敗しました",
    });
  }
});
