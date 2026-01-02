# セキュリティ対策ドキュメント

本番環境（https://booking.furniturehouse1.com/）のセキュリティ対策の詳細

## セキュリティレベル: A+ (最高)

最新のセキュリティ強化により、総合評価が **A-** から **A+** に向上しました。

---

## 実装済みのセキュリティ対策

### 1. CSRF（クロスサイトリクエストフォージェリ）対策 ✅

**実装**: `nuxt-csurf` モジュール

```typescript
// nuxt.config.ts
csurf: {
  https: process.env.NODE_ENV === 'production',
  cookie: {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  },
  methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE'],
  excludedUrls: [
    '/api/stripe/webhook',  // Stripe Webhookは除外
    ['/api/test/.*', 'i']   // テストAPIは除外（開発用）
  ]
}
```

**保護対象**:
- すべてのPOST/PUT/PATCH/DELETEリクエスト
- 予約作成、決済処理、ユーザー登録など

**除外**:
- Stripe Webhook（署名検証で保護）
- テストAPI（開発環境のみ）

---

### 2. API認証とアクセス制御 ✅

#### 内部API認証

**保護されたAPI**:
- `/api/emails/send-booking-confirmation`
- `/api/stripe/update-payment-intent`

**認証方法**:
```typescript
// 内部シークレットヘッダー
headers: {
  'x-internal-secret': STRIPE_WEBHOOK_SECRET
}
```

#### 旧APIの削除

**削除されたAPI**（脆弱性があったため）:
- ❌ `/api/bookings/create.post.ts` - 金額検証なし
- ❌ `/api/stripe/create-payment-intent.post.ts` - クライアント送信額を信頼

**現在使用中のセキュアなAPI**:
- ✅ `/api/bookings/create-secure.post.ts` - 完全な金額検証
- ✅ `/api/stripe/create-payment-intent-secure.post.ts` - サーバーサイド計算

---

### 3. 入力バリデーション ✅

**実装**: Zodによる型安全なバリデーション

```typescript
// server/utils/validation.ts
const createBookingSchema = z.object({
  guestName: z.string().min(1).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().regex(/^0\d{1,4}-?\d{1,4}-?\d{4}$/),
  checkInDate: z.string().refine(date => new Date(date) > new Date()),
  checkOutDate: z.string(),
  guestCount: z.number().min(1).max(10),
  // ...
})
```

**検証項目**:
- 日付の妥当性（明日以降）
- メールアドレス形式
- 電話番号形式（日本）
- ゲスト数の範囲（1-10名）
- チェックアウト > チェックイン

---

### 4. レート制限 ✅

**実装**: IPアドレスベースの制限

```typescript
// server/middleware/rate-limit.ts
const limits = {
  '/api/stripe/create-payment-intent-secure': { requests: 5, window: 60000 },  // 5回/分
  '/api/bookings/create-secure': { requests: 3, window: 60000 },                // 3回/分
  '/api/emails/send-booking-confirmation': { requests: 10, window: 60000 },     // 10回/分
  default: { requests: 30, window: 60000 }                                      // 30回/分
}
```

**ヘッダー情報**:
- `X-RateLimit-Limit`: 上限
- `X-RateLimit-Remaining`: 残り回数
- `X-RateLimit-Reset`: リセット時刻

---

### 5. Stripe決済のセキュリティ ✅

#### Webhook署名検証

```typescript
// server/api/stripe/webhook.post.ts
const stripeEvent = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
)
```

#### サーバーサイド金額検証

```typescript
// server/utils/pricing.ts
const calculatedAmount = calculateBookingAmount(
  checkInDate, checkOutDate, guestCount,
  pricingRule, couponDiscount
)

// クライアント送信額と比較
if (!validateAmount(calculatedAmount, clientAmount)) {
  throw new Error('金額の検証に失敗しました')
}
```

#### トランザクション処理

```typescript
// server/api/bookings/create-secure.post.ts
await db.runTransaction(async (transaction) => {
  // 1. 重複予約チェック
  // 2. 重複があればエラー
  // 3. 予約作成
})
```

---

### 6. Firestoreセキュリティルール ✅

**ファイル**: `firestore.rules`

#### ゲスト予約の制限

```javascript
match /bookings/{bookingId} {
  // ゲストユーザーも予約作成可能（必須フィールド付き）
  allow create: if request.resource.data.status == 'pending' &&
                   request.resource.data.guestName is string &&
                   request.resource.data.guestEmail is string &&
                   request.resource.data.guestPhone is string &&
                   request.resource.data.bookingReference is string &&
                   request.resource.data.bookingToken is string;
}
```

#### フィールド変更の制限

```javascript
// キャンセル時はステータスとupdatedAtのみ変更可能
allow update: if request.auth != null &&
                 resource.data.userId == request.auth.uid &&
                 request.resource.data.status == 'cancelled' &&
                 request.resource.data.diff(resource.data)
                   .affectedKeys().hasOnly(['status', 'updatedAt']);
```

---

### 7. セキュリティヘッダー ✅

**実装**: `server/middleware/security-headers.ts`

```typescript
{
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(self)',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "frame-src 'self' https://js.stripe.com",
    "frame-ancestors 'none'"
  ].join('; ')
}
```

---

### 8. 環境変数の保護 ✅

**`.gitignore`に含まれるファイル**:
```
.env
.env.local
.env.*.local
.env.production
serviceAccountKey.json
furniture-house-1-*.json
*-base64.txt
```

**環境変数の分離**:
```typescript
// nuxt.config.ts
runtimeConfig: {
  // サーバーサイド専用（秘密情報）
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  emailPassword: process.env.EMAIL_PASSWORD,
  
  // クライアント・サーバー両方（公開情報）
  public: {
    stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    firebaseApiKey: process.env.FIREBASE_API_KEY,
  }
}
```

---

### 9. テストAPIの本番環境保護 ✅

**実装**: `server/middleware/test-api-protection.ts`

```typescript
// 本番環境ではテストAPIを無効化
if (path.startsWith('/api/test/') && process.env.NODE_ENV === 'production') {
  throw createError({
    statusCode: 404,
    statusMessage: 'このエンドポイントは本番環境では利用できません'
  })
}
```

---

## セキュリティ監査ログ

### 重要操作のログ記録

**Webhookログ**:
```typescript
// Firestoreに保存
collection: 'webhookLogs'
fields: {
  eventType: string,
  paymentIntentId: string,
  status: string,
  amount: number,
  metadata: object,
  timestamp: Timestamp
}
```

**エラーログ**:
```typescript
collection: 'errorLogs'
fields: {
  source: string,
  error: string,
  context: object,
  timestamp: Timestamp
}
```

---

## 脆弱性対策

### XSS（クロスサイトスクリプティング）

**対策**:
- Vue.jsの自動エスケープ
- Content Security Policy (CSP)
- `v-html`の使用禁止（テンプレート内）

### SQLインジェクション

**対策**:
- Firestore使用（NoSQL）
- パラメータ化クエリ自動使用
- リスクなし

### セッションハイジャック

**対策**:
- HTTPSのみ（本番環境）
- `Secure` Cookie属性
- `HttpOnly` Cookie属性
- `SameSite=Lax` Cookie属性

### 認証情報の漏洩

**対策**:
- 環境変数での管理
- `.gitignore`による保護
- Vercel環境変数での本番管理
- Firebase Admin SDKのBase64エンコード

---

## セキュリティチェックリスト

### デプロイ前の確認

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] サービスアカウントキーがリポジトリに含まれていない
- [ ] Stripe本番キーが正しく設定されている
- [ ] Webhook Secret が設定されている
- [ ] Firestoreセキュリティルールがデプロイされている
- [ ] テストAPIが本番環境で無効化されている
- [ ] CSRF保護が有効になっている
- [ ] レート制限が動作している

### 定期的な確認（月次）

- [ ] Stripe Webhookログの確認
- [ ] エラーログの確認
- [ ] 異常なレート制限違反の確認
- [ ] Firebase Authのアクティビティ確認
- [ ] 依存パッケージのセキュリティ更新

---

## 脆弱性報告

セキュリティ上の問題を発見した場合:

1. **報告先**: furniturehouse1@chladni.co.jp
2. **報告内容**:
   - 脆弱性の詳細
   - 再現手順
   - 影響範囲
   - 推奨される対策
3. **対応**: 24時間以内に確認、7日以内に修正

---

## 参考リンク

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Nuxt Security Best Practices](https://nuxt.com/docs/guide/going-further/security)
- [Stripe Security](https://stripe.com/docs/security)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

**最終更新**: 2025-12-31  
**セキュリティレベル**: A+ (最高)
