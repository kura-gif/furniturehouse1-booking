# Stripe Webhook Secret セットアップ手順

## 🔑 Webhook Secretの取得

### オプション1: 既存のWebhookエンドポイントがある場合

1. **Stripe Dashboard Webhooksページにアクセス**
   https://dashboard.stripe.com/test/webhooks

2. **既存のエンドポイントをクリック**
   - URLが `https://booking.furniturehouse1.com/api/stripe/webhook` のエンドポイント

3. **Signing secretをコピー**
   - 「Signing secret」セクションの「Reveal」をクリック
   - `whsec_xxxxxxxxxxxxxx` の形式

4. **.envファイルに追加**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
   ```

---

### オプション2: Webhookエンドポイントがまだない場合

**デプロイ後に設定するので、今はスキップしてOK**

`.env`ファイルは現状のまま（空欄）で問題ありません:
```bash
STRIPE_WEBHOOK_SECRET=
```

デプロイが完了したら、以下の手順で設定します:

1. Stripe Dashboard → Webhooks
2. 「Add endpoint」をクリック
3. Endpoint URL: `https://booking.furniturehouse1.com/api/stripe/webhook`
4. Events to send: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. 作成後、Signing secretを取得して環境変数に設定

---

## 🚀 推奨

**今は空欄のままでOK。デプロイ後に設定します。**
