import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Firebase Admin初期化
const serviceAccountPath = resolve(__dirname, '../furniture-house-1-firebase-adminsdk-fbsvc-31687aa747.json')
let serviceAccount

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
} catch (error) {
  console.error('❌ サービスアカウントキーが見つかりません。')
  console.error(`   パス: ${serviceAccountPath}`)
  process.exit(1)
}

const app = initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore(app)
const auth = getAuth(app)

// 削除対象のコレクション
const COLLECTIONS_TO_CLEAN = [
  'bookings',
  'guestMessages',
  'conversations',
  'messages',
  'supportTasks',
  'cleaningTasks',
  'reviews',
  'sentEmails',
  'supporters',
  'supporterAvailability',
  'supportMessages',
  'webhookLogs',
  'reviewLogs',
  'refundLogs',
  'cancellationLogs',
  'emailLogs',
  'errorLogs',
  'consistencyReports',
]

async function deleteCollection(collectionName: string): Promise<number> {
  const collectionRef = db.collection(collectionName)
  const snapshot = await collectionRef.get()

  if (snapshot.empty) {
    return 0
  }

  const batch = db.batch()
  let count = 0

  // Firestoreのbatchは500件まで
  const docs = snapshot.docs
  for (let i = 0; i < docs.length; i += 500) {
    const chunk = docs.slice(i, i + 500)
    const batchInstance = db.batch()

    chunk.forEach(doc => {
      batchInstance.delete(doc.ref)
      count++
    })

    await batchInstance.commit()
  }

  return count
}

async function deleteNonAdminUsers(): Promise<{ firestoreDeleted: number; authDeleted: number }> {
  let firestoreDeleted = 0
  let authDeleted = 0

  // Firestoreからadmin以外のユーザーを取得
  const usersRef = db.collection('users')
  const snapshot = await usersRef.where('role', '!=', 'admin').get()

  if (snapshot.empty) {
    // role フィールドがない場合も考慮して全ユーザーをチェック
    const allUsersSnapshot = await usersRef.get()

    for (const doc of allUsersSnapshot.docs) {
      const userData = doc.data()
      if (userData.role !== 'admin') {
        // Firestoreから削除
        await doc.ref.delete()
        firestoreDeleted++

        // Firebase Authからも削除
        try {
          await auth.deleteUser(doc.id)
          authDeleted++
        } catch (e: any) {
          if (e.code !== 'auth/user-not-found') {
            console.warn(`  ⚠ Auth削除失敗 (${doc.id}): ${e.message}`)
          }
        }
      }
    }
  } else {
    for (const doc of snapshot.docs) {
      // Firestoreから削除
      await doc.ref.delete()
      firestoreDeleted++

      // Firebase Authからも削除
      try {
        await auth.deleteUser(doc.id)
        authDeleted++
      } catch (e: any) {
        if (e.code !== 'auth/user-not-found') {
          console.warn(`  ⚠ Auth削除失敗 (${doc.id}): ${e.message}`)
        }
      }
    }
  }

  return { firestoreDeleted, authDeleted }
}

async function cleanupTestData() {
  console.log('🧹 テストデータのクリーンアップを開始します...\n')
  console.log('⚠️  注意: この操作は元に戻せません！\n')

  try {
    // 1. admin以外のユーザーを削除
    console.log('👥 ユーザーを削除中（admin以外）...')
    const userResult = await deleteNonAdminUsers()
    console.log(`  ✓ Firestore: ${userResult.firestoreDeleted}件削除`)
    console.log(`  ✓ Firebase Auth: ${userResult.authDeleted}件削除`)

    // 2. 各コレクションを削除
    console.log('\n📦 コレクションを削除中...')

    for (const collection of COLLECTIONS_TO_CLEAN) {
      const count = await deleteCollection(collection)
      if (count > 0) {
        console.log(`  ✓ ${collection}: ${count}件削除`)
      } else {
        console.log(`  - ${collection}: データなし`)
      }
    }

    console.log('\n✅ クリーンアップが完了しました！')
    console.log('\n📝 残っているデータ:')
    console.log('  - adminユーザー')
    console.log('  - pricing（料金設定）')
    console.log('  - enhancedPricingSettings（料金設定）')
    console.log('  - coupons（クーポン）')
    console.log('  - cancellationPolicies（キャンセルポリシー）')
    console.log('  - photos（写真）')
    console.log('  - amenities（設備情報）')
    console.log('  - bookingOptions（オプション）')
    console.log('  - emailTemplates（メールテンプレート）')
    console.log('  - emailSchedules（メールスケジュール）')
    console.log('  - calendar/blockedDates（カレンダー設定）')
    console.log('  - inventory（在庫）')
    console.log('  - maintenance（メンテナンス記録）')
    console.log('  - adminInvitations（管理者招待）')

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)
    throw error
  }
}

// 実行確認
const args = process.argv.slice(2)
if (args.includes('--yes') || args.includes('-y')) {
  // 確認スキップ
  cleanupTestData()
    .then(() => {
      console.log('\n🎉 完了！')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 失敗:', error)
      process.exit(1)
    })
} else {
  // 確認プロンプト
  console.log('⚠️  テストデータを削除します。')
  console.log('   adminユーザー以外のすべてのユーザーと予約関連データが削除されます。')
  console.log('')
  console.log('   続行するには: npm run cleanup -- --yes')
  console.log('   または:       npx tsx scripts/cleanupTestData.ts --yes')
  process.exit(0)
}
