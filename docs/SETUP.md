# GitHub Actions 自動デプロイセットアップ手順

## 📋 概要

このガイドに従って、GitHub ActionsによるVercelへの自動デプロイを設定します。

## ✅ 前提条件

- GitHubアカウント
- Vercelアカウント
- GitHubリポジトリ: https://github.com/kura-gif/furniturehouse1-booking

---

## 🚀 セットアップ手順

### ステップ1: Vercel トークンを取得

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/ にログイン

2. **トークン作成ページへ移動**
   - 右上のアカウントアイコン → Settings
   - 左メニューから「Tokens」を選択
   - または直接: https://vercel.com/account/tokens

3. **新しいトークンを作成**
   - 「Create Token」ボタンをクリック
   - Token Name: `GitHub Actions Deploy` (任意の名前)
   - Scope: **Full Account** を選択
   - Expiration: **No Expiration** を選択（推奨）
   - 「Create Token」をクリック

4. **トークンをコピー**
   - 🚨 **重要**: 表示されたトークンをコピー（二度と表示されません）
   - トークン例: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### ステップ2: GitHub Secrets にトークンを設定

1. **GitHubリポジトリの設定ページへ**
   - https://github.com/kura-gif/furniturehouse1-booking
   - 上部メニューから「Settings」タブをクリック

2. **Secretsページへ移動**
   - 左メニューから「Secrets and variables」→「Actions」を選択
   - または直接: https://github.com/kura-gif/furniturehouse1-booking/settings/secrets/actions

3. **新しいSecretを追加**
   - 「New repository secret」ボタンをクリック
   - Name: `VERCEL_TOKEN`（正確にこの名前）
   - Secret: ステップ1でコピーしたトークンを貼り付け
   - 「Add secret」をクリック

4. **確認**
   - `VERCEL_TOKEN` がSecrets一覧に表示されていればOK

---

### ステップ3: Vercel プロジェクトに環境変数を設定

#### オプション1: Vercel ダッシュボードから手動設定

1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/yoichi-kurashimas-projects/furniturehouse1

2. **設定ページへ移動**
   - プロジェクトを選択
   - 上部メニューから「Settings」タブ
   - 左メニューから「Environment Variables」

3. **環境変数を追加**
   以下の変数を**Production**環境に設定:

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
   - `FIREBASE_ADMIN_KEY`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

   **Email**
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `EMAIL_REPLY_TO`

   **その他**
   - `INTERNAL_API_SECRET`
   - `SITE_URL`
   - `BRAND_SITE_URL`

---

### ステップ4: 自動デプロイをテスト

1. **変更をコミット**
   ```bash
   git add .
   git commit -m "test: setup GitHub Actions auto deploy"
   ```

2. **mainブランチにプッシュ**
   ```bash
   git push origin main
   ```

3. **GitHub Actionsで確認**
   - https://github.com/kura-gif/furniturehouse1-booking/actions
   - 「Deploy to Vercel」ワークフローが実行中になる
   - ✅ 緑色のチェックマークが表示されれば成功

4. **Vercelで確認**
   - https://vercel.com/yoichi-kurashimas-projects/furniturehouse1
   - 新しいデプロイが表示される
   - 本番URL: https://furniturehouse1-booking.vercel.app/

---

## 🎯 使い方

### 自動デプロイ（推奨）

```bash
# 変更をコミット
git add .
git commit -m "feat: add new feature"

# mainブランチにプッシュ → 自動デプロイ開始
git push origin main
```

### デプロイの流れ

1. `main`ブランチにpush
2. GitHub Actionsが自動実行
3. Vercelにビルド & デプロイ
4. 3-5分後に本番環境に反映

---

## 🔍 トラブルシューティング

### エラー1: "VERCEL_TOKEN is not set"

**原因**: GitHub Secretsにトークンが設定されていない

**解決方法**:
1. https://github.com/kura-gif/furniturehouse1-booking/settings/secrets/actions
2. `VERCEL_TOKEN`が存在するか確認
3. なければステップ2を再実行

---

### エラー2: "Failed to build"

**原因**: 環境変数が設定されていない、またはビルドエラー

**解決方法**:
1. Vercelダッシュボードで環境変数を確認
2. GitHub Actionsのログを確認:
   - https://github.com/kura-gif/furniturehouse1-booking/actions
   - 失敗したワークフローをクリック
   - エラーメッセージを確認

---

### エラー3: "Deployment failed"

**原因**: Vercelプロジェクトの設定ミス

**解決方法**:
1. ローカルで`vercel link`を実行
2. プロジェクトが正しくリンクされているか確認
3. `vercel --prod`で手動デプロイしてエラーを確認

---

## 📊 デプロイ状況の確認

### GitHub Actions
- https://github.com/kura-gif/furniturehouse1-booking/actions
- ワークフローの実行履歴を確認

### Vercel Dashboard
- https://vercel.com/yoichi-kurashimas-projects/furniturehouse1
- デプロイ履歴、ログ、パフォーマンスを確認

### 本番サイト
- https://furniturehouse1-booking.vercel.app/

---

## 🔐 セキュリティのベストプラクティス

1. **VERCEL_TOKENは絶対に公開しない**
   - GitHubリポジトリにコミットしない
   - GitHub Secretsにのみ保存

2. **環境変数は.envに保存、Gitにコミットしない**
   - `.gitignore`に`.env`が含まれているか確認

3. **定期的にトークンをローテーション**
   - 3-6ヶ月ごとにVercelトークンを再発行

---

## 🎉 完了！

これでGitHub Actionsによる自動デプロイが設定されました。

**次回から**:
```bash
git push origin main
```
するだけで自動的に本番環境にデプロイされます！
