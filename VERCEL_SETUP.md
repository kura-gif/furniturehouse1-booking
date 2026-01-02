# Vercel 本番環境セットアップガイド

本番環境（https://booking.furniturehouse1.com/）のVercel環境変数設定手順

## 前提条件

- Vercelプロジェクトが作成済み
- カスタムドメイン `booking.furniturehouse1.com` が設定済み
- Firebase プロジェクト `furniture-house-1` が作成済み
- Stripe アカウントが本番モードに対応済み

## 1. Firebase Admin SDK の設定

### サービスアカウントキーの取得

1. Firebase Console を開く: https://console.firebase.google.com/
2. プロジェクト `furniture-house-1` を選択
3. **プロジェクトの設定** → **サービスアカウント** タブ
4. **新しい秘密鍵の生成** をクリック
5. ダウンロードした JSON ファイルを安全な場所に保管

### Base64エンコード

```bash
# ダウンロードしたサービスアカウントキーをBase64エンコード
base64 -i furniture-house-1-xxxxxxxx.json | tr -d '\n' > firebase-admin-key-base64.txt

# 生成されたBase64文字列をコピー
cat firebase-admin-key-base64.txt
```

## 2. Stripe 本番キーの取得

### Stripeダッシュボード

1. Stripe Dashboard を開く: https://dashboard.stripe.com/
2. 右上のトグルを **本番モード** に切り替え
3. **開発者** → **APIキー** に移動

### 必要なキー

- **公開可能キー**: `pk_live_xxxxx`
- **シークレットキー**: `sk_live_xxxxx`

### Webhook Secret の取得

1. **開発者** → **Webhook** に移動
2. **エンドポイントを追加** をクリック
3. エンドポイント URL を入力:
   ```
   https://booking.furniturehouse1.com/api/stripe/webhook
   ```
4. 受信するイベントを選択:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. **署名シークレット** (`whsec_xxxxx`) をコピー

## 3. メール設定（Gmail）

### 重要: グループメールの取り扱い

`furniturehouse1@chladni.co.jp` がグループメール（Google グループ）の場合:
- ❌ グループメールアドレスではGmail認証ができません
- ✅ 個人アカウントで送信し、Reply-Toでグループメールを指定します

### アプリパスワードの生成

**個人アカウントで実施:**
1. Google アカウント設定: https://myaccount.google.com/apppasswords
2. **個人アカウント**（例: `kura@chladni.co.jp`）でログイン
3. **アプリパスワード** を生成（アプリ: メール、デバイス: その他）
4. 生成された16桁のパスワードをメモ

### 環境変数の設定

```bash
# 送信元（個人アカウント、認証用）
EMAIL_USER=kura@chladni.co.jp
EMAIL_PASSWORD=[16桁のアプリパスワード]

# 返信先（グループメール）
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp
```

**ゲストから見たメール**:
- 差出人: 家具の家 No.1 <kura@chladni.co.jp>
- 返信先: furniturehouse1@chladni.co.jp ← グループ全員に届く

## 4. Vercel 環境変数の設定

### Vercel Dashboard にアクセス

```
https://vercel.com/[your-account]/furniturehouse1/settings/environment-variables
```

### 環境変数を追加

以下の環境変数を **Production** 環境に設定:

#### Firebase 設定（公開情報）

```
FIREBASE_API_KEY=AIzaSyA0oO1xQhozKkQOGMRvqR3S8oU_GDQGs6o
FIREBASE_AUTH_DOMAIN=furniture-house-1.firebaseapp.com
FIREBASE_PROJECT_ID=furniture-house-1
FIREBASE_STORAGE_BUCKET=furniture-house-1.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=1004954057756
FIREBASE_APP_ID=1:1004954057756:web:afc1fa619449d84ec333d9
```

#### Firebase Admin SDK（秘密情報）

```
FIREBASE_ADMIN_KEY=[手順1で生成したBase64文字列]
```

#### Stripe 本番キー（秘密情報）

```
STRIPE_PUBLIC_KEY=pk_live_[本番公開可能キー]
STRIPE_SECRET_KEY=sk_live_[本番シークレットキー]
STRIPE_WEBHOOK_SECRET=whsec_[Webhook署名シークレット]
```

#### メール設定（秘密情報）

```
# 送信元（個人アカウント、認証用）
EMAIL_USER=kura@chladni.co.jp
EMAIL_PASSWORD=[Gmailアプリパスワード]

# 返信先（グループメール）
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp
```

#### サイト設定

```
SITE_URL=https://booking.furniturehouse1.com
BRAND_SITE_URL=https://furniturehouse1.com
```

## 5. デプロイと確認

### 環境変数を設定後、再デプロイ

```bash
# ローカルから本番デプロイ
vercel --prod

# または Vercel Dashboard から手動デプロイ
```

### 動作確認

1. **Firebase接続確認**
   ```
   https://booking.furniturehouse1.com/api/test/health
   ```

2. **Stripe決済テスト**
   - 予約フローを実行
   - Stripe Dashboard で決済を確認

3. **メール送信テスト**
   - テスト予約を作成
   - 確認メールが届くか確認

## 6. セキュリティチェックリスト

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] サービスアカウントキーのJSONファイルがリポジトリに含まれていない
- [ ] Vercel環境変数がProduction環境のみに設定されている
- [ ] Stripe Webhookエンドポイントが正しいURLに設定されている
- [ ] メールアプリパスワードが2段階認証で保護されている
- [ ] Firebase Firestore セキュリティルールが適切に設定されている

## トラブルシューティング

### Firebase Admin SDK エラー

```
Error: Could not load the default credentials
```

→ `FIREBASE_ADMIN_KEY` 環境変数が正しく設定されているか確認

### Stripe Webhook エラー

```
Error: No signatures found matching the expected signature for payload
```

→ `STRIPE_WEBHOOK_SECRET` が正しいか確認、Webhook URLが本番URLになっているか確認

### メール送信エラー

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

→ Gmailアプリパスワードが正しいか確認、2段階認証が有効か確認

## 参考リンク

- [Vercel環境変数ドキュメント](https://vercel.com/docs/projects/environment-variables)
- [Firebase Admin SDK セットアップ](https://firebase.google.com/docs/admin/setup)
- [Stripe Webhook ガイド](https://stripe.com/docs/webhooks)
- [Gmail アプリパスワード](https://support.google.com/accounts/answer/185833)
