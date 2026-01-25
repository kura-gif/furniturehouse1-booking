import nodemailer from "nodemailer";

/**
 * 管理者通知メール送信API
 *
 * 新規予約、キャンセル、決済失敗などを管理者に通知
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
    type,
    bookingId,
    bookingReference,
    guestName,
    guestEmail,
    guestPhone,
    checkInDate,
    checkOutDate,
    guestCount,
    totalAmount,
    refundAmount,
    errorMessage,
    rejectionReason,
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
  const adminEmail =
    config.emailReplyTo || config.emailFrom || config.emailUser;

  // 通知タイプに応じた件名とコンテンツ
  let subject = "";
  let headerColor = "";
  let headerIcon = "";
  let headerText = "";
  let contentHtml = "";

  switch (type) {
    case "new_booking_request":
      subject = `【審査待ち】新規予約リクエスト ${bookingReference} - ${guestName}様`;
      headerColor = "#8b5cf6"; // purple
      headerIcon = "📋";
      headerText = "新規予約リクエストが入りました";
      contentHtml = `
        <div class="info-box" style="border-left-color: #8b5cf6;">
          <h3 style="margin-top: 0;">予約リクエスト情報</h3>
          <div class="info-row">
            <span class="label">予約番号</span>
            <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
          </div>
          <div class="info-row">
            <span class="label">お客様名</span>
            <span class="value">${guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">メール</span>
            <span class="value">${guestEmail}</span>
          </div>
          <div class="info-row">
            <span class="label">電話番号</span>
            <span class="value">${guestPhone || "未登録"}</span>
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
            <span class="label">宿泊人数</span>
            <span class="value">${guestCount}名</span>
          </div>
          <div class="info-row">
            <span class="label">合計金額</span>
            <span class="value" style="font-weight: bold; color: #8b5cf6;">¥${totalAmount?.toLocaleString() || 0}</span>
          </div>
          ${
            body.notes
              ? `
          <div class="info-row">
            <span class="label">備考</span>
            <span class="value">${body.notes}</span>
          </div>
          `
              : ""
          }
        </div>
        <p style="background: #f5f3ff; padding: 15px; border-radius: 6px; color: #5b21b6;">
          <strong>審査が必要です</strong><br>
          カード与信は確保済みです。承認または却下の操作をお願いします。
        </p>
        <p style="margin-top: 20px;">
          <a href="${config.public.siteUrl || "http://localhost:3000"}/admin"
             style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            管理画面で審査する
          </a>
        </p>
      `;
      break;

    case "booking_approved":
      subject = `【承認完了】${bookingReference} - ${guestName}様`;
      headerColor = "#10b981"; // green
      headerIcon = "✅";
      headerText = "予約が承認されました";
      contentHtml = `
        <div class="info-box">
          <h3 style="margin-top: 0;">承認情報</h3>
          <div class="info-row">
            <span class="label">予約番号</span>
            <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
          </div>
          <div class="info-row">
            <span class="label">お客様名</span>
            <span class="value">${guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">メール</span>
            <span class="value">${guestEmail}</span>
          </div>
          <div class="info-row">
            <span class="label">決済金額</span>
            <span class="value" style="font-weight: bold; color: #10b981;">¥${totalAmount?.toLocaleString() || 0}</span>
          </div>
        </div>
        <p style="background: #ecfdf5; padding: 15px; border-radius: 6px; color: #065f46;">
          決済が確定しました。お客様に承認通知メールが送信されています。
        </p>
      `;
      break;

    case "new_booking":
      subject = `【新規予約】${bookingReference} - ${guestName}様`;
      headerColor = "#10b981"; // green
      headerIcon = "🎉";
      headerText = "新規予約が入りました";
      contentHtml = `
        <div class="info-box">
          <h3 style="margin-top: 0;">予約情報</h3>
          <div class="info-row">
            <span class="label">予約番号</span>
            <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
          </div>
          <div class="info-row">
            <span class="label">お客様名</span>
            <span class="value">${guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">メール</span>
            <span class="value">${guestEmail}</span>
          </div>
          <div class="info-row">
            <span class="label">電話番号</span>
            <span class="value">${guestPhone || "未登録"}</span>
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
            <span class="label">宿泊人数</span>
            <span class="value">${guestCount}名</span>
          </div>
          <div class="info-row">
            <span class="label">合計金額</span>
            <span class="value" style="font-weight: bold; color: #10b981;">¥${totalAmount?.toLocaleString() || 0}</span>
          </div>
        </div>
        <p style="margin-top: 20px;">
          <a href="${config.public.siteUrl || "http://localhost:3000"}/admin"
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            管理画面を開く
          </a>
        </p>
      `;
      break;

    case "booking_cancelled":
      subject = `【キャンセル】${bookingReference} - ${guestName}様`;
      headerColor = "#f59e0b"; // amber
      headerIcon = "⚠️";
      headerText = "予約がキャンセルされました";
      contentHtml = `
        <div class="info-box" style="border-left-color: #f59e0b;">
          <h3 style="margin-top: 0;">キャンセル情報</h3>
          <div class="info-row">
            <span class="label">予約番号</span>
            <span class="value">${bookingReference}</span>
          </div>
          <div class="info-row">
            <span class="label">お客様名</span>
            <span class="value">${guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">元の日程</span>
            <span class="value">${checkInDate} 〜 ${checkOutDate}</span>
          </div>
          ${
            refundAmount
              ? `
          <div class="info-row">
            <span class="label">返金額</span>
            <span class="value" style="color: #f59e0b;">¥${refundAmount.toLocaleString()}</span>
          </div>
          `
              : ""
          }
        </div>
      `;
      break;

    case "payment_failed":
      subject = `【決済失敗】${bookingReference} - ${guestName}様`;
      headerColor = "#ef4444"; // red
      headerIcon = "❌";
      headerText = "決済に失敗しました";
      contentHtml = `
        <div class="info-box" style="border-left-color: #ef4444;">
          <h3 style="margin-top: 0;">決済失敗情報</h3>
          <div class="info-row">
            <span class="label">予約番号</span>
            <span class="value">${bookingReference}</span>
          </div>
          <div class="info-row">
            <span class="label">お客様名</span>
            <span class="value">${guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">メール</span>
            <span class="value">${guestEmail}</span>
          </div>
          ${
            errorMessage
              ? `
          <div class="info-row">
            <span class="label">エラー内容</span>
            <span class="value" style="color: #ef4444;">${errorMessage}</span>
          </div>
          `
              : ""
          }
        </div>
        <p style="background: #fef2f2; padding: 15px; border-radius: 6px; color: #991b1b;">
          お客様への連絡が必要な場合があります。
        </p>
      `;
      break;

    case "refund_completed":
      subject = `【返金完了】${bookingReference} - ${guestName}様`;
      headerColor = "#3b82f6"; // blue
      headerIcon = "💰";
      headerText = "返金が完了しました";
      contentHtml = `
        <div class="info-box" style="border-left-color: #3b82f6;">
          <h3 style="margin-top: 0;">返金情報</h3>
          <div class="info-row">
            <span class="label">予約番号</span>
            <span class="value">${bookingReference}</span>
          </div>
          <div class="info-row">
            <span class="label">お客様名</span>
            <span class="value">${guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">返金額</span>
            <span class="value" style="font-weight: bold; color: #3b82f6;">¥${refundAmount?.toLocaleString() || 0}</span>
          </div>
        </div>
      `;
      break;

    case "booking_rejected":
      subject = `【却下完了】${bookingReference} - ${guestName}様`;
      headerColor = "#ef4444"; // red
      headerIcon = "❌";
      headerText = "予約が却下されました";
      contentHtml = `
        <div class="info-box" style="border-left-color: #ef4444;">
          <h3 style="margin-top: 0;">却下情報</h3>
          <div class="info-row">
            <span class="label">予約番号</span>
            <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
          </div>
          <div class="info-row">
            <span class="label">お客様名</span>
            <span class="value">${guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">メール</span>
            <span class="value">${guestEmail}</span>
          </div>
          ${
            rejectionReason
              ? `
          <div class="info-row">
            <span class="label">却下理由</span>
            <span class="value" style="color: #ef4444;">${rejectionReason}</span>
          </div>
          `
              : ""
          }
        </div>
        <p style="background: #fef2f2; padding: 15px; border-radius: 6px; color: #991b1b;">
          与信が解放されました。お客様に却下通知メールが送信されています。
        </p>
      `;
      break;

    case "booking_modified":
      subject = `【予約変更】${bookingReference} - ${guestName}様`;
      headerColor = "#3b82f6"; // blue
      headerIcon = "📝";
      headerText = "予約が変更されました";
      contentHtml = `
        <div class="info-box" style="border-left-color: #3b82f6;">
          <h3 style="margin-top: 0;">変更情報</h3>
          <div class="info-row">
            <span class="label">予約番号</span>
            <span class="value" style="font-family: monospace; font-weight: bold;">${bookingReference}</span>
          </div>
          <div class="info-row">
            <span class="label">お客様名</span>
            <span class="value">${guestName}</span>
          </div>
          <div class="info-row">
            <span class="label">メール</span>
            <span class="value">${guestEmail}</span>
          </div>
          <div class="info-row">
            <span class="label">変更後金額</span>
            <span class="value" style="font-weight: bold; color: #3b82f6;">¥${totalAmount?.toLocaleString() || 0}</span>
          </div>
        </div>
        <p style="background: #eff6ff; padding: 15px; border-radius: 6px; color: #1e40af;">
          予約内容が変更されました。ゲストに通知メールが送信されています。
        </p>
        <p style="margin-top: 20px;">
          <a href="${config.public.siteUrl || "http://localhost:3000"}/admin"
             style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            管理画面で確認
          </a>
        </p>
      `;
      break;

    default:
      subject = `【通知】${bookingReference || "予約通知"}`;
      headerColor = "#6b7280"; // gray
      headerIcon = "📩";
      headerText = "通知";
      contentHtml = `<p>予約ID: ${bookingId}</p>`;
  }

  const mailOptions = {
    from: `"家具の家 No.1" <${fromEmail}>`,
    to: adminEmail,
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
          <p>&copy; 2025 家具の家 No.1 管理システム</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Admin notification email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    console.error("❌ Admin notification email error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "管理者通知メールの送信に失敗しました",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
