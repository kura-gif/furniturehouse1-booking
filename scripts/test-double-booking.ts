/**
 * ダブルブッキング防止の直接テスト（E2Eテストと同じフロー）
 */
import Stripe from 'stripe'
import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import dotenv from 'dotenv'

dotenv.config()

// Firebase初期化
if (getApps().length === 0) {
  let keyJson = process.env.FIREBASE_ADMIN_KEY!
  try {
    JSON.parse(keyJson)
  } catch {
    keyJson = Buffer.from(keyJson, 'base64').toString('utf-8')
  }
  const serviceAccount = JSON.parse(keyJson) as ServiceAccount
  initializeApp({
    credential: cert(serviceAccount)
  })
}
const db = getFirestore()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET!

const BASE_URL = 'https://staging.furniturehouse1.com'

async function testDoubleBookingE2EFlow() {
  // 600日後の日付（既存テストデータと衝突しない）
  const checkIn = new Date()
  checkIn.setDate(checkIn.getDate() + 600)
  const checkOut = new Date(checkIn)
  checkOut.setDate(checkOut.getDate() + 2)

  const checkInStr = checkIn.toISOString().split('T')[0]
  const checkOutStr = checkOut.toISOString().split('T')[0]

  console.log('テスト日程:', checkInStr, '-', checkOutStr)

  let bookingId1: string | null = null
  let bookingId2: string | null = null

  try {
    // === E2Eテストと同じフロー ===

    // 1. Payment Intent作成
    console.log('1. Payment Intent作成中...')
    const piResponse = await fetch(`${BASE_URL}/api/stripe/create-payment-intent-secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-bypass-rate-limit': INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        checkInDate: checkInStr,
        checkOutDate: checkOutStr,
        guestCount: 2,
        calculatedTotalAmount: 55550,
      })
    })
    const piResult = await piResponse.json() as { paymentIntentId: string; clientSecret: string }
    console.log('   Payment Intent:', piResult.paymentIntentId)

    // 2. 最初の予約を作成
    console.log('2. 最初の予約を作成中...')
    const response1 = await fetch(`${BASE_URL}/api/bookings/create-secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-bypass-rate-limit': INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        checkInDate: checkInStr,
        checkOutDate: checkOutStr,
        guestName: 'ダブルブッキングテスト1',
        guestEmail: 'e2e-flow-test1@example.com',
        guestPhone: '090-1111-2222',
        guestCount: 2,
        notes: 'E2Eフロー再現テスト1'
      })
    })

    const result1 = await response1.json() as { bookingId?: string; message?: string }
    if (!response1.ok) {
      console.log('❌ 最初の予約失敗:', result1.message)
      return
    }
    bookingId1 = result1.bookingId || null
    console.log('   ✅ 最初の予約成功:', bookingId1)

    // 3. 決済確認
    console.log('3. 決済確認中...')
    await stripe.paymentIntents.confirm(piResult.paymentIntentId, {
      payment_method: 'pm_card_visa',
      return_url: `${BASE_URL}/booking/complete`,
    })
    console.log('   決済確認完了')

    // 4. 予約にPayment Intent IDを更新
    console.log('4. 予約更新中...')
    await db.collection('bookings').doc(bookingId1!).update({
      stripePaymentIntentId: piResult.paymentIntentId,
      reviewStatus: 'pending_review',
      updatedAt: FieldValue.serverTimestamp(),
    })
    console.log('   予約更新完了')

    // 5. 予約のステータスを確認
    const booking1Doc = await db.collection('bookings').doc(bookingId1!).get()
    const booking1Data = booking1Doc.data()
    console.log('   最初の予約ステータス:', booking1Data?.status, '/ reviewStatus:', booking1Data?.reviewStatus)

    // 6. 3秒待機
    console.log('5. 3秒待機中...')
    await new Promise(r => setTimeout(r, 3000))

    // 7. 同じ日程で2つ目の予約を試行
    console.log('6. 同じ日程で2つ目の予約を試行中...')
    const response2 = await fetch(`${BASE_URL}/api/bookings/create-secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-bypass-rate-limit': INTERNAL_API_SECRET,
      },
      body: JSON.stringify({
        checkInDate: checkInStr,
        checkOutDate: checkOutStr,
        guestName: 'ダブルブッキングテスト2',
        guestEmail: 'e2e-flow-test2@example.com',
        guestPhone: '090-3333-4444',
        guestCount: 2,
        notes: 'E2Eフロー再現テスト2'
      })
    })

    const result2 = await response2.json() as { bookingId?: string; message?: string }

    if (response2.ok) {
      bookingId2 = result2.bookingId || null
      console.log('❌ ダブルブッキングが成功してしまいました:', result2.bookingId)
    } else {
      if (result2.message?.includes('既に予約されています')) {
        console.log('✅ ダブルブッキング防止成功:', result2.message)
      } else {
        console.log('❌ 予期しないエラー:', response2.status, result2.message)
      }
    }

  } finally {
    // クリーンアップ
    if (bookingId1) {
      await db.collection('bookings').doc(bookingId1).delete()
      console.log('クリーンアップ完了: booking1')
    }
    if (bookingId2) {
      await db.collection('bookings').doc(bookingId2).delete()
      console.log('クリーンアップ完了: booking2')
    }
  }
}

testDoubleBookingE2EFlow().catch(console.error)
