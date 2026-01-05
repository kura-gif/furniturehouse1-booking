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

  /**
   * サポーターへのタスク割り当て通知メールを送信
   */
  const sendTaskAssignmentEmail = async (
    to: string,
    taskData: {
      supporterName: string
      taskType: string
      scheduledDate: string
      bookingReference: string
      estimatedDuration: number
    }
  ) => {
    try {
      const response = await $fetch('/api/emails/send-task-assignment', {
        method: 'POST',
        body: {
          to,
          ...taskData
        }
      })

      return response
    } catch (error) {
      console.error('タスク割り当てメール送信エラー:', error)
      return null
    }
  }

  /**
   * サポーターへのタスクリマインダーメールを送信
   */
  const sendTaskReminderEmail = async (
    to: string,
    taskData: {
      supporterName: string
      taskType: string
      scheduledDate: string
      scheduledTime?: string
      bookingReference: string
    }
  ) => {
    try {
      const response = await $fetch('/api/emails/send-task-reminder', {
        method: 'POST',
        body: {
          to,
          ...taskData
        }
      })

      return response
    } catch (error) {
      console.error('タスクリマインダーメール送信エラー:', error)
      return null
    }
  }

  /**
   * 管理者への清掃完了通知メールを送信
   */
  const sendCleaningCompletedEmail = async (
    taskData: {
      supporterName: string
      taskType: string
      scheduledDate: string
      completedAt: string
      actualDuration: number
      bookingReference: string
    }
  ) => {
    try {
      const response = await $fetch('/api/emails/send-cleaning-completed', {
        method: 'POST',
        body: taskData
      })

      return response
    } catch (error) {
      console.error('清掃完了通知メール送信エラー:', error)
      return null
    }
  }

  /**
   * 返金確認メールを送信（管理画面から手動返金時に使用）
   */
  const sendRefundConfirmationEmail = async (
    to: string,
    refundData: {
      bookingReference: string
      guestName: string
      refundAmount: number
    }
  ) => {
    try {
      const response = await $fetch('/api/emails/send-refund-confirmation', {
        method: 'POST',
        body: {
          to,
          ...refundData
        }
      })

      return response
    } catch (error) {
      console.error('返金確認メール送信エラー:', error)
      return null
    }
  }

  /**
   * 管理者への通知メールを送信
   */
  const sendAdminNotification = async (
    notificationData: {
      type: 'new_booking' | 'booking_cancelled' | 'payment_failed' | 'refund_completed'
      bookingId: string
      bookingReference: string
      guestName: string
      guestEmail?: string
      guestPhone?: string
      checkInDate?: string
      checkOutDate?: string
      guestCount?: number
      totalAmount?: number
      refundAmount?: number
      errorMessage?: string
    }
  ) => {
    try {
      const response = await $fetch('/api/emails/send-admin-notification', {
        method: 'POST',
        body: notificationData
      })

      return response
    } catch (error) {
      console.error('管理者通知メール送信エラー:', error)
      return null
    }
  }

  return {
    sendBookingConfirmationEmail,
    sendBookingCancellationEmail,
    sendCheckInReminderEmail,
    sendTaskAssignmentEmail,
    sendTaskReminderEmail,
    sendCleaningCompletedEmail,
    sendRefundConfirmationEmail,
    sendAdminNotification
  }
}
