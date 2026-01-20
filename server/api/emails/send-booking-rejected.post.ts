/**
 * 予約却下メール送信API
 * ゲストに予約が却下されたことを通知し、返信を促す
 */

import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // 内部呼び出し認証
  const internalSecret = getHeader(event, 'x-internal-secret')
  if (internalSecret !== config.internalApiSecret) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  try {
    const body = await readBody(event)
    const {
      to,
      bookingId,
      bookingReference,
      bookingToken,
      guestName,
      checkInDate,
      checkOutDate,
      totalAmount,
      rejectionReason
    } = body

    if (!to || !bookingReference || !guestName || !rejectionReason) {
      throw createError({
        statusCode: 400,
        message: '必須パラメータが不足しています',
      })
    }

    // メール送信設定
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    })

    const siteUrl = config.public.siteUrl || 'http://localhost:3000'
    const viewUrl = `${siteUrl}/booking/view?token=${bookingToken}`
    const bookingUrl = `${siteUrl}/booking`

    // 送信元はグループメール（furniturehouse1@）を表示
    const fromEmail = config.emailFrom || config.emailReplyTo || config.emailUser
    const replyToEmail = config.emailReplyTo || config.emailFrom || config.emailUser

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- ヘッダー -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                予約リクエストについて
              </h1>
            </td>
          </tr>

          <!-- コンテンツ -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 20px 0;">
                ${guestName}様
              </p>

              <p style="font-size: 16px; color: #333; margin: 0 0 30px 0; line-height: 1.8;">
                この度は「家具の家 No.1」へのご予約リクエストをいただき、誠にありがとうございます。<br>
                大変恐れ入りますが、今回のご予約につきましては承認することができませんでした。
              </p>

              <!-- 予約詳細 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #333; font-size: 16px;">リクエスト内容</h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666; font-size: 14px; width: 120px;">予約番号</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600;">${bookingReference}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px;">チェックイン</td>
                        <td style="color: #333; font-size: 14px;">${checkInDate}</td>
                      </tr>
                      <tr>
                        <td style="color: #666; font-size: 14px;">チェックアウト</td>
                        <td style="color: #333; font-size: 14px;">${checkOutDate}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ホストからのメッセージ -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px; font-weight: 600;">
                  ホストからのメッセージ
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.8;">
                  ${rejectionReason}
                </p>
              </div>

              <!-- お知らせ -->
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #065f46; font-size: 14px;">
                  <strong>請求について</strong><br>
                  クレジットカードへの請求は行われておりません。与信枠は自動的に解放されます。
                </p>
              </div>

              <p style="font-size: 16px; color: #333; margin: 0 0 30px 0; line-height: 1.8;">
                別の日程でのご予約も承っておりますので、ぜひご検討ください。<br>
                ご不明な点がございましたら、予約詳細ページからメッセージをお送りいただけます。
              </p>

              <!-- ボタン -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${viewUrl}" style="display: inline-block; background: #6b7280; color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 14px; font-weight: 600; margin-right: 10px;">
                      予約詳細・メッセージ
                    </a>
                    <a href="${bookingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      別の日程で予約
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.8;">
                またのご利用を心よりお待ちしております。
              </p>
            </td>
          </tr>

          <!-- フッター -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                家具の家 No.1<br>
                このメールは自動送信されています。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    await transporter.sendMail({
      from: `"家具の家 No.1" <${fromEmail}>`,
      to,
      replyTo: replyToEmail,
      subject: `【予約リクエスト】ご予約について - ${bookingReference}`,
      html: htmlContent,
    })

    console.log('✅ Booking rejected email sent to:', to)

    return { success: true }
  } catch (error: unknown) {
    console.error('❌ Failed to send booking rejected email:', error)
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'メール送信に失敗しました',
    })
  }
})
