# Phase 2 クイックスタートガイド

**所要時間:** 約30分
**前提条件:** Phase 1完了、ローカルテスト完了

---

## 🎯 このガイドの目的

Phase 2の詳細な手順は `PHASE2_VERCEL_DEPLOYMENT.md` に記載されていますが、
ここでは**最短距離で本番デプロイを完了させる**ための簡易版を提供します。

---

## ステップ1: Firebase Admin キー取得（5分）

### 1-1. Firebase Console を開く

```
https://console.firebase.google.com/project/furniture-house-1/settings/serviceaccounts/adminsdk
```

### 1-2. 秘密鍵を生成

1. 「新しい秘密鍵の生成」をクリック
2. `furniture-house-1-xxxxx.json` がダウンロードされる

### 1-3. Base64エンコード

**ターミナルで実行:**
```bash
cd ~/Downloads
base64 -i furniture-house-1-*.json | tr -d '\n' > firebase-admin-key-base64.txt
```

**Base64文字列をコピー:**
```bash
cat firebase-admin-key-base64.txt | pbcopy
```

> 📋 クリップボードにコピーされました（後でVercelに貼り付け）

---

## ステップ2: Stripe本番キー取得（5分）

### 2-1. Stripe Dashboard を開く

```
https://dashboard.stripe.com/
```

### 2-2. 本番モードに切り替え

左上のトグルを「テスト」→「本番」に変更

### 2-3. APIキーをコピー

「開発者」→「APIキー」

- **公開可能キー:** `pk_live_xxxxx`
- **シークレットキー:** `sk_live_xxxxx`

> 📝 メモ帳にコピーしておく

### 2-4. Webhook作成

「開発者」→「Webhook」→「エンドポイントを追加」

- **URL:** `https://furniturehouse1.vercel.app/api/stripe/webhook`
  ⚠️ ドメインは仮（後で更新）
- **イベント:**
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`

**署名シークレットをコピー:** `whsec_xxxxx`

---

## ステップ3: Gitプッシュ（2分）

```bash
cd /Users/kurashimayouichi/Documents/furniturehouse1

# 変更を確認
git status

# すべてコミット
git add .
git commit -m "feat: Phase 2 本番環境デプロイ準備完了

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# GitHub にプッシュ
git push origin main
```

**GitHubリポジトリがない場合:**
```bash
# GitHub で新しいリポジトリ作成後
git remote add origin https://github.com/YOUR_USERNAME/furniturehouse1.git
git branch -M main
git push -u origin main
```

---

## ステップ4: Vercelデプロイ（10分）

### 4-1. Vercelにログイン

```bash
vercel login
```

ブラウザで認証

### 4-2. プロジェクト初期化

```bash
vercel
```

**質問に回答:**
```
? Set up and deploy? Y
? Which scope? Your Account
? Link to existing project? N
? Project name? furniturehouse1
? In which directory is your code? ./
? Override settings? N
```

初回デプロイが開始（環境変数未設定のため一部エラー出る可能性あり）

### 4-3. デプロイURL確認

```
✅ Preview: https://furniturehouse1-xxxxx.vercel.app
```

このURLを控える

---

## ステップ5: Vercel環境変数設定（10分）

### 5-1. Vercel Dashboard を開く

```
https://vercel.com/
```

プロジェクト `furniturehouse1` → Settings → Environment Variables

### 5-2. 環境変数を追加（15個）

**コピペ用チートシート:**

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `FIREBASE_API_KEY` | `AIzaSyA0oO1xQhozKkQOGMRvqR3S8oU_GDQGs6o` | Production, Preview |
| `FIREBASE_AUTH_DOMAIN` | `furniture-house-1.firebaseapp.com` | Production, Preview |
| `FIREBASE_PROJECT_ID` | `furniture-house-1` | Production, Preview |
| `FIREBASE_STORAGE_BUCKET` | `furniture-house-1.firebasestorage.app` | Production, Preview |
| `FIREBASE_MESSAGING_SENDER_ID` | `1004954057756` | Production, Preview |
| `FIREBASE_APP_ID` | `1:1004954057756:web:afc1fa619449d84ec333d9` | Production, Preview |
| `FIREBASE_ADMIN_KEY` | **ステップ1でコピーしたBase64文字列** | Production |
| `STRIPE_PUBLIC_KEY` | `pk_live_xxxxx` | Production |
| `STRIPE_SECRET_KEY` | `sk_live_xxxxx` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx` | Production |
| `EMAIL_USER` | `kura@chladni.co.jp` | Production, Preview |
| `EMAIL_PASSWORD` | `seaezychzxzzcmsa` | Production, Preview |
| `SITE_URL` | `https://furniturehouse1.vercel.app` | Production |
| `BRAND_SITE_URL` | `https://furniturehouse1.com` | Production, Preview |

**テスト環境用（Preview）:**
| 変数名 | 値 | 環境 |
|--------|-----|------|
| `STRIPE_PUBLIC_KEY` | `pk_test_YOUR_PUBLIC_KEY` | Preview |
| `STRIPE_SECRET_KEY` | `sk_test_YOUR_SECRET_KEY` | Preview |

### 5-3. 保存

すべて入力後「Save」

---

## ステップ6: 本番デプロイ実行（2分）

```bash
vercel --prod
```

**期待される出力:**
```
✅ Production: https://furniturehouse1.vercel.app [5s]
```

---

## ステップ7: 動作確認（5分）

### 7-1. Health Check

```bash
curl https://furniturehouse1.vercel.app/api/test/health
```

**期待される出力:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T...",
  "firebase": {
    "status": "initialized",
    "projectId": "furniture-house-1"
  }
}
```

### 7-2. トップページ確認

ブラウザで開く:
```
https://furniturehouse1.vercel.app
```

### 7-3. Stripe Webhook URL更新

Stripe Dashboard → Webhook → 該当エンドポイント → 編集

**URL を正式なものに変更:**
```
https://furniturehouse1.vercel.app/api/stripe/webhook
```

保存

---

## ✅ Phase 2 完了！

以下が完了しました:

- [x] Firebase Admin SDK セットアップ
- [x] Stripe本番モード有効化
- [x] Vercelデプロイ成功
- [x] 環境変数設定完了
- [x] Health Check API 動作確認
- [x] Webhook エンドポイント設定

---

## 🎯 次のステップ

Phase 3: E2Eテストに進む

詳細は `PHASE3_E2E_TEST_GUIDE.md` を参照

---

## 🚨 トラブルシューティング

### エラー: "Firebase Admin SDK initialization failed"

**ログで確認:**
Vercel Dashboard → Deployments → 最新デプロイ → Functions → ログ確認

**原因:**
- `FIREBASE_ADMIN_KEY` が正しくない
- Base64エンコード時に改行が含まれている

**解決策:**
```bash
# 再度 Base64 エンコード（改行削除）
base64 -i furniture-house-1-*.json | tr -d '\n' | pbcopy

# Vercel 環境変数を再設定
# Settings → Environment Variables → FIREBASE_ADMIN_KEY → Edit
```

保存後、再デプロイ:
```bash
vercel --prod
```

### エラー: "Invalid API Key" (Stripe)

**原因:**
- テストキー（pk_test_/sk_test_）を本番環境に設定している

**解決策:**
- Stripe Dashboard で本番モードに切り替え
- `pk_live_`/`sk_live_` キーを再度コピー
- Vercel 環境変数を更新

### ページが表示されない

**原因:**
- ビルドエラー

**確認:**
Vercel Dashboard → Deployments → Build Logs

**解決策:**
ローカルでビルドテスト:
```bash
npm run build
```

エラーを修正後、再プッシュ

---

## 📞 ヘルプ

詳細な手順は以下を参照:

- **Phase 2 詳細:** `PHASE2_VERCEL_DEPLOYMENT.md`
- **デプロイ前チェックリスト:** `PRE_DEPLOYMENT_CHECKLIST.md`
- **セキュリティ実装:** `SECURITY_IMPLEMENTATION_GUIDE.md`

---

**デプロイ完了日:** _______________
