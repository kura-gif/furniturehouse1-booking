export const useEmail = () => {
  /**
   * 予約確定メールを送信
   */
  const sendBookingConfirmationEmail = async (
    to: string,
    bookingData: {
      bookingId: string
      bookingReference: string
      bookingToken: string
      guestName: string
      checkInDate: string
      checkOutDate: string
      totalAmount: number
    }
  ) => {
    try {
      const response = await $fetch('/api/emails/send-booking-confirmation', {
        method: 'POST',
        body: bookingData
      })

      return response
    } catch (error) {
      console.error('予約確定メール送信エラー:', error)
      throw error
    }
  }

  /**
   * 予約キャンセルメールを送信
   */
  const sendBookingCancellationEmail = async (
    to: string,
    bookingData: {
      bookingId: string
      guestName: string
      checkInDate: string
      checkOutDate: string
    }
  ) => {
    try {
      const response = await $fetch('/api/emails/send-booking-cancellation', {
        method: 'POST',
        body: {
          to,
          ...bookingData
        }
      })

      return response
    } catch (error) {
      console.error('キャンセルメール送信エラー:', error)
      // メール送信に失敗しても続行（ログだけ取る）
      return null
    }
  }

  /**
   * チェックインリマインダーメールを送信
   */
  const sendCheckInReminderEmail = async (
    to: string,
    bookingData: {
      bookingId: string
      guestName: string
      checkInDate: string
      checkInTime: string
      address: string
    }
  ) => {
    try {
      const response = await $fetch('/api/emails/send-checkin-reminder', {
        method: 'POST',
        body: {
          to,
          ...bookingData
        }
      })

      return response
    } catch (error) {
      console.error('リマインダーメール送信エラー:', error)
      return null
    }
  }

  return {
    sendBookingConfirmationEmail,
    sendBookingCancellationEmail,
    sendCheckInReminderEmail
  }
}
