/**
 * 日付フォーマットユーティリティ
 * 日本語形式の日付変換を一元管理
 */

import { isFirestoreTimestamp, type FirestoreTimestamp } from './error-handling'

/** 日付として受け入れ可能な型 */
type DateLike = Date | FirestoreTimestamp | string | number | null | undefined

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

/**
 * 任意の日付形式をDateオブジェクトに変換
 *
 * @param value - 変換対象（Date, Firestore Timestamp, ISO文字列, ミリ秒）
 * @returns Date オブジェクト、変換できない場合は null
 */
export function toDate(value: DateLike): Date | null {
  if (!value) {
    return null
  }

  // Firestore Timestamp
  if (isFirestoreTimestamp(value)) {
    return value.toDate()
  }

  // Date オブジェクト
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value
  }

  // 文字列 (ISO形式など)
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  // 数値 (ミリ秒)
  if (typeof value === 'number') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }

  return null
}

/**
 * 日本語形式の日付文字列に変換
 * 例: 2025年1月15日
 *
 * @param value - 変換対象の日付
 * @returns フォーマット済み文字列、変換できない場合は空文字
 */
export function formatJapaneseDate(value: DateLike): string {
  const date = toDate(value)
  if (!date) {
    return ''
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}年${month}月${day}日`
}

/**
 * 日本語形式の日付文字列に変換（曜日付き）
 * 例: 2025年1月15日（水）
 *
 * @param value - 変換対象の日付
 * @returns フォーマット済み文字列、変換できない場合は空文字
 */
export function formatJapaneseDateWithWeekday(value: DateLike): string {
  const date = toDate(value)
  if (!date) {
    return ''
  }

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = WEEKDAYS[date.getDay()]

  return `${year}年${month}月${day}日（${weekday}）`
}

/**
 * ISO形式の日付文字列に変換
 * 例: 2025-01-15
 *
 * @param value - 変換対象の日付
 * @returns ISO形式の日付文字列、変換できない場合は空文字
 */
export function formatISODate(value: DateLike): string {
  const date = toDate(value)
  if (!date) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 日付範囲を日本語形式でフォーマット
 * 例: 2025年1月15日 〜 2025年1月17日
 *
 * @param start - 開始日
 * @param end - 終了日
 * @returns フォーマット済み文字列
 */
export function formatDateRange(start: DateLike, end: DateLike): string {
  const startStr = formatJapaneseDate(start)
  const endStr = formatJapaneseDate(end)

  if (!startStr || !endStr) {
    return ''
  }

  return `${startStr} 〜 ${endStr}`
}

/**
 * 今日から指定日までの日数を計算
 *
 * @param targetDate - 目標日
 * @returns 日数（過去の場合は負の値）
 */
export function daysUntil(targetDate: DateLike): number {
  const target = toDate(targetDate)
  if (!target) {
    return 0
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDay = new Date(target)
  targetDay.setHours(0, 0, 0, 0)

  const diffTime = targetDay.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * 2つの日付間の日数を計算
 *
 * @param start - 開始日
 * @param end - 終了日
 * @returns 日数
 */
export function daysBetween(start: DateLike, end: DateLike): number {
  const startDate = toDate(start)
  const endDate = toDate(end)

  if (!startDate || !endDate) {
    return 0
  }

  const startDay = new Date(startDate)
  startDay.setHours(0, 0, 0, 0)

  const endDay = new Date(endDate)
  endDay.setHours(0, 0, 0, 0)

  const diffTime = endDay.getTime() - startDay.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
