# Phase 2: 本番環境セットアップ 完了サマリー

**作成日:** 2025年12月30日
**ステータス:** ✅ 準備完了（実施待ち）

---

## 📋 Phase 2 の目的

Phase 1で実装したセキュアな予約システムを、Vercel本番環境にデプロイし、Firebase・Stripeと完全に統合する。

---

## ✅ Phase 2 で実施した準備作業

### 1. ドキュメント作成

| ファイル名 | 目的 | 用途 |
|-----------|------|------|
| `PHASE2_VERCEL_DEPLOYMENT.md` | 詳細な本番デプロイ手順 | ステップバイステップガイド |
| `PHASE2_QUICK_START.md` | 最短30分でデプロイ完了 | クイックリファレンス |
| `PRE_DEPLOYMENT_CHECKLIST.md` | デプロイ前の確認項目 | チェックリスト |
| `.env.production.template` | 本番環境変数テンプレート | 環境変数設定ガイド |
| `PHASE2_COMPLETION_SUMMARY.md` | このファイル | 完了確認 |

### 2. 設定ファイル作成・更新

#### vercel.json
Vercel デプロイ設定を定義:
- ビルドコマンド: `npm run build`
- フレームワーク: Nuxt.js
- 出力ディレクトリ: `.output/public`

#### nuxt.config.ts
ランタイム設定を拡張:
- **追加したサーバーサイド環境変数:**
  - `stripeWebhookSecret`
  - `emailUser`, `emailPassword`
  - `firebaseAdminKey`, `firebaseClientEmail`, `firebasePrivateKey`
- **追加したクライアントサイド環境変数:**
  - `brandSiteUrl`

#### .gitignore
セキュリティファイルの除外を追加:
- `furniture-house-1-*.json` (Firebase サービスアカウント)
- `*-base64.txt` (Base64エンコード済みキー)

### 3. デプロイ検証スクリプト

**scripts/verify-deployment.sh**
- 本番環境の動作確認を自動化（10項目のテスト）
- 使い方:
  ```bash
  ./scripts/verify-deployment.sh https://your-domain.vercel.app
  ```

**テスト項目:**
1. Health Check API
2. Firebase Admin SDK 初期化確認
3. セキュリティヘッダー (X-Content-Type-Options)
4. セキュリティヘッダー (X-Frame-Options)
5. セキュリティヘッダー (HSTS)
6. HTTP → HTTPS リダイレクト
7. トップページ表示
8. 価格計算API
9. Stripe Payment Intent作成
10. レート制限動作確認

---

## 🎯 Phase 2 実施手順（概要）

### ステップ1: Firebase準備
- [ ] サービスアカウントキー生成
- [ ] Base64エンコード
- [ ] Firestore Security Rules デプロイ

### ステップ2: Stripe準備
- [ ] 本番モード有効化
- [ ] 本番APIキー取得
- [ ] Webhook エンドポイント作成

### ステップ3: GitHub準備
- [ ] 全コードをコミット
- [ ] GitHubにプッシュ

### ステップ4: Vercel準備
- [ ] プロジェクト作成
- [ ] 環境変数設定（15個）
- [ ] 本番デプロイ実行

### ステップ5: 動作確認
- [ ] Health Check API テスト
- [ ] セキュリティヘッダー確認
- [ ] Firebase接続確認
- [ ] 検証スクリプト実行

**詳細:** `PHASE2_QUICK_START.md` または `PHASE2_VERCEL_DEPLOYMENT.md` を参照

---

## 📦 必要な環境変数（15個）

### Production 環境（本番）

| カテゴリ | 変数名 | 値の例 |
|---------|--------|--------|
| **Firebase** | `FIREBASE_API_KEY` | `AIzaSyA...` |
| | `FIREBASE_AUTH_DOMAIN` | `furniture-house-1.firebaseapp.com` |
| | `FIREBASE_PROJECT_ID` | `furniture-house-1` |
| | `FIREBASE_STORAGE_BUCKET` | `furniture-house-1.firebasestorage.app` |
| | `FIREBASE_MESSAGING_SENDER_ID` | `1004954057756` |
| | `FIREBASE_APP_ID` | `1:1004954057756:web:...` |
| | `FIREBASE_ADMIN_KEY` | **Base64エンコード済みJSON** |
| **Stripe** | `STRIPE_PUBLIC_KEY` | `pk_live_xxxxx` |
| | `STRIPE_SECRET_KEY` | `sk_live_xxxxx` |
| | `STRIPE_WEBHOOK_SECRET` | `whsec_xxxxx` |
| **Email** | `EMAIL_USER` | `kura@chladni.co.jp` |
| | `EMAIL_PASSWORD` | `seaezychzxzzcmsa` |
| **サイト** | `SITE_URL` | `https://furniturehouse1.vercel.app` |
| | `BRAND_SITE_URL` | `https://furniturehouse1.com` |

### Preview 環境（プレビュー）

| カテゴリ | 変数名 | 値の例 |
|---------|--------|--------|
| **Firebase** | すべて同じ | Production と同じ値 |
| **Stripe** | `STRIPE_PUBLIC_KEY` | `pk_test_xxxxx` |
| | `STRIPE_SECRET_KEY` | `sk_test_xxxxx` |
| **Email** | すべて同じ | Production と同じ値 |
| **サイト** | `SITE_URL` | プレビューURLは自動設定 |
| | `BRAND_SITE_URL` | Production と同じ値 |

---

## 🔧 準備が完了しているもの

### ✅ コードベース
- [x] Phase 1 セキュリティ実装完了
- [x] サーバーサイド金額検証
- [x] Firestore トランザクション予約作成
- [x] Stripe Webhook ハンドラー
- [x] レート制限・セキュリティヘッダー
- [x] メール送信機能

### ✅ ローカルテスト
- [x] 全7項目のテスト完了
- [x] 価格計算: 44,000円（正常）
- [x] Payment Intent作成: 成功
- [x] セキュリティヘッダー: 設定済み
- [x] レート制限: 動作確認済み
- [x] メール送信: 成功（krakra1020@gmail.com に到達確認）

### ✅ 設定ファイル
- [x] `vercel.json` 作成
- [x] `nuxt.config.ts` 環境変数拡張
- [x] `.gitignore` セキュリティファイル除外
- [x] `.env.production.template` 作成

### ✅ ドキュメント
- [x] デプロイ手順書（詳細版・クイック版）
- [x] デプロイ前チェックリスト
- [x] 環境変数テンプレート
- [x] デプロイ検証スクリプト

---

## ⏭️ 次のステップ: Phase 2 実施

### 推奨される実施方法

**オプションA: クイックスタート（30分）**
```bash
# PHASE2_QUICK_START.md を開く
open PHASE2_QUICK_START.md

# ステップバイステップで実施
# 1. Firebase Admin キー取得
# 2. Stripe本番キー取得
# 3. Git プッシュ
# 4. Vercel デプロイ
# 5. 環境変数設定
# 6. 動作確認
```

**オプションB: 詳細ガイド（60分）**
```bash
# PHASE2_VERCEL_DEPLOYMENT.md を開く
open PHASE2_VERCEL_DEPLOYMENT.md

# デプロイ前チェックリストを確認
open PRE_DEPLOYMENT_CHECKLIST.md

# すべての項目をチェック後、デプロイ実施
```

### 実施後の確認

```bash
# デプロイ検証スクリプト実行
./scripts/verify-deployment.sh https://your-domain.vercel.app
```

**期待される結果:**
```
✅ 成功: 10
❌ 失敗: 0
🎉 すべてのテストが成功しました！
```

---

## 📊 Phase 2 完了基準

以下がすべて ✅ になったら Phase 2 完了:

- [ ] Firebase サービスアカウント作成・Base64エンコード完了
- [ ] Firestore Security Rules デプロイ完了
- [ ] Stripe 本番モード有効化・APIキー取得
- [ ] Stripe Webhook エンドポイント設定完了
- [ ] GitHub にコード全体プッシュ完了
- [ ] Vercel プロジェクト作成完了
- [ ] Vercel 環境変数 15個すべて設定完了
- [ ] 本番デプロイ成功（エラーなし）
- [ ] Health Check API が正常応答
- [ ] セキュリティヘッダーが設定されている
- [ ] Firebase Admin SDK が初期化されている
- [ ] デプロイ検証スクリプトが全テスト成功

---

## 🚨 よくあるエラーと解決策

### 1. Firebase Admin SDK initialization failed

**原因:** Base64エンコードが正しくない

**解決策:**
```bash
# 改行を完全に削除してエンコード
base64 -i furniture-house-1-*.json | tr -d '\n' > key.txt
cat key.txt | pbcopy
# Vercel環境変数に貼り付け後、再デプロイ
```

### 2. Stripe Webhook 署名検証エラー

**原因:** `STRIPE_WEBHOOK_SECRET` が正しくない

**解決策:**
- Stripe Dashboard → Webhook → 該当エンドポイント
- 署名シークレット（whsec_xxxxx）を再コピー
- Vercel環境変数を更新・再デプロイ

### 3. ページが表示されない

**原因:** ビルドエラー

**解決策:**
```bash
# ローカルでビルドテスト
npm run build

# エラーを修正後、再プッシュ
git add .
git commit -m "fix: ビルドエラー修正"
git push origin main
```

---

## 📞 サポートリソース

### ドキュメント
- 詳細デプロイ手順: [PHASE2_VERCEL_DEPLOYMENT.md](PHASE2_VERCEL_DEPLOYMENT.md)
- クイックスタート: [PHASE2_QUICK_START.md](PHASE2_QUICK_START.md)
- デプロイ前確認: [PRE_DEPLOYMENT_CHECKLIST.md](PRE_DEPLOYMENT_CHECKLIST.md)
- セキュリティ実装: [SECURITY_IMPLEMENTATION_GUIDE.md](SECURITY_IMPLEMENTATION_GUIDE.md)

### 外部リンク
- Firebase Console: https://console.firebase.google.com/project/furniture-house-1
- Stripe Dashboard: https://dashboard.stripe.com/
- Vercel Dashboard: https://vercel.com/

---

## 🎯 Phase 3 プレビュー

Phase 2完了後、Phase 3（E2Eテスト）に進みます:

1. 本番環境での予約フロー完全テスト
2. Stripe本番決済テスト（少額）
3. メール送信テスト（本番環境）
4. パフォーマンステスト（Lighthouse）
5. セキュリティスキャン（OWASP ZAP）
6. 負荷テスト（同時予約シミュレーション）

詳細: `PHASE3_E2E_TEST_GUIDE.md`

---

## ✅ Phase 2 準備完了チェック

- [x] すべてのドキュメント作成済み
- [x] 設定ファイル準備完了
- [x] デプロイ検証スクリプト作成済み
- [x] 環境変数テンプレート準備済み
- [ ] **実施準備OK（ユーザーによる実施待ち）**

---

**Phase 2 実施を開始する準備が整いました！**

実施開始時は `PHASE2_QUICK_START.md` から始めることをお勧めします。
