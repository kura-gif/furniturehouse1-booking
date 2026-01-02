/**
 * チェックイン日時から対象日付範囲を計算
 *
 * @param daysBeforeCheckIn チェックイン何日前
 * @param relativeToCheckOut チェックアウト基準かどうか
 * @returns 対象日の開始・終了時刻
 */
export function calculateTargetDate(
  daysBeforeCheckIn: number,
  relativeToCheckOut: boolean = false
) {
  const now = new Date()
  const targetDate = new Date(now)

  // daysBeforeCheckIn日後の日付を計算
  targetDate.setDate(targetDate.getDate() + daysBeforeCheckIn)

  // 対象日の0:00 から 23:59:59 までの範囲
  const start = new Date(targetDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(targetDate)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}
