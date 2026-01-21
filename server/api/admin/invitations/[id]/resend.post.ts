import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";
import {
  generateInvitationToken,
  getInvitationExpiry,
} from "~/server/utils/invitation";
import nodemailer from "nodemailer";

/**
 * 管理者招待再送信API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  const admin = await requireAdmin(event);

  const invitationId = getRouterParam(event, "id");
  if (!invitationId) {
    throw createError({
      statusCode: 400,
      message: "招待IDが必要です",
    });
  }

  const db = getFirestoreAdmin();

  // 招待を取得
  const invitationDoc = await db
    .collection("adminInvitations")
    .doc(invitationId)
    .get();

  if (!invitationDoc.exists) {
    throw createError({
      statusCode: 404,
      message: "招待が見つかりません",
    });
  }

  const invitation = invitationDoc.data();

  // pending状態のみ再送信可能
  if (invitation?.status !== "pending") {
    throw createError({
      statusCode: 400,
      message: "この招待は再送信できません",
    });
  }

  // 新しいトークンと有効期限を生成
  const token = generateInvitationToken();
  const expiresAt = getInvitationExpiry();

  // 招待情報を更新
  await invitationDoc.ref.update({
    token,
    expiresAt: new Date(expiresAt),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // 招待メール再送信
  try {
    const config = useRuntimeConfig();
    const siteUrl = config.public.siteUrl || "http://localhost:3000";
    const invitationUrl = `${siteUrl}/accept-invitation?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const senderEmail = config.emailUser || "noreply@furniturehouse1.com";
    const replyToEmail = config.emailReplyTo || senderEmail;

    await transporter.sendMail({
      from: `"家具の家 No.1" <${senderEmail}>`,
      to: invitation.email,
      replyTo: replyToEmail,
      subject: "【家具の家 No.1】管理者招待のお知らせ（再送）",
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
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .info-box {
              background: #e7f3ff;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">家具の家 No.1</h1>
            <p style="margin: 10px 0 0 0;">管理者招待（再送）</p>
          </div>

          <div class="content">
            <p>管理者招待メールを再送信します。</p>

            <p>以下のボタンをクリックして、アカウントを作成してください。</p>

            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">アカウントを作成</a>
            </div>

            <div class="info-box">
              <p style="margin: 0;"><strong>重要事項</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>この招待は7日間有効です</li>
                <li>リンクは1回のみ使用できます</li>
                <li>以前のリンクは無効になりました</li>
              </ul>
            </div>

            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              リンクが機能しない場合は、以下のURLをブラウザにコピー＆ペーストしてください：<br>
              ${invitationUrl}
            </p>
          </div>

          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p>&copy; 2025 家具の家 No.1. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ 招待メール再送信成功:", invitation.email);
  } catch (error: unknown) {
    console.error("❌ 招待メール再送信エラー:", error);
    throw createError({
      statusCode: 500,
      message: "メール送信に失敗しました",
    });
  }

  return {
    success: true,
    message: "招待メールを再送信しました",
  };
});
