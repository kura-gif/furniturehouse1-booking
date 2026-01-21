# 本番環境リリース完全ガイド
## 宿泊施設予約システム運営開始チェックリスト

最終更新: 2026年1月19日

---

## 📋 目次

1. [セキュリティ監査](#1-セキュリティ監査)
2. [Firebase本番環境設定](#2-firebase本番環境設定)
3. [Stripe本番決済設定](#3-stripe本番決済設定)
4. [環境変数とシークレット管理](#4-環境変数とシークレット管理)
5. [データベーステスト](#5-データベーステスト)
6. [決済フローテスト](#6-決済フローテスト)
7. [メール送信機能テスト](#7-メール送信機能テスト)
8. [パフォーマンスとコスト最適化](#8-パフォーマンスとコスト最適化)
9. [バグ防止とエラーハンドリング](#9-バグ防止とエラーハンドリング)
10. [監視とロギング](#10-監視とロギング)
11. [バックアップとリカバリー](#11-バックアップとリカバリー)
12. [ユーザーエクスペリエンス最終確認](#12-ユーザーエクスペリエンス最終確認)
13. [管理者・サポーター向け運用マニュアル](#13-管理者サポーター向け運用マニュアル)
14. [本番デプロイ手順](#14-本番デプロイ手順)
15. [運営開始後のモニタリング](#15-運営開始後のモニタリング)

---

## 1. セキュリティ監査

### 🔒 Firestoreセキュリティルール

#### チェック項目
- [ ] 匿名ユーザーが他人の予約を読み取れないことを確認
- [ ] ユーザーが自分の予約のみ読み取り・キャンセル可能であることを確認
- [ ] 管理者権限が正しく機能することを確認
- [ ] サポーターが割り当てられたタスクのみアクセス可能であることを確認
- [ ] クーポン・料金設定の読み取り権限が適切であることを確認

#### テスト方法
```bash
# Firebase Emulatorを使用してルールテスト
npm install -g firebase-tools
firebase emulators:start --only firestore

# または、Firebaseコンソールで「ルールのプレイグラウンド」を使用
```

#### 現在のルールの問題点チェック
```javascript
// 以下のケースをテスト:
// 1. 認証なしユーザーが予約を作成できるか（OK）
// 2. 認証なしユーザーが他人の予約を読めないか（NG）
// 3. 認証済みユーザーが自分の予約のみ読めるか（OK）
// 4. サポーターが他のサポーターのタスクを読めないか（NG）
```

### 🔒 API エンドポイントのセキュリティ

#### チェック項目
- [ ] 全ての決済APIがサーバーサイドで金額検証を実施
- [ ] クライアントから送信された金額を信頼しない
- [ ] Payment Intentのメタデータに改ざん対策を実装
- [ ] レート制限（Rate Limiting）の実装
- [ ] CORS設定が適切（本番ドメインのみ許可）

#### 実装推奨事項
```typescript
// server/api/stripe/create-payment-intent.post.ts
// 金額の検証ロジックを追加
const calculatedAmount = calculateBookingAmount(checkIn, checkOut, guestCount)
if (Math.abs(amount - calculatedAmount) > 1) {
  throw new Error('金額の検証エラー')
}
```

### 🔒 環境変数の漏洩チェック

#### チェック項目
- [ ] `.env`ファイルが`.gitignore`に含まれている
- [ ] クライアントサイドでシークレットキーを使用していない
- [ ] `nuxt.config.ts`の`runtimeConfig`が正しく設定されている
- [ ] GitHubなど公開リポジトリにシークレットがコミットされていない

#### 確認コマンド
```bash
# 履歴から機密情報を検索
git log --all --full-history --source -- **/.env
git log -p | grep -i "stripe_secret_key\|firebase.*private"

# もし見つかった場合は、Git履歴から削除が必要
```

### 🔒 XSS・インジェクション対策

#### チェック項目
- [ ] ユーザー入力が適切にサニタイズされている
- [ ] `v-html`の使用を避ける（またはサニタイズ済みHTMLのみ）
- [ ] URLパラメータの検証
- [ ] メール送信時のHTMLエスケープ

---

## 2. Firebase本番環境設定

### 🔥 プロジェクト構成の推奨

#### 環境分離
```
推奨構成:
- furniturehouse1-dev（開発環境）
- furniturehouse1-staging（ステージング環境）
- furniturehouse1-prod（本番環境）

または最低限:
- furniturehouse1-dev（開発/テスト）
- furniturehouse1-prod（本番）
```

#### セットアップ手順
```bash
# Firebase CLIでプロジェクト切り替え
firebase use --add
# → プロジェクトIDを選択: furniturehouse1-prod
# → エイリアスを入力: production

# 本番環境へのデプロイ
firebase use production
firebase deploy --only firestore:rules
```

### 🔥 Firestore インデックス設定

#### 必要なインデックス
```bash
# Firebaseコンソール → Firestore → インデックス
# 以下の複合インデックスを作成:

1. bookings コレクション
   - status (昇順) + checkInDate (昇順)
   - userId (昇順) + checkInDate (降順)
   - checkInDate (昇順) + checkOutDate (昇順)

2. supportTasks コレクション
   - supporterId (昇順) + scheduledDate (昇順)
   - bookingId (昇順) + taskType (昇順)
```

#### 自動生成を待つ
```bash
# アプリを実際に使用するとFirebaseが自動的にインデックスエラーを検出
# エラーメッセージ内のリンクをクリックして自動作成可能
```

### 🔥 Firebase Authentication設定

#### チェック項目
- [ ] メール/パスワード認証が有効化されている
- [ ] メール確認が必須になっている（オプション）
- [ ] パスワードリセット機能が動作する
- [ ] 承認済みドメインに本番URLが追加されている
  - `booking.furniturehouse1.com`
  - `furniturehouse1.com`（リダイレクト用）

#### 設定方法
```
Firebaseコンソール:
→ Authentication
→ Settings
→ Authorized domains
→ 「ドメインを追加」
```

### 🔥 Firebase予算アラート設定

#### コスト管理
```bash
# Firebaseコンソール → プロジェクト設定 → 使用量と請求

1. 予算アラートを設定:
   - 月額予算: ¥5,000
   - アラート閾値: 50%, 90%, 100%
   - 通知先メール: 管理者メール

2. 使用量上限を設定（オプション）:
   - Firestore読み取り: 100,000/日
   - Firestore書き込み: 50,000/日
```

---

## 3. Stripe本番決済設定

### 💳 Stripeアカウント本番モード化

#### 事前準備（ビジネス情報登録）
- [ ] 事業者情報の登録完了
- [ ] 銀行口座情報の登録完了
- [ ] 本人確認書類の提出完了
- [ ] 税務情報の登録完了

#### 本番APIキーの取得
```bash
1. Stripeダッシュボード → 右上の「テストモード」をOFF
2. 開発者 → APIキー → 本番用キーをコピー
   - pk_live_xxxxx（公開可能キー）
   - sk_live_xxxxx（シークレットキー）

⚠️ 絶対にシークレットキーを公開しない
⚠️ GitHubにコミットしない
```

### 💳 Webhook設定（重要）

#### エンドポイント登録
```bash
Stripeダッシュボード:
→ 開発者
→ Webhook
→ エンドポイントを追加

URL: https://booking.furniturehouse1.com/api/stripe/webhook
説明: 本番環境決済Webhook

選択するイベント:
- payment_intent.succeeded（決済成功）
- payment_intent.payment_failed（決済失敗）
- charge.refunded（返金処理）
- payment_intent.canceled（決済キャンセル）

→ 署名シークレットをコピー: whsec_xxxxx
```

#### Webhookハンドラーの実装（要追加）
```typescript
// server/api/stripe/webhook.post.ts を作成する必要あり
export default defineEventHandler(async (event) => {
  const stripe = useStripe()
  const sig = getHeader(event, 'stripe-signature')
  const body = await readRawBody(event)
  const endpointSecret = useRuntimeConfig().stripeWebhookSecret

  try {
    const stripeEvent = stripe.webhooks.constructEvent(body, sig, endpointSecret)

    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        // 予約ステータスを'confirmed'に更新
        break
      case 'payment_intent.payment_failed':
        // 予約ステータスを'failed'に更新
        break
      // その他のイベント処理
    }

    return { received: true }
  } catch (err) {
    throw createError({ statusCode: 400, message: `Webhook Error: ${err.message}` })
  }
})
```

### 💳 決済テスト（本番モード）

#### テスト用カードの使用禁止
```bash
⚠️ 本番モードではテストカード（4242 4242...）は使用できません

少額テスト決済の実施:
1. 実際のクレジットカードで100円の予約を作成
2. 決済完了を確認
3. Stripeダッシュボードで決済履歴を確認
4. 返金処理をテスト（Stripeダッシュボードから手動返金）
5. Firebaseで予約ステータスが正しく更新されるか確認
```

### 💳 返金ポリシーの実装

#### 推奨設定
```typescript
// composables/useBookings.ts に追加
export const cancelBooking = async (bookingId: string) => {
  const booking = await getBooking(bookingId)
  const daysUntilCheckIn = differenceInDays(booking.checkInDate, new Date())

  // 返金ポリシー
  let refundAmount = 0
  if (daysUntilCheckIn >= 30) {
    refundAmount = booking.totalAmount // 全額返金
  } else if (daysUntilCheckIn >= 7) {
    refundAmount = booking.totalAmount * 0.5 // 50%返金
  } else {
    refundAmount = 0 // 返金なし
  }

  if (refundAmount > 0) {
    await stripe.refunds.create({
      payment_intent: booking.paymentIntentId,
      amount: refundAmount
    })
  }

  // 予約ステータスを更新
  await updateBooking(bookingId, { status: 'cancelled' })
}
```

---

## 4. 環境変数とシークレット管理

### 🔐 Vercel環境変数設定

#### 設定手順
```bash
Vercelダッシュボード:
→ プロジェクト（furniturehouse1-booking）
→ Settings
→ Environment Variables

以下を設定（Productionのみ）:
```

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `FIREBASE_API_KEY` | AIza... | Production |
| `FIREBASE_AUTH_DOMAIN` | furniturehouse1-prod.firebaseapp.com | Production |
| `FIREBASE_PROJECT_ID` | furniturehouse1-prod | Production |
| `FIREBASE_STORAGE_BUCKET` | furniturehouse1-prod.firebasestorage.app | Production |
| `FIREBASE_MESSAGING_SENDER_ID` | 123... | Production |
| `FIREBASE_APP_ID` | 1:123... | Production |
| `STRIPE_PUBLIC_KEY` | pk_live_... | Production |
| `STRIPE_SECRET_KEY` | sk_live_... | Production |
| `STRIPE_WEBHOOK_SECRET` | whsec_... | Production |
| `EMAIL_USER` | noreply@furniturehouse1.com | Production |
| `EMAIL_PASSWORD` | アプリパスワード | Production |
| `SITE_URL` | https://booking.furniturehouse1.com | Production |
| `BRAND_SITE_URL` | https://furniturehouse1.com | Production |

#### ローカル開発環境
```bash
# .env ファイル（開発用）
cp .env.example .env

# 開発環境用の値を設定（テストキーを使用）
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### 🔐 Firebase Admin SDK設定（サーバーサイド）

#### サービスアカウントキーの取得
```bash
1. Firebaseコンソール
2. プロジェクト設定 → サービスアカウント
3. 「新しい秘密鍵を生成」をクリック
4. JSONファイルをダウンロード

⚠️ このファイルは絶対にGitにコミットしない
⚠️ サーバー環境にのみ配置
```

#### Vercelでの設定方法
```bash
# JSONファイルの内容をBase64エンコード
cat firebase-admin-key.json | base64

# Vercel環境変数に追加
FIREBASE_ADMIN_KEY=<Base64エンコードされた内容>
```

#### サーバーコードでの使用
```typescript
// server/utils/firebase-admin.ts
import admin from 'firebase-admin'

let firebaseAdmin: admin.app.App

export const getFirebaseAdmin = () => {
  if (!firebaseAdmin) {
    const credential = JSON.parse(
      Buffer.from(process.env.FIREBASE_ADMIN_KEY || '', 'base64').toString()
    )

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(credential)
    })
  }
  return firebaseAdmin
}
```

---

## 5. データベーステスト

### 📊 Firestoreデータ整合性テスト

#### テストシナリオ
```bash
テスト1: 予約作成
- [ ] ゲスト情報付き予約が正しく作成される
- [ ] bookingReferenceがユニークである
- [ ] bookingTokenが生成される
- [ ] タイムスタンプが正しく記録される

テスト2: 予約読み取り
- [ ] 認証済みユーザーが自分の予約のみ読める
- [ ] 他人の予約を読めない
- [ ] 管理者が全予約を読める

テスト3: 予約更新
- [ ] ステータス変更（pending → confirmed → completed）
- [ ] キャンセル処理が正しく動作
- [ ] userId紐付け（ゲスト→登録ユーザー）

テスト4: 同時予約の防止
- [ ] 同じ日付の重複予約が作成できない
- [ ] トランザクション処理が正しく動作
```

#### 同時予約防止の実装（重要）
```typescript
// server/api/bookings/create.post.ts に追加
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  const db = getFirestore()
  const { checkInDate, checkOutDate } = await readBody(event)

  // トランザクションで重複チェック
  const result = await db.runTransaction(async (transaction) => {
    // 同じ期間の予約を検索
    const existingBookings = await transaction.get(
      db.collection('bookings')
        .where('status', 'in', ['pending', 'confirmed'])
        .where('checkInDate', '<', Timestamp.fromDate(new Date(checkOutDate)))
        .where('checkOutDate', '>', Timestamp.fromDate(new Date(checkInDate)))
    )

    if (!existingBookings.empty) {
      throw new Error('この期間は既に予約されています')
    }

    // 予約作成
    const bookingRef = db.collection('bookings').doc()
    transaction.set(bookingRef, {
      // 予約データ
    })

    return bookingRef.id
  })

  return { bookingId: result }
})
```

### 📊 データマイグレーション

#### 既存データの移行（必要な場合）
```bash
# 開発環境から本番環境へのデータコピー
firebase firestore:export gs://furniturehouse1-dev-backup
firebase firestore:import gs://furniturehouse1-dev-backup --project furniturehouse1-prod

⚠️ 本番環境への移行は慎重に
⚠️ テストデータを本番に移行しない
```

#### 初期データのセットアップ
```bash
# 料金設定の初期データ
npm run seed

# または手動でFirebaseコンソールから追加:
コレクション: pricing
ドキュメントID: default
フィールド:
  - basePrice: 18000
  - weekendSurcharge: 3000
  - maxGuests: 6
  - extraGuestCharge: 3000
  - cleaningFee: 5000
```

---

## 6. 決済フローテスト

### 💰 エンドツーエンドテスト

#### テストケース1: 通常の予約フロー
```bash
1. https://booking.furniturehouse1.com にアクセス
2. 日付を選択（2泊3日）
3. ゲスト人数を選択（2名）
4. 「予約リクエストへ」をクリック
5. ゲスト情報を入力
   - 名前: テスト太郎
   - メール: test@example.com
   - 電話: 090-1234-5678
6. カード情報を入力（実際のカード、少額）
7. 利用規約に同意
8. 「リクエストを送信」をクリック
9. 完了ページにリダイレクトされる
10. Stripeダッシュボードで決済確認
11. Firestoreで予約データ確認
12. メール受信確認（ゲストと管理者）

✅ 期待結果:
- 決済成功
- 予約ID発番
- メール送信成功
- ステータス: pending
```

#### テストケース2: 決済失敗時の処理
```bash
1. 残高不足のカードで決済を試みる
2. エラーメッセージが表示される
3. 予約データが作成されない（またはステータスが'failed'）
4. ユーザーが再試行できる

✅ 期待結果:
- エラーメッセージ表示
- データ整合性が保たれる
```

#### テストケース3: ネットワークエラー時の処理
```bash
1. 予約フォーム送信時にネットワークを切断
2. エラーハンドリングが動作
3. 重複決済が発生しない

✅ 期待結果:
- エラー表示
- リトライ可能
- 二重決済なし
```

### 💰 金額計算のテスト

#### 検証項目
```typescript
// 計算ロジックのテストケース
const testCases = [
  {
    checkIn: '2025-01-10',
    checkOut: '2025-01-12',
    guests: 2,
    expected: 36000, // 平日2泊 × 18,000円
  },
  {
    checkIn: '2025-01-10',
    checkOut: '2025-01-13',
    guests: 2,
    couponCode: 'WELCOME10',
    expected: 48600, // (平日2泊 + 土曜1泊) × 割引10%
  },
  {
    checkIn: '2025-01-10',
    checkOut: '2025-01-12',
    guests: 8,
    expected: 42000, // 基本料金 + 追加ゲスト2名 × 3,000円
  },
]

// 各ケースで実際の金額と期待値を比較
testCases.forEach(testCase => {
  const calculated = calculateBookingAmount(testCase)
  console.assert(calculated === testCase.expected, `金額が一致しません`)
})
```

---

## 7. メール送信機能テスト

### 📧 Nodemailerの本番設定

#### Gmail SMTP設定（推奨）
```bash
1. Googleアカウントで2段階認証を有効化
2. アプリパスワードを生成:
   - Googleアカウント → セキュリティ → アプリパスワード
   - アプリ: メール
   - デバイス: その他（カスタム名: 家具の家予約システム）
   - 生成された16桁のパスワードをコピー

3. .env に設定:
   EMAIL_USER=noreply@furniturehouse1.com
   EMAIL_PASSWORD=<16桁のアプリパスワード>
```

#### 送信ドメイン認証（SPF/DKIM）
```bash
# より信頼性の高いメール送信のため、SendGridやMailgunの使用を推奨

SendGrid無料プラン:
- 月100通まで無料
- SPF/DKIM認証設定済み
- 高い到達率

設定手順:
1. SendGridアカウント作成
2. APIキー取得
3. 送信ドメイン認証（furniturehouse1.com）
4. server/utils/email.ts を更新
```

### 📧 メールテンプレートのテスト

#### テストシナリオ
```bash
送信メール一覧:
1. [ ] 予約リクエスト受付メール（ゲスト宛）
2. [ ] 予約リクエスト通知メール（管理者宛）
3. [ ] 予約確定メール（ゲスト宛）
4. [ ] キャンセル完了メール（ゲスト宛）
5. [ ] リマインダーメール（チェックイン3日前）
6. [ ] サンキューメール（チェックアウト後）
7. [ ] レビュー依頼メール（チェックアウト7日後）

各メールの確認項目:
- [ ] 件名が適切
- [ ] 本文の日本語が自然
- [ ] リンクが正しく動作
- [ ] スマホでの表示が適切
- [ ] スパムフォルダに入らない
```

#### メール送信ログの実装
```typescript
// server/api/emails/send-booking-confirmation.post.ts に追加
import { getFirestore } from 'firebase-admin/firestore'

const logEmail = async (emailData: {
  to: string
  subject: string
  status: 'sent' | 'failed'
  error?: string
}) => {
  const db = getFirestore()
  await db.collection('emailLogs').add({
    ...emailData,
    sentAt: new Date(),
  })
}

// メール送信後にログ記録
await logEmail({
  to: guestEmail,
  subject: '予約リクエストを受け付けました',
  status: 'sent'
})
```

---

## 8. パフォーマンスとコスト最適化

### ⚡ Firestoreコスト削減

#### 読み取り回数の最適化
```typescript
// ❌ 悪い例: 毎回全予約を取得
const bookings = await getDocs(collection(db, 'bookings'))

// ✅ 良い例: 必要な範囲のみクエリ
const bookings = await getDocs(
  query(
    collection(db, 'bookings'),
    where('userId', '==', currentUser.uid),
    where('checkInDate', '>=', startOfMonth(new Date())),
    limit(10)
  )
)
```

#### キャッシュ戦略
```typescript
// composables/useBookings.ts
import { ref } from 'vue'

const bookingsCache = ref<Map<string, Booking>>(new Map())
const cacheExpiry = 5 * 60 * 1000 // 5分

export const getBooking = async (bookingId: string) => {
  const cached = bookingsCache.value.get(bookingId)
  if (cached && Date.now() - cached.cachedAt < cacheExpiry) {
    return cached
  }

  const booking = await fetchBooking(bookingId)
  bookingsCache.value.set(bookingId, { ...booking, cachedAt: Date.now() })
  return booking
}
```

### ⚡ 画像最適化

#### 実装推奨
```bash
# Nuxt Imageモジュールの導入
npm install @nuxt/image

# nuxt.config.ts に追加
export default defineNuxtConfig({
  modules: ['@nuxt/image'],
  image: {
    quality: 80,
    formats: ['webp', 'jpg'],
  }
})

# Vueコンポーネントで使用
<NuxtImg
  src="/images/room.jpg"
  width="800"
  height="600"
  format="webp"
  loading="lazy"
/>
```

### ⚡ Vercelビルド最適化

#### 設定
```json
// package.json
{
  "scripts": {
    "build": "nuxt build",
    "analyze": "nuxt build --analyze"
  }
}
```

```bash
# バンドルサイズを確認
npm run analyze

# 大きなライブラリを特定して動的インポートに変更
```

---

## 9. バグ防止とエラーハンドリング

### 🐛 TypeScriptの厳格化

#### 現在の設定（緩い）
```typescript
// nuxt.config.ts
typescript: {
  strict: false,  // ⚠️ 本番前にtrueに変更推奨
  typeCheck: false
}
```

#### 推奨設定
```typescript
typescript: {
  strict: true,
  typeCheck: true,
  shim: false
}
```

#### 段階的な導入
```bash
1. まず既存コードでエラーを確認
   npm run dev

2. エラーを1つずつ修正
   - undefined チェックを追加
   - 型アノテーションを追加
   - any を具体的な型に変更

3. 全エラー修正後、strictモードを有効化
```

### 🐛 グローバルエラーハンドリング

#### エラーページの作成
```vue
<!-- error.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold">{{ error.statusCode }}</h1>
      <p class="text-gray-600 mt-4">{{ error.message }}</p>
      <NuxtLink to="/" class="mt-8 btn-primary">
        トップページへ戻る
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const error = useError()
</script>
```

#### APIエラーハンドリング
```typescript
// composables/useApi.ts
export const useApi = () => {
  const handleError = (error: any) => {
    console.error('API Error:', error)

    // ユーザーに分かりやすいメッセージ
    const message = error.statusCode === 500
      ? 'サーバーエラーが発生しました。しばらくしてから再度お試しください。'
      : error.message || '予期しないエラーが発生しました'

    // エラーログをFirestoreに記録（オプション）
    logError({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      url: window.location.href,
    })

    return message
  }

  return { handleError }
}
```

### 🐛 フォームバリデーション

#### クライアント・サーバー両方で検証
```typescript
// 予約フォームのバリデーション
const validateBooking = (data: BookingData) => {
  const errors: string[] = []

  // 日付チェック
  if (data.checkInDate <= new Date()) {
    errors.push('チェックイン日は明日以降を選択してください')
  }

  if (data.checkOutDate <= data.checkInDate) {
    errors.push('チェックアウト日はチェックイン日より後を選択してください')
  }

  // ゲスト数チェック
  if (data.guestCount < 1 || data.guestCount > 10) {
    errors.push('ゲスト数は1〜10名で選択してください')
  }

  // メールアドレス検証
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.guestEmail)) {
    errors.push('有効なメールアドレスを入力してください')
  }

  return errors
}

// サーバーサイドでも同じバリデーション
export default defineEventHandler(async (event) => {
  const data = await readBody(event)
  const errors = validateBooking(data)

  if (errors.length > 0) {
    throw createError({
      statusCode: 400,
      message: errors.join(', ')
    })
  }

  // 処理続行
})
```

---

## 10. 監視とロギング

### 📊 Firebase Analytics設定

#### 実装
```typescript
// plugins/firebase-analytics.client.ts
import { getAnalytics, logEvent } from 'firebase/analytics'

export default defineNuxtPlugin(() => {
  const app = useFirebaseApp()
  const analytics = getAnalytics(app)

  return {
    provide: {
      analytics: {
        logBookingStarted: (checkIn: string, checkOut: string) => {
          logEvent(analytics, 'booking_started', {
            check_in: checkIn,
            check_out: checkOut,
          })
        },
        logBookingCompleted: (bookingId: string, amount: number) => {
          logEvent(analytics, 'booking_completed', {
            booking_id: bookingId,
            value: amount,
            currency: 'JPY',
          })
        },
      }
    }
  }
})
```

#### トラッキングイベント
```bash
重要イベント:
- [ ] ページビュー（自動）
- [ ] 予約検索開始
- [ ] 日付選択
- [ ] ゲスト情報入力開始
- [ ] 決済開始
- [ ] 予約完了
- [ ] キャンセル
- [ ] エラー発生
```

### 📊 エラーモニタリング（Sentry推奨）

#### セットアップ
```bash
npm install @sentry/vue

# nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sentry'],
  sentry: {
    dsn: 'https://xxxxx@sentry.io/xxxxx',
    environment: process.env.NODE_ENV,
  }
})
```

#### カスタムエラーログ
```typescript
import * as Sentry from '@sentry/vue'

try {
  await createBooking(data)
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      component: 'BookingForm',
      action: 'create_booking',
    },
    extra: {
      bookingData: data,
    }
  })
  throw error
}
```

### 📊 Uptime監視

#### 推奨サービス
```bash
1. UptimeRobot（無料プラン）
   - URL: https://booking.furniturehouse1.com/api/health
   - チェック間隔: 5分
   - アラート先: 管理者メール
   - レスポンス確認: status=healthy

2. Better Uptime（有料、より詳細）
   - ステータスページ作成可能
   - インシデント管理
   - SLA追跡
```

#### ヘルスチェックエンドポイント

アプリケーションには `/api/health` エンドポイントが実装されています：

```bash
GET /api/health

レスポンス例:
{
  "status": "healthy" | "degraded" | "unhealthy",
  "services": {
    "firestore": { "status": "healthy", "latency": 45 },
    "stripe": { "status": "healthy", "latency": 120 }
  },
  "uptime": 3600,
  "environment": "production"
}

HTTPステータス:
- 200: 正常（healthy）
- 503: サービス異常（unhealthy/degraded）
```

### 📊 運用ログの確認

Firestoreの `operationLogs` コレクションに自動で運用ログが記録されます：

```bash
ログカテゴリ:
- booking: 予約作成、承認、キャンセルなど
- payment: 決済確定、返金など
- email: メール送信結果
- cron: 定期ジョブ実行結果
- admin: 管理者操作
- system: システムイベント
- error: エラー

Firebase Console → Firestore → operationLogs で確認可能
```

---

## 11. バックアップとリカバリー

### 💾 Firestoreバックアップ

#### 自動バックアップ設定
```bash
# Firebase Blaze（従量課金）プランが必要

# GCPコンソールでスケジュール設定
1. https://console.cloud.google.com/firestore
2. 「インポート/エクスポート」タブ
3. 「スケジュールされたバックアップを作成」
   - 頻度: 毎日 午前3時（JST）
   - 保存先: gs://furniturehouse1-prod-backups
   - 保持期間: 30日間
```

#### 手動バックアップ
```bash
# 重要な操作の前に手動バックアップ
firebase firestore:export gs://furniturehouse1-prod-backups/manual-$(date +%Y%m%d)
```

#### リストア手順
```bash
# バックアップからリストア
firebase firestore:import gs://furniturehouse1-prod-backups/2025-01-15

⚠️ 既存データが上書きされます
⚠️ 必ず別環境でテストしてから本番実施
```

### 💾 環境変数のバックアップ

#### ローカルに安全に保存
```bash
# パスワード管理ツール（1Password、Bitwarden等）に保存

または暗号化してGitに保存:
# .env.production.encrypted
git-crypt init
git-crypt add-gpg-user <GPGキーID>
echo ".env.production" >> .gitattributes
git add .env.production .gitattributes
git commit -m "Add encrypted production env"
```

---

## 12. ユーザーエクスペリエンス最終確認

### 🎨 デザイン・UI確認

#### チェックリスト
```bash
- [ ] 全ページがレスポンシブ（Mobile/Tablet/Desktop）
- [ ] ローディング状態が適切に表示される
- [ ] エラーメッセージが分かりやすい
- [ ] 成功メッセージが表示される
- [ ] ボタンの無効化状態が明確
- [ ] フォーカス状態が視覚的に分かる（アクセシビリティ）
- [ ] 画像の読み込みが速い
- [ ] フォントが読みやすい
```

#### モバイル実機テスト
```bash
テストデバイス:
- [ ] iPhone（Safari）
- [ ] Android（Chrome）
- [ ] iPad（Safari）

確認項目:
- [ ] タップしやすいボタンサイズ（最小44x44px）
- [ ] 入力フォームがキーボードで隠れない
- [ ] スクロールがスムーズ
- [ ] 決済フォームが正しく動作
```

### 🎨 アクセシビリティ

#### チェックツール
```bash
# Lighthouse監査
1. Chrome DevTools → Lighthouse
2. カテゴリ: Accessibility
3. スコア90以上を目指す

主な確認項目:
- [ ] 画像にalt属性がある
- [ ] ボタンに適切なaria-label
- [ ] フォーム要素にラベルがある
- [ ] コントラスト比が十分（4.5:1以上）
- [ ] キーボードのみで操作可能
```

### 🎨 SEO対策

#### メタタグ確認
```vue
<!-- pages/index.vue など各ページ -->
<script setup lang="ts">
useSeoMeta({
  title: '家具の家 No.1 | 坂茂の初期作品に宿泊する',
  description: '家具が家を支える「体験する建築」。風が通り、光が移ろい、音が吸い込まれる。',
  ogTitle: '家具の家 No.1｜坂茂の初期作品に宿泊する',
  ogDescription: '家具が家を支える『体験する建築』。静かな時間の中で構造体に囲まれる不思議な宿泊体験。',
  ogImage: 'https://booking.furniturehouse1.com/og-image.jpg',
  twitterCard: 'summary_large_image',
})
</script>
```

---

## 13. 管理者・サポーター向け運用マニュアル

### 📖 管理者ダッシュボード機能確認

#### 必要機能リスト
```bash
管理者ページ（要作成）:
- [ ] 予約一覧表示（カレンダー形式）
- [ ] 予約詳細表示
- [ ] 予約ステータス変更（pending → confirmed）
- [ ] キャンセル処理
- [ ] ゲスト情報編集
- [ ] 料金設定編集
- [ ] クーポン作成・管理
- [ ] カレンダー休業日設定
- [ ] メールテンプレート編集
- [ ] サポータータスク割り当て
- [ ] 売上レポート
```

#### 簡易管理ページの作成（優先度高）
```vue
<!-- pages/admin/dashboard.vue -->
<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold mb-8">管理者ダッシュボード</h1>

    <!-- 今日の予約 -->
    <section class="mb-8">
      <h2 class="text-xl font-semibold mb-4">今日のチェックイン/アウト</h2>
      <div v-for="booking in todayBookings" :key="booking.id" class="border p-4 mb-2">
        <p><strong>{{ booking.guestName }}</strong></p>
        <p>{{ booking.checkInDate }} - {{ booking.checkOutDate }}</p>
        <p>ステータス: {{ booking.status }}</p>
      </div>
    </section>

    <!-- 新規予約リクエスト -->
    <section>
      <h2 class="text-xl font-semibold mb-4">新規予約リクエスト</h2>
      <div v-for="booking in pendingBookings" :key="booking.id" class="border p-4 mb-2">
        <p><strong>{{ booking.guestName }}</strong></p>
        <button @click="approveBooking(booking.id)" class="btn-primary mr-2">承認</button>
        <button @click="rejectBooking(booking.id)" class="btn-danger">却下</button>
      </div>
    </section>
  </div>
</template>
```

### 📖 サポーター向けマニュアル

#### タスク管理フロー
```bash
1. ログイン後、自分のタスク一覧を表示
2. 当日のタスクを確認
   - チェックイン準備
   - 清掃
   - チェックアウト確認
3. タスク開始時に「開始」ボタンをタップ
4. チェックリスト完了
5. 「完了」ボタンをタップ
6. 写真アップロード（清掃後など）
```

#### 緊急連絡先の設定
```typescript
// 管理者連絡先をアプリ内に表示
const emergencyContact = {
  phone: '090-XXXX-XXXX',
  email: 'support@furniturehouse1.com',
  line: '@furniturehouse1',
}
```

---

## 14. 本番デプロイ手順

### 🚀 デプロイ前最終チェック

#### チェックリスト
```bash
コード:
- [ ] TypeScript strict モード有効化
- [ ] 全テストが通過
- [ ] console.log を削除（または本番環境で無効化）
- [ ] TODO コメントの確認
- [ ] 不要なコードの削除

設定:
- [ ] 環境変数が全て設定済み（Vercel）
- [ ] Firebaseルールが本番用に設定済み
- [ ] Stripe本番キーが設定済み
- [ ] ドメイン設定完了

テスト:
- [ ] 全機能のE2Eテスト完了
- [ ] 決済テスト完了（少額実決済）
- [ ] メール送信テスト完了
- [ ] モバイルテスト完了
```

### 🚀 デプロイ実行

#### ステップバイステップ
```bash
# 1. developブランチで最終テスト
git checkout develop
git pull
npm run build
npm run preview

# プレビュー環境で最終確認
# → https://furniturehouse1-booking-git-develop-xxxxx.vercel.app

# 2. mainブランチにマージ
git checkout main
git merge develop
git push origin main

# 3. Vercelが自動デプロイ
# → https://booking.furniturehouse1.com

# 4. デプロイ完了を確認
# Vercelダッシュボードで「Ready」になるまで待つ（約2-3分）

# 5. 本番環境で動作確認
curl https://booking.furniturehouse1.com
```

### 🚀 デプロイ後の確認

#### 即座に確認すべき項目
```bash
- [ ] トップページが表示される
- [ ] 予約フォームが開く
- [ ] カレンダーが機能する
- [ ] Stripe決済フォームが表示される
- [ ] 少額テスト予約を実施（100円）
- [ ] メールが届く
- [ ] Firestoreにデータが保存される
- [ ] 管理者ダッシュボードにアクセスできる
```

---

## 15. 運営開始後のモニタリング

### 📈 最初の24時間

#### 監視項目
```bash
時間帯別チェック:
- [ ] 0時: 夜間の予約状況
- [ ] 8時: 朝の予約状況
- [ ] 12時: 昼の予約状況
- [ ] 18時: 夕方の予約状況

確認内容:
- Vercelダッシュボードでエラーログ
- Firebaseコンソールで使用量
- Stripeダッシュボードで決済状況
- メール送信ログ
- Googleアナリティクスでアクセス数
```

### 📈 最初の1週間

#### 日次レポート
```bash
毎日確認:
1. 新規予約数
2. キャンセル数
3. エラー発生回数
4. サーバー応答時間
5. Firestoreコスト
6. メール送信成功率
7. ユーザーフィードバック

週次レビュー:
- 予約転換率（訪問者数 vs 予約完了数）
- 平均予約単価
- 人気の宿泊期間
- 問い合わせ内容の傾向
```

### 📈 改善サイクル

#### 継続的な最適化
```bash
月次タスク:
1. ユーザーフィードバックの分析
2. コスト最適化の検討
3. 新機能のロードマップ作成
4. セキュリティアップデート
5. 依存関係の更新（npm update）

四半期タスク:
1. 大規模リファクタリング
2. デザインの改善
3. パフォーマンス最適化
4. A/Bテストの実施
```

---

## 🎯 クイックスタートチェックリスト

### 最低限必要なタスク（優先度順）

#### Phase 1: セキュリティ（必須）
- [ ] Firestoreセキュリティルールの検証
- [ ] 環境変数の本番設定（Vercel）
- [ ] Stripe本番キー設定
- [ ] APIキーの漏洩チェック

#### Phase 2: 決済機能（必須）
- [ ] Stripe本番モード有効化
- [ ] Webhook設定
- [ ] 少額テスト決済
- [ ] 返金テスト

#### Phase 3: 基本機能（必須）
- [ ] 予約作成テスト
- [ ] メール送信テスト
- [ ] 同時予約防止の実装
- [ ] エラーハンドリング

#### Phase 4: 運用準備（推奨）
- [ ] 管理者ダッシュボード作成
- [ ] バックアップ設定
- [ ] 監視ツール導入
- [ ] 運用マニュアル作成
- [ ] 環境変数検証スクリプト実行（`npm run validate-env:prod`）
- [ ] ヘルスチェックエンドポイント動作確認（`/api/health`）
- [ ] 外部監視サービスへのヘルスチェック登録（UptimeRobotなど）
- [ ] Cron定期実行の動作確認（Vercel Dashboard → Logsで確認）
- [ ] operationLogsへの運用ログ記録確認

#### Phase 5: 最適化（オプション）
- [ ] パフォーマンス改善
- [ ] SEO対策
- [ ] アクセシビリティ改善
- [ ] アナリティクス設定

---

## 📞 サポート・問い合わせ

### トラブルシューティング

#### よくある問題

**問題1: 決済が完了しない**
```bash
確認項目:
1. Stripeキーが本番用か確認
2. Webhookが正しく設定されているか
3. ブラウザコンソールでエラー確認
4. Stripeダッシュボードのログ確認
```

**問題2: メールが届かない**
```bash
確認項目:
1. EMAIL_USERとEMAIL_PASSWORDが正しいか
2. Gmailのアプリパスワードを使用しているか
3. スパムフォルダを確認
4. メール送信ログを確認（Firestore: emailLogs）
```

**問題3: 予約が重複する**
```bash
対処法:
1. 同時予約防止のトランザクション処理を実装
2. Firestoreインデックスを確認
3. キャッシュをクリア
```

### 緊急時の連絡先

```bash
Firebase障害: https://status.firebase.google.com
Stripe障害: https://status.stripe.com
Vercel障害: https://www.vercel-status.com

技術サポート:
- Firebase Support: https://firebase.google.com/support
- Stripe Support: support@stripe.com
- Vercel Support: support@vercel.com
```

---

## ✅ 最終承認

### リリース責任者の確認

```
[ ] システム全体のテストが完了
[ ] セキュリティ監査に合格
[ ] ステークホルダーの承認取得
[ ] 運用チームへの引き継ぎ完了
[ ] バックアップ体制確立
[ ] 監視体制確立

承認者: ________________
日付: ________________
サイン: ________________
```

---

**このチェックリストを1項目ずつ確認し、全てにチェックが入った時点で本番運営開始の準備が整います。**

**焦らず、1つずつ丁寧に進めてください。成功を祈ります！**
