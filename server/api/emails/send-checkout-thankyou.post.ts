import nodemailer from "nodemailer";

/**
 * チェックアウト後お礼メール送信API
 * ゲストに滞在のお礼とレビュー依頼
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
    reviewUrl,
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
  const brandSiteUrl = config.brandSiteUrl || "https://furniturehouse1.com";

  const mailOptions = {
    from: `"家具の家 No.1" <${fromEmail}>`,
    to,
    replyTo: replyToEmail,
    subject: `【ありがとうございました】ご滞在のお礼 - ${bookingReference}`,
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
            padding: 40px 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .stay-box {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }
          .review-box {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
          }
          .button-secondary {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            margin-top: 15px;
          }
          .footer {
            text-align: center;
            color: #999;
            font-size: 12px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #666;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 48px; margin-bottom: 15px;">🙏</div>
          <h1 style="margin: 0; font-size: 24px;">ご滞在ありがとうございました</h1>
        </div>

        <div class="content">
          <p>${guestName} 様</p>

          <p>この度は「家具の家 No.1」をご利用いただき、誠にありがとうございました。</p>

          <p>ごゆっくりお過ごしいただけましたでしょうか？<br>
          お忙しい日常から離れ、リフレッシュしていただけていれば幸いです。</p>

          <div class="stay-box">
            <h4 style="margin-top: 0; color: #92400e;">📋 ご滞在情報</h4>
            <p style="margin: 5px 0;"><strong>予約番号:</strong> ${bookingReference}</p>
            <p style="margin: 5px 0;"><strong>ご滞在期間:</strong> ${checkInDate} 〜 ${checkOutDate}</p>
          </div>

          ${
            reviewUrl
              ? `
          <div class="review-box">
            <h3 style="margin-top: 0; color: #92400e;">⭐ ご感想をお聞かせください</h3>
            <p style="color: #78350f; margin-bottom: 20px;">
              皆様のご意見は、より良いサービス向上のために大変参考になります。<br>
              ぜひレビューをお寄せください。
            </p>
            <a href="${reviewUrl}" class="button">レビューを書く</a>
          </div>
          `
              : `
          <div class="review-box">
            <h3 style="margin-top: 0; color: #92400e;">⭐ ご感想をお聞かせください</h3>
            <p style="color: #78350f; margin-bottom: 10px;">
              皆様のご意見は、より良いサービス向上のために大変参考になります。<br>
              ご感想がございましたら、このメールにご返信ください。
            </p>
          </div>
          `
          }

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #666; margin-bottom: 15px;">またのご利用を心よりお待ちしております</p>
            <a href="${brandSiteUrl}" class="button-secondary">公式サイトを見る</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="text-align: center; color: #666;">
            「家具の家 No.1」をお選びいただき<br>
            ありがとうございました。
          </p>

          <p style="text-align: center;">家具の家 No.1 運営委員会</p>
        </div>

        <div class="footer">
          <p>ご質問・お問い合わせ: ${replyToEmail}</p>
          <p>&copy; 2025 家具の家 No.1. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Thank you email sent to:", to);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    console.error("❌ Thank you email error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "お礼メールの送信に失敗しました",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
