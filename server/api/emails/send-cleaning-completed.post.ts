import nodemailer from "nodemailer";

/**
 * 管理者への清掃完了通知メール送信API
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const body = await readBody(event);
  const {
    supporterName,
    taskType,
    scheduledDate,
    completedAt,
    actualDuration,
    bookingReference,
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
  const fromEmail = String(
    config.emailFrom ||
      config.emailReplyTo ||
      config.emailUser ||
      "noreply@furniturehouse1.com",
  );
  const adminEmail = String(
    config.emailReplyTo || config.emailFrom || config.emailUser,
  );

  const taskTypeLabel =
    taskType === "pre_checkin" ? "チェックイン前清掃" : "チェックアウト後清掃";

  const mailOptions = {
    from: `"家具の家 No.1 システム" <${fromEmail}>`,
    to: adminEmail,
    subject: `【清掃完了】${taskTypeLabel} - ${bookingReference}`,
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
          .success-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
          <h1 style="margin: 0;">清掃完了通知</h1>
          <p style="margin: 10px 0 0 0;"><span class="success-badge">完了</span></p>
        </div>

        <div class="content">
          <p>管理者様</p>

          <p>以下の清掃タスクが完了しました。</p>

          <div class="info-box">
            <h3 style="margin-top: 0;">完了タスク</h3>
            <div class="info-row">
              <span class="label">タスク種類</span>
              <span class="value">${taskTypeLabel}</span>
            </div>
            <div class="info-row">
              <span class="label">予約番号</span>
              <span class="value" style="font-family: monospace;">${bookingReference}</span>
            </div>
            <div class="info-row">
              <span class="label">担当者</span>
              <span class="value">${supporterName}</span>
            </div>
            <div class="info-row">
              <span class="label">予定日</span>
              <span class="value">${scheduledDate}</span>
            </div>
            <div class="info-row">
              <span class="label">完了日時</span>
              <span class="value">${completedAt}</span>
            </div>
            <div class="info-row">
              <span class="label">実作業時間</span>
              <span class="value">${actualDuration}分（${(actualDuration / 60).toFixed(1)}時間）</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${config.public.siteUrl || "http://localhost:3000"}/admin/cleaning-tasks"
               class="button">
              管理画面で詳細を確認
            </a>
          </div>
        </div>

        <div class="footer">
          <p>このメールはシステムから自動送信されています。</p>
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
    console.error("清掃完了通知メール送信エラー:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "メール送信に失敗しました",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
