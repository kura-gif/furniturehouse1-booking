import {
  isFirestoreTimestamp,
  type FirestoreTimestamp,
} from "./error-handling";

/** Firestore Timestampまたは日付型 */
type DateLike = Date | FirestoreTimestamp | string;

/** 予約データの型 */
interface BookingData {
  guestName?: string;
  bookingReference?: string;
  checkInDate?: DateLike;
  checkOutDate?: DateLike;
  totalAmount?: number;
  guestCount?: number;
  bookingToken?: string;
  guestEmail?: string;
  guestPhone?: string;
}

/**
 * テンプレート内の変数を置換
 *
 * @param template テンプレート文字列
 * @param variables 変数のキー・値マップ
 * @returns 変数が置換された文字列
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string | number | undefined>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

/**
 * 予約情報からテンプレート変数を生成
 *
 * @param booking 予約情報
 * @returns テンプレート変数のマップ
 */
export function getTemplateVariables(
  booking: BookingData,
): Record<string, string> {
  const checkInDate = formatDate(booking.checkInDate);
  const checkOutDate = formatDate(booking.checkOutDate);
  const daysUntilCheckIn = calculateDaysUntil(booking.checkInDate);

  return {
    guestName: booking.guestName || "",
    bookingReference: booking.bookingReference || "",
    checkInDate,
    checkOutDate,
    totalAmount: booking.totalAmount?.toLocaleString() || "0",
    guestCount: String(booking.guestCount || 1),
    daysUntilCheckIn: String(daysUntilCheckIn),
    bookingToken: booking.bookingToken || "",
    guestEmail: booking.guestEmail || "",
    guestPhone: booking.guestPhone || "",
  };
}

/**
 * Timestamp または Date を日本語形式の日付文字列に変換
 *
 * @param date Firestore Timestamp または Date オブジェクト
 * @returns 日本語形式の日付（例: 2025年1月15日（水））
 */
export function formatDate(date: DateLike | undefined): string {
  let jsDate: Date;

  // Firestore Timestamp の場合
  if (isFirestoreTimestamp(date)) {
    jsDate = date.toDate();
  } else if (date instanceof Date) {
    jsDate = date;
  } else {
    return "";
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const year = jsDate.getFullYear();
  const month = jsDate.getMonth() + 1;
  const day = jsDate.getDate();
  const weekday = weekdays[jsDate.getDay()];

  return `${year}年${month}月${day}日（${weekday}）`;
}

/**
 * チェックインまでの日数を計算
 *
 * @param checkInDate チェックイン日
 * @returns チェックインまでの日数
 */
export function calculateDaysUntil(checkInDate: DateLike | undefined): number {
  let jsDate: Date;

  // Firestore Timestamp の場合
  if (isFirestoreTimestamp(checkInDate)) {
    jsDate = checkInDate.toDate();
  } else if (checkInDate instanceof Date) {
    jsDate = checkInDate;
  } else {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  jsDate.setHours(0, 0, 0, 0);

  const diffTime = jsDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}
