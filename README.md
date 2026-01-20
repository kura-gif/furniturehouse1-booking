# 家具の家 No.1 - 予約システム

坂茂の初期作品「家具の家 No.1」の宿泊予約システム

## プロジェクト状態

| 項目 | 状態 |
|------|------|
| 開発Phase | Phase 2.5 完了 → Phase 3 準備中 |
| 本番公開予定 | 2026年2月6日 |
| セキュリティレベル | A+ |

## 環境

- **本番環境**: https://booking.furniturehouse1.com/
- **ブランドサイト**: https://furniturehouse1.com/
- **管理者メール**: furniturehouse1@chladni.co.jp

## 技術スタック

- **フロントエンド**: Nuxt 3 + Vue 3 + Tailwind CSS
- **バックエンド**: Nuxt Server API
- **データベース**: Firebase Firestore
- **決済**: Stripe（与信確保→承認方式）
- **メール送信**: Nodemailer (Gmail) + リトライ機能
- **デプロイ**: Vercel
- **監視**: Sentry（導入予定）

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

詳細は [DEPLOYMENT.md](./docs/DEPLOYMENT.md) を参照

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

Vercel Dashboard で設定。詳細は [docs/setup/ENVIRONMENT_VARIABLES.md](./docs/setup/ENVIRONMENT_VARIABLES.md) を参照

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

## 主要機能

### ゲスト向け
- ✅ 宿泊予約（カレンダー選択→ゲスト情報→決済）
- ✅ 予約確認・キャンセル（キャンセルポリシー連動返金）
- ✅ レビュー投稿
- ✅ ゲストガイド（WiFi、設備、周辺情報）
- ✅ メッセージ機能

### 管理者向け
- ✅ 予約審査（承認/却下）
- ✅ 清掃タスク管理・サポーター管理
- ✅ 動的料金設定・クーポン管理
- ✅ レビュー管理

### セキュリティ
- ✅ 並行処理競合対策（楽観的ロック）
- ✅ メール送信リトライ（指数バックオフ）
- ✅ 与信期限管理（自動Cron）
- ✅ CSRF保護・レート制限・入力バリデーション

## 重要なファイル

- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) - デプロイ手順
- [docs/PRODUCTION_LAUNCH_CHECKLIST.md](./docs/PRODUCTION_LAUNCH_CHECKLIST.md) - 本番公開チェックリスト
- [docs/setup/ENVIRONMENT_VARIABLES.md](./docs/setup/ENVIRONMENT_VARIABLES.md) - 環境変数設定
- [docs/SYSTEM_DESIGN_DOCUMENT.md](./docs/SYSTEM_DESIGN_DOCUMENT.md) - システム設計書
- [docs/OPERATIONS_MANUAL.md](./docs/OPERATIONS_MANUAL.md) - 運用マニュアル
- [docs/RELEASE_MANAGEMENT.md](./docs/RELEASE_MANAGEMENT.md) - 本番公開進行管理表
- [docs/CONSULTING_REPORT.md](./docs/CONSULTING_REPORT.md) - コンサルティングレポート
- [FEATURES.md](./FEATURES.md) - 実装済み機能一覧
- [SECURITY.md](./SECURITY.md) - セキュリティ対策
- [.env.example](./.env.example) - 環境変数テンプレート
- [firestore.rules](./firestore.rules) - Firestoreセキュリティルール

## セキュリティ

- `.env` ファイルは絶対にコミットしない
- Firebase サービスアカウントキーは `.gitignore` に含まれている
- 本番環境の秘密情報はVercel Dashboardで管理
- Firestoreセキュリティルールは本番デプロイ前に必ず確認

## サポート

問題が発生した場合は、[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) のトラブルシューティングセクションを参照してください。

## ライセンス

All rights reserved © 2026 家具の家 No.1
