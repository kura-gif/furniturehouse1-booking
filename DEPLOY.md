# デプロイガイド

## 前提条件

- Node.js 20以上
- Vercelアカウント
- GitHubリポジトリ: https://github.com/kura-gif/furniturehouse1-booking

## 初回セットアップ

### 1. Vercel CLIをインストール

```bash
npm install --global vercel@latest
```

### 2. Vercelにログイン

```bash
vercel login
```

### 3. プロジェクトをVercelにリンク

```bash
vercel link
```

プロンプトに従って選択:
- **Scope**: 自分のアカウントを選択
- **Link to existing project?**: Yes
- **Project name**: furniturehouse1

### 4. 環境変数を設定

```.env```ファイルを作成し、必要な環境変数を設定した後:

```bash
./scripts/setup-env.sh
```

または手動で設定:

```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add FIREBASE_API_KEY production
# ... その他の環境変数
```

## デプロイ方法

### 方法1: ローカルから手動デプロイ (推奨)

```bash
./scripts/deploy.sh
```

このスクリプトは以下を実行します:
1. ビルドキャッシュのクリア
2. Vercelプロジェクト情報の取得
3. プロジェクトのビルド
4. 本番環境へのデプロイ

### 方法2: GitHub経由で自動デプロイ

```bash
git add .
git commit -m "your message"
git push origin main
```

`main`ブランチにpushすると、GitHub Actionsが自動的に:
1. コードをビルド
2. Vercelにデプロイ

を実行します。

**注意**: GitHub Actionsを使用する場合は、GitHubリポジトリのSecretsに`VERCEL_TOKEN`を設定する必要があります。

### 方法3: Vercel CLIで直接デプロイ

```bash
vercel --prod
```

## GitHub Actionsの設定

### 必要なSecrets

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定:

1. **VERCEL_TOKEN**
   - Vercelダッシュボード: Settings > Tokens
   - "Create Token"をクリック
   - Scopeは"Full Account"を選択
   - 生成されたトークンをコピーしてGitHub Secretsに追加

## 環境変数一覧

本番環境に必要な環境変数:

### Stripe
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLIC_KEY`
- `STRIPE_WEBHOOK_SECRET`

### Firebase
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_ADMIN_KEY` (Base64エンコードされたサービスアカウントキー)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Email
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_REPLY_TO`

### その他
- `INTERNAL_API_SECRET`
- `SITE_URL` (例: https://furniturehouse1-booking.vercel.app)
- `BRAND_SITE_URL` (例: https://furniturehouse1.com)

## トラブルシューティング

### デプロイが失敗する場合

1. ビルドキャッシュをクリア:
```bash
rm -rf .nuxt .output .vercel
```

2. 環境変数を確認:
```bash
vercel env ls
```

3. ログを確認:
```bash
vercel logs
```

### 環境変数が反映されない場合

環境変数を更新した後は、再デプロイが必要です:

```bash
./scripts/deploy.sh
```

## デプロイの確認

デプロイ後、以下を確認:

1. **トップページ**: https://furniturehouse1-booking.vercel.app/
2. **予約ページ**: https://furniturehouse1-booking.vercel.app/booking/request
3. **Stripe Webhook**: Stripeダッシュボードで成功ステータスを確認
4. **Firebase**: Firestoreでデータが正しく保存されているか確認

## 注意事項

- `main`ブランチは本番環境に直結しています
- テストは必ずローカルまたはプレビュー環境で行ってください
- 環境変数は絶対にGitにコミットしないでください
