import * as functions from 'firebase-functions'
import * as nodemailer from 'nodemailer'

/**
 * メール送信用のtransporter設定を取得
 */
export function getEmailTransporter() {
  // Gmail SMTP設定
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
}

/**
 * メールを送信
 *
 * @param to 送信先メールアドレス
 * @param subject 件名
 * @param html HTML本文
 */
export async function sendEmail(to: string, subject: string, html: string) {
  const transporter = getEmailTransporter()

  const senderEmail = process.env.EMAIL_USER || 'noreply@furniturehouse1.com'
  const replyToEmail = process.env.EMAIL_REPLY_TO || senderEmail

  const mailOptions = {
    from: `"家具の家 No.1" <${senderEmail}>`,
    to,
    replyTo: replyToEmail,
    subject,
    html
  }

  const info = await transporter.sendMail(mailOptions)
  console.log('Email sent:', info.messageId)

  return info
}
