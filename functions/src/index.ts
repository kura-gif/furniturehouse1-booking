import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as nodemailer from 'nodemailer'

admin.initializeApp()

// スケジュールメール送信機能をエクスポート
export { sendScheduledEmails } from './scheduledEmails'

// メール送信設定（Gmail SMTP）
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

/**
 * 新しいゲストメッセージが作成されたときにメール通知を送信
 */
export const onGuestMessageCreated = functions.firestore
  .document('guestMessages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.data()
    const { bookingId, senderType, senderName, message: messageText } = message

    try {
      // 予約情報を取得
      const bookingDoc = await admin.firestore().collection('bookings').doc(bookingId).get()
      if (!bookingDoc.exists) {
        console.error('Booking not found:', bookingId)
        return
      }

      const booking = bookingDoc.data()
      const guestEmail = booking?.guestEmail
      const guestName = booking?.guestName

      if (senderType === 'guest') {
        // ゲストからのメッセージ → 管理者に通知
        await sendEmailToAdmin(guestName, guestEmail, messageText, bookingId)
      } else if (senderType === 'admin') {
        // 管理者からのメッセージ → ゲストに通知
        await sendEmailToGuest(guestEmail, guestName, messageText, bookingId)
      }

      console.log('Email notification sent successfully')
    } catch (error) {
      console.error('Error sending email notification:', error)
    }
  })

/**
 * 管理者にメール通知を送信
 */
async function sendEmailToAdmin(
  guestName: string,
  guestEmail: string,
  messageText: string,
  bookingId: string
) {
  const adminEmail = process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER

  if (!adminEmail) {
    console.error('Admin email not configured')
    return
  }

  const senderEmail = process.env.EMAIL_USER || 'noreply@furniturehouse1.com'

  const mailOptions = {
    from: `"家具の家 No.1" <${senderEmail}>`,
    to: adminEmail,
    replyTo: guestEmail,
    subject: `【新着メッセージ】${guestName}様から`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">新しいメッセージが届きました</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>ゲスト名:</strong> ${guestName}</p>
          <p><strong>メールアドレス:</strong> ${guestEmail}</p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
            <p style="margin: 0;">${messageText}</p>
          </div>
        </div>
        <p style="text-align: center;">
          <a href="https://furniturehouse.com/admin"
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            管理画面で返信する
          </a>
        </p>
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          このメールは家具の家 No.1 予約システムから自動送信されています。
        </p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}

/**
 * ゲストにメール通知を送信
 */
async function sendEmailToGuest(
  guestEmail: string,
  guestName: string,
  messageText: string,
  bookingId: string
) {
  const senderEmail = process.env.EMAIL_USER || 'noreply@furniturehouse1.com'
  const replyToEmail = process.env.EMAIL_REPLY_TO || senderEmail

  const mailOptions = {
    from: `"家具の家 No.1" <${senderEmail}>`,
    to: guestEmail,
    replyTo: replyToEmail,
    subject: '【家具の家 No.1】新しいメッセージが届きました',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">新しいメッセージが届きました</h2>
        <p>いつもご利用いただきありがとうございます。</p>
        <p>${guestName}様の予約に関する新しいメッセージが届いています。</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>管理者からのメッセージ:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
            <p style="margin: 0;">${messageText}</p>
          </div>
        </div>

        <p style="text-align: center;">
          <a href="https://furniturehouse.com/messages/${bookingId}"
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            メッセージを確認・返信する
          </a>
        </p>

        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          このメールは家具の家 No.1 予約システムから自動送信されています。
        </p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}
