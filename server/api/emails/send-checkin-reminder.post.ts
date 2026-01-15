import nodemailer from 'nodemailer'
import { getFacilitySettings } from '~/server/utils/facility-settings'

/**
 * チェックイン前リマインダーメール送信API
 * ゲストにチェックイン情報をリマインド
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
    checkInDate,
    checkOutDate,
    guestCount,
    daysUntilCheckIn
  } = body

  // 施設設定を取得
  const facilitySettings = await getFacilitySettings()

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

  // 日数に応じたメッセージ
  let timingMessage = ''
  if (daysUntilCheckIn === 0) {
    timingMessage = '本日がチェックイン日です！'
  } else if (daysUntilCheckIn === 1) {
    timingMessage = 'いよいよ明日がチェックイン日です！'
  } else {
    timingMessage = `チェックインまであと${daysUntilCheckIn}日となりました。`
  }

  const mailOptions = {
    from: `"家具の家 No.1" <${fromEmail}>`,
    to,
    replyTo: replyToEmail,
    subject: daysUntilCheckIn === 0
      ? `【本日チェックイン】ご宿泊のご案内 - ${bookingReference}`
      : `【リマインダー】ご宿泊まであと${daysUntilCheckIn}日 - ${bookingReference}`,
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
          .checkin-box {
            background: #ecfdf5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #10b981;
          }
          .facility-box {
            background: #f0f9ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #0ea5e9;
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
          <div style="font-size: 40px; margin-bottom: 10px;">${daysUntilCheckIn === 0 ? '🏠' : '📅'}</div>
          <h1 style="margin: 0;">${timingMessage}</h1>
        </div>

        <div class="content">
          <p>${guestName} 様</p>

          <p>「家具の家 No.1」へのご予約ありがとうございます。<br>
          ${timingMessage}ご宿泊の準備はいかがでしょうか？</p>

          <div class="info-box">
            <h3 style="margin-top: 0;">ご予約情報</h3>
            <div class="info-row">
              <span class="label">予約番号</span>
              <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
            </div>
            <div class="info-row">
              <span class="label">チェックイン</span>
              <span class="value"><strong>${checkInDate}</strong> ${facilitySettings.checkInTime || '15:00'}以降</span>
            </div>
            <div class="info-row">
              <span class="label">チェックアウト</span>
              <span class="value">${checkOutDate} ${facilitySettings.checkOutTime || '11:00'}まで</span>
            </div>
            <div class="info-row">
              <span class="label">宿泊人数</span>
              <span class="value">${guestCount}名</span>
            </div>
          </div>

          <div class="checkin-box">
            <h4 style="margin-top: 0; color: #065f46;">🔑 チェックイン方法</h4>
            <p style="margin: 0;">
              ${facilitySettings.keyInfo || 'チェックイン方法の詳細は予約詳細ページでご確認ください。'}
            </p>
          </div>

          <div class="facility-box">
            <h4 style="margin-top: 0; color: #0369a1;">📍 施設情報</h4>
            <ul style="margin: 0; padding-left: 20px;">
              ${facilitySettings.wifiPassword ? `<li>Wi-Fiパスワード: <strong>${facilitySettings.wifiPassword}</strong></li>` : ''}
              ${facilitySettings.parkingInfo ? `<li>駐車場: ${facilitySettings.parkingInfo}</li>` : ''}
              <li>最大収容人数: ${facilitySettings.maxGuests || 6}名</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewUrl}" class="button">予約詳細を確認する</a>
          </div>

          <p>ご不明な点がございましたら、お気軽にお問い合わせください。<br>
          素敵なご滞在となりますよう、心よりお待ちしております。</p>

          <p>家具の家 No.1 運営委員会</p>
        </div>

        <div class="footer">
          <p>緊急連絡先: ${facilitySettings.ownerPhone || replyToEmail}</p>
          <p>&copy; 2025 家具の家 No.1. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Check-in reminder email sent to:', to)

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error: any) {
    console.error('❌ Check-in reminder email error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'リマインダーメールの送信に失敗しました',
      message: error.message
    })
  }
})
