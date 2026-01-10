import nodemailer from 'nodemailer'
import { getFacilitySettings } from '~/server/utils/facility-settings'

/**
 * 予約確認メール送信API
 *
 * ⚠️ セキュリティ: このAPIは内部呼び出し専用です
 * - Webhook経由での呼び出しのみを想定
 * - シークレットキーによる認証が必要
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const facilitySettings = await getFacilitySettings()
  
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
  const { to, bookingId, bookingReference, bookingToken, guestName, checkInDate, checkOutDate, totalAmount, isPendingReview } = body

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

  // 審査中かどうかで件名と内容を変更
  const emailSubject = isPendingReview
    ? '【家具の家 No.1】予約リクエストを受け付けました'
    : '【家具の家 No.1】ご予約確定のお知らせ'

  const headerMessage = isPendingReview
    ? '予約リクエストを受け付けました'
    : 'ご予約ありがとうございます'

  const headerColor = isPendingReview
    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

  const mailOptions = {
    from: `"家具の家 No.1" <${senderEmail}>`,
    to,
    replyTo: replyToEmail,
    subject: emailSubject,
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            border-left: 4px solid #667eea;
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        <div class="header" style="background: ${headerColor};">
          <h1 style="margin: 0;">家具の家 No.1</h1>
          <p style="margin: 10px 0 0 0;">${headerMessage}</p>
        </div>

        <div class="content">
          <p>${guestName} 様</p>

          ${isPendingReview ? `
          <p>この度は「家具の家 No.1」への予約リクエストをいただき、誠にありがとうございます。<br>
          現在、ホストが予約内容を確認しております。</p>

          <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #92400e;">⏳ 審査中</p>
            <p style="margin: 0; font-size: 14px; color: #78350f;">
              通常48時間以内に審査が完了します。<br>
              審査結果はメールでお知らせいたします。<br>
              <strong>承認されるまでクレジットカードへの請求は行われません。</strong>
            </p>
          </div>

          <p>リクエスト内容は以下の通りです。</p>
          ` : `
          <p>この度は「家具の家 No.1」をご予約いただき、誠にありがとうございます。<br>
          ご予約内容は以下の通りです。</p>
          `}

          <div class="info-box">
            <h3 style="margin-top: 0;">${isPendingReview ? 'リクエスト内容' : 'ご予約内容'}</h3>
            <div class="info-row">
              <span class="label">予約番号</span>
              <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
            </div>
            <div class="info-row">
              <span class="label">チェックイン</span>
              <span class="value">${checkInDate}</span>
            </div>
            <div class="info-row">
              <span class="label">チェックアウト</span>
              <span class="value">${checkOutDate}</span>
            </div>
            <div class="info-row">
              <span class="label">合計金額</span>
              <span class="value">¥${totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #856404;">📋 予約内容を確認する</p>
            <p style="margin: 0 0 15px 0; font-size: 13px; color: #856404;">
              アカウント不要で、いつでも予約詳細を確認できます
            </p>
            <a href="${config.public.siteUrl || 'http://localhost:3000'}/booking/view?token=${bookingToken}"
               class="button"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: inline-block;">
              予約内容を確認
            </a>
            <p style="margin: 15px 0 0 0; font-size: 11px; color: #856404;">
              ※ このリンクは予約確認専用です。第三者と共有しないでください
            </p>
          </div>

          ${isPendingReview ? `
          <div class="info-box" style="border-left-color: #f59e0b;">
            <h3 style="margin-top: 0;">今後の流れ</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>ホストが予約内容を確認（通常48時間以内）</li>
              <li>審査結果をメールでお知らせ</li>
              <li>承認後、決済が確定し予約完了となります</li>
              <li>お問い合わせの際は、予約番号（${bookingReference}）をお伝えください</li>
            </ul>
          </div>

          <div style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px;">
            <p style="margin: 0; color: #065f46;">
              <strong>💳 請求について</strong><br>
              審査が完了するまで、クレジットカードへの請求は行われません。<br>
              与信枠のみ確保されており、却下された場合は自動的に解放されます。
            </p>
          </div>
          ` : `
          <div class="info-box">
            <h3 style="margin-top: 0;">重要事項</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>チェックイン時間: ${facilitySettings.checkInTime}〜</li>
              <li>チェックアウト時間: 〜${facilitySettings.checkOutTime}</li>
              <li>詳細な住所は別途メールにてお知らせいたします</li>
              <li>お問い合わせの際は、予約番号（${bookingReference}）をお伝えください</li>
            </ul>
          </div>
          `}

          <div style="background: #e7f3ff; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px;">
            <p style="margin: 0 0 10px 0; font-weight: 600;">💡 アカウントを作成すると、さらに便利に</p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>予約の変更・キャンセル</li>
              <li>ホストとのメッセージ</li>
              <li>レビューの投稿</li>
            </ul>
            <p style="margin: 10px 0 0 0; text-align: center;">
              <a href="${config.public.siteUrl || 'http://localhost:3000'}/signup?email=${encodeURIComponent(to)}&booking_id=${bookingId}"
                 style="color: #667eea; text-decoration: none; font-weight: 600;">
                アカウントを作成 →
              </a>
            </p>
          </div>

          <p>${isPendingReview ? '審査結果をお待ちください。' : 'ご滞在を心よりお待ちしております。'}</p>

          <p>家具の家 No.1 運営委員会</p>
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
    // メール送信
    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error: any) {
    console.error('メール送信エラー:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'メール送信に失敗しました',
      message: error.message
    })
  }
})
