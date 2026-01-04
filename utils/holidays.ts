/**
 * 日本の祝日・休日を管理するユーティリティ
 */

export interface Holiday {
  date: string // YYYY-MM-DD形式
  name: string
}

/**
 * 2025-2026年の日本の祝日
 * 参考: https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html
 */
export const JAPANESE_HOLIDAYS: Holiday[] = [
  // 2025年
  { date: '2025-01-01', name: '元日' },
  { date: '2025-01-13', name: '成人の日' },
  { date: '2025-02-11', name: '建国記念の日' },
  { date: '2025-02-23', name: '天皇誕生日' },
  { date: '2025-02-24', name: '振替休日' },
  { date: '2025-03-20', name: '春分の日' },
  { date: '2025-04-29', name: '昭和の日' },
  { date: '2025-05-03', name: '憲法記念日' },
  { date: '2025-05-04', name: 'みどりの日' },
  { date: '2025-05-05', name: 'こどもの日' },
  { date: '2025-05-06', name: '振替休日' },
  { date: '2025-07-21', name: '海の日' },
  { date: '2025-08-11', name: '山の日' },
  { date: '2025-09-15', name: '敬老の日' },
  { date: '2025-09-23', name: '秋分の日' },
  { date: '2025-10-13', name: 'スポーツの日' },
  { date: '2025-11-03', name: '文化の日' },
  { date: '2025-11-23', name: '勤労感謝の日' },
  { date: '2025-11-24', name: '振替休日' },

  // 2026年
  { date: '2026-01-01', name: '元日' },
  { date: '2026-01-12', name: '成人の日' },
  { date: '2026-02-11', name: '建国記念の日' },
  { date: '2026-02-23', name: '天皇誕生日' },
  { date: '2026-03-20', name: '春分の日' },
  { date: '2026-04-29', name: '昭和の日' },
  { date: '2026-05-03', name: '憲法記念日' },
  { date: '2026-05-04', name: 'みどりの日' },
  { date: '2026-05-05', name: 'こどもの日' },
  { date: '2026-05-06', name: '振替休日' },
  { date: '2026-07-20', name: '海の日' },
  { date: '2026-08-11', name: '山の日' },
  { date: '2026-09-21', name: '敬老の日' },
  { date: '2026-09-22', name: '国民の休日' },
  { date: '2026-09-23', name: '秋分の日' },
  { date: '2026-10-12', name: 'スポーツの日' },
  { date: '2026-11-03', name: '文化の日' },
  { date: '2026-11-23', name: '勤労感謝の日' },
]

/**
 * 指定された日付が祝日かどうかを判定
 */
export function isHoliday(date: Date): boolean {
  const dateStr = formatDateToYYYYMMDD(date)
  return JAPANESE_HOLIDAYS.some(h => h.date === dateStr)
}

/**
 * 指定された日付の祝日名を取得
 */
export function getHolidayName(date: Date): string | null {
  const dateStr = formatDateToYYYYMMDD(date)
  const holiday = JAPANESE_HOLIDAYS.find(h => h.date === dateStr)
  return holiday ? holiday.name : null
}

/**
 * 指定された日付が日曜日かどうかを判定
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0
}

/**
 * 指定された日付が土曜日かどうかを判定
 */
export function isSaturday(date: Date): boolean {
  return date.getDay() === 6
}

/**
 * Date を YYYY-MM-DD 形式の文字列に変換
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
