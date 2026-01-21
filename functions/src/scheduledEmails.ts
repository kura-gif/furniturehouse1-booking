import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { DocumentData } from 'firebase-admin/firestore'
import { calculateTargetDate } from './utils/dateCalculator'
import { sendEmail } from './utils/emailSender'
import { replaceTemplateVariables, getTemplateVariables } from './utils/templateProcessor'

/**
 * スケジュールメール送信
 * 毎日9:00 JST に実行
 */
export const sendScheduledEmails = functions
  .region('asia-northeast1')
  .pubsub.schedule('0 9 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const db = admin.firestore()

    console.log('スケジュールメール送信開始')

    try {
      // 1. 有効なスケジュールを取得
      const schedulesSnapshot = await db
        .collection('emailSchedules')
        .where('enabled', '==', true)
        .get()

      console.log(`有効なスケジュール数: ${schedulesSnapshot.size}`)

      for (const scheduleDoc of schedulesSnapshot.docs) {
        const schedule = scheduleDoc.data()
        console.log(`スケジュール処理中: ${schedule.name}`)

        try {
          // 2. 対象日付を計算
          const targetDate = calculateTargetDate(
            schedule.daysBeforeCheckIn,
            schedule.relativeToCheckOut || false
          )

          console.log(`対象日付範囲: ${targetDate.start} 〜 ${targetDate.end}`)

          // 3. 対象の予約を取得
          const bookingsSnapshot = await db
            .collection('bookings')
            .where('status', 'in', schedule.targetStatuses || ['confirmed'])
            .where('checkInDate', '>=', targetDate.start)
            .where('checkInDate', '<', targetDate.end)
            .get()

          console.log(`対象予約数: ${bookingsSnapshot.size}`)

          // 4. 各予約にメール送信
          for (const bookingDoc of bookingsSnapshot.docs) {
            const booking = { id: bookingDoc.id, ...bookingDoc.data() }

            await sendScheduledEmail(booking, schedule, scheduleDoc.id)
          }
        } catch (error) {
          console.error(`スケジュール処理エラー (${schedule.name}):`, error)
        }
      }

      console.log('スケジュールメール送信完了')
    } catch (error) {
      console.error('スケジュールメール送信エラー:', error)
      throw error
    }
  })

/**
 * 個別の予約にスケジュールメールを送信
 */
async function sendScheduledEmail(
  booking: DocumentData & { id: string },
  schedule: DocumentData,
  scheduleId: string
) {
  const db = admin.firestore()

  // 1. 重複送信チェック
  const alreadySentSnapshot = await db
    .collection('sentEmails')
    .where('bookingId', '==', booking.id)
    .where('scheduleId', '==', scheduleId)
    .limit(1)
    .get()

  if (!alreadySentSnapshot.empty) {
    console.log(`既に送信済み: ${booking.id} - ${scheduleId}`)
    return
  }

  // 2. テンプレート取得
  const templateDoc = await db
    .collection('emailTemplates')
    .doc(schedule.templateId)
    .get()

  if (!templateDoc.exists) {
    console.error(`テンプレート未発見: ${schedule.templateId}`)
    return
  }

  const template = templateDoc.data()

  // 3. 変数置換
  const variables = getTemplateVariables(booking)
  const subject = replaceTemplateVariables(template!.subject, variables)
  const bodyHtml = replaceTemplateVariables(template!.bodyHtml, variables)

  // 4. メール送信
  try {
    await sendEmail(booking.guestEmail, subject, bodyHtml)

    // 5. 送信ログ保存
    await db.collection('sentEmails').add({
      bookingId: booking.id,
      scheduleId,
      templateId: schedule.templateId,
      recipientEmail: booking.guestEmail,
      subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'sent'
    })

    console.log(`メール送信成功: ${booking.guestEmail} (${booking.bookingReference})`)
  } catch (error: unknown) {
    console.error(`メール送信エラー: ${booking.guestEmail}`, error)

    // エラーログ保存
    const errorMessage = error instanceof Error ? error.message : String(error)
    await db.collection('sentEmails').add({
      bookingId: booking.id,
      scheduleId,
      templateId: schedule.templateId,
      recipientEmail: booking.guestEmail,
      subject,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'failed',
      error: errorMessage
    })
  }
}
