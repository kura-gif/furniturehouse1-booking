# 環境変数リファレンス

**最終更新**: 2026年1月20日

このドキュメントは、プロジェクト全体で使用される環境変数の完全なリストです。

## 概要

環境変数は以下の3つの場所で設定されます：

1. **Vercel** - Nuxt アプリケーション（サーバーサイド＆クライアントサイド）
2. **Firebase Cloud Functions** - スケジュールメール送信などのバックグラウンドタスク
3. **ローカル開発** - `.env` ファイル（Git管理対象外）

---

## 1. Vercel 環境変数

Vercel ダッシュボード → Settings → Environment Variables で設定

### Firebase 設定（公開情報）

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `FIREBASE_API_KEY` | Firebase API キー | ✅ | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth ドメイン | ✅ | `furniture-house-1.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase プロジェクトID | ✅ | `furniture-house-1` |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage バケット | ✅ | `furniture-house-1.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | ✅ | `123456789012` |
| `FIREBASE_APP_ID` | Firebase App ID | ✅ | `1:123456789012:web:abcdef123456` |

### Stripe 設定

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `STRIPE_PUBLIC_KEY` | Stripe公開可能キー（クライアントサイド） | ✅ | `pk_live_XXXXXXXXXXXXXXXXXXXX` |
| `STRIPE_SECRET_KEY` | Stripeシークレットキー（サーバーサイド） | ✅ | `sk_live_XXXXXXXXXXXXXXXXXXXX` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhookシークレット | ✅ | `whsec_XXXXXXXXXXXXXXXXXXXX` |

### 内部API認証

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `INTERNAL_API_SECRET` | 内部API呼び出し用シークレット | ✅ | 独自に生成した値 |

**重要**: `INTERNAL_API_SECRET` は、Nuxt内部のAPI間での認証に使用されます。セキュリティのため、`STRIPE_WEBHOOK_SECRET` とは異なる独立した値を設定してください。

**生成方法**:
```bash
openssl rand -base64 32
```

### メール送信設定

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `EMAIL_USER` | Gmail アカウント（SMTP認証用） | ✅ | `your_email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail アプリパスワード | ✅ | `xxxx xxxx xxxx xxxx` |
| `EMAIL_REPLY_TO` | 返信先メールアドレス | ✅ | `furniturehouse1@chladni.co.jp` |

**Gmail アプリパスワードの取得方法:**
1. Google アカウントにログイン
2. https://myaccount.google.com/apppasswords にアクセス
3. 「アプリを選択」→「その他（カスタム名）」を選択
4. 名前を入力（例: Vercel Deployment）
5. 「生成」をクリック
6. 表示された16桁のパスワードをコピー

### Firebase Admin SDK（サーバーサイド専用）

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `FIREBASE_ADMIN_KEY` | Service Account Key（JSON全体ではなくproject_idなどの値） | ✅ | `furniture-house-1` |
| `FIREBASE_CLIENT_EMAIL` | Service Account Email | ✅ | `firebase-adminsdk-xxxxx@furniture-house-1.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Private Key（改行を `\\n` に置換） | ✅ | `-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n` |

**注**: Firebase Admin SDK の認証情報は、サーバーサイドでのFirestore書き込みなどに必要です。

### サイトURL

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `SITE_URL` | 予約サイトのURL | ✅ | `https://booking.furniturehouse1.com` |
| `BRAND_SITE_URL` | ブランドサイトのURL | ✅ | `https://furniturehouse1.com` |

---

## 2. Firebase Cloud Functions 環境変数

Firebase Functions Secrets を使用して設定

### メール送信設定

```bash
firebase functions:secrets:set EMAIL_USER
# 入力: your_email@gmail.com

firebase functions:secrets:set EMAIL_PASSWORD
# 入力: Gmail アプリパスワード（16桁）

firebase functions:secrets:set EMAIL_REPLY_TO
# 入力: furniturehouse1@chladni.co.jp
```

**注**: Cloud Functions は Firebase Admin SDK を自動初期化するため、Firebaseの認証情報は不要です。

---

## 3. ローカル開発環境変数

プロジェクトルートの `.env` ファイルに設定（Git管理対象外）

### 最小限の設定例

```bash
# Firebase 設定
FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
FIREBASE_AUTH_DOMAIN=furniture-house-1.firebaseapp.com
FIREBASE_PROJECT_ID=furniture-house-1
FIREBASE_STORAGE_BUCKET=furniture-house-1.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# Stripe 設定（テストモード）
STRIPE_PUBLIC_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXX

# 内部API認証
INTERNAL_API_SECRET=<STRIPE_WEBHOOK_SECRETと同じ値>

# メール送信設定
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp

# Firebase Admin SDK
FIREBASE_ADMIN_KEY=furniture-house-1
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@furniture-house-1.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"

# サイトURL
SITE_URL=http://localhost:3000
BRAND_SITE_URL=https://furniturehouse1.com
```

### スクリプト実行用の追加設定

メールテンプレート投入スクリプト（`npm run seed:email-templates`）を実行する場合:

```bash
# Service Account Key のパス
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
```

**注**: Service Account Key は Firebase Console → Project Settings → Service Accounts → Generate New Private Key からダウンロードできます。

---

## 4. 環境変数の優先順位

`nuxt.config.ts` での読み込み優先順位:

```typescript
runtimeConfig: {
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  emailUser: process.env.EMAIL_USER || '',
  // ...
}
```

1. **Vercel環境変数** - 本番環境
2. **`.env` ファイル** - ローカル開発
3. **デフォルト値（空文字列）** - フォールバック

---

## 5. セキュリティ注意事項

### 公開してはいけない変数

- ❌ `STRIPE_SECRET_KEY`
- ❌ `STRIPE_WEBHOOK_SECRET`
- ❌ `INTERNAL_API_SECRET`
- ❌ `EMAIL_PASSWORD`
- ❌ `FIREBASE_PRIVATE_KEY`
- ❌ `FIREBASE_ADMIN_KEY`
- ❌ Service Account Key JSON

### 公開しても良い変数

- ✅ `FIREBASE_API_KEY`（Firebase SDK用、ドメイン制限で保護）
- ✅ `FIREBASE_PROJECT_ID`
- ✅ `STRIPE_PUBLIC_KEY`（`pk_`で始まるキー）
- ✅ `SITE_URL`

### Git管理

- `.env` ファイルは `.gitignore` に含まれています
- `.env.example` にサンプルを記載（実際の値は含めない）

---

## 6. トラブルシューティング

### エラー: "FIREBASE_API_KEY is not defined"

**原因**: Vercel環境変数が設定されていない

**解決方法**:
1. Vercel ダッシュボード → Settings → Environment Variables
2. すべての必須変数を追加
3. Redeploy

### エラー: "Invalid login" (メール送信)

**原因**: Gmail アプリパスワードが間違っている、または2段階認証が有効になっていない

**解決方法**:
1. Gmail の2段階認証を有効化
2. アプリパスワードを再生成
3. `EMAIL_USER` と `EMAIL_PASSWORD` を再設定

### エラー: "Stripe webhook signature verification failed"

**原因**: `STRIPE_WEBHOOK_SECRET` が間違っている

**解決方法**:
1. Stripe Dashboard → Developers → Webhooks
2. Webhook の「Signing secret」をコピー
3. Vercel環境変数 `STRIPE_WEBHOOK_SECRET` を更新
4. Redeploy

### Cloud Functions: "Failed to configure secret"

**原因**: Firebase Functions Secrets が設定されていない

**解決方法**:
```bash
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
firebase functions:secrets:set EMAIL_REPLY_TO
```

---

## 7. 環境変数の確認方法

### ローカル環境

```bash
# .envファイルの内容を確認
cat .env

# Nuxtアプリ内で確認（開発サーバー起動時）
npm run dev
# ブラウザのコンソールで: console.log(useRuntimeConfig().public)
```

### Vercel環境

```bash
# Vercel CLIで確認
vercel env ls

# 特定の環境変数を取得
vercel env pull .env.local
```

### Firebase Functions

```bash
# シークレットのリストを確認
firebase functions:secrets:access EMAIL_USER
```

---

## 8. チェックリスト

デプロイ前に以下を確認:

- [ ] Vercel環境変数がすべて設定されている
- [ ] Firebase Functions Secretsが設定されている
- [ ] Gmail アプリパスワードが正しい
- [ ] Stripe Webhook Secretが正しい
- [ ] `INTERNAL_API_SECRET` が設定されている（または `STRIPE_WEBHOOK_SECRET` と同じ）
- [ ] Firebase Admin SDK の認証情報が正しい
- [ ] サイトURLが本番URLに設定されている
- [ ] `.env` ファイルが `.gitignore` に含まれている

---

## 参考ドキュメント

- [QUICK_DEPLOYMENT_GUIDE.md](QUICK_DEPLOYMENT_GUIDE.md) - デプロイ手順
- [FIREBASE_FUNCTIONS_SETUP.md](FIREBASE_FUNCTIONS_SETUP.md) - Cloud Functions セットアップ
- [VERCEL_SETUP.md](VERCEL_SETUP.md) - Vercel 設定ガイド
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env)
