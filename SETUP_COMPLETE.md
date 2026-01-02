# 環境設定完了レポート

本番環境（https://booking.furniturehouse1.com/）と開発環境の設定見直しが完了しました。

## 実施した変更

### 1. 環境変数ファイルの整理 ✅

#### 変更前の問題
- `.env` に実際の認証情報が含まれていた
- 本番用と開発用の環境変数が混在
- `.gitignore` に不足があった

#### 変更後
- **[.env.example](./.env.example)**: テンプレートファイル（リポジトリにコミット可能）
- **`.env`**: 実際の開発環境用（`.gitignore`に含まれる）
- **`.env.production`**: 本番環境用（`.gitignore`に含まれる）※Vercelでは未使用

#### セキュリティ強化
```diff
+ # .gitignore に追加
+ .env
+ .env.production
```

実際の認証情報は `.env` ファイルに保存され、リポジトリにはコミットされません。

### 2. Vercel環境変数設定ガイド作成 ✅

**[VERCEL_SETUP.md](./VERCEL_SETUP.md)** を作成しました。

含まれる内容:
- Firebase Admin SDK のセットアップ手順
- Stripe 本番キーの取得方法
- Gmail アプリパスワードの生成手順
- Vercel環境変数の設定方法（画面付き手順）
- トラブルシューティング

### 3. デプロイ環境の統一 ✅

**Vercelを本番環境として統一**しました。

#### 変更内容
- Firebase Hosting設定を `firebase.json` から削除
- Firebaseは**データベース専用**として使用
- Vercel Serverless Functionsでサーバーサイド処理

#### 作成したドキュメント
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: デプロイ手順とトラブルシューティング
- **[README.md](./README.md)**: プロジェクト全体の説明
- **[PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)**: 本番デプロイ前のチェックリスト

### 4. メール設定の本番環境対応 ✅

#### 変更点
- 送信元メールアドレスを環境変数から取得
- `from` フィールドに表示名を追加: `"家具の家 No.1" <furniturehouse1@chladni.co.jp>`
- `replyTo` フィールドを追加
- メールフッターに問い合わせ先を明記

#### ファイル変更
- [server/api/emails/send-booking-confirmation.post.ts](./server/api/emails/send-booking-confirmation.post.ts)

```typescript
const mailOptions = {
  from: `"家具の家 No.1" <${senderEmail}>`,
  to,
  replyTo: senderEmail,
  // ...
}
```

### 5. Firebase設定の確認と最適化 ✅

#### 確認済み項目
- ✅ Firestoreセキュリティルールが適切に設定されている
- ✅ インデックスが最適化されている
- ✅ クライアントサイドのFirebase初期化が正常
- ✅ サーバーサイドのFirebase Admin SDK設定が準備されている

#### Firebase用途の明確化
```
Firebase Firestore: データベース（予約、ユーザー、カレンダーなど）
Firebase Storage: ファイルストレージ（将来の画像アップロード用）
Firebase Auth: ユーザー認証（将来実装予定）
```

## 次のステップ：本番デプロイ

### 必要な作業（手動）

以下の作業は自動化できないため、手動で実施してください：

#### 1. Firebase Admin SDKサービスアカウントキー取得

```bash
# 1. Firebase Console でサービスアカウントキーを生成
# https://console.firebase.google.com/project/furniture-house-1/settings/serviceaccounts

# 2. ダウンロードしたJSONファイルをBase64エンコード
base64 -i furniture-house-1-xxxxxxxx.json | tr -d '\n' > firebase-admin-key-base64.txt

# 3. 生成された文字列をコピー
cat firebase-admin-key-base64.txt
```

#### 2. Stripe本番キー取得

1. Stripe Dashboard: https://dashboard.stripe.com/
2. 右上のトグルを**本番モード**に切り替え
3. **開発者** → **APIキー** で以下を取得:
   - 公開可能キー: `pk_live_xxxxx`
   - シークレットキー: `sk_live_xxxxx`

#### 3. Stripe Webhook設定

1. **開発者** → **Webhook**
2. エンドポイントを追加:
   - URL: `https://booking.furniturehouse1.com/api/stripe/webhook`
   - イベント: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
3. 署名シークレット (`whsec_xxxxx`) をコピー

#### 4. Gmail アプリパスワード生成

1. Google アカウント: https://myaccount.google.com/apppasswords
2. `furniturehouse1@chladni.co.jp` でログイン
3. アプリパスワードを生成（16桁）

#### 5. Vercel環境変数設定

Vercel Dashboard で以下を設定:

```
# Firebase
FIREBASE_API_KEY=AIzaSyA0oO1xQhozKkQOGMRvqR3S8oU_GDQGs6o
FIREBASE_AUTH_DOMAIN=furniture-house-1.firebaseapp.com
FIREBASE_PROJECT_ID=furniture-house-1
FIREBASE_STORAGE_BUCKET=furniture-house-1.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1004954057756
FIREBASE_APP_ID=1:1004954057756:web:afc1fa619449d84ec333d9

# Firebase Admin SDK
FIREBASE_ADMIN_KEY=[手順1で生成したBase64文字列]

# Stripe
STRIPE_PUBLIC_KEY=pk_live_[手順2で取得]
STRIPE_SECRET_KEY=sk_live_[手順2で取得]
STRIPE_WEBHOOK_SECRET=whsec_[手順3で取得]

# メール
EMAIL_USER=furniturehouse1@chladni.co.jp
EMAIL_PASSWORD=[手順4で生成したアプリパスワード]

# サイト
SITE_URL=https://booking.furniturehouse1.com
BRAND_SITE_URL=https://furniturehouse1.com
```

#### 6. デプロイ

```bash
# 本番デプロイ
vercel --prod
```

### 詳細な手順

詳しい手順は以下のドキュメントを参照してください：

- **本番デプロイ手順**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)
- **Vercel設定**: [VERCEL_SETUP.md](./VERCEL_SETUP.md)
- **デプロイ全般**: [DEPLOYMENT.md](./DEPLOYMENT.md)

## ファイル構成

### 新規作成ファイル

| ファイル | 説明 |
|---------|------|
| [.env.example](./.env.example) | 環境変数テンプレート |
| [VERCEL_SETUP.md](./VERCEL_SETUP.md) | Vercel環境変数設定ガイド |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | デプロイ手順とトラブルシューティング |
| [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) | 本番デプロイチェックリスト |
| [README.md](./README.md) | プロジェクト全体の説明 |
| [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) | このファイル |

### 更新ファイル

| ファイル | 変更内容 |
|---------|---------|
| [.gitignore](./.gitignore) | `.env`, `.env.production` を追加 |
| [firebase.json](./firebase.json) | Hosting設定を削除（Firestoreのみ） |
| [server/api/emails/send-booking-confirmation.post.ts](./server/api/emails/send-booking-confirmation.post.ts) | メール送信設定を本番対応 |

### 削除ファイル

- `.env.production.template` (`.env.example` に統合)

## セキュリティチェック ✅

- ✅ `.env` ファイルが `.gitignore` に含まれている
- ✅ Firebase サービスアカウントキーがリポジトリに含まれていない
- ✅ 実際の認証情報がコードにハードコードされていない
- ✅ Firestoreセキュリティルールが適切に設定されている

## 環境の役割

| 環境 | URL | 用途 | Firebase | Stripe |
|------|-----|------|----------|--------|
| 開発 | http://localhost:3001 | ローカル開発 | furniture-house-1 | テストモード |
| プレビュー | *.vercel.app | PR確認 | furniture-house-1 | テストモード |
| 本番 | https://booking.furniturehouse1.com | 実運用 | furniture-house-1 | **本番モード** |

## 完了した設定 ✅

- [x] 環境変数ファイルの整理とセキュリティ強化
- [x] .gitignore の更新
- [x] 本番環境用の環境変数テンプレート作成
- [x] Vercel環境変数の設定ガイド作成
- [x] Firebase設定の確認と最適化
- [x] メール設定の本番環境対応
- [x] デプロイ環境の統一（Vercel統一）

## サポート

問題が発生した場合:

1. [DEPLOYMENT.md](./DEPLOYMENT.md) のトラブルシューティングを確認
2. [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) で設定を再確認
3. Vercel / Firebase / Stripe の各ダッシュボードでログを確認

---

**次は**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) を見ながら本番デプロイを進めてください！
