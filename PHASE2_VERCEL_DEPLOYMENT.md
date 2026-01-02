# Phase 2: Vercel本番環境デプロイ手順

**目的:** セキュアな本番環境をVercelにデプロイし、Firebase・Stripeと連携する

---

## 📋 前提条件

- ✅ Phase 1完了（セキュリティ実装・ローカルテスト完了）
- ✅ Firebaseプロジェクト `furniture-house-1` 存在確認
- ✅ Stripe testモードキー取得済み
- ✅ Gmailアプリパスワード取得済み

---

## 🎯 Phase 2 の目標

1. Vercelプロジェクト作成・Gitリポジトリ連携
2. Firebase本番用サービスアカウント作成
3. Stripe本番モード有効化
4. 全環境変数をVercelに設定
5. 初回デプロイ成功
6. 本番環境での動作確認

---

## ステップ1: Gitリポジトリの準備

### 1-1. 現在のGit状態確認

```bash
git status
```

**期待される状態:**
- ✅ すべてのPhase1実装ファイルがコミット済み
- ⚠️ 未コミットファイルがある場合は次へ

### 1-2. 必要に応じてコミット

```bash
# すべての変更をステージング
git add .

# コミット
git commit -m "feat: Phase 1 セキュリティ実装完了

- サーバーサイド金額検証
- Firestore トランザクション予約作成
- Stripe Webhook ハンドラー
- レート制限・セキュリティヘッダー
- 同日予約防止
- メール送信機能

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 1-3. GitHubにプッシュ

**GitHub リポジトリがない場合:**

1. GitHub.com でリポジトリ作成
   - リポジトリ名: `furniturehouse1`（または任意）
   - Private推奨
   - README・.gitignore不要（既存）

2. リモート追加・プッシュ
```bash
git remote add origin https://github.com/YOUR_USERNAME/furniturehouse1.git
git branch -M main
git push -u origin main
```

**既にリポジトリがある場合:**
```bash
git push origin main
```

---

## ステップ2: Firebase本番環境設定

### 2-1. Firebase Console でサービスアカウント作成

1. **Firebase Console を開く**
   ```
   https://console.firebase.google.com/project/furniture-house-1/settings/serviceaccounts/adminsdk
   ```

2. **新しい秘密鍵を生成**
   - 「新しい秘密鍵の生成」ボタンをクリック
   - `furniture-house-1-xxxxx.json` がダウンロードされる

3. **ダウンロードしたJSONファイルを確認**
   ```json
   {
     "type": "service_account",
     "project_id": "furniture-house-1",
     "private_key_id": "xxxxx",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "firebase-adminsdk-xxxxx@furniture-house-1.iam.gserviceaccount.com",
     ...
   }
   ```

### 2-2. サービスアカウントキーをBase64エンコード

**macOS/Linux:**
```bash
base64 -i furniture-house-1-xxxxx.json | tr -d '\n' > firebase-admin-key-base64.txt
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("furniture-house-1-xxxxx.json")) | Out-File -Encoding ASCII firebase-admin-key-base64.txt
```

**生成された `firebase-admin-key-base64.txt` の内容をコピー**
```bash
cat firebase-admin-key-base64.txt
# 出力例: eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6ImZ1cm5pdHVyZS1ob3Vz...
```

⚠️ **重要:**
- JSONファイルとBase64テキストファイルは安全な場所に保管
- **絶対にGitにコミットしない**
- `.gitignore` に以下を追加済み確認:
  ```
  *.json
  *-base64.txt
  ```

### 2-3. Firestore Security Rules デプロイ

```bash
firebase deploy --only firestore:rules
```

**期待される出力:**
```
✔ Deploy complete!
Project Console: https://console.firebase.google.com/project/furniture-house-1/overview
```

---

## ステップ3: Stripe本番モード設定

### 3-1. Stripe本番モード有効化

1. **Stripe Dashboard を開く**
   ```
   https://dashboard.stripe.com/
   ```

2. **本番モードに切り替え**
   - 左上のトグルを「テスト」→「本番」に切り替え
   - 必要に応じて事業情報を入力

3. **本番APIキーを取得**
   - 「開発者」→「APIキー」
   - 公開可能キー（pk_live_xxx）をコピー
   - シークレットキー（sk_live_xxx）をコピー

### 3-2. Webhook エンドポイント作成

1. **「開発者」→「Webhook」→「エンドポイントを追加」**

2. **エンドポイントURL:**
   ```
   https://YOUR_VERCEL_DOMAIN.vercel.app/api/stripe/webhook
   ```
   ⚠️ `YOUR_VERCEL_DOMAIN` は次のステップで確定（仮でOK）

3. **リッスンするイベントを選択:**
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`

4. **署名シークレットをコピー**
   - 作成後に表示される `whsec_xxxxx` をコピー

---

## ステップ4: Vercelプロジェクト作成

### 4-1. Vercel CLI インストール（未インストールの場合）

```bash
npm i -g vercel
```

### 4-2. Vercelにログイン

```bash
vercel login
```

### 4-3. プロジェクト初期化

```bash
vercel
```

**質問に回答:**
```
? Set up and deploy "~/Documents/furniturehouse1"? [Y/n] y
? Which scope do you want to deploy to? Your Account
? Link to existing project? [y/N] n
? What's your project's name? furniturehouse1
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

**初回デプロイが開始される（環境変数未設定のため、エラーになる可能性あり）**
- 問題なし、次のステップで環境変数を設定

---

## ステップ5: Vercel環境変数設定

### 5-1. Vercel Dashboard で環境変数を設定

```
https://vercel.com/your-username/furniturehouse1/settings/environment-variables
```

### 5-2. 設定する環境変数（15個）

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `FIREBASE_API_KEY` | `AIzaSyA0oO1xQhozKkQOGMRvqR3S8oU_GDQGs6o` | Production, Preview |
| `FIREBASE_AUTH_DOMAIN` | `furniture-house-1.firebaseapp.com` | Production, Preview |
| `FIREBASE_PROJECT_ID` | `furniture-house-1` | Production, Preview |
| `FIREBASE_STORAGE_BUCKET` | `furniture-house-1.firebasestorage.app` | Production, Preview |
| `FIREBASE_MESSAGING_SENDER_ID` | `1004954057756` | Production, Preview |
| `FIREBASE_APP_ID` | `1:1004954057756:web:afc1fa619449d84ec333d9` | Production, Preview |
| `FIREBASE_ADMIN_KEY` | **Base64エンコード済みJSON** | Production のみ |
| `STRIPE_PUBLIC_KEY` | `pk_live_xxxxx`（本番キー） | Production のみ |
| `STRIPE_PUBLIC_KEY` | `pk_test_xxxxx`（テストキー） | Preview のみ |
| `STRIPE_SECRET_KEY` | `sk_live_xxxxx`（本番キー） | Production のみ |
| `STRIPE_SECRET_KEY` | `sk_test_xxxxx`（テストキー） | Preview のみ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx`（本番Webhook） | Production のみ |
| `EMAIL_USER` | `kura@chladni.co.jp` | Production, Preview |
| `EMAIL_PASSWORD` | `seaezychzxzzcmsa` | Production, Preview |
| `SITE_URL` | `https://YOUR_DOMAIN.vercel.app` | Production |
| `SITE_URL` | `https://YOUR_PREVIEW.vercel.app` | Preview |
| `BRAND_SITE_URL` | `https://furniturehouse1.com` | Production, Preview |

⚠️ **重要ポイント:**
- `FIREBASE_ADMIN_KEY`: ステップ2-2で作成したBase64文字列全体をペースト
- `STRIPE_*_KEY`: 本番環境は `pk_live_`/`sk_live_`、プレビューは `pk_test_`/`sk_test_`
- `SITE_URL`: デプロイ後に正しいURLに更新

### 5-3. 環境変数設定の確認

すべて設定後、「Save」をクリック

---

## ステップ6: 本番デプロイ

### 6-1. 再デプロイ

```bash
vercel --prod
```

**期待される出力:**
```
✅ Production: https://furniturehouse1.vercel.app [5s]
```

### 6-2. デプロイURLの確認

出力されたURLをブラウザで開く
- トップページが表示されるか確認
- エラーが出ていないか確認

### 6-3. Stripe WebhookエンドポイントURLを更新

ステップ3-2で仮設定したWebhook URLを正式なURLに更新:
```
https://furniturehouse1.vercel.app/api/stripe/webhook
```

### 6-4. `SITE_URL` 環境変数を更新

Vercel Dashboard で `SITE_URL` を正しいドメインに更新:
```
https://furniturehouse1.vercel.app
```

保存後、再デプロイ:
```bash
vercel --prod
```

---

## ステップ7: 本番環境動作確認

### 7-1. Health Check API

```bash
curl https://furniturehouse1.vercel.app/api/test/health
```

**期待される出力:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "firebase": {
    "status": "initialized",
    "projectId": "furniture-house-1"
  }
}
```

### 7-2. セキュリティヘッダー確認

```bash
curl -I https://furniturehouse1.vercel.app/
```

**期待されるヘッダー:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 7-3. Firestore接続確認

Vercel Deployment Logs で確認:
```
✅ Firebase Admin SDK initialized
```

エラーがある場合:
```
❌ Firebase Admin SDK initialization failed
```
→ `FIREBASE_ADMIN_KEY` の設定を確認

---

## ステップ8: カスタムドメイン設定（オプション）

### 8-1. Vercel Dashboard でドメイン追加

```
Settings → Domains → Add Domain
```

例: `booking.furniturehouse1.com`

### 8-2. DNSレコード設定

ドメインレジストラで以下を設定:

**Aレコード:**
```
Type: A
Name: booking
Value: 76.76.21.21
```

**または CNAMEレコード:**
```
Type: CNAME
Name: booking
Value: cname.vercel-dns.com
```

### 8-3. SSL証明書自動発行確認

Vercel が自動的にLet's Encrypt証明書を発行（数分）

### 8-4. 環境変数 `SITE_URL` を更新

```
SITE_URL=https://booking.furniturehouse1.com
```

保存後、再デプロイ

---

## ✅ Phase 2 完了チェックリスト

- [ ] Gitリポジトリにコード全体をプッシュ済み
- [ ] Firebase Admin サービスアカウント作成・Base64エンコード完了
- [ ] Firestore Security Rules デプロイ完了
- [ ] Stripe本番モード有効化・APIキー取得
- [ ] Stripe Webhook エンドポイント設定完了
- [ ] Vercelプロジェクト作成完了
- [ ] Vercel環境変数15個すべて設定完了
- [ ] 本番デプロイ成功（エラーなし）
- [ ] Health Check API が正常応答
- [ ] セキュリティヘッダーが設定されている
- [ ] Firebase Admin SDK が初期化されている
- [ ] カスタムドメイン設定完了（オプション）

---

## 🚨 トラブルシューティング

### エラー: "Firebase Admin SDK initialization failed"

**原因:** `FIREBASE_ADMIN_KEY` が正しく設定されていない

**解決策:**
1. Base64エンコードされた文字列全体がコピーされているか確認
2. 改行が含まれていないか確認（`tr -d '\n'` で削除済みか）
3. Vercel環境変数の「Production」環境が選択されているか確認

### エラー: "Stripe webhook signature verification failed"

**原因:** `STRIPE_WEBHOOK_SECRET` が正しくない

**解決策:**
1. Stripe Dashboard → Webhook → 該当エンドポイント → 署名シークレット確認
2. `whsec_` から始まる文字列全体をコピー
3. Vercel環境変数を再設定

### エラー: "Rate limit exceeded"

**原因:** レート制限が厳しすぎる（開発中のテスト）

**一時的な解決策:**
- `server/middleware/rate-limit.ts` のリミットを一時的に緩和
- または、Preview環境でテスト

### デプロイは成功するがページが表示されない

**原因:** `nuxt generate` ではなく `nuxt build` が必要

**解決策:**
`vercel.json` を作成（既に存在する場合は確認）:
```json
{
  "builds": [
    {
      "src": "nuxt.config.ts",
      "use": "@nuxtjs/vercel-builder"
    }
  ]
}
```

---

## 📞 次のステップ

Phase 2完了後:
- **Phase 3: E2E テスト** に進む
- 本番環境で実際の予約フローをテスト
- Stripe本番決済テスト（少額）
- メール送信テスト（本番環境）

---

## 📝 メモ

**Vercel デプロイメントURL（仮）:**
```
https://furniturehouse1.vercel.app
```

**Firebase Console:**
```
https://console.firebase.google.com/project/furniture-house-1
```

**Stripe Dashboard:**
```
https://dashboard.stripe.com/
```

**Vercel Dashboard:**
```
https://vercel.com/your-username/furniturehouse1
```
