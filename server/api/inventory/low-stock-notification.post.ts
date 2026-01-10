import nodemailer from 'nodemailer'

/**
 * 在庫不足通知メール送信API
 *
 * 在庫が発注目安を下回った場合に管理者へ通知
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const body = await readBody(event)
  const { itemName, currentStock, unit, threshold } = body

  if (!itemName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'アイテム名は必須です'
    })
  }

  // メール送信設定（Gmail）
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser || process.env.EMAIL_USER || '',
      pass: config.emailPassword || process.env.EMAIL_PASSWORD || ''
    }
  })

  const senderEmail = config.emailUser || process.env.EMAIL_USER || 'noreply@furniturehouse1.com'
  const adminEmail = config.emailReplyTo || process.env.EMAIL_REPLY_TO || senderEmail

  const subject = `【在庫不足】${itemName}の在庫が少なくなっています`
  const headerColor = '#f59e0b' // amber/yellow

  const mailOptions = {
    from: `"家具の家 No.1" <${senderEmail}>`,
    to: adminEmail,
    subject,
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
            background: ${headerColor};
            color: white;
            padding: 25px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 25px;
            border-radius: 0 0 8px 8px;
          }
          .info-box {
            background: white;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid ${headerColor};
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
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
          .warning {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            padding: 15px;
            border-radius: 6px;
            color: #92400e;
            margin-top: 15px;
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 32px; margin-bottom: 10px;">⚠️</div>
          <h2 style="margin: 0;">在庫が足りないよー</h2>
        </div>

        <div class="content">
          <div class="info-box">
            <h3 style="margin-top: 0;">在庫情報</h3>
            <div class="info-row">
              <span class="label">アイテム名</span>
              <span class="value" style="font-weight: bold;">${itemName}</span>
            </div>
            <div class="info-row">
              <span class="label">現在庫数</span>
              <span class="value" style="color: #ef4444; font-weight: bold;">${currentStock}${unit}</span>
            </div>
            <div class="info-row">
              <span class="label">発注目安</span>
              <span class="value">${threshold}${unit}以下</span>
            </div>
          </div>

          <div class="warning">
            <strong>発注のご確認をお願いします</strong><br>
            在庫数が発注目安を下回っています。早めの発注をご検討ください。
          </div>

          <p style="margin-top: 20px;">
            <a href="${config.public?.siteUrl || 'http://localhost:3000'}/admin?tab=inventory"
               style="display: inline-block; background: ${headerColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              備品管理画面を開く
            </a>
          </p>
        </div>

        <div class="footer">
          <p>このメールは自動送信されています。</p>
          <p>&copy; 2025 家具の家 No.1 管理システム</p>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Low stock notification email sent:', info.messageId)

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error: any) {
    console.error('❌ Low stock notification email error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '在庫不足通知メールの送信に失敗しました',
      message: error.message
    })
  }
})
