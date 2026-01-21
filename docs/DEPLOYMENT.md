# デプロイメントガイド - 家具の家 No.1

**最終更新**: 2026年1月20日

このドキュメントでは、サイトをデプロイする方法を説明します。

## 概要

このプロジェクトは、Nuxt 3で構築された完全に独立したWebアプリケーションです。以下の任意のホスティングサービスにデプロイできます。

## 前提条件

- Node.js 20以上
- GitHubリポジトリ: https://github.com/kura-gif/furniturehouse1-booking

## 技術スタック

- **フレームワーク**: Nuxt 3
- **スタイリング**: Tailwind CSS + カスタムCSS
- **バックエンド**: Firebase (Firestore, Authentication)
- **決済**: Stripe
- **言語**: TypeScript
- **Node.js**: v20以上推奨

## デプロイオプション

### オプション1: Vercel（推奨）

最も簡単で高速なデプロイ方法です。

#### 初回セットアップ

1. **Vercel CLIをインストール**
   ```bash
   npm install --global vercel@latest
   ```

2. **Vercelにログイン**
   ```bash
   vercel login
   ```

3. **プロジェクトをVercelにリンク**
   ```bash
   vercel link
   ```
   プロンプトに従って選択:
   - **Scope**: 自分のアカウントを選択
   - **Link to existing project?**: Yes
   - **Project name**: furniturehouse1

4. **環境変数を設定**
   `.env`ファイルを作成し、必要な環境変数を設定した後:
   ```bash
   ./scripts/setup-env.sh
   ```
   または手動で設定:
   ```bash
   vercel env add STRIPE_SECRET_KEY production
   vercel env add FIREBASE_API_KEY production
   # ... その他の環境変数
   ```

#### デプロイ前の環境変数検証

本番環境へのデプロイ前に、環境変数が正しく設定されているか確認できます：

```bash
# 本番環境用の環境変数を検証
npm run validate-env:prod
```

このスクリプトは以下を検証します：
- 必須環境変数の存在
- Firebase/Stripeキーの形式
- メール設定
- API秘密鍵の設定

#### デプロイ方法

**方法1: ローカルから手動デプロイ (推奨)**
```bash
./scripts/deploy.sh
```
このスクリプトは以下を実行します:
1. ビルドキャッシュのクリア
2. Vercelプロジェクト情報の取得
3. プロジェクトのビルド
4. 本番環境へのデプロイ

**方法2: GitHub経由で自動デプロイ**
```bash
git add .
git commit -m "your message"
git push origin main
```
`main`ブランチにpushすると、GitHub Actionsが自動的にビルド・デプロイを実行します。

**注意**: GitHub Actionsを使用する場合は、GitHubリポジトリのSecretsに`VERCEL_TOKEN`を設定する必要があります。

**方法3: Vercel CLIで直接デプロイ**
```bash
vercel --prod
```

#### GitHub Actionsの設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定:

1. **VERCEL_TOKEN**
   - Vercelダッシュボード: Settings > Tokens
   - "Create Token"をクリック
   - Scopeは"Full Account"を選択
   - 生成されたトークンをコピーしてGitHub Secretsに追加

#### Vercel環境変数

Vercel Dashboard → Project Settings → Environment Variablesで以下を設定:

**Stripe**
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLIC_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Firebase**
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`
- `FIREBASE_ADMIN_KEY` (Base64エンコードされたサービスアカウントキー)
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

**Email**
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_REPLY_TO`

**その他**
- `INTERNAL_API_SECRET`
- `SITE_URL` (例: https://furniturehouse1-booking.vercel.app)
- `BRAND_SITE_URL` (例: https://furniturehouse1.com)

#### カスタムドメイン設定
- Project Settings → Domains
- カスタムドメインを追加
- DNSレコードを設定

---

### オプション2: Netlify

Vercelと同様に簡単なデプロイが可能です。

#### 手順

1. **Netlifyアカウント作成**
   - [Netlify](https://www.netlify.com/)にサインアップ

2. **GitHubリポジトリと連携**
   - "Add new site" → "Import an existing project"
   - GitHubリポジトリを選択

3. **ビルド設定**
   - Build command: `npm run build`
   - Publish directory: `.output/public`
   - 環境変数を設定

4. **デプロイ**
   - "Deploy site"をクリック

---

### オプション3: 独自サーバー（VPS / 専用サーバー）

#### 必要なもの

- Ubuntu 20.04以上のサーバー
- Node.js v18以上
- PM2（プロセスマネージャー）
- Nginx（リバースプロキシ）

#### 手順

1. **サーバーにSSH接続**
   ```bash
   ssh user@your-server-ip
   ```

2. **Node.jsインストール**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **PM2インストール**
   ```bash
   sudo npm install -g pm2
   ```

4. **プロジェクトをクローン**
   ```bash
   cd /var/www
   git clone <your-repo-url> furniturehouse1
   cd furniturehouse1
   ```

5. **依存関係をインストール**
   ```bash
   npm install
   ```

6. **環境変数を設定**
   ```bash
   nano .env
   ```

   以下を記載:
   ```
   FIREBASE_API_KEY=your_firebase_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id

   STRIPE_PUBLIC_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx

   SITE_URL=https://yourdomain.com
   ```

7. **ビルド**
   ```bash
   npm run build
   ```

8. **PM2で起動**
   ```bash
   pm2 start npm --name "furniturehouse1" -- run preview
   pm2 save
   pm2 startup
   ```

9. **Nginx設定**
   ```bash
   sudo nano /etc/nginx/sites-available/furniturehouse1
   ```

   以下を記載:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   有効化:
   ```bash
   sudo ln -s /etc/nginx/sites-available/furniturehouse1 /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

10. **SSL証明書（Let's Encrypt）**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
    ```

---

### オプション4: Firebase Hosting

Firebaseを既に使用しているため、Firebase Hostingも選択肢です。

#### 手順

1. **Firebase CLIインストール**
   ```bash
   npm install -g firebase-tools
   ```

2. **ログイン**
   ```bash
   firebase login
   ```

3. **初期化**
   ```bash
   firebase init hosting
   ```

   設定:
   - Public directory: `.output/public`
   - Single-page app: Yes
   - GitHub自動デプロイ: 任意

4. **ビルド**
   ```bash
   npm run generate
   ```

5. **デプロイ**
   ```bash
   firebase deploy --only hosting
   ```

---

## 画像の配置

デプロイ前に、必ず画像ファイルを配置してください。

### 必要な画像

`public/images/` フォルダに以下の画像を配置:

- `hero-background.jpg` - トップページのメインビジュアル
- `gallery-1.jpg` ～ `gallery-6.jpg` - ギャラリー画像
- `ogp-image.jpg` - SNSシェア用サムネイル

詳細は [`docs/IMAGE_MANAGEMENT.md`](./IMAGE_MANAGEMENT.md) を参照。

---

## 環境変数の取得方法

### Firebase

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. プロジェクト設定 → "全般"
4. "マイアプリ"セクションでウェブアプリを選択
5. 設定オブジェクトをコピー

### Stripe

1. [Stripe Dashboard](https://dashboard.stripe.com/)にログイン
2. "開発者" → "APIキー"
3. 公開可能キーとシークレットキーをコピー
4. **本番環境では必ず本番用キーを使用してください**

---

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

### ビルドエラー

**エラー**: `Module not found`
- 解決策: `npm install`を再実行

**エラー**: `Tailwind CSS not loading`
- 解決策: `tailwind.config.js`が正しく配置されているか確認

### 画像が表示されない

- `public/images/`に画像が配置されているか確認
- ファイル名が`config/images.ts`と一致しているか確認
- ブラウザのキャッシュをクリア

### 環境変数が読み込まれない

- `.env`ファイルがプロジェクトルートにあるか確認
- Vercel/Netlifyの場合、ダッシュボードで環境変数を設定
- 環境変数を更新した後は、再デプロイが必要:
  ```bash
  ./scripts/deploy.sh
  ```

---

## デプロイの確認

デプロイ後、以下を確認:

1. **トップページ**: https://furniturehouse1-booking.vercel.app/
2. **予約ページ**: https://furniturehouse1-booking.vercel.app/booking/request
3. **ヘルスチェック**: https://furniturehouse1-booking.vercel.app/api/health
   - `status: "healthy"` が返ることを確認
4. **Stripe Webhook**: Stripeダッシュボードで成功ステータスを確認
5. **Firebase**: Firestoreでデータが正しく保存されているか確認
6. **運用ログ**: Firestore `operationLogs` コレクションにログが記録されているか確認

## 注意事項

- `main`ブランチは本番環境に直結しています
- テストは必ずローカルまたはプレビュー環境で行ってください
- 環境変数は絶対にGitにコミットしないでください

---

## パフォーマンス最適化

### 画像最適化

- WebP形式を使用
- 適切なサイズにリサイズ
- 圧縮ツール: [TinyPNG](https://tinypng.com/), [Squoosh](https://squoosh.app/)

### CDN設定

Vercel/Netlifyは自動でCDNを提供しますが、独自サーバーの場合はCloudflareの使用を推奨。

### キャッシング

Nginxの場合、静的ファイルのキャッシュ設定:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|webp)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## セキュリティ

### 本番環境チェックリスト

- [ ] 環境変数が`.env`ファイルに含まれていない（`.gitignore`に追加済み）
- [ ] Stripe本番用キーを使用
- [ ] Firebase Securityルールを設定
- [ ] HTTPS (SSL)を有効化
- [ ] CSRFトークン実装（Nuxtデフォルトで有効）
- [ ] Firebaseの認証ルールを厳格化

---

## サポート

問題が発生した場合は、以下を確認してください:

1. [`README.md`](../README.md) - プロジェクト概要
2. [`docs/IMAGE_MANAGEMENT.md`](./IMAGE_MANAGEMENT.md) - 画像管理ガイド
3. [Nuxt 3ドキュメント](https://nuxt.com/docs)
4. [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)

---

## まとめ

このプロジェクトは、Studioに依存せず、任意のホスティングサービスで動作する完全に独立したWebアプリケーションです。Vercelでの自動デプロイが最も簡単ですが、VPSでの完全なコントロールも可能です。

デプロイ後は、画像を配置し、環境変数を正しく設定することで、Studioと同じデザインのサイトが稼働します。
