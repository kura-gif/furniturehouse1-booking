/**
 * Staging → Production 写真データ移行スクリプト
 *
 * Usage: npx tsx scripts/migrate-photos.ts
 */

import { initializeApp, cert, deleteApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// サービスアカウントキーを読み込み
const stagingKey = JSON.parse(
  readFileSync(join(__dirname, '../furniture-house-1-firebase-adminsdk-fbsvc-31687aa747.json'), 'utf8')
)
const prodKey = JSON.parse(
  readFileSync(join(__dirname, '../furniture-house-1-prod-firebase-adminsdk-fbsvc-3b846c033c.json'), 'utf8')
)

// Staging環境の設定
const stagingApp = initializeApp({
  credential: cert(stagingKey)
}, 'staging')

// Production環境の設定
const prodApp = initializeApp({
  credential: cert(prodKey)
}, 'production')

const stagingDb = getFirestore(stagingApp)
const prodDb = getFirestore(prodApp)

async function migratePhotos() {
  console.log('📸 写真データ移行を開始します...\n')

  try {
    // Stagingから写真を取得
    console.log('1. Staging環境から写真データを取得中...')
    const stagingPhotos = await stagingDb.collection('photos').get()

    if (stagingPhotos.empty) {
      console.log('⚠️  Staging環境に写真データがありません')
      return
    }

    console.log(`   → ${stagingPhotos.size}件の写真が見つかりました\n`)

    // Production環境の既存写真を確認
    console.log('2. Production環境の既存データを確認中...')
    const prodPhotos = await prodDb.collection('photos').get()
    console.log(`   → ${prodPhotos.size}件の写真が既に存在します\n`)

    // 写真をProductionにコピー
    console.log('3. Production環境に写真データをコピー中...')
    let copied = 0
    let skipped = 0

    for (const doc of stagingPhotos.docs) {
      const data = doc.data()

      // 同じURLの写真が既に存在するかチェック
      const existing = await prodDb.collection('photos')
        .where('url', '==', data.url)
        .get()

      if (!existing.empty) {
        console.log(`   ⏭️  スキップ: ${data.title} (既に存在)`)
        skipped++
        continue
      }

      // 新しいドキュメントとしてコピー（migratedFromとmigratedAtは除外）
      const { migratedFrom, migratedAt, ...cleanData } = data
      await prodDb.collection('photos').add({
        ...cleanData,
        migratedFrom: 'staging',
        migratedAt: FieldValue.serverTimestamp()
      })
      console.log(`   ✅ コピー完了: ${data.title}`)
      copied++
    }

    console.log('\n========================================')
    console.log(`✨ 移行完了!`)
    console.log(`   - コピー: ${copied}件`)
    console.log(`   - スキップ: ${skipped}件`)
    console.log('========================================\n')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    throw error
  } finally {
    // クリーンアップ
    await deleteApp(stagingApp)
    await deleteApp(prodApp)
  }
}

// 実行
migratePhotos()
  .then(() => {
    console.log('スクリプト終了')
    process.exit(0)
  })
  .catch((error) => {
    console.error('スクリプト失敗:', error)
    process.exit(1)
  })
