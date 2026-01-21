import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Firebase Admin初期化
// サービスアカウントキーを読み込み
const serviceAccountPath = resolve(__dirname, '../serviceAccountKey.json')
let serviceAccount

try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
} catch (error) {
  console.error('❌ サービスアカウントキーが見つかりません。')
  console.error('\n以下の手順でサービスアカウントキーを取得してください:')
  console.error('1. Firebase Consoleを開く: https://console.firebase.google.com/project/furniture-house-1/settings/serviceaccounts/adminsdk')
  console.error('2. 「新しい秘密鍵の生成」をクリック')
  console.error('3. ダウンロードしたJSONファイルを以下のパスに保存:')
  console.error(`   ${serviceAccountPath}`)
  console.error('\n4. 再度 npm run seed を実行してください\n')
  process.exit(1)
}

const app = initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore(app)
const auth = getAuth(app)

async function seedSampleData() {
  console.log('🌱 サンプルデータの投入を開始します...\n')

  try {
    // 1. サンプルゲストユーザーを作成
    console.log('👥 ゲストユーザーを作成中...')

    let guestUser1, guestUser2, guestUser3

    try {
      guestUser1 = await auth.createUser({
        email: 'tanaka@example.com',
        password: 'password123',
        displayName: '田中太郎'
      })
      console.log('  ✓ 田中太郎 (tanaka@example.com) を作成')
    } catch (e: unknown) {
      const error = e as { code?: string }
      if (error.code === 'auth/email-already-exists') {
        guestUser1 = await auth.getUserByEmail('tanaka@example.com')
        console.log('  ⚠ 田中太郎は既に存在します')
      } else {
        throw e
      }
    }

    try {
      guestUser2 = await auth.createUser({
        email: 'suzuki@example.com',
        password: 'password123',
        displayName: '鈴木花子'
      })
      console.log('  ✓ 鈴木花子 (suzuki@example.com) を作成')
    } catch (e: unknown) {
      const error = e as { code?: string }
      if (error.code === 'auth/email-already-exists') {
        guestUser2 = await auth.getUserByEmail('suzuki@example.com')
        console.log('  ⚠ 鈴木花子は既に存在します')
      } else {
        throw e
      }
    }

    try {
      guestUser3 = await auth.createUser({
        email: 'yamada@example.com',
        password: 'password123',
        displayName: '山田次郎'
      })
      console.log('  ✓ 山田次郎 (yamada@example.com) を作成')
    } catch (e: unknown) {
      const error = e as { code?: string }
      if (error.code === 'auth/email-already-exists') {
        guestUser3 = await auth.getUserByEmail('yamada@example.com')
        console.log('  ⚠ 山田次郎は既に存在します')
      } else {
        throw e
      }
    }

    // ユーザードキュメントを作成
    await db.collection('users').doc(guestUser1.uid).set({
      email: 'tanaka@example.com',
      displayName: '田中太郎',
      role: 'user',
      createdAt: Timestamp.now()
    })

    await db.collection('users').doc(guestUser2.uid).set({
      email: 'suzuki@example.com',
      displayName: '鈴木花子',
      role: 'user',
      createdAt: Timestamp.now()
    })

    await db.collection('users').doc(guestUser3.uid).set({
      email: 'yamada@example.com',
      displayName: '山田次郎',
      role: 'user',
      createdAt: Timestamp.now()
    })

    // 2. 施設サポーターを作成
    console.log('\n🔧 施設サポーターを作成中...')

    const supporter1Ref = await db.collection('supporters').add({
      name: '佐藤美咲',
      email: 'sato@support.example.com',
      phone: '090-1234-5678',
      specialties: ['清掃', '設備点検'],
      isActive: true,
      createdAt: Timestamp.now()
    })
    console.log('  ✓ 佐藤美咲 (清掃・設備点検)')

    const supporter2Ref = await db.collection('supporters').add({
      name: '伊藤健一',
      email: 'ito@support.example.com',
      phone: '090-9876-5432',
      specialties: ['メンテナンス', '緊急対応'],
      isActive: true,
      createdAt: Timestamp.now()
    })
    console.log('  ✓ 伊藤健一 (メンテナンス・緊急対応)')

    // 3. 予約を作成
    console.log('\n📅 予約を作成中...')

    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const lastWeek = new Date(today)
    lastWeek.setDate(lastWeek.getDate() - 7)

    // 予約1: 本日チェックイン（確定済み）
    const booking1Ref = await db.collection('bookings').add({
      userId: guestUser1.uid,
      guestName: '田中太郎',
      guestEmail: 'tanaka@example.com',
      guestPhone: '080-1111-2222',
      guestCount: 4,
      startDate: Timestamp.fromDate(today),
      endDate: Timestamp.fromDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
      totalPrice: 45000,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: '小さな子供がいるので、ベビーベッドを用意していただけると助かります。',
      createdAt: Timestamp.now()
    })
    console.log('  ✓ 田中太郎さんの予約（本日チェックイン）')

    // 予約2: 来週の予約（確定済み）
    const booking2Ref = await db.collection('bookings').add({
      userId: guestUser2.uid,
      guestName: '鈴木花子',
      guestEmail: 'suzuki@example.com',
      guestPhone: '080-3333-4444',
      guestCount: 2,
      startDate: Timestamp.fromDate(nextWeek),
      endDate: Timestamp.fromDate(new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000)),
      totalPrice: 60000,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: '',
      createdAt: Timestamp.now()
    })
    console.log('  ✓ 鈴木花子さんの予約（来週）')

    // 予約3: 明日チェックアウト（確定済み・滞在中）
    const booking3Ref = await db.collection('bookings').add({
      userId: guestUser3.uid,
      guestName: '山田次郎',
      guestEmail: 'yamada@example.com',
      guestPhone: '080-5555-6666',
      guestCount: 3,
      startDate: Timestamp.fromDate(lastWeek),
      endDate: Timestamp.fromDate(tomorrow),
      totalPrice: 120000,
      status: 'confirmed',
      paymentStatus: 'paid',
      specialRequests: 'Wi-Fiが必須です。仕事で使用します。',
      createdAt: Timestamp.fromDate(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000))
    })
    console.log('  ✓ 山田次郎さんの予約（明日チェックアウト）')

    // 4. ゲストメッセージを作成
    console.log('\n💬 ゲストメッセージを作成中...')

    // 田中さんとのメッセージ
    await db.collection('guestMessages').add({
      bookingId: booking1Ref.id,
      senderId: guestUser1.uid,
      senderType: 'guest',
      senderName: '田中太郎',
      message: 'こんにちは。本日チェックインの田中です。到着時間が少し遅れそうなのですが、19時頃でも大丈夫でしょうか？',
      isRead: true,
      createdAt: Timestamp.fromDate(new Date(today.getTime() - 2 * 60 * 60 * 1000))
    })

    await db.collection('guestMessages').add({
      bookingId: booking1Ref.id,
      senderId: 'admin',
      senderType: 'admin',
      senderName: '管理者',
      message: 'ご連絡ありがとうございます。19時のチェックインでも問題ございません。鍵はキーボックスにございますので、暗証番号「1234」でお開けください。',
      isRead: true,
      createdAt: Timestamp.fromDate(new Date(today.getTime() - 1.5 * 60 * 60 * 1000))
    })

    await db.collection('guestMessages').add({
      bookingId: booking1Ref.id,
      senderId: guestUser1.uid,
      senderType: 'guest',
      senderName: '田中太郎',
      message: 'ありがとうございます！了解しました。よろしくお願いいたします。',
      isRead: false,
      createdAt: Timestamp.fromDate(new Date(today.getTime() - 1 * 60 * 60 * 1000))
    })

    // 山田さんとのメッセージ
    await db.collection('guestMessages').add({
      bookingId: booking3Ref.id,
      senderId: guestUser3.uid,
      senderType: 'guest',
      senderName: '山田次郎',
      message: 'お世話になっております。エアコンのリモコンが見当たらないのですが、どこにありますでしょうか？',
      isRead: true,
      createdAt: Timestamp.fromDate(new Date(today.getTime() - 12 * 60 * 60 * 1000))
    })

    await db.collection('guestMessages').add({
      bookingId: booking3Ref.id,
      senderId: 'admin',
      senderType: 'admin',
      senderName: '管理者',
      message: 'ご不便をおかけして申し訳ございません。リモコンはテレビ台の引き出しの中にございます。ご確認いただけますでしょうか。',
      isRead: true,
      createdAt: Timestamp.fromDate(new Date(today.getTime() - 11.5 * 60 * 60 * 1000))
    })

    await db.collection('guestMessages').add({
      bookingId: booking3Ref.id,
      senderId: guestUser3.uid,
      senderType: 'guest',
      senderName: '山田次郎',
      message: '見つかりました！ありがとうございます。快適に過ごさせていただいています。',
      isRead: true,
      createdAt: Timestamp.fromDate(new Date(today.getTime() - 11 * 60 * 60 * 1000))
    })

    console.log('  ✓ 田中太郎さんとのメッセージ（3件）')
    console.log('  ✓ 山田次郎さんとのメッセージ（3件）')

    // 5. サポートタスクを作成
    console.log('\n🔧 サポートタスクを作成中...')

    await db.collection('supportTasks').add({
      bookingId: booking1Ref.id,
      title: 'チェックイン前清掃',
      description: '本日チェックイン予定の田中様のお部屋の清掃をお願いします。ベビーベッドの設置もお願いします。',
      type: 'cleaning',
      status: 'completed',
      priority: 'high',
      scheduledDate: Timestamp.fromDate(new Date(today.getTime() - 3 * 60 * 60 * 1000)),
      supporterId: supporter1Ref.id,
      supporterName: '佐藤美咲',
      createdAt: Timestamp.fromDate(new Date(today.getTime() - 24 * 60 * 60 * 1000)),
      completedAt: Timestamp.fromDate(new Date(today.getTime() - 2 * 60 * 60 * 1000))
    })

    await db.collection('supportTasks').add({
      bookingId: booking3Ref.id,
      title: 'チェックアウト後清掃',
      description: '明日チェックアウト予定の山田様のお部屋の清掃。次の予約が2日後なので余裕があります。',
      type: 'cleaning',
      status: 'pending',
      priority: 'medium',
      scheduledDate: Timestamp.fromDate(new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000)),
      supporterId: supporter1Ref.id,
      supporterName: '佐藤美咲',
      createdAt: Timestamp.now()
    })

    await db.collection('supportTasks').add({
      bookingId: booking2Ref.id,
      title: '設備点検',
      description: '来週チェックイン予定のお部屋の設備点検。エアコン、給湯器、Wi-Fiの動作確認をお願いします。',
      type: 'maintenance',
      status: 'in_progress',
      priority: 'medium',
      scheduledDate: Timestamp.fromDate(new Date(nextWeek.getTime() - 24 * 60 * 60 * 1000)),
      supporterId: supporter2Ref.id,
      supporterName: '伊藤健一',
      createdAt: Timestamp.now()
    })

    console.log('  ✓ チェックイン前清掃（完了）')
    console.log('  ✓ チェックアウト後清掃（保留中）')
    console.log('  ✓ 設備点検（進行中）')

    // 6. クーポンを作成
    console.log('\n🎫 クーポンを作成中...')

    await db.collection('coupons').add({
      code: 'WELCOME2025',
      name: '新規ユーザー歓迎クーポン',
      description: '初めてのご利用で5,000円割引',
      discountType: 'fixed',
      discountValue: 5000,
      minPurchaseAmount: 30000,
      maxUses: 100,
      usedCount: 23,
      isActive: true,
      startDate: Timestamp.fromDate(new Date('2025-01-01')),
      endDate: Timestamp.fromDate(new Date('2025-12-31')),
      createdAt: Timestamp.now()
    })

    await db.collection('coupons').add({
      code: 'SUMMER20',
      name: '夏季限定20%オフ',
      description: '夏季限定で全予約20%オフ',
      discountType: 'percentage',
      discountValue: 20,
      minPurchaseAmount: 0,
      maxUses: 50,
      usedCount: 15,
      isActive: true,
      startDate: Timestamp.fromDate(new Date('2025-06-01')),
      endDate: Timestamp.fromDate(new Date('2025-08-31')),
      createdAt: Timestamp.now()
    })

    await db.collection('coupons').add({
      code: 'LONGSTAY',
      name: '長期滞在割引',
      description: '7泊以上で10,000円割引',
      discountType: 'fixed',
      discountValue: 10000,
      minPurchaseAmount: 100000,
      maxUses: 20,
      usedCount: 3,
      isActive: true,
      startDate: Timestamp.fromDate(new Date('2025-01-01')),
      endDate: Timestamp.fromDate(new Date('2025-12-31')),
      createdAt: Timestamp.now()
    })

    await db.collection('coupons').add({
      code: 'EXPIRED2024',
      name: '期限切れクーポン（テスト用）',
      description: '期限切れクーポンのサンプル',
      discountType: 'percentage',
      discountValue: 30,
      minPurchaseAmount: 0,
      maxUses: 100,
      usedCount: 100,
      isActive: false,
      startDate: Timestamp.fromDate(new Date('2024-01-01')),
      endDate: Timestamp.fromDate(new Date('2024-12-31')),
      createdAt: Timestamp.fromDate(new Date('2024-01-01'))
    })

    console.log('  ✓ WELCOME2025（新規ユーザー歓迎）')
    console.log('  ✓ SUMMER20（夏季限定20%オフ）')
    console.log('  ✓ LONGSTAY（長期滞在割引）')
    console.log('  ✓ EXPIRED2024（期限切れ・テスト用）')

    console.log('\n✅ サンプルデータの投入が完了しました！')
    console.log('\n📝 作成されたアカウント情報:')
    console.log('  ゲスト1: tanaka@example.com / password123')
    console.log('  ゲスト2: suzuki@example.com / password123')
    console.log('  ゲスト3: yamada@example.com / password123')
    console.log('\n💡 管理画面で各機能を確認できます: http://localhost:3000/admin')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    throw error
  }
}

// スクリプト実行
seedSampleData()
  .then(() => {
    console.log('\n🎉 完了！')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 失敗:', error)
    process.exit(1)
  })
