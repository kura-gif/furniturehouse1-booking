# 🚀 本番デプロイ前チェックリスト

**実施日:** _______________
**実施者:** _______________

---

## ✅ Phase 1: セキュリティ実装（完了確認）

- [x] サーバーサイド金額検証実装
- [x] Firestore トランザクション予約作成
- [x] Stripe Webhook ハンドラー
- [x] レート制限実装
- [x] セキュリティヘッダー実装
- [x] 同日予約防止ロジック
- [x] メール送信機能実装
- [x] ローカル環境テスト完了（7項目すべてPASS）

---

## 📋 Phase 2: デプロイ前準備

### コード品質

- [ ] すべてのコードがGitにコミット済み
- [ ] `.env` ファイルがGitにコミットされていないことを確認
- [ ] `node_modules/` が `.gitignore` に含まれている
- [ ] 本番用秘密鍵ファイル（*.json, *-base64.txt）が `.gitignore` に含まれている
- [ ] TypeScriptエラーがない
  ```bash
  npm run build
  ```

### 依存関係

- [ ] `package.json` のすべての依存関係がインストール済み
  ```bash
  npm install
  ```
- [ ] 不要な dev dependencies がないか確認
- [ ] `package-lock.json` が最新

### セキュリティ

- [ ] ハードコードされた秘密情報がコードに含まれていない
  ```bash
  grep -r "sk_test_\|sk_live_\|seaezy\|AIzaSy" --exclude-dir=node_modules --exclude-dir=.git --exclude=.env .
  ```
- [ ] `console.log` で秘密情報を出力していない
- [ ] API エンドポイントに適切な認証がある

---

## 🔐 Firebase準備

### Firebaseプロジェクト確認

- [ ] Firebaseプロジェクト `furniture-house-1` が存在
- [ ] Firestore Database が有効化されている
- [ ] Firebase Authentication が有効化されている（Email/Password）
- [ ] ストレージが有効化されている（画像アップロード用）

### サービスアカウント作成

- [ ] Firebase Console → プロジェクト設定 → サービスアカウント
- [ ] 「新しい秘密鍵の生成」をクリック
- [ ] `furniture-house-1-xxxxx.json` をダウンロード
- [ ] Base64エンコード実施
  ```bash
  base64 -i furniture-house-1-xxxxx.json | tr -d '\n' > firebase-admin-key-base64.txt
  ```
- [ ] Base64文字列をコピー（後でVercelに設定）

### Firestore Security Rules

- [ ] `firestore.rules` の内容を確認
- [ ] デプロイ実施
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] デプロイ成功を確認

---

## 💳 Stripe準備

### Stripe本番モード有効化

- [ ] Stripe Dashboard にログイン
- [ ] 左上のトグルを「テスト」→「本番」に切り替え
- [ ] 事業情報の入力完了（初回のみ）
- [ ] 銀行口座情報の登録完了（売上受取用）

### API キー取得

- [ ] 「開発者」→「APIキー」を開く
- [ ] 公開可能キー（pk_live_xxxxx）をコピー
- [ ] シークレットキー（sk_live_xxxxx）をコピー
- [ ] ⚠️ テストキー（pk_test_/sk_test_）ではないことを確認

### Webhook設定（仮設定）

- [ ] 「開発者」→「Webhook」→「エンドポイントを追加」
- [ ] エンドポイントURL: `https://YOUR_DOMAIN.vercel.app/api/stripe/webhook`
  - ⚠️ ドメインは仮でOK、デプロイ後に正式URLに更新
- [ ] リッスンするイベント:
  - [x] `payment_intent.succeeded`
  - [x] `payment_intent.payment_failed`
  - [x] `charge.refunded`
- [ ] 署名シークレット（whsec_xxxxx）をコピー

---

## 📧 メール送信準備

### Gmail設定確認

- [ ] Gmailアカウント: `kura@chladni.co.jp` が有効
- [ ] アプリパスワードが有効（`seaezychzxzzcmsa`）
- [ ] 2段階認証が有効になっている
- [ ] テストメールが正常に送信された（Phase 1で確認済み）

### メール到達性確認

- [ ] 送信元アドレス: `kura@chladni.co.jp`
- [ ] 迷惑メールフォルダに入らないことを確認
- [ ] 必要に応じてSPF/DKIMレコード設定（独自ドメイン使用時）

---

## 🌐 GitHub準備

### リポジトリ確認

- [ ] GitHubリポジトリが作成済み
- [ ] リポジトリが Private に設定されている（推奨）
- [ ] すべてのコードがプッシュ済み
  ```bash
  git status
  git push origin main
  ```

### ブランチ戦略

- [ ] `main` ブランチが本番用
- [ ] 開発用ブランチ（`develop`）を作成済み（オプション）
- [ ] プロテクトブランチ設定済み（オプション）

---

## ☁️ Vercel準備

### Vercelアカウント

- [ ] Vercelアカウント作成済み
- [ ] GitHubアカウントと連携済み

### Vercelプロジェクト作成

- [ ] Vercel CLI インストール済み
  ```bash
  npm i -g vercel
  ```
- [ ] Vercel ログイン
  ```bash
  vercel login
  ```
- [ ] プロジェクト初期化（後で実施）
  ```bash
  vercel
  ```

---

## 🔧 環境変数準備リスト

以下の値を手元に準備（Vercel設定時に使用）:

### Firebase（7個）

- [ ] `FIREBASE_API_KEY`: `AIzaSyA0oO1xQhozKkQOGMRvqR3S8oU_GDQGs6o`
- [ ] `FIREBASE_AUTH_DOMAIN`: `furniture-house-1.firebaseapp.com`
- [ ] `FIREBASE_PROJECT_ID`: `furniture-house-1`
- [ ] `FIREBASE_STORAGE_BUCKET`: `furniture-house-1.firebasestorage.app`
- [ ] `FIREBASE_MESSAGING_SENDER_ID`: `1004954057756`
- [ ] `FIREBASE_APP_ID`: `1:1004954057756:web:afc1fa619449d84ec333d9`
- [ ] `FIREBASE_ADMIN_KEY`: **Base64エンコード済みJSON**

### Stripe（3個）

- [ ] `STRIPE_PUBLIC_KEY`: `pk_live_xxxxx`（本番）
- [ ] `STRIPE_SECRET_KEY`: `sk_live_xxxxx`（本番）
- [ ] `STRIPE_WEBHOOK_SECRET`: `whsec_xxxxx`

### メール（2個）

- [ ] `EMAIL_USER`: `kura@chladni.co.jp`
- [ ] `EMAIL_PASSWORD`: `seaezychzxzzcmsa`

### サイトURL（2個）

- [ ] `SITE_URL`: デプロイ後に設定（例: `https://furniturehouse1.vercel.app`）
- [ ] `BRAND_SITE_URL`: `https://furniturehouse1.com`

**合計:** 15個の環境変数

---

## 🚀 デプロイ実行準備

### ビルドテスト

- [ ] ローカルで本番ビルド成功
  ```bash
  npm run build
  ```
- [ ] ビルドエラーがない
- [ ] ビルドサイズが適切（.output/public/ のサイズ確認）

### 最終コミット

- [ ] すべての変更をコミット
  ```bash
  git add .
  git commit -m "feat: Phase 2 本番環境デプロイ準備完了"
  git push origin main
  ```

---

## ✅ デプロイ実施（Phase 2 本番作業）

以下は `PHASE2_VERCEL_DEPLOYMENT.md` を参照して実施:

1. [ ] Vercelプロジェクト作成
2. [ ] Vercel環境変数設定（15個）
3. [ ] 初回デプロイ実施
4. [ ] デプロイURL確認
5. [ ] Stripe Webhook URL更新
6. [ ] Health Check API テスト
7. [ ] セキュリティヘッダー確認
8. [ ] Firebase接続確認
9. [ ] カスタムドメイン設定（オプション）

---

## 📊 デプロイ後確認（Phase 3 E2Eテスト）

- [ ] トップページ表示確認
- [ ] 予約フロー完全動作確認
- [ ] Stripe決済テスト（少額）
- [ ] メール送信テスト
- [ ] 管理画面動作確認
- [ ] パフォーマンス確認（Lighthouse）
- [ ] セキュリティスキャン（OWASP ZAP）

---

## 🎯 完了条件

すべてのチェックボックスが ✅ になったら Phase 2 実施準備完了

---

**準備完了日:** _______________
**デプロイ予定日:** _______________

**特記事項:**
____________________________________________
____________________________________________
____________________________________________
