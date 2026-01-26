/**
 * 予約作成API（サーバーサイド）
 * Firebase Admin SDKを使用してFirestoreに予約を作成
 * クライアントサイド認証の問題を回避するためのエンドポイント
 */

import { Timestamp, FieldValue } from "firebase-admin/firestore";
import {
  getFirestoreAdmin,
  generateSecureToken,
} from "~/server/utils/firebase-admin";

interface CreateBookingBody {
  userId?: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestPostalCode?: string; // 郵便番号
  guestAddress?: string; // 住所
  guestOccupation?: string; // 職業
  isForeignNational?: boolean; // 外国籍かどうか
  guestNationality?: string; // 国籍（外国籍の場合）
  guestPassportNumber?: string; // パスポート番号（外国籍の場合）
  // 法人予約関連
  isCorporate?: boolean;
  companyName?: string;
  invoiceRequired?: boolean;
  totalAmount: number;
  baseAmount: number;
  cleaningFee?: number;
  couponDiscount?: number;
  couponCode?: string;
  notes?: string;
  selectedOptions?: Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }>;
  optionsTotalPrice?: number;
  stripePaymentIntentId: string;
}

// 予約番号を生成（人間が読みやすい形式）
function generateBookingReference(): string {
  const prefix = "FH"; // Furniture House
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

// 予約確認用トークンを生成（セキュアなランダム文字列）
// crypto.randomBytes を使用した安全な実装に変更
function generateBookingToken(): string {
  return generateSecureToken();
}

export default defineEventHandler(async (event) => {
  try {
    // 1. リクエストボディを取得
    const body = await readBody<CreateBookingBody>(event);

    // 2. 基本的なバリデーション
    if (!body.checkInDate || !body.checkOutDate) {
      throw createError({
        statusCode: 400,
        message: "開始日と終了日は必須です",
      });
    }

    if (!body.guestName || !body.guestEmail) {
      throw createError({
        statusCode: 400,
        message: "ゲスト名とメールアドレスは必須です",
      });
    }

    // 0円予約（100%割引クーポン）の場合はPayment Intentが不要
    const isZeroAmountBooking = body.totalAmount === 0;
    if (!isZeroAmountBooking && !body.stripePaymentIntentId) {
      throw createError({
        statusCode: 400,
        message: "決済情報が不足しています",
      });
    }

    // 3. Firebase Admin初期化
    const db = getFirestoreAdmin();

    // 4. 日付をTimestampに変換
    const checkInDate = Timestamp.fromDate(new Date(body.checkInDate));
    const checkOutDate = Timestamp.fromDate(new Date(body.checkOutDate));

    // 5. 既存予約との重複チェック
    // pending, pending_review, confirmed のステータスの予約と日程が重複していないか確認
    const conflictingBookingsRef = db
      .collection("bookings")
      .where("status", "in", ["pending", "pending_review", "confirmed"])
      .where("checkInDate", "<", checkOutDate)
      .where("checkOutDate", ">", checkInDate);

    const conflictingBookings = await conflictingBookingsRef.get();

    if (!conflictingBookings.empty) {
      console.log("❌ 予約重複エラー:", {
        requestedCheckIn: body.checkInDate,
        requestedCheckOut: body.checkOutDate,
        conflictingCount: conflictingBookings.size,
      });
      throw createError({
        statusCode: 409,
        message: "この期間は既に予約されています。別の日程をお選びください。",
      });
    }

    // 6. 予約データを作成
    const bookingReference = generateBookingReference();
    const bookingToken = generateBookingToken();

    const bookingData = {
      bookingReference,
      bookingToken,
      type: "stay" as const,
      // ユーザーIDを保存（マイページで予約一覧を表示するため）
      ...(body.userId && { userId: body.userId }),
      checkInDate,
      checkOutDate,
      startDate: checkInDate,
      endDate: checkOutDate,
      guestCount: body.guestCount,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone || "",
      guestPostalCode: body.guestPostalCode || "",
      guestAddress: body.guestAddress || "",
      guestOccupation: body.guestOccupation || "",
      isForeignNational: body.isForeignNational || false,
      ...(body.isForeignNational &&
        body.guestNationality && { guestNationality: body.guestNationality }),
      ...(body.isForeignNational &&
        body.guestPassportNumber && {
          guestPassportNumber: body.guestPassportNumber,
        }),
      // 法人予約関連
      isCorporate: body.isCorporate || false,
      ...(body.isCorporate &&
        body.companyName && { companyName: body.companyName }),
      invoiceRequired: body.invoiceRequired || false,
      status: "pending" as const,
      // 0円予約の場合は決済不要
      paymentStatus: isZeroAmountBooking
        ? ("not_required" as const)
        : ("pending" as const),
      isZeroAmountBooking,
      totalAmount: body.totalAmount,
      baseAmount: body.baseAmount,
      cleaningFee: body.cleaningFee || 0,
      discountAmount: body.couponDiscount || 0,
      ...(body.couponCode && { couponId: body.couponCode }),
      ...(body.notes && { notes: body.notes }),
      ...(body.selectedOptions &&
        body.selectedOptions.length > 0 && {
          selectedOptions: body.selectedOptions,
          optionsTotalPrice: body.optionsTotalPrice || 0,
        }),
      // 0円予約の場合はPayment Intent IDは空
      ...(body.stripePaymentIntentId && {
        stripePaymentIntentId: body.stripePaymentIntentId,
      }),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // 7. Firestoreに保存
    const docRef = await db.collection("bookings").add(bookingData);
    const bookingId = docRef.id;

    console.log("✅ 予約作成成功（サーバーサイドAPI）:", {
      bookingId,
      bookingReference,
      guestEmail: body.guestEmail,
    });

    // 8. 成功レスポンス
    return {
      success: true,
      bookingId,
      bookingReference,
    };
  } catch (error: unknown) {
    console.error("❌ 予約作成エラー（サーバーサイドAPI）:", error);

    // エラーレスポンス
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    const message =
      error instanceof Error ? error.message : "予約の作成に失敗しました";

    throw createError({
      statusCode,
      message,
    });
  }
});
