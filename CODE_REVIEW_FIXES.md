# コードレビュー修正レポート

## 実施日時
2025年12月31日

## 概要
開発環境・実装環境・公開環境の包括的なレビューを実施し、17件の問題を発見。高優先度・中優先度の問題をすべて修正完了。

---

## 修正済み問題一覧

### 🔴 高優先度（Critical）- 全て修正完了 ✅

#### 問題4: フィールド名の統一 (startDate vs checkInDate)

**問題内容:**
- `types/index.ts` で `Booking` インターフェースが `startDate/endDate` を使用
- 実際のコードでは `checkInDate/checkOutDate` を使用
- 不整合により型安全性が損なわれる

**修正内容:**
- [types/index.ts:26-27](types/index.ts#L26-L27)
  ```typescript
  // 修正前
  startDate: Timestamp
  endDate: Timestamp

  // 修正後
  checkInDate: Timestamp
  checkOutDate: Timestamp
  ```
- `CreateBookingRequest` インターフェースも同様に修正

**影響範囲:**
- 型定義のみの修正（既存コードはすでに正しいフィールド名を使用）

---

#### 問題8-9: Cloud Functions設定 (.firebaserc, 環境変数)

**問題内容:**
- `.firebaserc` ファイルが存在せず、Firebase プロジェクトが指定されていない
- `firebase.json` に Cloud Functions の設定が欠落
- 環境変数の設定手順が不明確

**修正内容:**

1. **`.firebaserc` を新規作成:**
   ```json
   {
     "projects": {
       "default": "furniture-house-1"
     }
   }
   ```

2. **`firebase.json` に Functions 設定を追加:**
   ```json
   {
     "functions": {
       "source": "functions",
       "runtime": "nodejs18",
       "predeploy": [
         "npm --prefix \"$RESOURCE_DIR\" run build"
       ]
     }
   }
   ```

3. **環境変数リファレンスドキュメント作成:**
   - [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - 完全な環境変数リスト

**影響範囲:**
- Firebase Functions のデプロイが正しく機能するようになる
- プロジェクト設定が明確化

---

#### 問題14: デプロイメントドキュメント完全化

**問題内容:**
- デプロイ手順が不完全
- 環境変数の設定方法が不明確
- Vercel環境変数の設定が欠落

**修正内容:**

1. **QUICK_DEPLOYMENT_GUIDE.md を更新:**
   - ステップ数を5→6に修正
   - Vercel環境変数設定セクションを追加
   - 全環境変数のリストを記載

2. **ENVIRONMENT_VARIABLES.md を新規作成:**
   - Vercel、Firebase Functions、ローカル開発の3つの環境を網羅
   - 各変数の説明、必須/任意、例を明記
   - トラブルシューティングセクションを追加
   - チェックリストを追加

**影響範囲:**
- デプロイ手順が明確化
- 新規メンバーのオンボーディングが容易に

---

### 🟡 中優先度（Medium）- 全て修正完了 ✅

#### 問題1-2: 未使用環境変数削除とメール設定統一

**問題内容:**
- `nuxt.config.ts` に未使用の `emailApiKey` が存在
- 内部API認証が `STRIPE_WEBHOOK_SECRET` に依存

**修正内容:**
- [nuxt.config.ts:54](nuxt.config.ts#L54)
  ```typescript
  // 削除: emailApiKey

  // 追加:
  internalApiSecret: process.env.INTERNAL_API_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '',
  ```

**影響範囲:**
- 内部API認証の専用シークレット設定が可能に
- 後方互換性を維持（STRIPE_WEBHOOK_SECRETへのフォールバック）

---

#### 問題11: 内部API認証の改善

**問題内容:**
- `/api/emails/send-booking-confirmation.post.ts`
- `/api/stripe/update-payment-intent.post.ts`
- 上記2つのAPIが `STRIPE_WEBHOOK_SECRET` を内部認証に使用

**修正内容:**
- [server/api/emails/send-booking-confirmation.post.ts:15](server/api/emails/send-booking-confirmation.post.ts#L15)
  ```typescript
  // 修正前
  const internalSecret = config.stripeWebhookSecret

  // 修正後
  const internalSecret = config.internalApiSecret
  ```
- [server/api/stripe/update-payment-intent.post.ts:15](server/api/stripe/update-payment-intent.post.ts#L15) - 同様に修正

**影響範囲:**
- セキュリティ向上（専用シークレットの使用）
- Stripe Webhook Secretと内部API認証の分離

---

#### 問題12: SendGrid参照をGmailに統一

**問題内容:**
- `functions/src/index.ts` で SendGrid を参照
- 実際にはGmail SMTPを使用

**修正内容:**
- [functions/src/index.ts:10-17](functions/src/index.ts#L10-L17)
  ```typescript
  // 修正前
  const transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: 'apikey',
      pass: functions.config().sendgrid?.api_key || process.env.SENDGRID_API_KEY
    }
  })

  // 修正後
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  })
  ```

- **管理者メール送信関数を更新:**
  - `sendEmailToAdmin()` - `EMAIL_REPLY_TO` を管理者メールアドレスとして使用
  - `sendEmailToGuest()` - `EMAIL_REPLY_TO` を返信先として設定

**影響範囲:**
- メール送信設定が一貫性を持つ
- Cloud Functionsがゲストメッセージ通知を正しく送信可能に

---

#### 問題6-7: Webhook型定義とBookingフィールド追加

**問題内容:**
- Webhook ハンドラーが以下のフィールドを使用するが型定義が欠落:
  - `paymentError` - 決済エラーメッセージ
  - `canceledAt` - キャンセル日時
- `BookingStatus` に `'refunded'` が欠落
- Webhook が `paymentIntentId` で検索するが、型定義は `stripePaymentIntentId`

**修正内容:**

1. **型定義の追加:**
   - [types/index.ts:11](types/index.ts#L11)
     ```typescript
     // 修正前
     export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'payment_failed'

     // 修正後
     export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'payment_failed' | 'refunded'
     ```

   - [types/index.ts:40-46](types/index.ts#L40-L46)
     ```typescript
     stripePaymentIntentId?: string
     notes?: string
     paidAt?: Timestamp
     paymentError?: string // 新規追加
     refundedAt?: Timestamp
     refundAmount?: number
     canceledAt?: Timestamp // 新規追加
     ```

2. **Webhookハンドラーの修正:**
   - [server/api/stripe/webhook.post.ts](server/api/stripe/webhook.post.ts)
   - すべての `where('paymentIntentId', ...)` を `where('stripePaymentIntentId', ...)` に修正
   - 4箇所を修正（行130, 167, 212, 249）

**影響範囲:**
- 型安全性の向上
- Webhookが正しく動作するように修正
- データベースクエリが型定義と一致

---

## 残存問題（低優先度）

### 🟢 問題5: Firestore ルールの冗長性

**内容:**
[firestore.rules:10](firestore.rules#L10) に冗長なルールが存在
```javascript
allow read: if true; // 重複（下のルールで包含）
```

**推奨対応:**
将来のリファクタリング時に削除

---

### 🟢 問題16: TypeScript Strict Mode

**内容:**
`nuxt.config.ts` と `functions/tsconfig.json` で strict mode が無効

**推奨対応:**
段階的に strict mode を有効化
- 新規ファイルから strict チェックを適用
- 既存ファイルは徐々に対応

---

### 🟢 問題17: 依存関係のバージョン統一

**内容:**
メインプロジェクトと Cloud Functions で依存関係のバージョンが異なる

**推奨対応:**
- `firebase-admin`: メイン `^13.6.0` vs Functions `^12.0.0`
- 将来のアップデート時に統一

---

## 修正ファイル一覧

### 新規作成
- ✅ `.firebaserc` - Firebase プロジェクト設定
- ✅ `ENVIRONMENT_VARIABLES.md` - 環境変数完全リファレンス
- ✅ `CODE_REVIEW_FIXES.md` - このドキュメント

### 修正
- ✅ `types/index.ts` - 型定義の修正・追加
- ✅ `nuxt.config.ts` - 環境変数設定の改善
- ✅ `firebase.json` - Cloud Functions 設定追加
- ✅ `server/api/emails/send-booking-confirmation.post.ts` - 内部API認証修正
- ✅ `server/api/stripe/update-payment-intent.post.ts` - 内部API認証修正
- ✅ `server/api/stripe/webhook.post.ts` - フィールド名修正（4箇所）
- ✅ `functions/src/index.ts` - SendGrid → Gmail 統一、メール設定改善
- ✅ `QUICK_DEPLOYMENT_GUIDE.md` - デプロイ手順の完全化

---

## デプロイ前チェックリスト

本番環境へのデプロイ前に以下を確認してください:

### Vercel環境変数
- [ ] `INTERNAL_API_SECRET` が設定されている（または `STRIPE_WEBHOOK_SECRET` と同じ）
- [ ] `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_REPLY_TO` が設定されている
- [ ] Firebase Admin SDK の認証情報が設定されている
- [ ] `SITE_URL` が `https://booking.furniturehouse1.com` に設定されている

### Firebase Functions
- [ ] `firebase functions:secrets:set EMAIL_USER`
- [ ] `firebase functions:secrets:set EMAIL_PASSWORD`
- [ ] `firebase functions:secrets:set EMAIL_REPLY_TO`

### Firebase Firestore
- [ ] `firebase deploy --only firestore` でルール・インデックスをデプロイ

### コードのビルド確認
```bash
# メインプロジェクト
npm run build

# Cloud Functions
cd functions
npm run build
cd ..
```

### 動作テスト
- [ ] Webhook が正しく動作する（Stripe Dashboard でテスト）
- [ ] 予約確認メールが送信される
- [ ] 管理者招待機能が動作する（将来実装時）
- [ ] スケジュールメールが送信される（Cloud Functions）

---

## 参考ドキュメント

- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - 環境変数リファレンス
- [QUICK_DEPLOYMENT_GUIDE.md](QUICK_DEPLOYMENT_GUIDE.md) - デプロイ手順
- [FIREBASE_FUNCTIONS_SETUP.md](FIREBASE_FUNCTIONS_SETUP.md) - Cloud Functions セットアップ
- [ADMIN_MULTI_EMAIL_IMPLEMENTATION.md](ADMIN_MULTI_EMAIL_IMPLEMENTATION.md) - 実装詳細

---

## まとめ

### 修正完了
- ✅ 高優先度問題: 3件すべて修正
- ✅ 中優先度問題: 4件すべて修正
- ✅ 合計7件の問題を解決

### 残存問題
- 🟢 低優先度: 3件（将来のリファクタリング時に対応推奨）

### 品質向上
- 型安全性の向上（フィールド名統一、欠落型の追加）
- セキュリティ向上（内部API認証の分離）
- 設定の明確化（Firebase、環境変数）
- ドキュメントの充実（デプロイ手順、環境変数リファレンス）

---

**レビュー実施者:** Claude Sonnet 4.5
**修正完了日:** 2025年12月31日
