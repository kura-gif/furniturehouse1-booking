/**
 * デフォルトメールテンプレートをFirestoreに投入するスクリプト
 *
 * 使い方:
 * npx tsx scripts/seedEmailTemplates.ts
 */

import * as admin from 'firebase-admin'
import * as dotenv from 'dotenv'
import * as path from 'path'

// 環境変数を読み込み
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Firebase Admin初期化
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!serviceAccountPath) {
  console.error('❌ GOOGLE_APPLICATION_CREDENTIALS が設定されていません')
  process.exit(1)
}

const serviceAccount = require(path.resolve(serviceAccountPath))

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
})

const db = admin.firestore()

// デフォルトテンプレート
const defaultTemplates = [
  {
    name: '1週間前リマインダー',
    type: 'checkin_reminder',
    subject: '【家具の家 No.1】ご宿泊まで1週間となりました',
    bodyHtml: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">家具の家 No.1</h1>
          <p style="margin: 10px 0 0 0;">ご宿泊まであと{{daysUntilCheckIn}}日</p>
        </div>
        <div class="content">
          <p>{{guestName}} 様</p>
          <p>この度は「家具の家 No.1」をご予約いただき、誠にありがとうございます。</p>
          <p>ご宿泊日が1週間後に近づいてまいりました。ご準備の参考にしていただければ幸いです。</p>
          <div class="info-box">
            <h3 style="margin-top: 0;">ご予約内容</h3>
            <p><strong>予約番号:</strong> {{bookingReference}}</p>
            <p><strong>チェックイン:</strong> {{checkInDate}} 14:00〜</p>
            <p><strong>チェックアウト:</strong> {{checkOutDate}} 〜11:00</p>
            <p><strong>人数:</strong> {{guestCount}}名様</p>
          </div>
          <p>詳細な住所やアクセス方法は、チェックイン3日前にメールにてお知らせいたします。</p>
          <p>ご滞在を心よりお待ちしております。</p>
          <p>家具の家 No.1 運営委員会</p>
        </div>
      </body>
      </html>
    `,
    variables: ['guestName', 'bookingReference', 'checkInDate', 'checkOutDate', 'guestCount', 'daysUntilCheckIn']
  },
  {
    name: '3日前リマインダー',
    type: 'checkin_reminder',
    subject: '【家具の家 No.1】ご宿泊まで3日となりました',
    bodyHtml: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">家具の家 No.1</h1>
          <p style="margin: 10px 0 0 0;">ご宿泊まであと{{daysUntilCheckIn}}日</p>
        </div>
        <div class="content">
          <p>{{guestName}} 様</p>
          <p>ご宿泊日が近づいてまいりました。準備の最終確認をお願いいたします。</p>
          <div class="info-box">
            <h3 style="margin-top: 0;">アクセス情報</h3>
            <p><strong>住所:</strong> 〒XXX-XXXX [詳細住所]</p>
            <p><strong>アクセス:</strong> [交通手段の詳細]</p>
            <p><strong>駐車場:</strong> あり（無料）</p>
          </div>
          <div class="info-box">
            <h3 style="margin-top: 0;">チェックイン時の注意事項</h3>
            <ul>
              <li>チェックイン時間: 14:00〜18:00</li>
              <li>鍵の受け渡し方法: [詳細]</li>
              <li>ご持参いただくもの: [リスト]</li>
            </ul>
          </div>
          <p>ご不明な点がございましたら、このメールにご返信ください。</p>
          <p>お会いできることを楽しみにしております。</p>
        </div>
      </body>
      </html>
    `,
    variables: ['guestName', 'bookingReference', 'checkInDate', 'checkOutDate', 'daysUntilCheckIn']
  },
  {
    name: '前日最終確認',
    type: 'checkin_reminder',
    subject: '【家具の家 No.1】明日のご宿泊について',
    bodyHtml: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">家具の家 No.1</h1>
          <p style="margin: 10px 0 0 0;">いよいよ明日チェックイン</p>
        </div>
        <div class="content">
          <p>{{guestName}} 様</p>
          <p>いよいよ明日がチェックイン日となりました。</p>
          <div class="info-box">
            <h3 style="margin-top: 0;">明日の流れ</h3>
            <p><strong>チェックイン:</strong> {{checkInDate}} 14:00〜18:00</p>
            <p><strong>住所:</strong> [詳細住所]</p>
            <p><strong>緊急連絡先:</strong> [電話番号]</p>
          </div>
          <p>お気をつけてお越しください。お待ちしております。</p>
        </div>
      </body>
      </html>
    `,
    variables: ['guestName', 'checkInDate']
  },
  {
    name: 'チェックアウトお礼メール',
    type: 'checkout_thanks',
    subject: '【家具の家 No.1】ご利用ありがとうございました',
    bodyHtml: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0;">家具の家 No.1</h1>
          <p style="margin: 10px 0 0 0;">ご利用ありがとうございました</p>
        </div>
        <div class="content">
          <p>{{guestName}} 様</p>
          <p>この度は「家具の家 No.1」をご利用いただき、誠にありがとうございました。</p>
          <p>ご滞在はいかがでしたでしょうか。またのお越しを心よりお待ちしております。</p>
          <p>もしよろしければ、今回のご滞在のレビューをお聞かせいただけますと幸いです。</p>
          <p>家具の家 No.1 運営委員会</p>
        </div>
      </body>
      </html>
    `,
    variables: ['guestName']
  }
]

async function seedEmailTemplates() {
  console.log('📧 デフォルトメールテンプレート投入開始...')

  try {
    for (const template of defaultTemplates) {
      // 同じ名前のテンプレートが既に存在するかチェック
      const existingSnapshot = await db
        .collection('emailTemplates')
        .where('name', '==', template.name)
        .limit(1)
        .get()

      if (!existingSnapshot.empty) {
        console.log(`⏭️  スキップ: ${template.name} は既に存在します`)
        continue
      }

      // テンプレートを作成
      const docRef = await db.collection('emailTemplates').add({
        ...template,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'system'
      })

      console.log(`✅ 作成: ${template.name} (${docRef.id})`)
    }

    console.log('✨ デフォルトメールテンプレート投入完了')
  } catch (error) {
    console.error('❌ エラー:', error)
    process.exit(1)
  } finally {
    await admin.app().delete()
  }
}

seedEmailTemplates()
