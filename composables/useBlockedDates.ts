import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp, orderBy } from 'firebase/firestore'

export interface BlockedDate {
  id?: string
  startDate: Date
  endDate: Date
  reason: string
  createdAt?: Date
}

export function useBlockedDates() {
  const { $db } = useNuxtApp()
  const blockedDates = ref<BlockedDate[]>([])
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
    } catch (e: any) {
      error.value = e.message
      console.error('❌ Error adding blocked date:', e)
      throw e
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
    } catch (e: any) {
      error.value = e.message
      console.error('❌ Error deleting blocked date:', e)
      throw e
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
    } catch (e: any) {
      error.value = e.message
      console.error('❌ Error loading blocked dates:', e)
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

  return {
    blockedDates,
    loading,
    error,
    addBlockedDate,
    deleteBlockedDate,
    loadBlockedDates,
    isDateRangeBlocked,
    isDateBlocked,
    getBlockedReason
  }
}
