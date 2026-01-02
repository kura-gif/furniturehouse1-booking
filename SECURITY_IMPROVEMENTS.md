# セキュリティ改善提案

本番環境リリース前に実装すべきセキュリティ強化項目

---

## 1. 同時予約防止（Critical - 最優先）

### 現状の問題
現在のシステムでは、複数のユーザーが同時に同じ日程で予約を試みた場合、重複予約が発生する可能性があります。

### 解決策: Firestoreトランザクションの実装

```typescript
// server/api/bookings/create-with-lock.post.ts
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore'
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const db = getFirestore()
  const body = await readBody(event)

  const {
    checkInDate,
    checkOutDate,
    guestName,
    guestEmail,
    guestPhone,
    guestCount,
    totalAmount,
    paymentIntentId,
  } = body

  try {
    // トランザクションで予約を作成
    const bookingId = await db.runTransaction(async (transaction) => {
      // 1. 同じ期間の予約を検索
      const startDate = Timestamp.fromDate(new Date(checkInDate))
      const endDate = Timestamp.fromDate(new Date(checkOutDate))

      const conflictingBookings = await transaction.get(
        db.collection('bookings')
          .where('status', 'in', ['pending', 'confirmed'])
          .where('checkInDate', '<', endDate)
          .where('checkOutDate', '>', startDate)
      )

      // 2. 重複があればエラー
      if (!conflictingBookings.empty) {
        throw new Error('この期間は既に予約されています。別の日程をお選びください。')
      }

      // 3. 予約を作成
      const bookingRef = db.collection('bookings').doc()
      const bookingData = {
        checkInDate: startDate,
        checkOutDate: endDate,
        guestName,
        guestEmail,
        guestPhone,
        guestCount,
        totalAmount,
        paymentIntentId,
        status: 'pending',
        bookingReference: generateBookingReference(),
        bookingToken: generateSecureToken(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      transaction.set(bookingRef, bookingData)
      return bookingRef.id
    })

    return { success: true, bookingId }
  } catch (error: any) {
    throw createError({
      statusCode: 409,
      message: error.message || '予約の作成に失敗しました',
    })
  }
})

// ユニークな予約番号を生成
function generateBookingReference(): string {
  const prefix = 'FH1'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// セキュアなトークンを生成
function generateSecureToken(): string {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}
```

---

## 2. 金額検証（Critical - 最優先）

### 現状の問題
クライアントから送信された金額をそのまま信頼しているため、改ざんのリスクがあります。

### 解決策: サーバーサイドでの金額再計算

```typescript
// server/utils/pricing.ts
export interface PricingRule {
  basePrice: number
  weekendSurcharge: number
  extraGuestCharge: number
  maxIncludedGuests: number
  cleaningFee: number
}

export const calculateBookingAmount = (
  checkInDate: Date,
  checkOutDate: Date,
  guestCount: number,
  pricingRule: PricingRule,
  couponDiscount: number = 0
): number => {
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))

  if (nights < 1) {
    throw new Error('チェックアウト日はチェックイン日より後でなければなりません')
  }

  let totalAmount = 0

  // 宿泊料金を日ごとに計算
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkInDate)
    currentDate.setDate(currentDate.getDate() + i)
    const dayOfWeek = currentDate.getDay()

    // 金曜・土曜は週末料金
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6
    const nightPrice = pricingRule.basePrice + (isWeekend ? pricingRule.weekendSurcharge : 0)

    totalAmount += nightPrice
  }

  // 追加ゲスト料金
  if (guestCount > pricingRule.maxIncludedGuests) {
    const extraGuests = guestCount - pricingRule.maxIncludedGuests
    totalAmount += extraGuests * pricingRule.extraGuestCharge
  }

  // クリーニング料金
  totalAmount += pricingRule.cleaningFee

  // クーポン割引
  totalAmount -= couponDiscount

  return Math.max(totalAmount, 0) // 負の金額を防ぐ
}
```

```typescript
// server/api/stripe/create-payment-intent.post.ts を更新
import { getFirestore } from 'firebase-admin/firestore'
import Stripe from 'stripe'
import { calculateBookingAmount } from '~/server/utils/pricing'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2024-12-18.acacia' })
  const db = getFirestore()

  const { checkInDate, checkOutDate, guestCount, couponCode } = await readBody(event)

  // 1. 料金設定を取得
  const pricingDoc = await db.collection('pricing').doc('default').get()
  if (!pricingDoc.exists) {
    throw createError({ statusCode: 500, message: '料金設定が見つかりません' })
  }
  const pricingRule = pricingDoc.data() as PricingRule

  // 2. クーポン割引を計算
  let couponDiscount = 0
  if (couponCode) {
    const couponDoc = await db.collection('coupons')
      .where('code', '==', couponCode)
      .where('isActive', '==', true)
      .limit(1)
      .get()

    if (!couponDoc.empty) {
      const coupon = couponDoc.docs[0].data()
      // クーポン有効期限チェック
      if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
        throw createError({ statusCode: 400, message: 'クーポンの有効期限が切れています' })
      }
      couponDiscount = coupon.discountAmount || 0
    }
  }

  // 3. サーバーサイドで金額を計算
  const calculatedAmount = calculateBookingAmount(
    new Date(checkInDate),
    new Date(checkOutDate),
    guestCount,
    pricingRule,
    couponDiscount
  )

  // 4. Payment Intentを作成
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculatedAmount,
    currency: 'jpy',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      checkInDate,
      checkOutDate,
      guestCount: guestCount.toString(),
      calculatedAmount: calculatedAmount.toString(),
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
    amount: calculatedAmount, // クライアントに正しい金額を返す
  }
})
```

---

## 3. Stripe Webhook実装（Critical）

### 現状の問題
Webhookが未実装のため、決済の非同期イベント（成功、失敗、返金）を検知できません。

### 解決策: Webhookエンドポイントの作成

```typescript
// server/api/stripe/webhook.post.ts
import Stripe from 'stripe'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, { apiVersion: '2024-12-18.acacia' })
  const db = getFirestore()

  // 1. Webhook署名を検証
  const sig = getHeader(event, 'stripe-signature')
  const body = await readRawBody(event)

  if (!sig || !body) {
    throw createError({ statusCode: 400, message: 'Invalid request' })
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      sig,
      config.stripeWebhookSecret
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    throw createError({ statusCode: 400, message: `Webhook Error: ${err.message}` })
  }

  // 2. イベントタイプに応じて処理
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(stripeEvent.data.object as Stripe.PaymentIntent, db)
      break

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent, db)
      break

    case 'charge.refunded':
      await handleRefund(stripeEvent.data.object as Stripe.Charge, db)
      break

    default:
      console.log(`Unhandled event type: ${stripeEvent.type}`)
  }

  return { received: true }
})

// 決済成功時の処理
async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, db: FirebaseFirestore.Firestore) {
  const bookingQuery = await db.collection('bookings')
    .where('paymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (!bookingQuery.empty) {
    const bookingDoc = bookingQuery.docs[0]
    await bookingDoc.ref.update({
      status: 'confirmed',
      paymentStatus: 'paid',
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // 確認メールを送信（別途実装）
    // await sendBookingConfirmationEmail(bookingDoc.data())
  }
}

// 決済失敗時の処理
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, db: FirebaseFirestore.Firestore) {
  const bookingQuery = await db.collection('bookings')
    .where('paymentIntentId', '==', paymentIntent.id)
    .limit(1)
    .get()

  if (!bookingQuery.empty) {
    const bookingDoc = bookingQuery.docs[0]
    await bookingDoc.ref.update({
      status: 'payment_failed',
      paymentStatus: 'failed',
      paymentError: paymentIntent.last_payment_error?.message || 'Unknown error',
      updatedAt: FieldValue.serverTimestamp(),
    })

    // エラーメールを送信（別途実装）
    // await sendPaymentFailedEmail(bookingDoc.data())
  }
}

// 返金処理
async function handleRefund(charge: Stripe.Charge, db: FirebaseFirestore.Firestore) {
  const paymentIntentId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent?.id

  if (!paymentIntentId) return

  const bookingQuery = await db.collection('bookings')
    .where('paymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get()

  if (!bookingQuery.empty) {
    const bookingDoc = bookingQuery.docs[0]
    await bookingDoc.ref.update({
      status: 'refunded',
      paymentStatus: 'refunded',
      refundedAt: FieldValue.serverTimestamp(),
      refundAmount: charge.amount_refunded,
      updatedAt: FieldValue.serverTimestamp(),
    })

    // 返金完了メールを送信（別途実装）
    // await sendRefundConfirmationEmail(bookingDoc.data())
  }
}
```

---

## 4. レート制限（Rate Limiting）

### 現状の問題
APIエンドポイントに対する過度なリクエストを制限できていません。

### 解決策: ミドルウェアでレート制限を実装

```typescript
// server/middleware/rate-limit.ts
import { defineEventHandler } from 'h3'

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

const rateLimitStore: RateLimitStore = {}

export default defineEventHandler((event) => {
  const url = event.node.req.url || ''

  // 特定のAPIエンドポイントのみレート制限
  if (!url.startsWith('/api/stripe') && !url.startsWith('/api/bookings')) {
    return
  }

  const clientIP = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const key = `${clientIP}:${url}`
  const now = Date.now()
  const limit = 10 // 10リクエスト/分
  const windowMs = 60 * 1000 // 1分

  // 古いエントリをクリーンアップ
  if (rateLimitStore[key] && rateLimitStore[key].resetAt < now) {
    delete rateLimitStore[key]
  }

  // レート制限チェック
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetAt: now + windowMs,
    }
  } else {
    rateLimitStore[key].count++

    if (rateLimitStore[key].count > limit) {
      throw createError({
        statusCode: 429,
        message: 'リクエストが多すぎます。しばらくしてから再度お試しください。',
      })
    }
  }
})

function getRequestIP(event: any, options: { xForwardedFor: boolean }): string | undefined {
  if (options.xForwardedFor) {
    const forwarded = getHeader(event, 'x-forwarded-for')
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
  }
  return event.node.req.socket.remoteAddress
}
```

---

## 5. 入力検証とサニタイゼーション

### 解決策: Zodによる型安全なバリデーション

```bash
npm install zod
```

```typescript
// server/utils/validation.ts
import { z } from 'zod'

// 予約データのスキーマ
export const bookingSchema = z.object({
  checkInDate: z.string().refine((date) => {
    const checkIn = new Date(date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return checkIn >= tomorrow
  }, 'チェックイン日は明日以降を選択してください'),

  checkOutDate: z.string(),

  guestCount: z.number().min(1, 'ゲスト数は1名以上です').max(10, 'ゲスト数は最大10名です'),

  guestName: z.string().min(1, '名前を入力してください').max(100, '名前は100文字以内です'),

  guestEmail: z.string().email('有効なメールアドレスを入力してください'),

  guestPhone: z.string().regex(
    /^0\d{1,4}-?\d{1,4}-?\d{4}$/,
    '有効な電話番号を入力してください（例: 090-1234-5678）'
  ),

  notes: z.string().max(500, '備考は500文字以内です').optional(),

  couponCode: z.string().max(20).optional(),
}).refine((data) => {
  const checkIn = new Date(data.checkInDate)
  const checkOut = new Date(data.checkOutDate)
  return checkOut > checkIn
}, {
  message: 'チェックアウト日はチェックイン日より後でなければなりません',
  path: ['checkOutDate'],
})

// バリデーション実行ヘルパー
export const validateBookingData = (data: unknown) => {
  try {
    return bookingSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => err.message).join(', ')
      throw createError({
        statusCode: 400,
        message: messages,
      })
    }
    throw error
  }
}
```

```typescript
// server/api/bookings/create.post.ts で使用
import { validateBookingData } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event)

  // バリデーション
  const validatedData = validateBookingData(rawBody)

  // 処理続行...
})
```

---

## 6. XSS対策

### 解決策: サニタイゼーション

```bash
npm install dompurify isomorphic-dompurify
```

```typescript
// composables/useSanitize.ts
import DOMPurify from 'isomorphic-dompurify'

export const useSanitize = () => {
  const sanitizeHtml = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
      ALLOWED_ATTR: [],
    })
  }

  const sanitizeText = (text: string): string => {
    return text.replace(/[<>\"']/g, (char) => {
      const escapeMap: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      }
      return escapeMap[char] || char
    })
  }

  return {
    sanitizeHtml,
    sanitizeText,
  }
}
```

---

## 7. CORS設定

### 解決策: 本番ドメインのみ許可

```typescript
// server/middleware/cors.ts
export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const allowedOrigins = [
    config.public.siteUrl,
    'https://furniturehouse1.com',
    'https://www.furniturehouse1.com',
  ]

  const origin = getHeader(event, 'origin')

  if (origin && allowedOrigins.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')
  }

  // OPTIONSリクエストへの対応
  if (event.node.req.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
  }
})
```

---

## 8. セキュリティヘッダー

### 解決策: セキュリティヘッダーの追加

```typescript
// server/middleware/security-headers.ts
export default defineEventHandler((event) => {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }

  Object.entries(headers).forEach(([key, value]) => {
    setHeader(event, key, value)
  })
})
```

---

## 9. 環境変数の検証

### 解決策: 起動時に必須変数をチェック

```typescript
// server/utils/env-validation.ts
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_WEBHOOK_SECRET',
]

export const validateEnvironmentVariables = () => {
  const config = useRuntimeConfig()
  const missing: string[] = []

  requiredEnvVars.forEach((varName) => {
    const value = config[varName] || config.public[varName]
    if (!value || value === '') {
      missing.push(varName)
    }
  })

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  console.log('✅ All required environment variables are set')
}
```

```typescript
// server/plugins/init.ts
export default defineNitroPlugin((nitroApp) => {
  validateEnvironmentVariables()
})
```

---

## 実装優先順位

### Phase 1: 即座に実装（Critical）
1. ✅ 同時予約防止（トランザクション）
2. ✅ 金額検証（サーバーサイド計算）
3. ✅ Stripe Webhook実装

### Phase 2: 本番前に実装（High）
4. ✅ レート制限
5. ✅ 入力検証（Zod）
6. ✅ CORS設定

### Phase 3: 推奨実装（Medium）
7. ✅ XSS対策（サニタイゼーション）
8. ✅ セキュリティヘッダー
9. ✅ 環境変数検証

---

これらの実装により、セキュアで安定した本番環境を構築できます。
