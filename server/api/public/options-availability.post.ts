/**
 * オプション可用性チェックAPI
 * POST /api/public/options-availability
 *
 * 指定日のオプション予約可能状況を返す
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { date, optionIds } = body

    if (!date) {
      throw createError({
        statusCode: 400,
        message: '日付が必要です'
      })
    }

    const checkDate = new Date(date)
    if (isNaN(checkDate.getTime())) {
      throw createError({
        statusCode: 400,
        message: '無効な日付形式です'
      })
    }

    const db = getFirestoreAdmin()

    // 対象オプションを取得
    let optionsQuery = db.collection('bookingOptions').where('isActive', '==', true)
    const optionsSnapshot = await optionsQuery.get()

    const options = optionsSnapshot.docs
      .filter(doc => !optionIds || optionIds.includes(doc.id))
      .map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          dailyLimit: data.dailyLimit as number
        }
      })

    // 日付の開始と終了
    const startOfDay = new Date(checkDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(checkDate)
    endOfDay.setHours(23, 59, 59, 999)

    // 指定日の予約を取得
    const bookingsSnapshot = await db
      .collection('bookings')
      .where('status', 'in', ['confirmed', 'pending', 'pending_review'])
      .get()

    // 各オプションの予約数をカウント
    const optionBookingCounts: Record<string, number> = {}

    bookingsSnapshot.docs.forEach(doc => {
      const booking = doc.data()

      // チェックイン日が指定日かどうか確認
      const checkInDate = booking.checkInDate?.toDate?.() || new Date(booking.checkInDate)
      if (checkInDate >= startOfDay && checkInDate <= endOfDay) {
        const selectedOptions = booking.selectedOptions || []
        selectedOptions.forEach((opt: { optionId: string }) => {
          if (!optionBookingCounts[opt.optionId]) {
            optionBookingCounts[opt.optionId] = 0
          }
          optionBookingCounts[opt.optionId]++
        })
      }
    })

    // 可用性情報を構築
    const availability: Record<string, {
      available: boolean
      remaining: number
      dailyLimit: number
    }> = {}

    options.forEach((option: { id: string; dailyLimit: number }) => {
      const bookedCount = optionBookingCounts[option.id] || 0
      const remaining = option.dailyLimit - bookedCount

      availability[option.id] = {
        available: remaining > 0,
        remaining: Math.max(0, remaining),
        dailyLimit: option.dailyLimit
      }
    })

    return {
      success: true,
      date: checkDate.toISOString().split('T')[0],
      availability
    }
  } catch (error: unknown) {
    console.error('オプション可用性チェックエラー:', error)
    // 4xxエラー（createErrorで意図的に作成）はそのまま再スロー
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    // 内部エラーは詳細を漏洩させない
    throw createError({
      statusCode: 500,
      message: 'オプション可用性の確認に失敗しました'
    })
  }
})
