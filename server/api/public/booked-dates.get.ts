import { getFirestoreAdmin } from '~/server/utils/firebase-admin'

interface BookedDateRange {
  startDate: string
  endDate: string
}

/**
 * 予約済み日付を取得するAPI（認証不要）
 * pending_review（承認待ち）とconfirmed（確定）ステータスの予約日付を返す
 */
export default defineEventHandler(async (): Promise<{ success: boolean; bookedDates: BookedDateRange[]; error?: string }> => {
  try {
    const db = getFirestoreAdmin()

    // pending_review（承認待ち）とconfirmed（確定）ステータスの予約を取得
    const bookingsSnapshot = await db.collection('bookings')
      .where('status', 'in', ['pending_review', 'confirmed'])
      .get()

    const bookedDates: BookedDateRange[] = []

    bookingsSnapshot.docs.forEach(doc => {
      const data = doc.data()

      // startDate/endDateまたはcheckInDate/checkOutDateを使用
      const startDate = data.startDate || data.checkInDate
      const endDate = data.endDate || data.checkOutDate

      if (startDate && endDate) {
        // Firestoreのタイムスタンプを日付文字列に変換
        const start = startDate.toDate ? startDate.toDate() : new Date(startDate)
        const end = endDate.toDate ? endDate.toDate() : new Date(endDate)

        bookedDates.push({
          startDate: formatDateString(start),
          endDate: formatDateString(end)
        })
      }
    })

    return {
      success: true,
      bookedDates
    }
  } catch (error: any) {
    console.error('[API /public/booked-dates] Error:', error.message)
    return {
      success: false,
      bookedDates: [],
      error: '予約済み日付の取得に失敗しました'
    }
  }
})

function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
