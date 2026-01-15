/**
 * 決済失敗通知メール送信API
 * ゲストにカード決済が失敗したことを通知し、再試行を促す
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
      bookingReference,
      guestName,
      checkInDate,
      checkOutDate,
      totalAmount,
      errorMessage,
      retryUrl
    } = body

    if (!to || !bookingReference || !guestName) {
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
    const bookingUrl = retryUrl || `${siteUrl}/booking`

    // 送信元はグループメール（furniturehouse1@）を表示
    const fromEmail = config.emailFrom || config.emailReplyTo || config.emailUser
    const replyToEmail = config.emailReplyTo || config.emailFrom || config.emailUser

    // 金額フォーマット
    const formattedAmount = totalAmount
      ? `¥${totalAmount.toLocaleString()}`
      : '確認中'

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
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
                お支払いに問題が発生しました
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
                「家具の家 No.1」へのご予約手続き中に、カード決済でエラーが発生しました。<br>
                お手数をおかけしますが、別のカードでの再試行をお願いいたします。
              </p>

              <!-- 予約詳細 -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px 0; color: #333; font-size: 16px;">予約リクエスト内容</h3>
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666; font-size: 14px; width: 120px;">予約番号</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600;">${bookingReference}</td>
                      </tr>
                      ${checkInDate ? `
                      <tr>
                        <td style="color: #666; font-size: 14px;">チェックイン</td>
                        <td style="color: #333; font-size: 14px;">${checkInDate}</td>
                      </tr>
                      ` : ''}
                      ${checkOutDate ? `
                      <tr>
                        <td style="color: #666; font-size: 14px;">チェックアウト</td>
                        <td style="color: #333; font-size: 14px;">${checkOutDate}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="color: #666; font-size: 14px;">ご利用金額</td>
                        <td style="color: #333; font-size: 14px; font-weight: 600;">${formattedAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- エラー詳細 -->
              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                  エラー内容
                </p>
                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.8;">
                  ${errorMessage || 'カード決済処理中にエラーが発生しました。'}
                </p>
              </div>

              <!-- 対処方法 -->
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
                <p style="margin: 0 0 12px 0; color: #1e40af; font-size: 14px; font-weight: 600;">
                  考えられる原因と対処方法
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; font-size: 14px; line-height: 1.8;">
                  <li>カードの有効期限が切れている → 新しいカードをご使用ください</li>
                  <li>利用限度額を超えている → カード会社にお問い合わせください</li>
                  <li>カード情報の入力ミス → 再度正確にご入力ください</li>
                  <li>3Dセキュア認証の失敗 → 認証を完了してください</li>
                </ul>
              </div>

              <p style="font-size: 16px; color: #333; margin: 0 0 30px 0; line-height: 1.8;">
                ご希望の日程が埋まる前に、お早めに再度ご予約手続きをお願いいたします。
              </p>

              <!-- ボタン -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 10px 0;">
                    <a href="${bookingUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      予約を再試行する
                    </a>
                  </td>
                </tr>
              </table>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.8;">
                ご不明な点がございましたら、お気軽にお問い合わせください。<br>
                <a href="mailto:furniturehouse1@chladni.co.jp" style="color: #667eea;">furniturehouse1@chladni.co.jp</a>
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
      subject: `【重要】お支払いエラーのお知らせ - ${bookingReference}`,
      html: htmlContent,
    })

    console.log('✅ Payment failed email sent to:', to)

    return { success: true }
  } catch (error: any) {
    console.error('❌ Failed to send payment failed email:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'メール送信に失敗しました',
    })
  }
})
