import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp
} from 'firebase/firestore'
import type { Booking, CreateBookingRequest } from '~/types'

export const useBookings = () => {
  const { $db } = useNuxtApp()
  const { user } = useAuth()

  // 予約番号を生成（人間が読みやすい形式）
  const generateBookingReference = (): string => {
    const prefix = 'FH' // Furniture House
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${date}-${random}`
  }

  // 予約確認用トークンを生成（セキュアなランダム文字列）
  const generateBookingToken = (): string => {
    return Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2)
    ).join('')
  }

  // 予約を作成（ゲストユーザーにも対応）
  const createBooking = async (bookingData: CreateBookingRequest): Promise<string> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const bookingReference = generateBookingReference()
      const bookingToken = generateBookingToken()

      if (!bookingData.startDate || !bookingData.endDate) {
        throw new Error('開始日と終了日は必須です')
      }
      const startDateTimestamp = Timestamp.fromDate(bookingData.startDate)
      const endDateTimestamp = Timestamp.fromDate(bookingData.endDate)

      const booking: Omit<Booking, 'id'> = {
        // userIdはログインユーザーの場合のみ設定
        ...(user.value && { userId: user.value.uid }),
        bookingReference,
        bookingToken,
        type: bookingData.type,
        checkInDate: startDateTimestamp,
        checkOutDate: endDateTimestamp,
        startDate: startDateTimestamp,
        endDate: endDateTimestamp,
        guestCount: bookingData.guestCount,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        guestPhone: bookingData.guestPhone,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: bookingData.totalAmount,
        baseAmount: bookingData.baseAmount,
        discountAmount: bookingData.discountAmount,
        ...(bookingData.couponCode && { couponId: bookingData.couponCode }),
        ...(bookingData.notes && { notes: bookingData.notes }),
        ...(bookingData.selectedOptions && bookingData.selectedOptions.length > 0 && {
          selectedOptions: bookingData.selectedOptions,
          optionsTotalPrice: bookingData.optionsTotalPrice || 0
        }),
        ...(bookingData.stripePaymentIntentId && { stripePaymentIntentId: bookingData.stripePaymentIntentId }),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection($db, 'bookings'), booking)
      const bookingId = docRef.id

      // メール通知はStripe Webhook（payment_intent.amount_capturable_updated）で
      // 与信確保成功時に自動送信されるため、ここでは送信しない

      return bookingId
    } catch (error) {
      console.error('Create booking error:', error)
      throw new Error('予約の作成に失敗しました')
    }
  }

  // 予約一覧を取得（管理者用）
  const getAllBookings = async (): Promise<Booking[]> => {
    if (!$db) {
      console.error('[useBookings] Firestore is not initialized')
      throw new Error('Firestore is not initialized')
    }

    try {
      console.log('[useBookings] getAllBookings called')
      const q = query(
        collection($db, 'bookings'),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      console.log('[useBookings] Query completed, docs count:', querySnapshot.docs.length)

      const bookings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[]

      console.log('[useBookings] Bookings loaded:', bookings.length)
      return bookings
    } catch (error) {
      console.error('[useBookings] Get all bookings error:', error)
      throw new Error('予約の取得に失敗しました')
    }
  }

  // ユーザーの予約一覧を取得（userIdまたはguestEmailで検索）
  const getUserBookings = async (userId: string): Promise<Booking[]> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      // userIdで検索
      const userIdQuery = query(
        collection($db, 'bookings'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )

      const userIdSnapshot = await getDocs(userIdQuery)
      const bookingsByUserId = userIdSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Booking[]

      // guestEmailでも検索（ユーザーのメールアドレスを取得）
      const userEmail = user.value?.email
      if (userEmail) {
        const emailQuery = query(
          collection($db, 'bookings'),
          where('guestEmail', '==', userEmail),
          orderBy('createdAt', 'desc')
        )

        const emailSnapshot = await getDocs(emailQuery)
        const bookingsByEmail = emailSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[]

        // 重複を除去して結合
        const allBookings = [...bookingsByUserId]
        const existingIds = new Set(allBookings.map(b => b.id))

        for (const booking of bookingsByEmail) {
          if (!existingIds.has(booking.id)) {
            allBookings.push(booking)
          }
        }

        // 作成日時でソート
        allBookings.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime() || 0
          const bTime = b.createdAt?.toDate?.()?.getTime() || 0
          return bTime - aTime
        })

        return allBookings
      }

      return bookingsByUserId
    } catch (error) {
      console.error('Get user bookings error:', error)
      throw new Error('予約の取得に失敗しました')
    }
  }

  // 予約詳細を取得
  const getBooking = async (bookingId: string): Promise<Booking | null> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const docRef = doc($db, 'bookings', bookingId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Booking
      }
      return null
    } catch (error) {
      console.error('Get booking error:', error)
      throw new Error('予約の取得に失敗しました')
    }
  }

  // トークンで予約を取得（ゲストユーザー用）
  const getBookingByToken = async (token: string): Promise<Booking | null> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const q = query(
        collection($db, 'bookings'),
        where('bookingToken', '==', token)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null
      }

      const docSnap = querySnapshot.docs[0]
      return { id: docSnap.id, ...docSnap.data() } as Booking
    } catch (error) {
      console.error('Get booking by token error:', error)
      throw new Error('予約の取得に失敗しました')
    }
  }

  // 予約ステータスを更新
  const updateBookingStatus = async (
    bookingId: string,
    status: Booking['status']
  ): Promise<void> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const docRef = doc($db, 'bookings', bookingId)
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now()
      })

      // 予約が確定された場合、清掃タスクを自動生成
      if (status === 'confirmed') {
        try {
          const booking = await getBooking(bookingId)
          if (booking) {
            const { createCleaningTasks } = useCleaningTasks()
            await createCleaningTasks(booking)
            console.log('✅ 予約確定に伴い清掃タスクを自動生成しました')
          }
        } catch (taskError) {
          // タスク生成エラーは予約確定の処理を止めない
          console.error('清掃タスク自動生成エラー（処理は続行）:', taskError)
        }
      }
    } catch (error) {
      console.error('Update booking status error:', error)
      throw new Error('予約ステータスの更新に失敗しました')
    }
  }

  // 予約をキャンセル
  const cancelBooking = async (bookingId: string): Promise<void> => {
    await updateBookingStatus(bookingId, 'cancelled')
  }

  // 予約を確定
  const confirmBooking = async (bookingId: string): Promise<void> => {
    await updateBookingStatus(bookingId, 'confirmed')
  }

  // 指定期間の予約済み日付を取得
  const getBookedDates = async (
    startDate: Date,
    endDate: Date
  ): Promise<Date[]> => {
    if (!$db) throw new Error('Firestore is not initialized')

    try {
      const q = query(
        collection($db, 'bookings'),
        where('status', 'in', ['confirmed', 'pending']),
        where('startDate', '>=', Timestamp.fromDate(startDate)),
        where('startDate', '<=', Timestamp.fromDate(endDate))
      )

      const querySnapshot = await getDocs(q)
      const bookedDates: Date[] = []

      querySnapshot.forEach(doc => {
        const booking = doc.data() as Booking
        if (!booking.startDate || !booking.endDate) return
        const start = booking.startDate.toDate()
        const end = booking.endDate.toDate()

        // 予約期間のすべての日付を追加
        const current = new Date(start)
        while (current < end) {
          bookedDates.push(new Date(current))
          current.setDate(current.getDate() + 1)
        }
      })

      return bookedDates
    } catch (error) {
      console.error('Get booked dates error:', error)
      throw new Error('予約済み日付の取得に失敗しました')
    }
  }

  return {
    createBooking,
    getAllBookings,
    getUserBookings,
    getBooking,
    getBookingByToken,
    updateBookingStatus,
    cancelBooking,
    confirmBooking,
    getBookedDates
  }
}
