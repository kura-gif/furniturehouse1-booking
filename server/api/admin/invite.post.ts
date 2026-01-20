import { FieldValue } from 'firebase-admin/firestore'
import { getFirestoreAdmin } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/auth'
import { generateInvitationToken, getInvitationExpiry } from '~/server/utils/invitation'
import nodemailer from 'nodemailer'

/**
 * 管理者招待API
 *
 * 既存の管理者が新しい管理者を招待するためのAPI
 */
export default defineEventHandler(async (event) => {
  // 1. 管理者認証チェック
  const admin = await requireAdmin(event)

  // 2. リクエストボディ検証
  const body = await readBody(event)
  const { email } = body

  if (!email || typeof email !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'メールアドレスが必要です'
    })
  }

  // メールアドレスの形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      message: '無効なメールアドレス形式です'
    })
  }

  const db = getFirestoreAdmin()

  // 3. 既存の管理者かチェック
  const existingUsersSnapshot = await db
    .collection('users')
    .where('email', '==', email)
    .where('role', '==', 'admin')
    .limit(1)
    .get()

  if (!existingUsersSnapshot.empty) {
    throw createError({
      statusCode: 400,
      message: 'このメールアドレスは既に管理者として登録されています'
    })
  }

  // 4. 未処理の招待が既にあるかチェック
  const existingInvitationsSnapshot = await db
    .collection('adminInvitations')
    .where('email', '==', email)
    .where('status', '==', 'pending')
    .limit(1)
    .get()

  if (!existingInvitationsSnapshot.empty) {
    throw createError({
      statusCode: 400,
      message: 'このメールアドレスには既に招待が送信されています'
    })
  }

  // 5. 招待トークン生成
  const token = generateInvitationToken()
  const expiresAt = getInvitationExpiry()

  // 6. adminInvitationsコレクションに保存
  const invitationRef = db.collection('adminInvitations').doc()
  const invitationData = {
    email,
    token,
    invitedBy: admin.uid,
    invitedByName: admin.displayName || admin.email,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: FieldValue.serverTimestamp() // Firestoreではサーバータイムスタンプを使用
  }

  // expiresAtを正しく設定（7日後）
  await invitationRef.set({
    ...invitationData,
    expiresAt: new Date(expiresAt)
  })

  // 7. 招待メール送信
  try {
    const config = useRuntimeConfig()
    const siteUrl = config.public.siteUrl || 'http://localhost:3000'
    const invitationUrl = `${siteUrl}/accept-invitation?token=${token}`

    // メール送信設定
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.emailUser,
        pass: config.emailPassword
      }
    })

    const senderEmail = config.emailUser || 'noreply@furniturehouse1.com'
    const replyToEmail = config.emailReplyTo || senderEmail

    await transporter.sendMail({
      from: `"家具の家 No.1" <${senderEmail}>`,
      to: email,
      replyTo: replyToEmail,
      subject: '【家具の家 No.1】管理者招待のお知らせ',
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
            <p style="margin: 10px 0 0 0;">管理者招待</p>
          </div>

          <div class="content">
            <p>${admin.displayName || admin.email} 様より、家具の家 No.1 の管理者として招待されました。</p>

            <p>以下のボタンをクリックして、アカウントを作成してください。</p>

            <div style="text-align: center;">
              <a href="${invitationUrl}" class="button">アカウントを作成</a>
            </div>

            <div class="info-box">
              <p style="margin: 0;"><strong>重要事項</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>この招待は7日間有効です</li>
                <li>リンクは1回のみ使用できます</li>
                <li>招待状に心当たりがない場合は、このメールを無視してください</li>
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
      `
    })

    console.log('✅ 招待メール送信成功:', email)
  } catch (error: unknown) {
    console.error('❌ 招待メール送信エラー:', error)
    // メール送信失敗でも招待データは保存されているため、手動で再送信可能
  }

  return {
    success: true,
    invitationId: invitationRef.id,
    message: '招待メールを送信しました'
  }
})
