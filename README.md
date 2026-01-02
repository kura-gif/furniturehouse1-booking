# 家具の家 No.1 - 予約システム

坂茂の初期作品「家具の家 No.1」の宿泊予約システム

## 環境

- **本番環境**: https://booking.furniturehouse1.com/
- **ブランドサイト**: https://furniturehouse1.com/
- **管理者メール**: furniturehouse1@chladni.co.jp

## 技術スタック

- **フロントエンド**: Nuxt 3 + Vue 3 + Tailwind CSS
- **バックエンド**: Nuxt Server API
- **データベース**: Firebase Firestore
- **決済**: Stripe
- **メール送信**: Nodemailer (Gmail)
- **デプロイ**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
# .env.example をコピー
cp .env.example .env

# .env ファイルを編集して実際の値を設定
```

必要な環境変数:
- Firebase 設定（API Key, Project ID など）
- Stripe キー（テストモード）
- Gmail アプリパスワード

詳細は [.env.example](./.env.example) を参照

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3001 でアクセス

### 4. ビルド

```bash
# 本番用ビルド
npm run build

# プレビュー
npm run preview
```

## デプロイ

### 本番環境（Vercel）

詳細は [DEPLOYMENT.md](./DEPLOYMENT.md) を参照

```bash
# 本番デプロイ
vercel --prod
```

### Firebase（データベース設定のみ）

```bash
# Firestoreルールとインデックスをデプロイ
firebase deploy --only firestore
```

## 環境変数設定

### 開発環境

`.env` ファイルに設定（このファイルはgitignoreに含まれます）

### 本番環境（Vercel）

Vercel Dashboard で設定。詳細は [VERCEL_SETUP.md](./VERCEL_SETUP.md) を参照

必須の環境変数:
- `FIREBASE_*`: Firebase設定
- `FIREBASE_ADMIN_KEY`: Firebase Admin SDK認証（Base64エンコード）
- `STRIPE_PUBLIC_KEY`: Stripe公開キー（本番モード）
- `STRIPE_SECRET_KEY`: Stripeシークレットキー（本番モード）
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook署名シークレット
- `EMAIL_USER`: 送信元メールアドレス（furniturehouse1@chladni.co.jp）
- `EMAIL_PASSWORD`: Gmailアプリパスワード
- `SITE_URL`: サイトURL（https://booking.furniturehouse1.com）

## プロジェクト構成

```
.
├── assets/          # スタイル、画像などの静的アセット
├── components/      # Vueコンポーネント
├── pages/           # ページ（自動ルーティング）
├── plugins/         # Nuxtプラグイン（Firebase, Stripeなど）
├── server/          # サーバーサイドAPI
│   └── api/        # APIエンドポイント
├── public/          # 公開ファイル
├── firestore.rules  # Firestoreセキュリティルール
├── firestore.indexes.json  # Firestoreインデックス
└── nuxt.config.ts   # Nuxt設定
```

## 重要なファイル

- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイ手順
- [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Vercel環境変数設定
- [.env.example](./.env.example) - 環境変数テンプレート
- [firestore.rules](./firestore.rules) - Firestoreセキュリティルール

## セキュリティ

- `.env` ファイルは絶対にコミットしない
- Firebase サービスアカウントキーは `.gitignore` に含まれている
- 本番環境の秘密情報はVercel Dashboardで管理
- Firestoreセキュリティルールは本番デプロイ前に必ず確認

## サポート

問題が発生した場合は、[DEPLOYMENT.md](./DEPLOYMENT.md) のトラブルシューティングセクションを参照してください。

## ライセンス

All rights reserved © 2025 家具の家 No.1
