# セキュリティ実装ガイド

Phase 1のセキュリティ実装が完了しました。このガイドでは、新しいAPIの使用方法とセットアップ手順を説明します。

---

## 📦 実装された機能

### ✅ 完了した実装

1. **同時予約防止** - Firestoreトランザクション処理
2. **サーバーサイド金額検証** - クライアント送信額の改ざん防止
3. **Stripe Webhook** - 決済イベントの非同期処理
4. **レート制限** - API過剰リクエストの防止
5. **入力検証（Zod）** - 型安全なバリデーション
6. **セキュリティヘッダー** - XSS、クリックジャッキング対策

---

## 🚀 セットアップ手順

### 1. 環境変数の追加

`.env`ファイルに以下を追加してください:

```bash
# Firebase Admin SDK（3つの方法のいずれか）

# 方法1: サービスアカウントJSONをBase64エンコード（本番環境推奨）
FIREBASE_ADMIN_KEY=eyJ0eXBlIjoic2VydmljZV9hY2NvdW50...

# 方法2: 個別の環境変数（開発環境用）
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA..."

# 方法3: JSONファイルパス（ローカル開発のみ）
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json

# Stripe Webhook Secret（本番環境で必須）
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 2. Firebase Admin サービスアカウントキーの取得

```bash
1. Firebaseコンソールにアクセス
   https://console.firebase.google.com

2. プロジェクト設定 → サービスアカウント

3. 「新しい秘密鍵を生成」をクリック

4. JSONファイルがダウンロードされる

5. Base64エンコード（本番環境用）:
   cat serviceAccountKey.json | base64 > encoded.txt

6. encoded.txtの内容をFIREBASE_ADMIN_KEYに設定

⚠️ JSONファイルは絶対にGitにコミットしない
⚠️ .gitignoreに*.jsonを追加済み
```

### 3. Stripe Webhook Secretの取得

```bash
1. Stripeダッシュボードにアクセス
   https://dashboard.stripe.com

2. 開発者 → Webhook

3. 「エンドポイントを追加」
   URL: https://booking.furniturehouse1.com/api/stripe/webhook

4. イベントを選択:
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - charge.refunded
   - payment_intent.canceled

5. 署名シークレットをコピー
   whsec_xxxxxxxxxxxxx

6. .envに設定
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 4. Vercel環境変数の設定

```bash
Vercelダッシュボード:
→ プロジェクト
→ Settings
→ Environment Variables

以下を追加:
- FIREBASE_ADMIN_KEY (Base64エンコード済みJSON)
- STRIPE_WEBHOOK_SECRET (whsec_xxxxx)

⚠️ Environment: Production のみに設定
```

---

## 📝 新しいAPIの使用方法

### セキュアな予約作成フロー

#### ステップ1: Payment Intentの作成

```typescript
// composables/useBooking.ts または pages/booking/request.vue

const createPaymentIntent = async () => {
  try {
    const response = await $fetch('/api/stripe/create-payment-intent-secure', {
      method: 'POST',
      body: {
        checkInDate: '2025-02-01',
        checkOutDate: '2025-02-03',
        guestCount: 2,
        couponCode: 'WELCOME10', // オプション
      },
    })

    return {
      clientSecret: response.clientSecret,
      paymentIntentId: response.paymentIntentId,
      amount: response.amount,
      breakdown: response.breakdown,
    }
  } catch (error) {
    console.error('Payment Intent作成エラー:', error)
    throw error
  }
}
```

**レスポンス例:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 41000,
  "breakdown": {
    "baseAmount": 36000,
    "cleaningFee": 5000,
    "couponDiscount": 0,
    "total": 41000
  }
}
```

#### ステップ2: 予約の作成

```typescript
const createBooking = async () => {
  try {
    const response = await $fetch('/api/bookings/create-secure', {
      method: 'POST',
      body: {
        checkInDate: '2025-02-01',
        checkOutDate: '2025-02-03',
        guestCount: 2,
        guestName: '山田太郎',
        guestEmail: 'test@example.com',
        guestPhone: '090-1234-5678',
        notes: '15時頃チェックイン予定',
        couponCode: 'WELCOME10',
        amount: 41000, // Payment Intentで取得した金額
      },
    })

    return {
      bookingId: response.bookingId,
      bookingReference: response.bookingReference,
      amount: response.amount,
    }
  } catch (error) {
    console.error('予約作成エラー:', error)
    throw error
  }
}
```

**レスポンス例:**
```json
{
  "success": true,
  "bookingId": "abc123",
  "bookingReference": "FH1-1A2B3C-XYZ9",
  "amount": 41000
}
```

---

## 🔒 セキュリティ機能の詳細

### 1. 同時予約防止

**仕組み:**
```typescript
// Firestoreトランザクション内で処理
await db.runTransaction(async (transaction) => {
  // 1. 重複チェック
  const conflicts = await transaction.get(
    bookings
      .where('status', 'in', ['pending', 'confirmed'])
      .where('checkInDate', '<', checkOutDate)
      .where('checkOutDate', '>', checkInDate)
  )

  // 2. 重複があればエラー
  if (!conflicts.empty) {
    throw new Error('この期間は既に予約されています')
  }

  // 3. 予約を作成
  transaction.set(bookingRef, bookingData)
})
```

**効果:**
- 複数ユーザーが同時に予約しても1件のみ成功
- データベースレベルでの整合性保証

### 2. サーバーサイド金額検証

**仕組み:**
```typescript
// サーバーで金額を再計算
const calculatedAmount = calculateBookingAmount(
  checkInDate,
  checkOutDate,
  guestCount,
  pricingRule,
  couponDiscount
)

// クライアント送信額と比較
if (!validateAmount(calculatedAmount, clientAmount)) {
  throw new Error('金額の検証に失敗しました')
}
```

**効果:**
- クライアント側での金額改ざんを防止
- 料金計算ロジックがサーバーに集約

### 3. Stripe Webhook

**処理フロー:**
```
Stripe → Webhook → Firebase更新 → メール送信

決済成功:
payment_intent.succeeded
  ↓
予約ステータス: pending → confirmed
  ↓
確認メール送信

決済失敗:
payment_intent.payment_failed
  ↓
予約ステータス: pending → payment_failed
  ↓
エラー通知
```

**効果:**
- 決済結果を確実に反映
- 非同期処理でパフォーマンス向上

### 4. レート制限

**設定:**
```typescript
// Payment Intent作成: 5回/分
// 予約作成: 3回/分
// その他API: 30回/分
```

**レスポンスヘッダー:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2025-01-15T10:30:00Z
```

**効果:**
- DDoS攻撃の緩和
- サーバーリソースの保護

### 5. 入力検証（Zod）

**バリデーション:**
```typescript
const schema = z.object({
  checkInDate: z.string().refine(date => date >= tomorrow),
  guestCount: z.number().min(1).max(10),
  guestEmail: z.string().email(),
  guestPhone: z.string().regex(/^0\d{1,4}-?\d{1,4}-?\d{4}$/),
})
```

**効果:**
- 型安全なバリデーション
- 明確なエラーメッセージ

### 6. セキュリティヘッダー

**設定されるヘッダー:**
```
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: ...
```

**効果:**
- XSS攻撃の防止
- クリックジャッキングの防止
- HTTPSの強制

---

## 🧪 テスト方法

### ローカルテスト

```bash
# 1. サーバーを起動
npm run dev

# 2. Payment Intent作成をテスト
curl -X POST http://localhost:3000/api/stripe/create-payment-intent-secure \
  -H "Content-Type: application/json" \
  -d '{
    "checkInDate": "2025-02-01",
    "checkOutDate": "2025-02-03",
    "guestCount": 2
  }'

# 3. 予約作成をテスト
curl -X POST http://localhost:3000/api/bookings/create-secure \
  -H "Content-Type: application/json" \
  -d '{
    "checkInDate": "2025-02-01",
    "checkOutDate": "2025-02-03",
    "guestCount": 2,
    "guestName": "テスト太郎",
    "guestEmail": "test@example.com",
    "guestPhone": "090-1234-5678",
    "amount": 41000
  }'
```

### 同時予約防止のテスト

```bash
# 2つのターミナルで同時に実行
# ターミナル1:
curl -X POST http://localhost:3000/api/bookings/create-secure -d '{...}'

# ターミナル2（同時に実行）:
curl -X POST http://localhost:3000/api/bookings/create-secure -d '{...}'

# 期待結果: 1件は成功、1件は「既に予約されています」エラー
```

### レート制限のテスト

```bash
# 連続でリクエストを送信
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/bookings/create-secure -d '{...}'
  echo "Request $i"
done

# 期待結果: 3回目以降で429エラー
```

### Webhookのテスト（Stripe CLI）

```bash
# Stripe CLIをインストール
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# Webhookをローカルに転送
stripe listen --forward-to localhost:3000/api/stripe/webhook

# テストイベントを送信
stripe trigger payment_intent.succeeded

# ログで処理を確認
# ✅ Webhook received: payment_intent.succeeded
# 💳 Payment succeeded: pi_xxx
# ✅ Booking confirmed: abc123
```

---

## 🔧 トラブルシューティング

### エラー: "Firebase Admin credentials not found"

**原因:** 環境変数が設定されていない

**解決策:**
```bash
# .envファイルを確認
cat .env | grep FIREBASE

# 環境変数を設定
export FIREBASE_ADMIN_KEY="..."

# または .envファイルに追加
echo 'FIREBASE_ADMIN_KEY="..."' >> .env
```

### エラー: "Webhook Error: No signatures found"

**原因:** Stripe Webhook Secretが設定されていない

**解決策:**
```bash
# Stripeダッシュボードでシークレットを確認
# .envに追加
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### エラー: "金額の検証に失敗しました"

**原因:** クライアントとサーバーの金額計算ロジックが異なる

**解決策:**
```typescript
// Payment Intentで返された金額を使用
const { amount } = await createPaymentIntent()

// この金額をそのまま予約作成に使用
await createBooking({ amount })
```

### エラー: "Rate limit exceeded"

**原因:** APIリクエストが多すぎる

**解決策:**
```typescript
// リトライロジックを実装
const retryWithBackoff = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (error.statusCode === 429 && i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
        continue
      }
      throw error
    }
  }
}
```

---

## 📊 モニタリング

### Firestoreでログを確認

```bash
# エラーログ
Firestoreコンソール → errorLogs コレクション

# Webhookログ
Firestoreコンソール → webhookLogs コレクション
```

### Vercelでログを確認

```bash
Vercelダッシュボード
→ プロジェクト
→ Deployments
→ 最新デプロイ
→ Functions
→ Logs
```

### Stripeでイベントを確認

```bash
Stripeダッシュボード
→ 開発者
→ イベント

または

→ Webhook
→ エンドポイント
→ イベントログ
```

---

## ✅ チェックリスト

デプロイ前に以下を確認してください:

- [ ] 環境変数が全て設定されている
- [ ] Firebase Adminが初期化できる
- [ ] Payment Intent作成が動作する
- [ ] 予約作成が動作する
- [ ] 同時予約が防止される
- [ ] Webhook Secretが設定されている
- [ ] レート制限が動作する
- [ ] セキュリティヘッダーが設定される
- [ ] エラーログが記録される

---

## 🎯 次のステップ

Phase 1のセキュリティ実装が完了しました。次は:

1. **フロントエンドの更新**
   - 新しいAPIエンドポイントを使用
   - エラーハンドリングの改善

2. **メール送信機能の実装**
   - Webhook後の確認メール
   - 決済失敗時の通知

3. **管理者ダッシュボードの作成**
   - 予約一覧
   - ステータス変更

4. **本番デプロイ**
   - Firebase本番環境
   - Stripe本番モード
   - Vercel Production

---

**これでPhase 1のセキュリティ実装は完了です！**

ご質問やサポートが必要な場合は、お気軽にお声がけください。
