const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// .envファイルを読み込む
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const serviceAccount = JSON.parse(Buffer.from(envVars.FIREBASE_ADMIN_KEY, 'base64').toString());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'furniture-house-1'
});

const db = admin.firestore();

// ランダムな予約番号を生成
function generateBookingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'FH-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ランダムなトークンを生成
function generateToken() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function createTestBookings() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const testBookings = [
    // 本日チェックインの予約
    {
      bookingReference: generateBookingReference(),
      bookingToken: generateToken(),
      guestName: '田中太郎',
      guestEmail: 'tanaka@example.com',
      guestPhone: '090-1234-5678',
      guestCount: 4,
      startDate: admin.firestore.Timestamp.fromDate(today),
      endDate: admin.firestore.Timestamp.fromDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)),
      nights: 2,
      type: 'stay',
      status: 'confirmed',
      paymentStatus: 'paid',
      totalAmount: 45000,
      baseAmount: 40000,
      guestFee: 5000,
      stripePaymentIntentId: 'pi_test_' + generateToken().substring(0, 16),
      specialRequests: '静かな部屋を希望します',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.now()
    },
    // 本日チェックアウトの予約
    {
      bookingReference: generateBookingReference(),
      bookingToken: generateToken(),
      guestName: '佐藤花子',
      guestEmail: 'sato@example.com',
      guestPhone: '080-9876-5432',
      guestCount: 2,
      startDate: admin.firestore.Timestamp.fromDate(new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)),
      endDate: admin.firestore.Timestamp.fromDate(today),
      nights: 1,
      type: 'stay',
      status: 'confirmed',
      paymentStatus: 'paid',
      totalAmount: 25000,
      baseAmount: 22000,
      guestFee: 3000,
      stripePaymentIntentId: 'pi_test_' + generateToken().substring(0, 16),
      specialRequests: '',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.now()
    },
    // 保留中（審査待ち）の予約
    {
      bookingReference: generateBookingReference(),
      bookingToken: generateToken(),
      guestName: '鈴木一郎',
      guestEmail: 'suzuki@example.com',
      guestPhone: '070-1111-2222',
      guestCount: 6,
      startDate: admin.firestore.Timestamp.fromDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
      endDate: admin.firestore.Timestamp.fromDate(new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000)),
      nights: 2,
      type: 'stay',
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount: 60000,
      baseAmount: 52000,
      guestFee: 8000,
      stripePaymentIntentId: 'pi_test_' + generateToken().substring(0, 16),
      specialRequests: '大人4名、子供2名です',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.now()
    },
    // 来週の確定済み予約
    {
      bookingReference: generateBookingReference(),
      bookingToken: generateToken(),
      guestName: '山田次郎',
      guestEmail: 'yamada@example.com',
      guestPhone: '090-3333-4444',
      guestCount: 3,
      startDate: admin.firestore.Timestamp.fromDate(new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)),
      endDate: admin.firestore.Timestamp.fromDate(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)),
      nights: 2,
      type: 'stay',
      status: 'confirmed',
      paymentStatus: 'paid',
      totalAmount: 50000,
      baseAmount: 44000,
      guestFee: 6000,
      stripePaymentIntentId: 'pi_test_' + generateToken().substring(0, 16),
      specialRequests: '',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.now()
    },
    // ワークショップ予約
    {
      bookingReference: generateBookingReference(),
      bookingToken: generateToken(),
      guestName: '高橋美咲',
      guestEmail: 'takahashi@example.com',
      guestPhone: '080-5555-6666',
      guestCount: 8,
      startDate: admin.firestore.Timestamp.fromDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
      endDate: admin.firestore.Timestamp.fromDate(new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)),
      nights: 0,
      type: 'workshop',
      status: 'confirmed',
      paymentStatus: 'paid',
      totalAmount: 30000,
      baseAmount: 30000,
      guestFee: 0,
      stripePaymentIntentId: 'pi_test_' + generateToken().substring(0, 16),
      specialRequests: '建築ワークショップの開催です',
      createdAt: admin.firestore.Timestamp.fromDate(new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000)),
      updatedAt: admin.firestore.Timestamp.now()
    }
  ];

  console.log('テスト予約データを作成中...');

  for (const booking of testBookings) {
    const docRef = await db.collection('bookings').add(booking);
    console.log(`予約作成: ${booking.guestName} (${booking.bookingReference}) - ID: ${docRef.id}`);
  }

  console.log('\n✅ テスト予約データの作成が完了しました！');
  console.log(`合計: ${testBookings.length}件の予約を作成`);

  process.exit(0);
}

createTestBookings().catch(err => {
  console.error('エラー:', err.message);
  process.exit(1);
});
