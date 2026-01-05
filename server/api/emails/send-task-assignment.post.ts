import nodemailer from 'nodemailer'

/**
 * サポーターへのタスク割り当て通知メール送信API
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody(event)
  const { to, supporterName, taskType, scheduledDate, bookingReference, estimatedDuration } = body

  // メール送信設定（Gmail）
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser || process.env.EMAIL_USER || '',
      pass: config.emailPassword || process.env.EMAIL_PASSWORD || ''
    }
  })

  const senderEmail = config.emailUser || process.env.EMAIL_USER || 'noreply@furniturehouse1.com'
  const replyToEmail = config.emailReplyTo || process.env.EMAIL_REPLY_TO || senderEmail

  const taskTypeLabel = taskType === 'pre_checkin' ? 'チェックイン前清掃' : 'チェックアウト後清掃'

  const mailOptions = {
    from: `"家具の家 No.1" <${senderEmail}>`,
    to,
    replyTo: replyToEmail,
    subject: `【家具の家 No.1】清掃タスクが割り当てられました`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .info-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #666;
          }
          .value {
            color: #333;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">家具の家 No.1</h1>
          <p style="margin: 10px 0 0 0;">清掃タスク割り当て通知</p>
        </div>

        <div class="content">
          <p>${supporterName} 様</p>

          <p>新しい清掃タスクが割り当てられました。<br>
          以下の内容をご確認ください。</p>

          <div class="info-box">
            <h3 style="margin-top: 0;">タスク内容</h3>
            <div class="info-row">
              <span class="label">タスク種類</span>
              <span class="value">${taskTypeLabel}</span>
            </div>
            <div class="info-row">
              <span class="label">予定日</span>
              <span class="value">${scheduledDate}</span>
            </div>
            <div class="info-row">
              <span class="label">予約番号</span>
              <span class="value" style="font-family: monospace;">${bookingReference}</span>
            </div>
            <div class="info-row">
              <span class="label">予定作業時間</span>
              <span class="value">${estimatedDuration}分（${(estimatedDuration / 60).toFixed(1)}時間）</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${config.public.siteUrl || 'http://localhost:3000'}/supporter"
               class="button">
              ダッシュボードで確認
            </a>
          </div>

          <p style="margin-top: 30px;">よろしくお願いいたします。</p>

          <p>家具の家 No.1 運営チーム</p>
        </div>

        <div class="footer">
          <p>このメールに関するお問い合わせは、このメールに返信してください。<br>
          お問い合わせ先: ${replyToEmail}</p>
          <p>&copy; 2025 家具の家 No.1. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error: any) {
    console.error('タスク割り当てメール送信エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'メール送信に失敗しました',
      message: error.message
    })
  }
})
