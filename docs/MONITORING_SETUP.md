# モニタリング・アラート設定ガイド

## 概要

本番環境で安定した運用を行うために、以下の監視・アラート設定を推奨します。

## 1. Vercel モニタリング

### 1.1 エラーアラートの設定

1. Vercel Dashboardにログイン
2. プロジェクト → Settings → Notifications
3. 以下のアラートを設定：

| アラート種類 | 設定 |
|-------------|------|
| Deployment Failed | メール通知ON |
| Runtime Errors | メール通知ON |
| Build Failed | メール通知ON |

### 1.2 ログ監視

Vercel Dashboard → Deployments → 最新デプロイ → Logs

確認項目：
- エラーログ（赤色）
- Webhookエラー
- API呼び出し失敗

### 1.3 Analytics（有料プラン）

- Web Vitals監視
- レスポンス時間
- エラー率

## 2. Stripe モニタリング

### 2.1 Stripe Dashboard

https://dashboard.stripe.com にログイン

#### 確認すべき画面

1. **Payments** - 決済一覧
   - 失敗した決済を確認
   - Disputed（紛争）を即座に確認

2. **Webhooks** → 作成したエンドポイント
   - 配信失敗イベントを確認
   - 再送が必要なイベントを特定

3. **Radar** - 不正検知
   - 高リスク決済の確認
   - ブロックされた決済

### 2.2 Stripeアラート設定

1. Settings → Email alerts
2. 以下を有効化：

| アラート種類 | 重要度 |
|-------------|--------|
| Successful payments | 低 |
| Failed payments | 高 |
| Disputes | 最高 |
| Refunds | 中 |
| Payout failures | 高 |

### 2.3 Webhookアラート

Settings → Webhooks → 対象エンドポイント → Settings

- 「Disable on failure」をOFF（失敗時も継続）
- 配信失敗時のメール通知をON

## 3. Firebase モニタリング

### 3.1 Firebase Console

https://console.firebase.google.com

#### Firestore 監視

1. Firestore → 使用状況
   - 読み取り/書き込み数
   - ストレージ使用量
   - 無料枠の残り確認

2. Firestore → インデックス
   - 不足しているインデックスの確認

#### Authentication 監視

1. Authentication → Users
   - 登録ユーザー数
   - 直近のサインイン状況

2. Authentication → 使用状況
   - 認証リクエスト数

### 3.2 Firebase Performance（オプション）

Performance Monitoring を有効化すると：
- ネットワークリクエストの監視
- カスタムトレースの設定

## 4. アプリケーション内ログ

### 4.1 Firestore ログコレクション

以下のコレクションでログを確認できます：

| コレクション | 内容 |
|-------------|------|
| `operationLogs` | **運用ログ（自動記録）** - 予約、決済、メール、Cron実行など |
| `webhookLogs` | Stripe Webhookの処理ログ |
| `emailLogs` | メール送信エラーログ |
| `errorLogs` | アプリケーションエラー |
| `consistencyReports` | 整合性チェック結果 |

#### operationLogsの構造

```
category: "booking" | "payment" | "email" | "cron" | "admin" | "system" | "error"
level: "info" | "warn" | "error"
action: "BOOKING_CREATED" | "PAYMENT_CAPTURED" | "CRON_COMPLETED" など
message: 人間が読めるメッセージ
timestamp: 記録日時
duration: 処理時間（ミリ秒）※Cronジョブの場合
data: 追加データ（マスク済み）
```

### 4.2 ログ確認方法

Firebase Console → Firestore → 該当コレクション

または管理画面の「システム」タブから確認可能

### 4.3 ヘルスチェックエンドポイント

外部監視サービスから死活監視に使用できます：

```
GET /api/health

レスポンス:
{
  "status": "healthy" | "degraded" | "unhealthy",
  "services": {
    "firestore": { "status": "healthy", "latency": 45 },
    "stripe": { "status": "healthy", "latency": 120 }
  },
  "uptime": 3600
}
```

- **200**: 正常
- **503**: サービス異常

#### 監視サービスの設定例（UptimeRobot）

1. UptimeRobot（https://uptimerobot.com/）にログイン
2. 「Add New Monitor」
3. Monitor Type: HTTP(s)
4. URL: `https://booking.furniturehouse1.com/api/health`
5. Monitoring Interval: 5 minutes
6. Alert Contacts: 管理者メール

## 5. 推奨監視ルーティン

### 毎日の確認事項

- [ ] Stripe Dashboard で決済状況確認
- [ ] 失敗した決済がないか確認
- [ ] Webhook配信状況確認

### 毎週の確認事項

- [ ] Vercel ログでエラー確認
- [ ] Firebase 使用量確認
- [ ] 管理画面の整合性チェック実行

### 毎月の確認事項

- [ ] Firestore バックアップ確認
- [ ] 不要なログデータの削除検討
- [ ] 料金プランの見直し

## 6. 緊急時の対応

### Webhookが届かない場合

1. Stripe Dashboard → Webhooks → イベントログ確認
2. エンドポイントURLの確認
3. 署名シークレットの確認
4. 失敗イベントの手動再送

### 決済が失敗した場合

1. Stripe Dashboard で詳細確認
2. エラーコードを確認
3. 顧客への連絡（必要に応じて）
4. 管理画面で予約ステータス確認

### サーバーエラーが発生した場合

1. Vercel Dashboard でログ確認
2. 直近のデプロイに問題がないか確認
3. 必要に応じて前のバージョンにロールバック
   - Deployments → 前のデプロイ → Promote to Production

## 7. 外部サービス導入（オプション）

より高度な監視が必要な場合：

### Sentry（エラートラッキング）

```bash
npm install @sentry/nuxt
```

### LogRocket（セッション記録）

ユーザー操作の再生とエラー追跡

### Datadog / New Relic

APM（Application Performance Monitoring）
