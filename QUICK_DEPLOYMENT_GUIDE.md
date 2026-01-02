# クイックデプロイガイド - 複数管理者 + 自動メール配信

## 前提条件

- ✅ Firebase プロジェクトが作成済み（プロジェクトID: `furniture-house-1`）
- ✅ Firebase CLI インストール済み（`npm install -g firebase-tools`）
- ✅ Gmail アカウント + アプリパスワード設定済み
- ✅ Firebase Blaze プラン（従量課金）に移行済み
- ✅ Vercel プロジェクトが作成済み

---

## デプロイ手順（6ステップ）

### 1. 依存関係のインストール

```bash
# メインプロジェクト
npm install

# Cloud Functions
cd functions
npm install
cd ..
```

### 2. Firebase にログイン

```bash
firebase login
```

### 3. Vercel 環境変数設定

Vercel ダッシュボードで以下の環境変数を設定:

```bash
# Firebase 設定（公開情報）
FIREBASE_API_KEY=<Firebase API Key>
FIREBASE_AUTH_DOMAIN=furniture-house-1.firebaseapp.com
FIREBASE_PROJECT_ID=furniture-house-1
FIREBASE_STORAGE_BUCKET=furniture-house-1.appspot.com
FIREBASE_MESSAGING_SENDER_ID=<Messaging Sender ID>
FIREBASE_APP_ID=<App ID>

# Stripe 設定
STRIPE_PUBLIC_KEY=<Stripe公開可能キー>
STRIPE_SECRET_KEY=<Stripeシークレットキー>
STRIPE_WEBHOOK_SECRET=<Stripe Webhookシークレット>

# 内部API認証（Stripe Webhook Secretと同じでOK）
INTERNAL_API_SECRET=<StripeのWebhookシークレットと同じ値>

# メール送信設定
EMAIL_USER=<Gmail address>
EMAIL_PASSWORD=<Gmailアプリパスワード>
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp

# Firebase Admin SDK（サーバーサイド専用）
FIREBASE_ADMIN_KEY=<Service Account Key>
FIREBASE_CLIENT_EMAIL=<Service Account Email>
FIREBASE_PRIVATE_KEY=<Private Key（改行を\\nに置換）>

# サイトURL
SITE_URL=https://booking.furniturehouse1.com
BRAND_SITE_URL=https://furniturehouse1.com
```

### 4. Cloud Functions の環境変数設定

```bash
# メール送信用のGmail認証情報を設定
firebase functions:secrets:set EMAIL_USER
# 入力: your_email@gmail.com

firebase functions:secrets:set EMAIL_PASSWORD
# 入力: Gmail アプリパスワード（16桁）

firebase functions:secrets:set EMAIL_REPLY_TO
# 入力: furniturehouse1@chladni.co.jp
```

### 5. Firestore & Functions デプロイ

```bash
# Firestoreルールとインデックスをデプロイ
firebase deploy --only firestore

# Cloud Functions をビルド＆デプロイ
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 6. デフォルトメールテンプレート投入

```bash
# .envファイルが設定されていることを確認
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json

npm run seed:email-templates
```

---

## 動作確認

### 1. Firebase Console で確認

https://console.firebase.google.com/ にアクセス

1. **Firestore** → 新しいコレクションが作成されているか確認:
   - `adminInvitations`
   - `emailSchedules`
   - `emailTemplates`（seedスクリプトで4件作成される）
   - `sentEmails`

2. **Functions** → `sendScheduledEmails` が表示されているか確認
   - スケジュール: `0 9 * * *`
   - タイムゾーン: `Asia/Tokyo`
   - リージョン: `asia-northeast1`

### 2. Cloud Function のテスト実行

```bash
# Firebase Console の Functions ページで手動実行
# または CLI から:
firebase functions:shell
> sendScheduledEmails()
```

### 3. ログ確認

```bash
firebase functions:log --only sendScheduledEmails --limit 10
```

期待される出力:
```
✅ スケジュールメール送信開始
✅ 有効なスケジュール数: X
✅ スケジュールメール送信完了
```

---

## API 動作確認（Postman / curl）

### 管理者招待 API テスト

```bash
# 1. 管理者としてログイン（Firebase Auth）
# 2. ID Token を取得
# 3. 招待API を呼び出し

curl -X POST https://booking.furniturehouse1.com/api/admin/invite \
  -H "Authorization: Bearer YOUR_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "newadmin@example.com"}'
```

成功レスポンス:
```json
{
  "success": true,
  "invitationId": "abc123",
  "message": "招待メールを送信しました"
}
```

### メールテンプレート一覧取得

```bash
curl https://booking.furniturehouse1.com/api/admin/email-templates \
  -H "Authorization: Bearer YOUR_ID_TOKEN"
```

成功レスポンス:
```json
{
  "success": true,
  "templates": [
    {
      "id": "template1",
      "name": "1週間前リマインダー",
      "type": "checkin_reminder",
      ...
    }
  ]
}
```

---

## トラブルシューティング

### エラー: "Failed to configure secret"

**解決策**:
```bash
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
firebase functions:secrets:set EMAIL_REPLY_TO
```

### エラー: "Billing account not configured"

**解決策**:
```bash
# Firebase Blaze プラン（従量課金）に移行
firebase projects:list
firebase billing:link PROJECT_ID
```

### エラー: "Permission denied" (Firestore Rules)

**解決策**:
```bash
# Firestoreルールを再デプロイ
firebase deploy --only firestore:rules
```

### メールが送信されない

**チェック項目**:
1. ✅ Gmail アプリパスワードが正しいか
2. ✅ Gmail の2段階認証が有効か
3. ✅ Cloud Functions の環境変数が設定されているか
4. ✅ `emailSchedules` コレクションにデータがあり `enabled: true` か
5. ✅ 対象の `bookings` が存在するか

---

## 次のステップ

1. ✅ デプロイ完了
2. ⏳ 管理画面で最初のメールスケジュールを作成
3. ⏳ テスト予約を作成して自動メール送信をテスト
4. ⏳ フロントエンド UI の実装（将来のタスク）

---

## 参考ドキュメント

- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - **環境変数完全リファレンス**
- [ADMIN_MULTI_EMAIL_IMPLEMENTATION.md](ADMIN_MULTI_EMAIL_IMPLEMENTATION.md) - 詳細実装レポート
- [FIREBASE_FUNCTIONS_SETUP.md](FIREBASE_FUNCTIONS_SETUP.md) - Cloud Functions セットアップガイド
- [VERCEL_SETUP.md](VERCEL_SETUP.md) - Vercel 環境変数設定ガイド
- [SECURITY.md](SECURITY.md) - セキュリティドキュメント

---

## サポート

問題が発生した場合は、以下のログを確認してください:

```bash
# Cloud Functions ログ
firebase functions:log --only sendScheduledEmails

# Vercel デプロイログ
vercel logs

# Firestore ルールテスト
firebase emulators:start --only firestore
```
