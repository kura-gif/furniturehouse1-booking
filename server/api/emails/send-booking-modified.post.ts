import nodemailer from 'nodemailer'

/**
 * 予約変更通知メール送信API
 * ゲストに予約内容が変更されたことを通知
 *
 * ⚠️ セキュリティ: このAPIは内部呼び出し専用です
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // 内部呼び出し認証チェック
  const authHeader = getHeader(event, 'x-internal-secret')
  const internalSecret = config.internalApiSecret

  if (!authHeader || authHeader !== internalSecret) {
    throw createError({
      statusCode: 403,
      statusMessage: 'このAPIは内部呼び出し専用です'
    })
  }

  const body = await readBody(event)
  const {
    to,
    bookingReference,
    bookingToken,
    guestName,
    changes,
    previousAmount,
    newAmount,
    amountDifference,
    refundAmount,
    additionalChargeAmount,
    reason
  } = body

  // メール送信設定（Gmail）
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser || process.env.EMAIL_USER || '',
      pass: config.emailPassword || process.env.EMAIL_PASSWORD || ''
    }
  })

  // 送信元はグループメール（furniturehouse1@）を表示
  const fromEmail = config.emailFrom || config.emailReplyTo || config.emailUser || 'noreply@furniturehouse1.com'
  const replyToEmail = config.emailReplyTo || config.emailFrom || config.emailUser
  const siteUrl = config.public.siteUrl || 'http://localhost:3000'
  const viewUrl = `${siteUrl}/booking/view?token=${bookingToken}`

  // 変更内容のHTMLを生成
  let changesHtml = ''
  if (changes.checkInDate) {
    changesHtml += `
      <div class="change-row">
        <span class="change-label">チェックイン</span>
        <span class="change-value">
          <span style="text-decoration: line-through; color: #999;">${changes.checkInDate.from}</span>
          →
          <span style="font-weight: bold; color: #10b981;">${changes.checkInDate.to}</span>
        </span>
      </div>
    `
  }
  if (changes.checkOutDate) {
    changesHtml += `
      <div class="change-row">
        <span class="change-label">チェックアウト</span>
        <span class="change-value">
          <span style="text-decoration: line-through; color: #999;">${changes.checkOutDate.from}</span>
          →
          <span style="font-weight: bold; color: #10b981;">${changes.checkOutDate.to}</span>
        </span>
      </div>
    `
  }
  if (changes.guestCount) {
    changesHtml += `
      <div class="change-row">
        <span class="change-label">宿泊人数</span>
        <span class="change-value">
          <span style="text-decoration: line-through; color: #999;">${changes.guestCount.from}名</span>
          →
          <span style="font-weight: bold; color: #10b981;">${changes.guestCount.to}名</span>
        </span>
      </div>
    `
  }

  // 金額変更のHTML
  let amountHtml = ''
  if (amountDifference !== 0) {
    const diffColor = amountDifference > 0 ? '#ef4444' : '#10b981'
    const diffPrefix = amountDifference > 0 ? '+' : ''
    amountHtml = `
      <div class="amount-box">
        <h4 style="margin-top: 0; color: #374151;">料金の変更</h4>
        <div class="change-row">
          <span class="change-label">変更前</span>
          <span class="change-value">¥${previousAmount?.toLocaleString()}</span>
        </div>
        <div class="change-row">
          <span class="change-label">変更後</span>
          <span class="change-value" style="font-weight: bold;">¥${newAmount?.toLocaleString()}</span>
        </div>
        <div class="change-row" style="border-top: 2px solid #e5e7eb; padding-top: 12px; margin-top: 8px;">
          <span class="change-label">差額</span>
          <span class="change-value" style="font-weight: bold; color: ${diffColor};">${diffPrefix}¥${Math.abs(amountDifference).toLocaleString()}</span>
        </div>
      </div>
    `
  }

  // 返金/追加請求の案内
  let paymentNoticeHtml = ''
  if (refundAmount > 0) {
    paymentNoticeHtml = `
      <div class="notice-box refund">
        <h4 style="margin-top: 0;">💰 返金のお知らせ</h4>
        <p style="margin: 0;">
          料金変更に伴い、<strong>¥${refundAmount.toLocaleString()}</strong>を返金いたします。<br>
          返金はお支払いに使用されたカードに3〜10営業日程度で反映されます。
        </p>
      </div>
    `
  } else if (additionalChargeAmount > 0) {
    paymentNoticeHtml = `
      <div class="notice-box additional">
        <h4 style="margin-top: 0;">💳 追加料金のお知らせ</h4>
        <p style="margin: 0;">
          料金変更に伴い、<strong>¥${additionalChargeAmount.toLocaleString()}</strong>の追加料金が発生します。<br>
          追加のお支払い方法については、別途ご連絡いたします。
        </p>
      </div>
    `
  }

  const mailOptions = {
    from: `"家具の家 No.1" <${fromEmail}>`,
    to,
    replyTo: replyToEmail,
    subject: `【予約変更】ご予約内容が変更されました - ${bookingReference}`,
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
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
          .changes-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .amount-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .change-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .change-row:last-child {
            border-bottom: none;
          }
          .change-label {
            font-weight: 600;
            color: #666;
          }
          .change-value {
            color: #333;
          }
          .notice-box {
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
          }
          .notice-box.refund {
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            color: #065f46;
          }
          .notice-box.additional {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            color: #92400e;
          }
          .reason-box {
            background: #f3f4f6;
            padding: 15px;
            margin: 20px 0;
            border-radius: 8px;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
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
          <div style="font-size: 40px; margin-bottom: 10px;">📝</div>
          <h1 style="margin: 0;">予約内容が変更されました</h1>
        </div>

        <div class="content">
          <p>${guestName} 様</p>

          <p>下記の通り、ご予約内容が変更されましたのでお知らせいたします。</p>

          <div class="changes-box">
            <h3 style="margin-top: 0;">変更内容</h3>
            <div class="change-row">
              <span class="change-label">予約番号</span>
              <span class="change-value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
            </div>
            ${changesHtml}
          </div>

          ${amountHtml}

          ${paymentNoticeHtml}

          ${reason ? `
          <div class="reason-box">
            <strong>変更理由:</strong> ${reason}
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewUrl}" class="button">予約詳細を確認する</a>
          </div>

          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>

          <p>家具の家 No.1 運営委員会</p>
        </div>

        <div class="footer">
          <p>ご不明点がございましたら、このメールに返信してお問い合わせください。<br>
          お問い合わせ先: ${replyToEmail}</p>
          <p>&copy; 2025 家具の家 No.1. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Booking modified email sent to:', to)

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error: any) {
    console.error('❌ Booking modified email error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: '予約変更通知メールの送信に失敗しました',
      message: error.message
    })
  }
})
