import nodemailer from "nodemailer";

/**
 * 返金確認メール送信API
 *
 * ⚠️ セキュリティ: このAPIは内部呼び出し専用です
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  // 内部呼び出し認証チェック
  const authHeader = getHeader(event, "x-internal-secret");
  const internalSecret = config.internalApiSecret;

  if (!authHeader || authHeader !== internalSecret) {
    throw createError({
      statusCode: 403,
      statusMessage: "このAPIは内部呼び出し専用です",
    });
  }

  const body = await readBody(event);
  const { to, bookingReference, guestName, refundAmount } = body;

  // メール送信設定（Gmail）
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailUser || process.env.EMAIL_USER || "",
      pass: config.emailPassword || process.env.EMAIL_PASSWORD || "",
    },
  });

  // 送信元はグループメール（furniturehouse1@）を表示
  const fromEmail =
    config.emailFrom ||
    config.emailReplyTo ||
    config.emailUser ||
    "noreply@furniturehouse1.com";
  const replyToEmail =
    config.emailReplyTo || config.emailFrom || config.emailUser;

  const mailOptions = {
    from: `"家具の家 No.1" <${fromEmail}>`,
    to,
    replyTo: replyToEmail,
    subject: "【家具の家 No.1】ご返金完了のお知らせ",
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
          .info-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
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
          <div style="font-size: 40px; margin-bottom: 10px;">💰</div>
          <h1 style="margin: 0;">返金完了のお知らせ</h1>
        </div>

        <div class="content">
          <p>${guestName} 様</p>

          <p>ご予約のキャンセルに伴う返金処理が完了いたしました。</p>

          <div class="info-box">
            <h3 style="margin-top: 0;">返金情報</h3>
            <div class="info-row">
              <span class="label">予約番号</span>
              <span class="value" style="font-family: monospace;">${bookingReference}</span>
            </div>
            <div class="info-row">
              <span class="label">返金額</span>
              <span class="value" style="font-weight: bold; color: #3b82f6; font-size: 1.2em;">¥${refundAmount?.toLocaleString() || 0}</span>
            </div>
          </div>

          <div style="background: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1d4ed8;">返金について</h4>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li>返金はお支払いに使用されたカードに返金されます</li>
              <li>返金の反映には、カード会社により3〜10営業日程度かかる場合があります</li>
              <li>ご不明点がございましたら、お気軽にお問い合わせください</li>
            </ul>
          </div>

          <p>またのご利用を心よりお待ちしております。</p>

          <p>家具の家 No.1 運営委員会</p>
        </div>

        <div class="footer">
          <p>このメールに関するお問い合わせは、このメールに返信してください。<br>
          お問い合わせ先: ${replyToEmail}</p>
          <p>&copy; 2025 家具の家 No.1. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    console.error("返金確認メール送信エラー:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "返金確認メールの送信に失敗しました",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
