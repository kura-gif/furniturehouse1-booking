type EmailResult = {
  success: boolean;
  error?: string;
};

/**
 * メール送信失敗をログに記録
 * 管理画面で確認できるようFirestoreに保存
 */
const logEmailFailure = async (
  emailType: string,
  recipient: string | null,
  error: unknown,
  metadata?: Record<string, unknown>,
) => {
  try {
    await $fetch("/api/emails/log-failure", {
      method: "POST",
      body: {
        emailType,
        recipient,
        errorMessage: error instanceof Error ? error.message : String(error),
        metadata,
      },
    });
  } catch (logError) {
    // ログ記録失敗は無視（無限ループ防止）
    console.error("メール失敗ログ記録エラー:", logError);
  }
};

export const useEmail = () => {
  /**
   * 予約確定メールを送信
   */
  const sendBookingConfirmationEmail = async (
    to: string,
    bookingData: {
      bookingId: string;
      bookingReference: string;
      bookingToken: string;
      guestName: string;
      checkInDate: string;
      checkOutDate: string;
      totalAmount: number;
    },
  ): Promise<EmailResult> => {
    try {
      await $fetch("/api/emails/send-booking-confirmation", {
        method: "POST",
        body: bookingData,
      });

      return { success: true };
    } catch (error) {
      console.error("予約確定メール送信エラー:", error);
      await logEmailFailure("booking_confirmation", to, error, {
        bookingId: bookingData.bookingId,
        bookingReference: bookingData.bookingReference,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "送信に失敗しました",
      };
    }
  };

  /**
   * 予約キャンセルメールを送信
   */
  const sendBookingCancellationEmail = async (
    to: string,
    bookingData: {
      bookingId: string;
      guestName: string;
      checkInDate: string;
      checkOutDate: string;
    },
  ): Promise<EmailResult> => {
    try {
      await $fetch("/api/emails/send-booking-cancellation", {
        method: "POST",
        body: {
          to,
          ...bookingData,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("キャンセルメール送信エラー:", error);
      await logEmailFailure("booking_cancellation", to, error, {
        bookingId: bookingData.bookingId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "送信に失敗しました",
      };
    }
  };

  /**
   * チェックインリマインダーメールを送信
   */
  const sendCheckInReminderEmail = async (
    to: string,
    bookingData: {
      bookingId: string;
      guestName: string;
      checkInDate: string;
      checkInTime: string;
      address: string;
    },
  ): Promise<EmailResult> => {
    try {
      await $fetch("/api/emails/send-checkin-reminder", {
        method: "POST",
        body: {
          to,
          ...bookingData,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("リマインダーメール送信エラー:", error);
      await logEmailFailure("checkin_reminder", to, error, {
        bookingId: bookingData.bookingId,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "送信に失敗しました",
      };
    }
  };

  /**
   * サポーターへのタスク割り当て通知メールを送信
   */
  const sendTaskAssignmentEmail = async (
    to: string,
    taskData: {
      supporterName: string;
      taskType: string;
      scheduledDate: string;
      bookingReference: string;
      estimatedDuration: number;
    },
  ): Promise<EmailResult> => {
    try {
      await $fetch("/api/emails/send-task-assignment", {
        method: "POST",
        body: {
          to,
          ...taskData,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("タスク割り当てメール送信エラー:", error);
      await logEmailFailure("task_assignment", to, error, {
        bookingReference: taskData.bookingReference,
        taskType: taskData.taskType,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "送信に失敗しました",
      };
    }
  };

  /**
   * サポーターへのタスクリマインダーメールを送信
   */
  const sendTaskReminderEmail = async (
    to: string,
    taskData: {
      supporterName: string;
      taskType: string;
      scheduledDate: string;
      scheduledTime?: string;
      bookingReference: string;
    },
  ): Promise<EmailResult> => {
    try {
      await $fetch("/api/emails/send-task-reminder", {
        method: "POST",
        body: {
          to,
          ...taskData,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("タスクリマインダーメール送信エラー:", error);
      await logEmailFailure("task_reminder", to, error, {
        bookingReference: taskData.bookingReference,
        taskType: taskData.taskType,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "送信に失敗しました",
      };
    }
  };

  /**
   * 管理者への清掃完了通知メールを送信
   */
  const sendCleaningCompletedEmail = async (taskData: {
    supporterName: string;
    taskType: string;
    scheduledDate: string;
    completedAt: string;
    actualDuration: number;
    bookingReference: string;
  }): Promise<EmailResult> => {
    try {
      await $fetch("/api/emails/send-cleaning-completed", {
        method: "POST",
        body: taskData,
      });

      return { success: true };
    } catch (error) {
      console.error("清掃完了通知メール送信エラー:", error);
      await logEmailFailure("cleaning_completed", null, error, {
        bookingReference: taskData.bookingReference,
        supporterName: taskData.supporterName,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "送信に失敗しました",
      };
    }
  };

  /**
   * 返金確認メールを送信（管理画面から手動返金時に使用）
   */
  const sendRefundConfirmationEmail = async (
    to: string,
    refundData: {
      bookingReference: string;
      guestName: string;
      refundAmount: number;
    },
  ): Promise<EmailResult> => {
    try {
      await $fetch("/api/emails/send-refund-confirmation", {
        method: "POST",
        body: {
          to,
          ...refundData,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("返金確認メール送信エラー:", error);
      await logEmailFailure("refund_confirmation", to, error, {
        bookingReference: refundData.bookingReference,
        refundAmount: refundData.refundAmount,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "送信に失敗しました",
      };
    }
  };

  /**
   * 管理者への通知メールを送信
   */
  const sendAdminNotification = async (notificationData: {
    type:
      | "new_booking"
      | "booking_cancelled"
      | "payment_failed"
      | "refund_completed";
    bookingId: string;
    bookingReference: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
    totalAmount?: number;
    refundAmount?: number;
    errorMessage?: string;
  }): Promise<EmailResult> => {
    try {
      await $fetch("/api/emails/send-admin-notification", {
        method: "POST",
        body: notificationData,
      });

      return { success: true };
    } catch (error) {
      console.error("管理者通知メール送信エラー:", error);
      await logEmailFailure("admin_notification", null, error, {
        type: notificationData.type,
        bookingId: notificationData.bookingId,
        bookingReference: notificationData.bookingReference,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "送信に失敗しました",
      };
    }
  };

  return {
    sendBookingConfirmationEmail,
    sendBookingCancellationEmail,
    sendCheckInReminderEmail,
    sendTaskAssignmentEmail,
    sendTaskReminderEmail,
    sendCleaningCompletedEmail,
    sendRefundConfirmationEmail,
    sendAdminNotification,
  };
};
