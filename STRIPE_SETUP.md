# Stripe決済の設定ガイド

このドキュメントでは、家具の家 No.1予約システムにStripe決済を統合する手順を説明します。

## 1. Stripeアカウントの作成

1. [Stripe](https://stripe.com/jp)にアクセス
2. 「今すぐ始める」をクリックしてアカウントを作成
3. 必要情報（メール、パスワード、会社名など）を入力

## 2. APIキーの取得

### テスト環境用（開発中）

1. Stripeダッシュボードにログイン
2. 右上の「テストモード」がONになっていることを確認
3. 左メニューから「開発者」→「APIキー」をクリック
4. 以下の2つのキーをコピー：
   - **公開可能キー** (pk_test_で始まる)
   - **シークレットキー** (sk_test_で始まる)

### 本番環境用（リリース後）

1. 右上の「テストモード」をOFFにして本番モードに切り替え
2. 同様に「開発者」→「APIキー」から以下をコピー：
   - **公開可能キー** (pk_live_で始まる)
   - **シークレットキー** (sk_live_で始まる)

## 3. 環境変数の設定

`.env`ファイルを開き、以下のStripe設定を更新：

```env
# Stripe設定
STRIPE_PUBLIC_KEY=pk_test_あなたの公開可能キー
STRIPE_SECRET_KEY=sk_test_あなたのシークレットキー
STRIPE_WEBHOOK_SECRET=whsec_xxx  # 後で設定
```

**重要**: `.env`ファイルはGitにコミットしないでください（.gitignoreに含まれています）

## 4. Webhookの設定（オプション）

Webhook機能を使用する場合：

1. Stripeダッシュボードで「開発者」→「Webhook」をクリック
2. 「エンドポイントを追加」をクリック
3. エンドポイントURL: `https://あなたのドメイン/api/stripe/webhook`
4. リッスンするイベントを選択：
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. 署名シークレットをコピーして`.env`の`STRIPE_WEBHOOK_SECRET`に設定

## 5. テスト用カード番号

開発・テスト時に使用できるカード番号：

### 成功するカード
- カード番号: `4242 4242 4242 4242`
- 有効期限: 任意の未来の日付（例：12/34）
- CVC: 任意の3桁（例：123）
- 郵便番号: 任意

### エラーをテストするカード
- カード拒否: `4000 0000 0000 0002`
- 残高不足: `4000 0000 0000 9995`
- 期限切れ: `4000 0000 0000 0069`

詳細: https://stripe.com/docs/testing

## 6. 決済フローの確認

1. ローカル環境で予約フォーム（`/booking/request`）にアクセス
2. チェックイン・チェックアウト日付と人数を入力
3. ゲスト情報（名前、メール、電話番号）を入力
4. Stripe Payment Elementが表示されたら、テストカード情報を入力
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 任意の未来の日付（例：12/34）
   - CVC: 任意の3桁（例：123）
5. 利用規約に同意して「リクエストを送信」ボタンをクリック
6. 決済処理が完了し、完了ページ（`/booking/complete`）にリダイレクトされることを確認
7. Stripeダッシュボードの「支払い」で決済が記録されていることを確認
8. Firebaseコンソールで予約データが作成されていることを確認

## 7. 本番環境への移行

1. Stripeアカウントを本番モードに切り替え
2. 本番用のAPIキーを取得
3. Vercelなどの本番環境の環境変数を更新：
   - `STRIPE_PUBLIC_KEY`: 本番用公開可能キー
   - `STRIPE_SECRET_KEY`: 本番用シークレットキー
4. Webhookエンドポイントを本番URLで再設定

## 8. セキュリティのベストプラクティス

- ✅ シークレットキーはサーバーサイドのみで使用
- ✅ 公開可能キーはクライアントサイドで使用可能
- ✅ `.env`ファイルをGitにコミットしない
- ✅ 本番環境ではHTTPSを使用
- ✅ Webhookの署名を検証
- ✅ 金額の検証をサーバーサイドで実施

## 9. トラブルシューティング

### エラー: "Stripe is not initialized"
- プラグインが正しく読み込まれているか確認
- 環境変数`STRIPE_PUBLIC_KEY`が設定されているか確認

### エラー: "Invalid API Key"
- APIキーが正しくコピーされているか確認
- テストモード/本番モードのキーが一致しているか確認

### 決済が完了しない
- ブラウザのコンソールでエラーを確認
- Stripeダッシュボードの「ログ」でAPIエラーを確認
- ネットワークタブで通信エラーを確認

## 10. 実装の詳細

### ファイル構成

- **plugins/stripe.client.ts**: Stripeクライアントの初期化
- **composables/useStripePayment.ts**: Stripe決済機能のcomposable
- **server/api/stripe/create-payment-intent.post.ts**: Payment Intent作成API
- **server/api/stripe/update-payment-intent.post.ts**: Payment Intent更新API
- **pages/booking/request.vue**: 予約フォームとStripe Payment Element統合
- **pages/booking/complete.vue**: 決済完了ページ

### 決済フロー

1. **ページ読み込み時**:
   - Payment Intentを作成（金額とメタデータを含む）
   - Stripe Elementsを初期化
   - Payment Elementをページにマウント

2. **フォーム送信時**:
   - Payment Intentのメタデータを最新のゲスト情報で更新
   - 予約データをFirestoreに保存
   - `stripe.confirmPayment()`を呼び出し
   - 決済完了後、自動的に完了ページにリダイレクト

3. **完了ページ**:
   - URLパラメータから`payment_intent_client_secret`を取得
   - Payment Intentのステータスを確認
   - 成功・処理中・失敗の状態を表示

## 関連リンク

- [Stripe公式ドキュメント](https://stripe.com/docs)
- [Stripe.js リファレンス](https://stripe.com/docs/js)
- [Payment Intents API](https://stripe.com/docs/api/payment_intents)
- [Payment Element](https://stripe.com/docs/payments/payment-element)
- [テストカード番号](https://stripe.com/docs/testing)
