import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore'

export interface BlockedDate {
  id?: string
  startDate: Date
  endDate: Date
  reason: string
  createdAt?: Date
}

export interface BookedDateRange {
  startDate: string
  endDate: string
}

export function useBlockedDates() {
  const { $db } = useNuxtApp()
  const blockedDates = ref<BlockedDate[]>([])
  const bookedDates = ref<BookedDateRange[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * ブロック期間を追加
   */
  const addBlockedDate = async (data: Omit<BlockedDate, 'id' | 'createdAt'>) => {
    if (!$db) {
      throw new Error('Firestore is not initialized')
    }

    try {
      loading.value = true
      error.value = null

      const docRef = await addDoc(collection($db, 'blockedDates'), {
        startDate: Timestamp.fromDate(data.startDate),
        endDate: Timestamp.fromDate(data.endDate),
        reason: data.reason,
        createdAt: Timestamp.now()
      })

      console.log('✅ Blocked date added:', docRef.id)
      await loadBlockedDates()
      return docRef.id
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error adding blocked date:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * ブロック期間を削除
   */
  const deleteBlockedDate = async (id: string) => {
    if (!$db) {
      throw new Error('Firestore is not initialized')
    }

    try {
      loading.value = true
      error.value = null

      await deleteDoc(doc($db, 'blockedDates', id))
      console.log('✅ Blocked date deleted:', id)
      await loadBlockedDates()
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error deleting blocked date:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * すべてのブロック期間を読み込み
   */
  const loadBlockedDates = async () => {
    if (!$db) {
      console.warn('Firestore is not initialized')
      return
    }

    try {
      loading.value = true
      error.value = null

      const q = query(
        collection($db, 'blockedDates'),
        orderBy('startDate', 'asc')
      )

      const snapshot = await getDocs(q)
      blockedDates.value = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          reason: data.reason,
          createdAt: data.createdAt?.toDate()
        }
      })

      console.log('✅ Loaded blocked dates:', blockedDates.value.length)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
      console.error('❌ Error loading blocked dates:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 指定された期間がブロックされているかチェック
   */
  const isDateRangeBlocked = (checkIn: Date, checkOut: Date): boolean => {
    return blockedDates.value.some(blocked => {
      // チェックイン日とチェックアウト日がブロック期間と重複しているか
      return (
        (checkIn >= blocked.startDate && checkIn < blocked.endDate) ||
        (checkOut > blocked.startDate && checkOut <= blocked.endDate) ||
        (checkIn <= blocked.startDate && checkOut >= blocked.endDate)
      )
    })
  }

  /**
   * 指定された期間が予約済みかチェック
   */
  const isDateRangeBooked = (checkIn: Date, checkOut: Date): boolean => {
    const checkInStr = formatDateString(checkIn)
    const checkOutStr = formatDateString(checkOut)

    return bookedDates.value.some(booked => {
      // 予約期間と重複しているかチェック
      // チェックアウト日は次の予約のチェックイン日として利用可能なので、< を使用
      return (
        (checkInStr >= booked.startDate && checkInStr < booked.endDate) ||
        (checkOutStr > booked.startDate && checkOutStr <= booked.endDate) ||
        (checkInStr <= booked.startDate && checkOutStr >= booked.endDate)
      )
    })
  }

  /**
   * 指定された期間が利用不可かチェック（ブロックまたは予約済み）
   */
  const isDateRangeUnavailable = (checkIn: Date, checkOut: Date): boolean => {
    return isDateRangeBlocked(checkIn, checkOut) || isDateRangeBooked(checkIn, checkOut)
  }

  /**
   * 特定の日付がブロックされているかチェック
   */
  const isDateBlocked = (date: Date): boolean => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    return blockedDates.value.some(blocked => {
      const startOnly = new Date(blocked.startDate.getFullYear(), blocked.startDate.getMonth(), blocked.startDate.getDate())
      const endOnly = new Date(blocked.endDate.getFullYear(), blocked.endDate.getMonth(), blocked.endDate.getDate())
      return dateOnly >= startOnly && dateOnly <= endOnly
    })
  }

  /**
   * 特定の日付のブロック理由を取得
   */
  const getBlockedReason = (date: Date): string | null => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const blocked = blockedDates.value.find(blocked => {
      const startOnly = new Date(blocked.startDate.getFullYear(), blocked.startDate.getMonth(), blocked.startDate.getDate())
      const endOnly = new Date(blocked.endDate.getFullYear(), blocked.endDate.getMonth(), blocked.endDate.getDate())
      return dateOnly >= startOnly && dateOnly <= endOnly
    })
    return blocked ? blocked.reason : null
  }

  /**
   * 予約済み日付を読み込み（pending_review, confirmedステータス）
   */
  const loadBookedDates = async () => {
    try {
      const response = await $fetch<{ success: boolean; bookedDates: BookedDateRange[] }>('/api/public/booked-dates')
      if (response.success) {
        bookedDates.value = response.bookedDates
        console.log('✅ Loaded booked dates:', bookedDates.value.length)
      }
    } catch (error: unknown) {
      console.error('❌ Error loading booked dates:', error)
    }
  }

  /**
   * 特定の日付が予約済みかチェック（pending_review, confirmedステータス）
   */
  const isDateBooked = (date: Date): boolean => {
    const dateString = formatDateString(date)
    return bookedDates.value.some(booked => {
      // チェックイン日は予約可能（前の予約のチェックアウト日と重なるため）
      // endDateは含まない（チェックアウト日は次の予約のチェックイン可能）
      return dateString >= booked.startDate && dateString < booked.endDate
    })
  }

  /**
   * 特定の日付が利用不可かチェック（ブロックまたは予約済み）
   */
  const isDateUnavailable = (date: Date): boolean => {
    return isDateBlocked(date) || isDateBooked(date)
  }

  /**
   * 日付文字列をフォーマット
   */
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return {
    blockedDates,
    bookedDates,
    loading,
    error,
    addBlockedDate,
    deleteBlockedDate,
    loadBlockedDates,
    loadBookedDates,
    isDateRangeBlocked,
    isDateRangeUnavailable,
    isDateBlocked,
    isDateBooked,
    isDateUnavailable,
    getBlockedReason
  }
}
