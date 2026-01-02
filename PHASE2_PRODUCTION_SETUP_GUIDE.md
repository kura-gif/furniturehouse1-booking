# Phase 2: 本番環境設定ガイド

このガイドでは、本番環境へのデプロイに必要な設定を順番に説明します。

---

## 📋 目次

1. [Firebase本番プロジェクト作成](#1-firebase本番プロジェクト作成)
2. [Vercel環境変数設定](#2-vercel環境変数設定)
3. [Stripe本番モード設定](#3-stripe本番モード設定)

---

## 1. Firebase本番プロジェクト作成

### ステップ1: 本番用プロジェクトの作成（推奨）

現在の開発環境: `furniture-house-1`
推奨される本番環境: `furniture-house-1-prod` または既存プロジェクトを本番用に使用

#### オプションA: 新規プロジェクト作成（推奨）

```bash
1. Firebaseコンソールにアクセス
   https://console.firebase.google.com

2. 「プロジェクトを追加」をクリック

3. プロジェクト名を入力
   - 名前: furniture-house-1-prod
   - ID: furniture-house-1-prod

4. Google Analyticsを有効化（推奨）

5. 「プロジェクトを作成」
```

#### オプションB: 既存プロジェクトを本番用に使用

既存の `furniture-house-1` をそのまま本番環境として使用する場合は、このステップをスキップ。

---

### ステップ2: Firestore Databaseのセットアップ

```bash
1. Firebaseコンソール → Firestore Database

2. 「データベースを作成」

3. ロケーションを選択
   推奨: asia-northeast1（東京）
   - 低レイテンシー
   - 日本のユーザーに最適

4. セキュリティルールを選択
   「本番モードで開始」を選択
   （後でカスタムルールをデプロイ）

5. 「有効にする」
```

---

### ステップ3: Firebase Authenticationの設定

```bash
1. Firebaseコンソール → Authentication

2. 「始める」をクリック

3. ログイン方法を設定
   - メール/パスワード: 有効化
   - メールリンク（パスワード不要）: 有効化（オプション）

4. 承認済みドメインを追加
   - Settings → Authorized domains
   - 追加: booking.furniturehouse1.com
   - 追加: furniturehouse1.com（リダイレクト用）
```

---

### ステップ4: サービスアカウントキーの取得

**重要: このキーは厳重に管理してください**

```bash
1. Firebaseコンソール → プロジェクト設定（歯車アイコン）

2. 「サービスアカウント」タブをクリック

3. 「新しい秘密鍵を生成」をクリック

4. 警告を確認して「キーを生成」

5. JSONファイルがダウンロードされます
   ファイル名例: furniture-house-1-prod-xxxxx.json

⚠️ このファイルは絶対にGitにコミットしないこと
⚠️ 安全な場所に保管すること
```

---

### ステップ5: サービスアカウントキーをBase64エンコード

**Vercel環境変数用にBase64エンコードします**

#### Macの場合:
```bash
cat furniture-house-1-prod-xxxxx.json | base64 > firebase-admin-key-base64.txt
```

#### Windowsの場合（PowerShell）:
```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("furniture-house-1-prod-xxxxx.json")) > firebase-admin-key-base64.txt
```

#### Linuxの場合:
```bash
base64 -w 0 furniture-house-1-prod-xxxxx.json > firebase-admin-key-base64.txt
```

**firebase-admin-key-base64.txt の内容をコピー**
（これをVercelの環境変数に設定します）

---

### ステップ6: Firestoreセキュリティルールのデプロイ

```bash
# Firebase CLIをインストール（未インストールの場合）
npm install -g firebase-tools

# Firebaseにログイン
firebase login

# プロジェクトを初期化（初回のみ）
firebase init firestore

# 本番プロジェクトを選択
# ? Select a default Firebase project for this directory:
#   → furniture-house-1-prod

# Firestoreルールファイル
# ? What file should be used for Firestore Rules?
#   → firestore.rules (既存ファイルを使用)

# Firestoreインデックスファイル
# ? What file should be used for Firestore indexes?
#   → firestore.indexes.json (デフォルト)

# セキュリティルールをデプロイ
firebase deploy --only firestore:rules --project furniture-house-1-prod
```

**デプロイ完了の確認:**
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/furniture-house-1-prod/overview
```

---

### ステップ7: 初期データのセットアップ

Firestoreコンソールで以下のコレクションとドキュメントを手動作成:

#### 料金設定（pricing）
```javascript
コレクション: pricing
ドキュメントID: default

フィールド:
{
  basePrice: 18000,          // 平日1泊の基本料金
  weekendSurcharge: 3000,    // 週末追加料金
  extraGuestCharge: 3000,    // 追加ゲスト1名あたり
  maxIncludedGuests: 6,      // 基本料金に含まれる最大人数
  cleaningFee: 5000,         // クリーニング料金
  createdAt: [現在のタイムスタンプ],
  updatedAt: [現在のタイムスタンプ]
}
```

#### 管理者ユーザー（users）
```javascript
コレクション: users
ドキュメントID: [あなたのFirebase UID]

フィールド:
{
  email: "your-email@example.com",
  displayName: "管理者",
  role: "admin",              // 重要: 管理者権限
  createdAt: [現在のタイムスタンプ],
  updatedAt: [現在のタイムスタンプ]
}
```

**Firebase UIDの確認方法:**
1. Authentication → Users
2. あなたのメールアドレスでユーザーを作成
3. User UID をコピー
4. このUIDをドキュメントIDとして使用

---

### ステップ8: Firebase設定情報の取得

本番環境用の設定情報を取得:

```bash
1. Firebaseコンソール → プロジェクト設定

2. 「全般」タブ

3. 「マイアプリ」セクション
   - ウェブアプリがない場合: 「アプリを追加」→「ウェブ」

4. 以下の情報をコピー:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
```

**設定例:**
```javascript
{
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "furniture-house-1-prod.firebaseapp.com",
  projectId: "furniture-house-1-prod",
  storageBucket: "furniture-house-1-prod.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
}
```

---

## 2. Vercel環境変数設定

### ステップ1: Vercelダッシュボードにアクセス

```bash
1. https://vercel.com にアクセス

2. プロジェクトを選択
   furniturehouse1-booking

3. Settings → Environment Variables
```

---

### ステップ2: 本番環境変数を追加

以下の環境変数を **Production** 環境に追加:

#### Firebase設定

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `FIREBASE_API_KEY` | AIzaSyXXX... | Production |
| `FIREBASE_AUTH_DOMAIN` | furniture-house-1-prod.firebaseapp.com | Production |
| `FIREBASE_PROJECT_ID` | furniture-house-1-prod | Production |
| `FIREBASE_STORAGE_BUCKET` | furniture-house-1-prod.firebasestorage.app | Production |
| `FIREBASE_MESSAGING_SENDER_ID` | 123456789012 | Production |
| `FIREBASE_APP_ID` | 1:123456789012:web:xxx | Production |

#### Firebase Admin SDK

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `FIREBASE_ADMIN_KEY` | [Base64エンコードされたJSON] | Production |

**値の設定:**
firebase-admin-key-base64.txt の内容をコピー＆ペースト

#### Stripe設定

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `STRIPE_PUBLIC_KEY` | pk_live_XXX... | Production |
| `STRIPE_SECRET_KEY` | sk_live_XXX... | Production |
| `STRIPE_WEBHOOK_SECRET` | whsec_XXX... | Production |

**注意:** Stripeのライブキーは後のステップで取得

#### メール設定

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `EMAIL_USER` | noreply@furniturehouse1.com | Production |
| `EMAIL_PASSWORD` | [Gmailアプリパスワード] | Production |

#### サイト設定

| 変数名 | 値 | 環境 |
|--------|-----|------|
| `SITE_URL` | https://booking.furniturehouse1.com | Production |
| `BRAND_SITE_URL` | https://furniturehouse1.com | Production |

---

### ステップ3: 設定の保存と確認

```bash
1. 各環境変数を入力後「Save」をクリック

2. 全ての環境変数が追加されたことを確認

3. 「Redeploy」は後で実施
   （Stripe設定完了後）
```

---

## 3. Stripe本番モード設定

### ステップ1: Stripeアカウントの本番化

```bash
1. Stripeダッシュボードにアクセス
   https://dashboard.stripe.com

2. 右上の「テストモード」トグルをOFFにする
   → 本番モードに切り替わります

3. ビジネス情報の登録（未完了の場合）
   - 事業者名
   - 所在地
   - 銀行口座情報
   - 本人確認書類
   - 税務情報
```

**重要: 本番モードを有効化するには、上記の情報登録が必須です**

---

### ステップ2: 本番APIキーの取得

```bash
1. Stripeダッシュボード（本番モード）

2. 開発者 → APIキー

3. 以下をコピー:
   - 公開可能キー (pk_live_XXX...)
   - シークレットキー (sk_live_XXX...)
     「表示」をクリックして全体をコピー

⚠️ シークレットキーは1回のみ表示されます
⚠️ 安全に保管してください
```

**これらのキーをVercel環境変数に設定:**
- `STRIPE_PUBLIC_KEY` = pk_live_XXX...
- `STRIPE_SECRET_KEY` = sk_live_XXX...

---

### ステップ3: Webhookエンドポイントの設定

```bash
1. Stripeダッシュボード → 開発者 → Webhook

2. 「エンドポイントを追加」をクリック

3. エンドポイントの詳細:
   URL: https://booking.furniturehouse1.com/api/stripe/webhook
   説明: 本番環境決済イベント処理
   バージョン: 最新

4. リッスンするイベントを選択:
   ☑ payment_intent.succeeded
   ☑ payment_intent.payment_failed
   ☑ charge.refunded
   ☑ payment_intent.canceled

5. 「エンドポイントを追加」をクリック

6. 署名シークレットをコピー
   whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**このシークレットをVercel環境変数に設定:**
- `STRIPE_WEBHOOK_SECRET` = whsec_XXX...

---

### ステップ4: Webhook署名の検証

デプロイ後に以下で検証:

```bash
# Stripe CLIをインストール（ローカルテスト用）
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# Webhookをテスト
stripe trigger payment_intent.succeeded --forward-to https://booking.furniturehouse1.com/api/stripe/webhook
```

---

### ステップ5: テスト決済の実施

**本番モードでは実際のクレジットカードを使用します**

#### 少額テスト（100円）

```bash
1. 本番サイトにアクセス
   https://booking.furniturehouse1.com

2. 予約フォームに入力
   - チェックイン: 明日
   - チェックアウト: 明後日
   - ゲスト数: 1名

3. ゲスト情報を入力
   - テスト用のメールアドレス

4. 決済情報を入力
   - 実際のクレジットカード
   - 金額: 最低料金（23,000円程度）

5. 決済を実行

6. 確認:
   ✓ 決済成功
   ✓ Firestoreに予約データ作成
   ✓ Webhookで予約ステータス更新（pending → confirmed）
   ✓ メール送信（ゲストと管理者）
```

#### 返金テスト

```bash
1. Stripeダッシュボード → 支払い

2. テスト決済を選択

3. 「払い戻し」をクリック

4. 金額: 全額

5. 理由: テスト

6. 「払い戻しを確認」

7. 確認:
   ✓ Firestoreの予約ステータスが refunded に更新
   ✓ 返金メール送信
```

---

## ✅ チェックリスト

Phase 2完了前に以下を確認:

### Firebase
- [ ] 本番プロジェクト作成（または既存を使用）
- [ ] Firestore Database有効化
- [ ] Authentication設定
- [ ] サービスアカウントキー取得
- [ ] Base64エンコード完了
- [ ] セキュリティルールデプロイ
- [ ] 初期データ作成（pricing, users）
- [ ] Firebase設定情報取得

### Vercel
- [ ] Firebase環境変数設定（8個）
- [ ] Firebase Admin Key設定
- [ ] Stripe環境変数設定（3個）
- [ ] メール設定（2個）
- [ ] サイトURL設定（2個）
- [ ] **合計15個の環境変数**

### Stripe
- [ ] 本番モード有効化
- [ ] ビジネス情報登録完了
- [ ] 本番APIキー取得
- [ ] Webhook設定完了
- [ ] 署名シークレット取得
- [ ] Vercelに環境変数設定

---

## 🚀 デプロイ実行

全ての設定が完了したら:

```bash
1. Vercelダッシュボード → Deployments

2. 「Redeploy」をクリック
   または
   GitHubにpush（mainブランチ）

3. デプロイ完了を待つ（2-3分）

4. デプロイログを確認:
   ✅ Build Success
   ✅ Function Deployment Success
   ✅ 環境変数読み込み成功
```

---

## 🧪 Phase 3への準備

Phase 2が完了したら、Phase 3のテストに進みます:

1. **全機能のE2Eテスト**
   - 予約作成フロー
   - 決済処理
   - メール送信
   - 管理者機能

2. **少額実決済テスト**
   - 実際のクレジットカードで決済
   - 返金処理

3. **メール送信テスト**
   - 予約確認メール
   - キャンセルメール
   - リマインダーメール

---

## 📞 トラブルシューティング

### よくある問題

#### 問題1: Firebase Admin SDK初期化エラー

```
Error: Firebase Admin credentials not found
```

**解決策:**
- Base64エンコードが正しいか確認
- Vercel環境変数に正しく設定されているか確認
- 改行コードが含まれていないか確認

#### 問題2: Stripe Webhook検証エラー

```
Webhook Error: No signatures found
```

**解決策:**
- `STRIPE_WEBHOOK_SECRET` が正しく設定されているか確認
- Webhook URLが正しいか確認
- Stripeダッシュボードでイベントログを確認

#### 問題3: 決済が完了しない

**確認項目:**
1. Stripeが本番モードか確認
2. 本番APIキーを使用しているか確認
3. クレジットカードが有効か確認
4. ブラウザコンソールでエラーを確認

---

**Phase 2完了後、Phase 3のテストガイドに進んでください。**

**作成日: 2025-12-30**
**対象: 本番環境デプロイ前の設定**
