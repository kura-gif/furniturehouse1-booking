# デプロイ環境について

## 本番環境

**プラットフォーム**: Vercel  
**本番URL**: https://booking.furniturehouse1.com/  
**管理者メール**: furniturehouse1@chladni.co.jp

### なぜVercelなのか

1. **Nuxt 3との親和性が高い**
   - Nuxtの開発元が推奨するデプロイ先
   - SSR（サーバーサイドレンダリング）が完全サポート
   - エッジファンクションの活用

2. **簡単な環境変数管理**
   - ダッシュボードで環境変数を一元管理
   - Production / Preview / Development の環境分離

3. **自動デプロイ**
   - Gitプッシュで自動デプロイ
   - プレビュー環境の自動生成

4. **カスタムドメイン対応**
   - `booking.furniturehouse1.com` の設定が簡単
   - SSL証明書の自動更新

## Firebase の役割

Firebaseは**データベース専用**として使用します。

### Firebase で使用するサービス

1. **Firestore**: データベース（予約、ユーザー、カレンダーなど）
2. **Storage**: ファイルストレージ（将来的に画像アップロード用）
3. **Authentication**: ユーザー認証（将来的に実装予定）

### Firebase で使用しないサービス

- ❌ **Firebase Hosting**: 使用しない（Vercelを使用）
- ❌ **Cloud Functions**: 使用しない（Vercel Serverless Functionsを使用）

## デプロイ手順

### 初回セットアップ

1. **Vercelプロジェクト作成**
   ```bash
   # Vercel CLIをインストール（未インストールの場合）
   npm i -g vercel
   
   # Vercelにログイン
   vercel login
   
   # プロジェクトをリンク
   vercel link
   ```

2. **環境変数設定**
   
   [VERCEL_SETUP.md](./VERCEL_SETUP.md) を参照して、Vercel Dashboardで環境変数を設定

3. **カスタムドメイン設定**
   
   Vercel Dashboard → Settings → Domains → `booking.furniturehouse1.com` を追加

### 通常のデプロイ

#### 本番環境へのデプロイ

```bash
# main ブランチにマージすると自動デプロイ
git checkout main
git merge develop
git push origin main
```

または手動デプロイ:

```bash
vercel --prod
```

#### プレビュー環境（開発確認用）

```bash
# feature ブランチをプッシュすると自動でプレビュー環境が作成される
git push origin feature/new-feature
```

## Firebase設定（データベース側）

### Firestoreルールのデプロイ

```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# Firestoreルールをデプロイ
firebase deploy --only firestore:rules

# Firestoreインデックスをデプロイ
firebase deploy --only firestore:indexes
```

### セキュリティルールの確認

本番環境デプロイ前に必ず確認:

```bash
# Firebase Console でルールをテスト
https://console.firebase.google.com/project/furniture-house-1/firestore/rules
```

## 環境の分離

| 環境 | URL | Firebase | Stripe | 用途 |
|------|-----|----------|--------|------|
| 開発 | http://localhost:3001 | furniture-house-1 | テストモード | ローカル開発 |
| プレビュー | https://furniturehouse1-*.vercel.app | furniture-house-1 | テストモード | PR確認用 |
| 本番 | https://booking.furniturehouse1.com | furniture-house-1 | 本番モード | 実運用 |

## トラブルシューティング

### ビルドエラー

```bash
# ローカルでビルドを確認
npm run build

# Vercelのビルドログを確認
vercel logs
```

### 環境変数が反映されない

1. Vercel Dashboard で環境変数を確認
2. 環境変数を更新した場合は再デプロイ必須
   ```bash
   vercel --prod --force
   ```

### Firebase接続エラー

1. Firebase Admin SDK の環境変数を確認
2. サービスアカウントキーが正しいか確認
   ```bash
   # Base64デコードして確認
   echo $FIREBASE_ADMIN_KEY | base64 -d | jq
   ```

## 参考リンク

- [Vercel Dashboard](https://vercel.com/)
- [Firebase Console](https://console.firebase.google.com/)
- [Vercel環境変数設定ガイド](./VERCEL_SETUP.md)
