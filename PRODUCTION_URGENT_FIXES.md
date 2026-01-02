# 🚨 本番環境 緊急対応ガイド

## ⚠️ 重要: すぐに対応が必要です

本番環境で**予約システムのコア機能が動作していない**可能性が非常に高いです。
以下の手順で**即座に修正**してください。

---

## 🔴 最優先対応（今すぐ実行）

### 1. Vercel環境変数の設定【5分】

Vercel ダッシュボードにアクセス:
https://vercel.com/kurashimayouichis-projects/furniturehouse1/settings/environment-variables

以下の2つの環境変数を**今すぐ追加**:

```bash
# 1. Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=<Stripe Dashboardから取得>

# 2. 内部API認証シークレット（STRIPE_WEBHOOK_SECRETと同じ値でOK）
INTERNAL_API_SECRET=<STRIPE_WEBHOOK_SECRETと同じ値>
```

#### Stripe Webhook Secretの取得方法:
1. https://dashboard.stripe.com/ にログイン
2. Developers → Webhooks
3. エンドポイント `https://booking.furniturehouse1.com/api/stripe/webhook` を選択
4. 「Signing secret」をコピー（`whsec_`で始まる文字列）

#### 設定後:
```bash
# Vercelで即座に再デプロイ
vercel --prod
```

---

### 2. Firestore Indexesのデプロイ【3分】

```bash
cd /Users/kurashimayouichi/Documents/furniturehouse1

# Firestore Indexesをデプロイ
firebase deploy --only firestore:indexes
```

**修正内容**: 古い`startDate`フィールドのインデックスを削除（すでにコードで修正済み）

---

### 3. コードのデプロイ【5分】

修正済みのコードを本番環境にデプロイ:

```bash
# Gitにコミット
git add .
git commit -m "fix: 本番環境の緊急修正 - フィールド名統一、環境変数対応"
git push origin main

# Vercelは自動デプロイされます
```

---

## 🟡 確認事項（デプロイ後）

### 1. 環境変数の確認

```bash
# Vercel環境変数を確認
vercel env ls

# 以下が設定されているか確認:
# - STRIPE_WEBHOOK_SECRET
# - INTERNAL_API_SECRET
```

### 2. Webhookのテスト

Stripe Dashboardでテストイベントを送信:

1. https://dashboard.stripe.com/test/webhooks
2. エンドポイント選択 → 「Send test webhook」
3. イベントタイプ: `payment_intent.succeeded`
4. 「Send test webhook」クリック

**期待される結果**:
- ステータスコード `200`
- Vercelログに `✅ Booking confirmed` が表示される

### 3. 予約フローのテスト

実際に予約を作成してテスト:

1. https://booking.furniturehouse1.com/ で予約を作成
2. テストカード `4242 4242 4242 4242` で決済
3. 以下を確認:
   - ✅ 決済が成功する
   - ✅ Webhookが正常に処理される
   - ✅ 予約ステータスが `confirmed` に更新される
   - ✅ 確認メールが届く

---

## 📊 修正された問題の詳細

### 問題1: Payment Intentフィールド名の不整合【修正済み】

**症状**:
- 予約作成時に `paymentIntentId` で保存
- Webhookは `stripePaymentIntentId` で検索
- → **Webhookが予約を見つけられず、ステータス更新失敗**

**修正内容**:
- [server/api/bookings/create-secure.post.ts:136](server/api/bookings/create-secure.post.ts#L136)
  ```typescript
  // 修正前
  paymentIntentId: '',

  // 修正後
  stripePaymentIntentId: '',
  ```

---

### 問題2: Stripe Webhook Secretが未設定【要対応】

**症状**:
- `.env` に `STRIPE_WEBHOOK_SECRET=` （空文字列）
- Webhookの署名検証が失敗
- → **決済イベントが処理されない**

**対応**:
- Vercel環境変数に `STRIPE_WEBHOOK_SECRET` を設定（上記手順1参照）

---

### 問題3: 内部API認証シークレットが未設定【要対応】

**症状**:
- `INTERNAL_API_SECRET` が未設定
- `/api/emails/send-booking-confirmation` が動作しない
- → **確認メールが送信されない**

**対応**:
- Vercel環境変数に `INTERNAL_API_SECRET` を設定（上記手順1参照）

---

### 問題4: Firestore Indexesの古いフィールド参照【修正済み】

**症状**:
- `firestore.indexes.json` に `startDate` フィールドの古いインデックス
- 新しい `checkInDate` フィールドと重複
- → **クエリが最適化されない**

**修正内容**:
- [firestore.indexes.json:31-44](firestore.indexes.json#L31-L44) を削除済み

**対応**:
- `firebase deploy --only firestore:indexes` でデプロイ（上記手順2参照）

---

## 🔍 影響範囲の詳細

### 修正前の予約フロー（❌ 失敗）:

```
1. ユーザーが予約を作成 ✅
   ↓
2. Payment Intent を作成 ✅
   ↓
3. Stripe決済成功
   ↓
4. Webhookで決済成功イベントを受信
   ↓
5. ❌ STRIPE_WEBHOOK_SECRET が空
   → 署名検証失敗
   ↓
6. ❌ イベント処理が中断される
   ↓
7. ❌ 予約ステータスが更新されない (pending のまま)
   ↓
8. ❌ 確認メールが送信されない
```

### 修正後の予約フロー（✅ 成功）:

```
1. ユーザーが予約を作成 ✅
   ↓
2. Payment Intent を作成 ✅
   ↓
3. Stripe決済成功
   ↓
4. Webhookで決済成功イベントを受信
   ↓
5. ✅ STRIPE_WEBHOOK_SECRET で署名検証
   → 成功
   ↓
6. ✅ stripePaymentIntentId で予約を検索
   → 見つかる
   ↓
7. ✅ 予約ステータスを confirmed に更新
   ↓
8. ✅ INTERNAL_API_SECRET で内部API呼び出し
   ↓
9. ✅ 確認メールが送信される
```

---

## 🚀 デプロイ後の最終確認チェックリスト

### Vercel環境変数
- [ ] `STRIPE_WEBHOOK_SECRET` が設定されている
- [ ] `INTERNAL_API_SECRET` が設定されている
- [ ] 設定後に再デプロイを実行した

### Firebase
- [ ] `firebase deploy --only firestore:indexes` を実行した
- [ ] デプロイが成功した（エラーなし）

### 動作確認
- [ ] Stripe Webhookのテストが成功した（ステータス200）
- [ ] テスト予約を作成して決済が成功した
- [ ] 予約ステータスが `confirmed` に更新された
- [ ] 確認メールが届いた

---

## 📞 サポート

問題が解決しない場合は、以下のログを確認:

### Vercelログ
```bash
vercel logs --follow
```

### Firebase Functionsログ
```bash
firebase functions:log --only sendScheduledEmails
```

### Stripe Webhookログ
https://dashboard.stripe.com/test/webhooks → エンドポイント選択 → Recent deliveries

---

## 📝 関連ドキュメント

- [CODE_REVIEW_FIXES.md](CODE_REVIEW_FIXES.md) - コードレビュー修正レポート
- [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) - 環境変数リファレンス
- [QUICK_DEPLOYMENT_GUIDE.md](QUICK_DEPLOYMENT_GUIDE.md) - デプロイ手順

---

**最終更新**: 2025年12月31日
**緊急度**: 🔴 最高（即座に対応してください）
