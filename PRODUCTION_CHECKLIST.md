# 本番環境デプロイ チェックリスト

本番環境（https://booking.furniturehouse1.com/）をデプロイする前に、以下の項目を確認してください。

## 1. Firebase設定

### 1.1 Firebase Admin SDKサービスアカウントキー

- [ ] Firebase Console でサービスアカウントキーを生成済み
  - https://console.firebase.google.com/project/furniture-house-1/settings/serviceaccounts
- [ ] JSON ファイルをダウンロード済み
- [ ] Base64エンコード済み
  ```bash
  base64 -i furniture-house-1-xxxxxxxx.json | tr -d '\n' > firebase-admin-key-base64.txt
  ```
- [ ] Base64文字列をVercel環境変数に設定済み

### 1.2 Firestoreセキュリティルール

- [ ] セキュリティルールをデプロイ済み
  ```bash
  firebase deploy --only firestore:rules
  ```
- [ ] インデックスをデプロイ済み
  ```bash
  firebase deploy --only firestore:indexes
  ```
- [ ] Firebase Console でルールをテスト済み

## 2. Stripe設定

### 2.1 本番モードへの切り替え

- [ ] Stripe Dashboard で本番モードに切り替え済み
- [ ] 本番公開可能キー (`pk_live_xxx`) を取得済み
- [ ] 本番シークレットキー (`sk_live_xxx`) を取得済み

### 2.2 Webhook設定

- [ ] Webhook エンドポイントを追加済み
  - URL: `https://booking.furniturehouse1.com/api/stripe/webhook`
- [ ] 受信イベントを設定済み:
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
  - [ ] `charge.refunded`
- [ ] Webhook 署名シークレット (`whsec_xxx`) を取得済み

## 3. メール設定

### 3.1 Gmail設定

**重要**: `furniturehouse1@chladni.co.jp` がグループメールの場合、個人アカウントで認証します

- [ ] **個人アカウント**（例: `kura@chladni.co.jp`）でGmailアプリパスワードを生成済み
  - https://myaccount.google.com/apppasswords
- [ ] 2段階認証が有効になっている
- [ ] アプリパスワード（16桁）をメモ済み
- [ ] グループメールアドレス `furniturehouse1@chladni.co.jp` を返信先として設定

### 3.2 メール送信テスト

- [ ] 開発環境でメール送信をテスト済み
- [ ] メールテンプレートの表示確認済み
- [ ] 予約確認リンクが正しく動作する

## 4. Vercel環境変数設定

### 4.1 Firebase環境変数（公開情報）

- [ ] `FIREBASE_API_KEY` = `AIzaSyA0oO1xQhozKkQOGMRvqR3S8oU_GDQGs6o`
- [ ] `FIREBASE_AUTH_DOMAIN` = `furniture-house-1.firebaseapp.com`
- [ ] `FIREBASE_PROJECT_ID` = `furniture-house-1`
- [ ] `FIREBASE_STORAGE_BUCKET` = `furniture-house-1.firebasestorage.app`
- [ ] `FIREBASE_MESSAGING_SENDER_ID` = `1004954057756`
- [ ] `FIREBASE_APP_ID` = `1:1004954057756:web:afc1fa619449d84ec333d9`

### 4.2 Firebase Admin SDK（秘密情報）

- [ ] `FIREBASE_ADMIN_KEY` = [Base64エンコード済みJSON]

### 4.3 Stripe環境変数（秘密情報）

- [ ] `STRIPE_PUBLIC_KEY` = `pk_live_xxx`
- [ ] `STRIPE_SECRET_KEY` = `sk_live_xxx`
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_xxx`

### 4.4 メール環境変数（秘密情報）

- [ ] `EMAIL_USER` = `kura@chladni.co.jp`（個人アカウント、認証用）
- [ ] `EMAIL_PASSWORD` = [Gmailアプリパスワード]
- [ ] `EMAIL_REPLY_TO` = `furniturehouse1@chladni.co.jp`（グループメール、返信先）

### 4.5 サイト設定

- [ ] `SITE_URL` = `https://booking.furniturehouse1.com`
- [ ] `BRAND_SITE_URL` = `https://furniturehouse1.com`

### 4.6 環境の設定

- [ ] すべての環境変数を **Production** 環境に設定
- [ ] Preview環境にはStripeテストキーを設定

## 5. カスタムドメイン設定

- [ ] Vercel Dashboard でドメインを追加
  - `booking.furniturehouse1.com`
- [ ] DNSレコードを設定
- [ ] SSL証明書が発行されている（自動）
- [ ] HTTPSでアクセス可能

## 6. デプロイ前の確認

### 6.1 ローカルビルドテスト

- [ ] ビルドエラーがない
  ```bash
  npm run build
  ```
- [ ] TypeScriptエラーがない
  ```bash
  npm run typecheck
  ```

### 6.2 セキュリティ確認

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] サービスアカウントキーJSONがリポジトリに含まれていない
- [ ] 機密情報がコードにハードコードされていない

### 6.3 コードレビュー

- [ ] 本番用のエラーハンドリングが実装されている
- [ ] デバッグ用のconsole.logが削除されている（重要なものを除く）
- [ ] APIエンドポイントが適切に保護されている

## 7. デプロイ実行

### 7.1 本番デプロイ

```bash
# mainブランチにマージ
git checkout main
git merge develop
git push origin main
```

または手動デプロイ:

```bash
vercel --prod
```

### 7.2 デプロイ確認

- [ ] ビルドが成功している
- [ ] デプロイログにエラーがない
- [ ] Vercel Dashboard でデプロイステータスが "Ready"

## 8. 本番環境テスト

### 8.1 基本動作確認

- [ ] サイトが表示される: https://booking.furniturehouse1.com
- [ ] ページ遷移が正常に動作する
- [ ] スタイルが正しく適用されている

### 8.2 Firebase接続確認

- [ ] Firebaseが正常に初期化される（ブラウザコンソール確認）
- [ ] Firestoreからデータ取得ができる
- [ ] 認証機能が動作する（実装されている場合）

### 8.3 Stripe決済テスト

**⚠️ 注意**: 本番モードなので、実際の決済が発生します

- [ ] 決済フローが正常に動作する
- [ ] テスト予約を作成（必要に応じて後でキャンセル）
- [ ] Stripe Dashboard で決済を確認
- [ ] Webhook が正常に動作する

### 8.4 メール送信テスト

- [ ] 予約確認メールが送信される
- [ ] メール内のリンクが正しく動作する
- [ ] メールの差出人が `furniturehouse1@chladni.co.jp` になっている

### 8.5 予約フロー全体テスト

- [ ] 日付選択が正常に動作する
- [ ] 料金計算が正しい
- [ ] 予約作成が成功する
- [ ] 予約確認ページが表示される
- [ ] 確認メールが届く

## 9. モニタリング設定

### 9.1 エラー監視

- [ ] Vercel Dashboard でエラーログを確認できる
- [ ] Firebase Console でエラーを監視できる
- [ ] Stripe Dashboard でWebhookエラーを監視できる

### 9.2 アラート設定

- [ ] 重要なエラーが発生した場合の通知設定（任意）
- [ ] デプロイ失敗時の通知設定（任意）

## 10. ドキュメント更新

- [ ] README.md が最新の情報に更新されている
- [ ] DEPLOYMENT.md が正確である
- [ ] チーム内で設定情報が共有されている

## 11. バックアップ計画

- [ ] Firestoreのバックアップ方法を確認済み
- [ ] 環境変数のバックアップを保管済み（安全な場所に）
- [ ] ロールバック手順を確認済み

## トラブルシューティング

### デプロイが失敗する

1. Vercel Dashboard のビルドログを確認
2. ローカルで `npm run build` を実行してエラーを確認
3. 環境変数が正しく設定されているか確認

### Firebase接続エラー

1. `FIREBASE_ADMIN_KEY` が正しいか確認
2. Base64デコードしてJSON形式を確認:
   ```bash
   echo $FIREBASE_ADMIN_KEY | base64 -d | jq
   ```
3. Firebase Console でサービスアカウントの権限を確認

### Stripe決済エラー

1. 本番モードのキーを使用しているか確認
2. Webhook URLが正しいか確認
3. Stripe Dashboard でイベントログを確認

### メール送信エラー

1. Gmailアプリパスワードが正しいか確認
2. 2段階認証が有効になっているか確認
3. `EMAIL_USER` と `EMAIL_PASSWORD` が正しく設定されているか確認

## 完了後

✅ すべてのチェック項目が完了したら、本番環境の運用を開始できます！

問題が発生した場合は、[DEPLOYMENT.md](./DEPLOYMENT.md) を参照してください。
