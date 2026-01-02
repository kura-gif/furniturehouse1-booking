/**
 * テンプレート内の変数を置換
 */
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, any>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match
  })
}

/**
 * 予約情報からテンプレート変数を生成
 */
export function getTemplateVariables(booking: any): Record<string, string> {
  const checkInDate = formatDate(booking.checkInDate)
  const checkOutDate = formatDate(booking.checkOutDate)
  const daysUntilCheckIn = calculateDaysUntil(booking.checkInDate)

  return {
    guestName: booking.guestName || '',
    bookingReference: booking.bookingReference || '',
    checkInDate,
    checkOutDate,
    totalAmount: booking.totalAmount?.toLocaleString() || '0',
    guestCount: String(booking.guestCount || 1),
    daysUntilCheckIn: String(daysUntilCheckIn),
    bookingToken: booking.bookingToken || '',
    guestEmail: booking.guestEmail || '',
    guestPhone: booking.guestPhone || ''
  }
}

/**
 * Firestore Timestamp を日本語形式の日付文字列に変換
 */
export function formatDate(date: any): string {
  let jsDate: Date

  // Firestore Timestamp の場合
  if (date && typeof date.toDate === 'function') {
    jsDate = date.toDate()
  } else if (date instanceof Date) {
    jsDate = date
  } else if (date && date._seconds) {
    // Firestore Timestampオブジェクト
    jsDate = new Date(date._seconds * 1000)
  } else {
    return ''
  }

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const year = jsDate.getFullYear()
  const month = jsDate.getMonth() + 1
  const day = jsDate.getDate()
  const weekday = weekdays[jsDate.getDay()]

  return `${year}年${month}月${day}日（${weekday}）`
}

/**
 * チェックインまでの日数を計算
 */
export function calculateDaysUntil(checkInDate: any): number {
  let jsDate: Date

  // Firestore Timestamp の場合
  if (checkInDate && typeof checkInDate.toDate === 'function') {
    jsDate = checkInDate.toDate()
  } else if (checkInDate instanceof Date) {
    jsDate = checkInDate
  } else if (checkInDate && checkInDate._seconds) {
    jsDate = new Date(checkInDate._seconds * 1000)
  } else {
    return 0
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  jsDate.setHours(0, 0, 0, 0)

  const diffTime = jsDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}
