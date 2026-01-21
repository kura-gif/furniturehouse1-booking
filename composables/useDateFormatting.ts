/**
 * 日付フォーマットユーティリティ composable
 *
 * サーバー側 server/utils/date-formatting.ts と同様の機能をクライアント側で提供
 * Firestore Timestamp、Date、文字列、数値など様々な形式に対応
 */

import { Timestamp } from "firebase/firestore";

/** 日付として受け入れ可能な型 */
export type DateLike =
  | Timestamp
  | { toDate: () => Date }
  | Date
  | string
  | number
  | null
  | undefined;

/**
 * 様々な形式の日付を Date オブジェクトに変換
 * @param value - 変換する値
 * @returns Date オブジェクト、または無効な場合は null
 */
export function toDate(value: DateLike): Date | null {
  if (!value) return null;

  try {
    // Firestore Timestamp
    if (value instanceof Timestamp) {
      return value.toDate();
    }

    // toDate メソッドを持つオブジェクト（Timestamp 互換）
    if (
      typeof value === "object" &&
      value !== null &&
      "toDate" in value &&
      typeof value.toDate === "function"
    ) {
      return value.toDate();
    }

    // Date オブジェクト
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }

    // 文字列または数値（上記チェックで toDate メソッドを持つオブジェクトは処理済み）
    if (typeof value === "string" || typeof value === "number") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * 日本語形式の日付（年月日）
 * @example "2025年1月15日"
 */
export function formatJapaneseDate(value: DateLike): string {
  const date = toDate(value);
  if (!date) return "-";
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

/**
 * 曜日付きの日本語形式
 * @example "2025年1月15日（水）"
 */
export function formatJapaneseDateWithWeekday(value: DateLike): string {
  const date = toDate(value);
  if (!date) return "-";
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
}

/**
 * スラッシュ区切り形式
 * @example "2025/1/15"
 */
export function formatSlashDate(value: DateLike): string {
  const date = toDate(value);
  if (!date) return "-";
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * ISO形式（YYYY-MM-DD）
 * @example "2025-01-15"
 */
export function formatISODate(value: DateLike): string {
  const date = toDate(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日時形式（スラッシュ区切り + 時:分）
 * @example "2025/1/15 14:30"
 */
export function formatDateTime(value: DateLike): string {
  const date = toDate(value);
  if (!date) return "-";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${hours}:${minutes}`;
}

/**
 * 時刻のみ
 * @example "14:30"
 */
export function formatTime(value: DateLike): string {
  const date = toDate(value);
  if (!date) return "-";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * 相対的な日付表示（今日、昨日、○日前）
 * @example "今日 14:30", "昨日", "3日前"
 */
export function formatRelativeDate(value: DateLike): string {
  const date = toDate(value);
  if (!date) return "-";

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return formatTime(date);
  } else if (days === 1) {
    return "昨日";
  } else if (days < 7) {
    return `${days}日前`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

/**
 * 日付範囲のフォーマット
 * @example "2025年1月15日 〜 2025年1月17日"
 */
export function formatDateRange(start: DateLike, end: DateLike): string {
  const startStr = formatJapaneseDate(start);
  const endStr = formatJapaneseDate(end);
  if (startStr === "-" || endStr === "-") return "-";
  return `${startStr} 〜 ${endStr}`;
}

/**
 * 2つの日付間の日数を計算
 */
export function daysBetween(start: DateLike, end: DateLike): number {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return 0;

  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 今日から指定日までの日数を計算
 */
export function daysUntil(targetDate: DateLike): number {
  return daysBetween(new Date(), targetDate);
}

/**
 * composable として使用する場合のエクスポート
 */
export const useDateFormatting = () => {
  return {
    toDate,
    formatJapaneseDate,
    formatJapaneseDateWithWeekday,
    formatSlashDate,
    formatISODate,
    formatDateTime,
    formatTime,
    formatRelativeDate,
    formatDateRange,
    daysBetween,
    daysUntil,
  };
};
