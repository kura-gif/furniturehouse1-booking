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
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

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
        selectedOptions.forEach((opt: any) => {
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

    options.forEach((option: any) => {
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
  } catch (error: any) {
    console.error('オプション可用性チェックエラー:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'オプション可用性の確認に失敗しました'
    })
  }
})
