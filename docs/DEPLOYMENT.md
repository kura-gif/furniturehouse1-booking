# デプロイメントガイド - 家具の家 No.1

このドキュメントでは、Studioを使わずに別サーバーにサイトをデプロイする方法を説明します。

## 概要

このプロジェクトは、Nuxt 3で構築された完全に独立したWebアプリケーションです。Studioのデザインを完全に再現しており、以下の任意のホスティングサービスにデプロイできます。

## 技術スタック

- **フレームワーク**: Nuxt 3
- **スタイリング**: Tailwind CSS + カスタムCSS
- **バックエンド**: Firebase (Firestore, Authentication)
- **決済**: Stripe
- **言語**: TypeScript
- **Node.js**: v18以上推奨

## デプロイオプション

### オプション1: Vercel（推奨）

最も簡単で高速なデプロイ方法です。

#### 手順

1. **Vercelアカウント作成**
   - [Vercel](https://vercel.com/)にアクセスしてサインアップ

2. **プロジェクトをGitHubにプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Vercelでインポート**
   - Vercel Dashboard → "New Project"
   - GitHubリポジトリを選択
   - Framework Preset: "Nuxt.js"を自動検出
   - 環境変数を設定（後述）
   - "Deploy"をクリック

4. **カスタムドメイン設定**
   - Project Settings → Domains
   - カスタムドメインを追加
   - DNSレコードを設定

#### 環境変数

Vercel Dashboard → Project Settings → Environment Variablesで以下を設定:

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
- サーバー再起動

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
