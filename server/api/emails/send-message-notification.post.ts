import nodemailer from "nodemailer";

/**
 * メッセージ通知メール送信API
 *
 * ゲスト→管理者、管理者→ゲスト の双方向に対応
 *
 * - type: 'guest_to_admin' ゲストからのメッセージを管理者に通知
 * - type: 'admin_to_guest' 管理者からのメッセージをゲストに通知
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  console.log("📧 send-message-notification API called");

  // 内部呼び出し認証チェック
  // 同一オリジンからの呼び出しのみ許可（サーバーサイドからの内部呼び出し）
  const authHeader = getHeader(event, "x-internal-secret");
  const userAgent = getHeader(event, "user-agent");

  // node (サーバーサイド) からの呼び出しか確認
  const isServerSideCall = userAgent === "node" || userAgent?.includes("node");

  if (!isServerSideCall && !authHeader) {
    throw createError({
      statusCode: 403,
      statusMessage: "このAPIは内部呼び出し専用です",
    });
  }

  const body = await readBody(event);
  const {
    type,
    conversationId,
    bookingId,
    bookingReference,
    guestName,
    guestEmail,
    senderName,
    messageContent,
    messagePreview,
  } = body;

  if (!type || !conversationId) {
    throw createError({
      statusCode: 400,
      statusMessage: "type と conversationId は必須です",
    });
  }

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
  const adminEmail =
    config.emailReplyTo || config.emailFrom || config.emailUser;
  const siteUrl = config.public.siteUrl || "http://localhost:3000";

  let toEmail: string;
  let subject: string;
  let headerColor: string;
  let headerIcon: string;
  let headerText: string;
  let contentHtml: string;

  // メッセージプレビュー（100文字まで）
  const preview =
    messagePreview ||
    (messageContent
      ? messageContent.substring(0, 100) +
        (messageContent.length > 100 ? "..." : "")
      : "");

  if (type === "guest_to_admin") {
    // ゲストからのメッセージ → 管理者へ通知
    toEmail = adminEmail;
    subject = `【新着メッセージ】${guestName}様からのメッセージ${bookingReference ? ` (${bookingReference})` : ""}`;
    headerColor = "#8b5cf6"; // purple
    headerIcon = "💬";
    headerText = "新着メッセージがあります";
    contentHtml = `
      <div class="info-box" style="border-left-color: #8b5cf6;">
        <h3 style="margin-top: 0;">メッセージ情報</h3>
        ${
          bookingReference
            ? `
        <div class="info-row">
          <span class="label">予約番号</span>
          <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
        </div>
        `
            : ""
        }
        <div class="info-row">
          <span class="label">送信者</span>
          <span class="value">${guestName || "ゲスト"}</span>
        </div>
        <div class="info-row">
          <span class="label">メールアドレス</span>
          <span class="value">${guestEmail || "不明"}</span>
        </div>
      </div>
      <div style="background: #f5f3ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; color: #5b21b6; font-weight: 600;">メッセージ内容:</p>
        <p style="margin: 0; color: #333; white-space: pre-wrap;">${preview}</p>
      </div>
      <p style="margin-top: 20px;">
        <a href="${siteUrl}/admin/messages/${conversationId}"
           style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          メッセージを確認・返信する
        </a>
      </p>
    `;
  } else if (type === "admin_to_guest") {
    // 管理者からのメッセージ → ゲストへ通知
    if (!guestEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: "ゲストのメールアドレスが必要です",
      });
    }

    toEmail = guestEmail;
    subject = `【家具の家 No.1】${senderName || "管理者"}からメッセージが届きました`;
    headerColor = "#10b981"; // green
    headerIcon = "📩";
    headerText = "新しいメッセージが届きました";
    contentHtml = `
      <div class="info-box" style="border-left-color: #10b981;">
        <h3 style="margin-top: 0;">メッセージ情報</h3>
        ${
          bookingReference
            ? `
        <div class="info-row">
          <span class="label">予約番号</span>
          <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
        </div>
        `
            : ""
        }
        <div class="info-row">
          <span class="label">送信者</span>
          <span class="value">${senderName || "家具の家 No.1"}</span>
        </div>
      </div>
      <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0 0 10px 0; color: #065f46; font-weight: 600;">メッセージ内容:</p>
        <p style="margin: 0; color: #333; white-space: pre-wrap;">${preview}</p>
      </div>
      <p style="margin-top: 20px;">
        <a href="${siteUrl}/messages/${bookingId || conversationId}"
           style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          メッセージを確認・返信する
        </a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 15px;">
        ※ このメールに直接返信しても届きません。上のボタンからご返信ください。
      </p>
    `;
  } else {
    throw createError({
      statusCode: 400,
      statusMessage:
        "無効なtypeです。guest_to_admin または admin_to_guest を指定してください",
    });
  }

  const mailOptions = {
    from: `"家具の家 No.1" <${fromEmail}>`,
    to: toEmail,
    replyTo: adminEmail,
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
          <div style="font-size: 32px; margin-bottom: 10px;">${headerIcon}</div>
          <h2 style="margin: 0;">${headerText}</h2>
        </div>

        <div class="content">
          ${contentHtml}
        </div>

        <div class="footer">
          <p>このメールは自動送信されています。</p>
          <p>&copy; 2025 家具の家 No.1</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(
      `✅ Message notification email sent (${type}):`,
      info.messageId,
    );

    return {
      success: true,
      messageId: info.messageId,
      type,
    };
  } catch (error: unknown) {
    console.error(`❌ Message notification email error (${type}):`, error);
    throw createError({
      statusCode: 500,
      statusMessage: "メッセージ通知メールの送信に失敗しました",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
