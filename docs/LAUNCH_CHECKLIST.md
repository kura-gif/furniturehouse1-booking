# booking.furniturehouse1.com 公開準備レポート

最終更新: 2026年1月7日

## プロジェクト構造概要

| カテゴリ | 技術スタック |
|---------|------------|
| フロントエンド | Nuxt 3 + Vue 3 + Tailwind CSS |
| バックエンド | Nuxt Server API (Nitro) |
| データベース | Firebase Firestore |
| 認証 | Firebase Authentication |
| 決済 | Stripe（与信確保→審査→キャプチャ方式）|
| メール | Nodemailer (Gmail) |
| ホスティング | Vercel |

---

## 重大な問題点（公開前に必ず対応）

### 1. 環境変数・秘密情報の漏洩リスク

| 問題 | 対応 |
|------|------|
| `.env`ファイルに本番キーが含まれている | Vercelの環境変数で管理し、`.env`はローカル開発用のみに |
| `FIREBASE_ADMIN_KEY`がBase64で保存されている | 正しい設計だが、Vercelで`FIREBASE_ADMIN_KEY`を必ず設定 |
| Stripe テストキー使用中 | **本番公開前に本番キーに切り替え必須** |

### 2. Stripe Webhook設定

| 項目 | 状態 | 対応 |
|------|------|------|
| Webhook Secret | テスト用設定 | Stripe Dashboardで本番用Webhook URLを登録し、シークレットを更新 |
| 処理イベント | `payment_intent.amount_capturable_updated`, `payment_intent.succeeded`, etc. | 実装済み |

### 3. 本番URL設定

```
.env の SITE_URL=http://localhost:3001
→ 本番: SITE_URL=https://booking.furniturehouse1.com
```

---

## 中優先度の問題点

### 4. セキュリティ

| 項目 | 状態 | 詳細 |
|------|------|------|
| CSRF保護 | 実装済み | `nuxt-csurf`使用、Webhook等は除外 |
| 認証ミドルウェア | 実装済み | admin.ts, supporter.ts, auth.ts |
| Firestore Rules | 実装済み | 詳細なロールベースアクセス制御 |
| CSP Headers | 重複設定あり | nuxt.config.ts と security-headers.ts で重複 |
| API認証 | 実装済み | Firebase ID Token検証 |

### 5. メール通知

| 項目 | 状態 | 詳細 |
|------|------|------|
| Gmail SMTP | 設定済み | アプリパスワード使用 |
| 予約確認メール | 実装済み | 審査中/確定の両パターン対応 |
| 決済失敗通知 | 実装済み | ゲスト・管理者両方に通知 |
| 返金通知 | 実装済み | |

**注意**: Gmailは1日500通の送信制限あり。大量予約が予想される場合はSendGrid等への移行を検討。

### 6. 料金計算

| 項目 | 状態 |
|------|------|
| サーバーサイド検証 | 実装済み（pricing.ts）|
| Zodバリデーション | 実装済み |
| クーポン検証 | 実装済み |

---

## 実装済み機能（問題なし）

### 管理画面 (`/admin`)

- 予約一覧・詳細表示
- 予約審査（承認/却下）
- 与信期限アラート
- 本日のチェックイン/アウト表示
- 清掃タスク管理
- サポーター管理
- 料金設定（拡張料金対応）
- レビュー管理
- クーポン管理
- メッセージ機能

### ゲスト予約 (`/booking`)

- カレンダー選択
- ゲスト人数選択
- オプション選択
- 料金計算表示
- Stripe決済（与信確保方式）
- 予約確認ページ（トークンベース）
- キャンセルポリシー表示

### サポーター (`/supporter`)

- 清掃タスク管理
- 報酬履歴
- タスク完了報告

---

## 公開前チェックリスト（優先順位順）

### Phase 1: 必須（公開前に完了必須）

| # | タスク | 状態 |
|---|--------|------|
| 1 | **Vercel環境変数設定** | |
|   | - `STRIPE_SECRET_KEY` (本番キー) | [ ] 後で設定 |
|   | - `STRIPE_PUBLIC_KEY` (本番キー) | [ ] 後で設定 |
|   | - `STRIPE_WEBHOOK_SECRET` (本番) | [ ] 後で設定 |
|   | - `FIREBASE_ADMIN_KEY` | [x] 設定済み |
|   | - `EMAIL_USER` / `EMAIL_PASSWORD` | [x] 設定済み |
|   | - `SITE_URL=https://booking.furniturehouse1.com` | [x] 設定済み (2026/01/07) |
| 2 | **Stripe本番Webhook設定** | |
|   | - Stripe Dashboard → Webhook追加 | [ ] |
|   | - URL: `https://booking.furniturehouse1.com/api/stripe/webhook` | [ ] |
|   | - イベント登録確認 | [ ] |
| 3 | **ドメイン設定** | |
|   | - Vercelでカスタムドメイン設定 | [ ] |
|   | - SSL証明書確認 | [ ] |
| 4 | **Firebase本番設定確認** | |
|   | - Firestore Rules デプロイ | [ ] |
|   | - 認証設定確認 | [ ] |
| 5 | **管理者アカウント作成** | |
|   | - Firestoreで`role: 'admin'`設定 | [ ] |

### Phase 2: 推奨（公開後早期対応）

| # | タスク | 状態 |
|---|--------|------|
| 6 | エラー監視設定 | |
|   | - Sentry等の導入検討 | [ ] |
| 7 | バックアップ設定 | |
|   | - Firestoreバックアップ | [ ] |
| 8 | ログ監視設定 | |
|   | - Vercel Logs確認 | [ ] |
| 9 | パフォーマンス最適化 | |
|   | - 画像最適化確認 | [ ] |
|   | - Core Web Vitals確認 | [ ] |

### Phase 3: 運用開始後

| # | タスク | 状態 |
|---|--------|------|
| 10 | テスト予約実行 | [ ] |
| 11 | 決済フロー確認（本番） | [ ] |
| 12 | メール到達確認 | [ ] |
| 13 | レスポンシブ確認（モバイル） | [ ] |

---

## 公開手順

### 1. Vercel環境変数を設定

```bash
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_PUBLIC_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add FIREBASE_ADMIN_KEY production
vercel env add EMAIL_USER production
vercel env add EMAIL_PASSWORD production
vercel env add SITE_URL production
# SITE_URL の値: https://booking.furniturehouse1.com
```

### 2. Stripeダッシュボードで本番Webhook設定

1. [Stripe Dashboard](https://dashboard.stripe.com/) にログイン
2. 本番モード（Live mode）に切り替え
3. 開発者 → Webhooks → エンドポイントを追加
4. URL: `https://booking.furniturehouse1.com/api/stripe/webhook`
5. 以下のイベントを選択:
   - `payment_intent.amount_capturable_updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `payment_intent.canceled`
6. 署名シークレットをコピーして`STRIPE_WEBHOOK_SECRET`に設定

### 3. デプロイ実行

```bash
vercel --prod
```

### 4. ドメイン設定

1. Vercel Dashboard → プロジェクト → Settings → Domains
2. `booking.furniturehouse1.com` を追加
3. DNS設定（CNAMEまたはAレコード）を確認
4. SSL証明書が自動発行されることを確認

### 5. Firestore Rulesデプロイ

```bash
firebase deploy --only firestore:rules
```

### 6. 動作確認

1. 管理画面ログイン確認
2. テスト予約実行
3. メール到達確認
4. 決済フロー確認

---

## 注意点

### 1. 与信期限

Stripeの与信確保は**7日間**有効です。審査が遅れると与信が失効し、再度カード情報の入力が必要になります。管理画面の与信期限アラートを必ず確認してください。

### 2. テストモードと本番モード

現在の`.env`ファイルにはテストキーが設定されています。本番公開時は必ず本番キーに切り替えてください。

**テストキーの特徴:**
- `pk_test_` で始まる公開キー
- `sk_test_` で始まる秘密キー

**本番キーの特徴:**
- `pk_live_` で始まる公開キー
- `sk_live_` で始まる秘密キー

### 3. CSPヘッダー重複

`nuxt.config.ts`と`server/middleware/security-headers.ts`の両方でCSP（Content Security Policy）が設定されています。どちらかに統一することを推奨します。

### 4. Gmail送信制限

Gmailアプリパスワードを使用したSMTP送信は、1日あたり**500通**の制限があります。大量の予約が予想される場合は、以下のサービスへの移行を検討してください:

- SendGrid
- Amazon SES
- Mailgun

---

## ファイル構成（参考）

```
furniturehouse1/
├── pages/
│   ├── admin/          # 管理画面
│   ├── booking/        # 予約フロー
│   ├── supporter/      # サポーター画面
│   └── ...
├── server/
│   ├── api/
│   │   ├── admin/      # 管理API
│   │   ├── bookings/   # 予約API
│   │   ├── emails/     # メール送信API
│   │   └── stripe/     # 決済API
│   ├── middleware/     # セキュリティミドルウェア
│   └── utils/          # ユーティリティ
├── composables/        # Vue composables
├── middleware/         # ルートミドルウェア
├── firestore.rules     # Firestoreセキュリティルール
└── nuxt.config.ts      # Nuxt設定
```

---

## 関連ドキュメント

- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイ手順
- [SECURITY.md](../SECURITY.md) - セキュリティ実装詳細
- [STRIPE_WEBHOOK_SETUP.md](../STRIPE_WEBHOOK_SETUP.md) - Stripe Webhook設定
- [EMAIL_SETUP_GUIDE.md](../EMAIL_SETUP_GUIDE.md) - メール設定ガイド
