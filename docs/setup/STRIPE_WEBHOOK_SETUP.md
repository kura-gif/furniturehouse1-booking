# Stripe Webhook 本番設定ガイド

**最終更新**: 2026年1月20日

## 概要

Stripeからの決済イベント（成功、失敗、返金など）をリアルタイムで受け取るために、Webhookエンドポイントの設定が必要です。

## 設定手順

### 1. Stripe Dashboardにアクセス

1. https://dashboard.stripe.com にログイン
2. 右上で**本番環境**に切り替え（テストモードではないことを確認）
3. 左メニューの「開発者」→「Webhooks」をクリック

### 2. エンドポイントを追加

1. 「エンドポイントを追加」ボタンをクリック
2. 以下の情報を入力：

| 項目 | 値 |
|------|-----|
| エンドポイントURL | `https://あなたのドメイン/api/stripe/webhook` |
| バージョン | 最新のAPIバージョン |
| 説明 | 家具の家 No.1 予約システム |

### 3. 受信イベントを選択

以下のイベントにチェックを入れてください：

#### 必須イベント

- `payment_intent.amount_capturable_updated` - 与信確保成功（審査フロー開始）
- `payment_intent.succeeded` - 決済成功
- `payment_intent.payment_failed` - 決済失敗
- `payment_intent.canceled` - 決済キャンセル（審査却下時）
- `charge.refunded` - 返金完了

#### オプション（推奨）

- `payment_intent.created` - Payment Intent作成
- `charge.succeeded` - 課金成功

### 4. 署名シークレットを取得

1. エンドポイント作成後、詳細ページを開く
2. 「署名シークレット」セクションの「表示」をクリック
3. `whsec_` で始まるシークレットをコピー

### 5. 環境変数に設定

#### Vercelの場合

```bash
vercel env add STRIPE_WEBHOOK_SECRET
# プロンプトで署名シークレットを入力
# Environment: Production, Preview, Development すべて選択
```

または Vercel Dashboard から：

1. Settings → Environment Variables
2. `STRIPE_WEBHOOK_SECRET` を追加
3. 値に署名シークレットを入力

#### ローカル開発の場合

`.env`ファイルに追加:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
```

### 6. 再デプロイ

```bash
git commit --allow-empty -m "Update Stripe webhook secret"
git push origin main
```

## 動作確認

### Stripe CLIでローカルテスト

```bash
# Stripe CLIインストール
brew install stripe/stripe-cli/stripe

# ログイン
stripe login

# Webhookをローカルに転送
stripe listen --forward-to localhost:3000/api/stripe/webhook

# テストイベント送信
stripe trigger payment_intent.succeeded
```

### 本番環境での確認

1. Stripe Dashboard → Webhooks → 作成したエンドポイント
2. 「最近のイベント」タブでイベント配信状況を確認
3. ステータスコード `200` が返っていれば成功

## イベント処理の流れ

```
予約リクエスト
    ↓
[payment_intent.amount_capturable_updated]
    ↓ 与信確保成功 → 管理者へ審査通知メール
    ↓
管理者が承認/却下
    ↓
承認の場合: [payment_intent.succeeded]
    ↓ 決済確定 → ゲストへ予約確定メール
    ↓
却下の場合: [payment_intent.canceled]
    ↓ 与信リリース → ゲストへ却下通知メール
```

## トラブルシューティング

### Webhookが受信できない

1. **エンドポイントURLの確認**
   - `https://` で始まっているか
   - 末尾に `/api/stripe/webhook` が含まれているか

2. **署名検証エラー (400 Bad Request)**
   - `STRIPE_WEBHOOK_SECRET` が正しく設定されているか確認
   - 本番用とテスト用で異なるシークレットが必要

3. **タイムアウト (504)**
   - Webhook処理が重すぎる場合、非同期処理を検討

### イベントの再送

1. Stripe Dashboard → Webhooks → エンドポイント
2. 「最近のイベント」から失敗したイベントを選択
3. 「再送」ボタンをクリック

## セキュリティ

- Webhook署名検証により、Stripeからのリクエストのみ処理
- 冪等性チェックにより、同じイベントの重複処理を防止
- 処理ログはFirestore `webhookLogs` コレクションに保存

## 関連ファイル

- `/server/api/stripe/webhook.post.ts` - Webhookエンドポイント実装
- `/server/api/bookings/approve.post.ts` - 予約承認API
- `/server/api/bookings/reject.post.ts` - 予約却下API
