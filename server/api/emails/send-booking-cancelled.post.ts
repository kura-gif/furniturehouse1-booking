import nodemailer from "nodemailer";

/**
 * 予約キャンセル確認メール送信API
 * ゲストに予約がキャンセルされたことを通知
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
  const {
    to,
    bookingReference,
    guestName,
    checkInDate,
    checkOutDate,
    refundAmount,
    refundPercentage,
  } = body;

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

  const hasRefund = refundAmount > 0;

  const mailOptions = {
    from: `"家具の家 No.1" <${fromEmail}>`,
    to,
    replyTo: replyToEmail,
    subject: `【キャンセル完了】ご予約のキャンセルを承りました - ${bookingReference}`,
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
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
            border-left: 4px solid #f59e0b;
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
          .refund-box {
            background: #eff6ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .no-refund-box {
            background: #fef3c7;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #f59e0b;
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
          <div style="font-size: 40px; margin-bottom: 10px;">📋</div>
          <h1 style="margin: 0;">キャンセル完了</h1>
        </div>

        <div class="content">
          <p>${guestName} 様</p>

          <p>下記のご予約のキャンセルを承りました。</p>

          <div class="info-box">
            <h3 style="margin-top: 0;">キャンセル済み予約情報</h3>
            <div class="info-row">
              <span class="label">予約番号</span>
              <span class="value" style="font-family: monospace;">${bookingReference}</span>
            </div>
            <div class="info-row">
              <span class="label">チェックイン</span>
              <span class="value">${checkInDate}</span>
            </div>
            <div class="info-row">
              <span class="label">チェックアウト</span>
              <span class="value">${checkOutDate}</span>
            </div>
          </div>

          ${
            hasRefund
              ? `
          <div class="refund-box">
            <h4 style="margin-top: 0; color: #1d4ed8;">💰 返金について</h4>
            <p style="margin: 0 0 10px 0;">
              キャンセルポリシーに基づき、<strong style="color: #1d4ed8; font-size: 1.2em;">¥${refundAmount?.toLocaleString()}</strong>（${refundPercentage}%）を返金いたします。
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #374151; font-size: 14px;">
              <li>返金はお支払いに使用されたカードに返金されます</li>
              <li>返金の反映には3〜10営業日程度かかる場合があります</li>
            </ul>
          </div>
          `
              : `
          <div class="no-refund-box">
            <h4 style="margin-top: 0; color: #92400e;">ご返金について</h4>
            <p style="margin: 0; color: #78350f;">
              キャンセルポリシーに基づき、今回のキャンセルでは返金対象外となります。<br>
              ご理解いただけますようお願いいたします。
            </p>
          </div>
          `
          }

          <p>またのご利用を心よりお待ちしております。</p>

          <p>家具の家 No.1 運営委員会</p>
        </div>

        <div class="footer">
          <p>ご不明点がございましたら、このメールに返信してお問い合わせください。<br>
          お問い合わせ先: ${replyToEmail}</p>
          <p>&copy; 2025 家具の家 No.1. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Booking cancelled email sent to:", to);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    console.error("❌ Booking cancelled email error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "キャンセル確認メールの送信に失敗しました",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
