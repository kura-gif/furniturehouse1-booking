/**
 * 定期実行: チェックイン前リマインダー送信
 *
 * 毎日実行して、チェックイン3日前、1日前、当日の予約にリマインダーを送信
 *
 * POST /api/cron/send-reminders
 * Headers: x-cron-secret: <CRON_SECRET>
 *
 * 外部Cronサービス（Vercel Cron、Cloud Scheduler等）から呼び出す
 */

import { getErrorMessage } from '~/server/utils/error-handling'
import { cronLogger, emailOperationLogger } from '~/server/utils/operation-logger'

const JOB_NAME = 'send-reminders'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const config = useRuntimeConfig()

  // Cron認証チェック（Vercel Cronまたはカスタムシークレット）
  const vercelCronAuth = getHeader(event, 'authorization')
  const cronSecret = getHeader(event, 'x-cron-secret')
  const isVercelCron = vercelCronAuth === `Bearer ${config.cronSecret}`
  const isCustomCron = cronSecret === config.cronSecret || cronSecret === config.internalApiSecret

  if (!isVercelCron && !isCustomCron) {
    throw createError({
      statusCode: 401,
      message: '認証が必要です'
    })
  }

  const db = getFirestoreAdmin()
  const results = {
    processed: 0,
    sent: 0,
    errors: [] as string[]
  }

  // ジョブ開始ログ
  await cronLogger.started(JOB_NAME)

  try {
    // 今日の日付を取得（日本時間）
    const now = new Date()
    const jstOffset = 9 * 60 * 60 * 1000
    const jstNow = new Date(now.getTime() + jstOffset)
    jstNow.setHours(0, 0, 0, 0)

    // リマインダーを送る日数（0日=当日、1日=明日、3日=3日前）
    const reminderDays = [0, 1, 3]

    for (const days of reminderDays) {
      // 対象日を計算
      const targetDate = new Date(jstNow)
      targetDate.setDate(targetDate.getDate() + days)

      // 対象日の開始と終了
      const startOfDay = new Date(targetDate)
      const endOfDay = new Date(targetDate)
      endOfDay.setHours(23, 59, 59, 999)

      // 対象の予約を取得（confirmed状態のもの）
      const bookingsSnapshot = await db.collection('bookings')
        .where('status', '==', 'confirmed')
        .where('checkInDate', '>=', startOfDay)
        .where('checkInDate', '<=', endOfDay)
        .get()

      for (const doc of bookingsSnapshot.docs) {
        const booking = doc.data()
        results.processed++

        // 既にこの日数でリマインダー送信済みかチェック
        const reminderKey = `reminder_${days}d_sent`
        if (booking[reminderKey]) {
          continue
        }

        try {
          // 日付をフォーマット
          const checkInDate = booking.checkInDate?.toDate?.() || new Date(booking.checkInDate)
          const checkOutDate = booking.checkOutDate?.toDate?.() || new Date(booking.checkOutDate)
          const formatDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`

          // リマインダーメール送信
          await $fetch('/api/emails/send-checkin-reminder', {
            method: 'POST',
            headers: {
              'x-internal-secret': config.internalApiSecret,
            },
            body: {
              to: booking.guestEmail,
              bookingReference: booking.bookingReference,
              bookingToken: booking.bookingToken,
              guestName: booking.guestName,
              checkInDate: formatDate(checkInDate),
              checkOutDate: formatDate(checkOutDate),
              guestCount: booking.guestCount,
              daysUntilCheckIn: days
            },
          })

          // 送信済みフラグを更新
          await doc.ref.update({
            [reminderKey]: true,
            [`${reminderKey}At`]: new Date()
          })

          results.sent++
          await emailOperationLogger.sent(`checkin-reminder-${days}d`, booking.guestEmail, booking.bookingReference)
        } catch (error: unknown) {
          const errorMsg = getErrorMessage(error)
          results.errors.push(`${booking.bookingReference}: ${errorMsg}`)
          await emailOperationLogger.failed(`checkin-reminder-${days}d`, booking.guestEmail, errorMsg, booking.bookingReference)
        }
      }
    }

    const duration = Date.now() - startTime
    await cronLogger.completed(JOB_NAME, results, duration)

    return {
      success: true,
      message: `リマインダー処理完了: ${results.sent}件送信`,
      results
    }
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    const errorMsg = getErrorMessage(error)
    await cronLogger.failed(JOB_NAME, errorMsg, duration)

    throw createError({
      statusCode: 500,
      message: errorMsg || 'リマインダー処理に失敗しました'
    })
  }
})
