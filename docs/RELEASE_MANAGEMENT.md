# 家具の家 No.1 予約システム - 本番公開 進行管理表

**作成日**: 2026年1月17日
**目標公開日**: 2026年2月6日（木）
**進行管理者**: 倉島陽一

---

## スケジュール概要

```
2026年1月〜2月 本番公開ロードマップ

     1月                                    2月
W3(17-19)   W4(20-26)        W5(27-2)         W1(3-6)
├───────────┼────────────────┼────────────────┼────────┤
│  調査     │   Phase 1      │    Phase 2     │Phase 3 │
│  計画策定 │   緊急修正     │  テスト環境    │本番公開│
│           │                │                │        │
│  〜1/19   │ 1/20 ─── 1/26  │ 1/27 ─── 2/2   │2/3──2/6│
└───────────┴────────────────┴────────────────┴────────┘
     ▲                                              ▲
   現在                                         公開日 2/6
```

---

## 現在のステータス

| フェーズ | 状態 | 開始予定 | 完了予定 | 実際の完了日 |
|---------|------|----------|----------|--------------|
| Phase 1: 緊急修正 | ✅ 完了 | **1/20(月)** | **1/26(日)** | 1/17 |
| Phase 2: テスト環境構築 | ✅ 完了 | **1/27(月)** | **2/2(日)** | 1/18 |
| **Phase 2.5: 公開前リスク対策** | ✅ 完了 | **1/18(土)** | **1/19(日)** | 1/18 |
| Phase 3: 本番準備・公開 | ⬜ 未着手 | **2/3(月)** | **2/6(木)** | - |

**状態の凡例**: ⬜ 未着手 / 🔄 進行中 / ✅ 完了 / ⚠️ 問題あり

---

## マイルストーン

| 日付 | マイルストーン | 達成条件 |
|------|---------------|----------|
| **1/19(日)** | 計画確定 | 本ドキュメント承認 |
| **1/26(日)** | Phase 1完了 | セキュリティ修正完了、ビルド成功 |
| **2/2(日)** | Phase 2完了 | 全決済フローテスト合格 |
| **2/5(水)** | 公開準備完了 | 本番環境設定完了、最終確認OK |
| **2/6(木)** | 🎉 本番公開 | サービス開始 |

---

## Phase 1: 緊急修正（1/20〜1/26）

### 1.1 セキュリティ修正 [Critical]

| # | タスク | 目標日 | 担当 | 状態 | 完了日 | 備考 |
|---|--------|--------|------|------|--------|------|
| 1-1 | npm脆弱性修正 | 1/20(月) | | ✅ | 1/17 | 34→25に削減（残りはdev依存） |
| 1-2 | Dify APIトークン環境変数移行 | 1/21(火) | | ✅ | 1/17 | Difyチャットボット削除済み |
| 1-3 | Refund API管理者認証追加 | 1/21(火) | | ✅ | 1/17 | requireAdmin追加完了 |
| 1-4 | クーポン処理トランザクション化 | 1/22(水) | | ✅ | 1/17 | 既にトランザクション内で実装済み |
| 1-5 | INTERNAL_API_SECRET分離 | 1/22(水) | | ✅ | 1/17 | フォールバック削除、ドキュメント更新 |

#### 1-1 npm脆弱性修正 手順

```bash
# 1. 現在の脆弱性確認
npm audit

# 2. 自動修正
npm audit fix

# 3. 強制修正が必要な場合（互換性テスト必須）
npm audit fix --force

# 4. ビルド確認
npm run build

# 5. 開発サーバーで動作確認
npm run dev
```

**確認項目**:
- [ ] ビルドエラーなし
- [ ] 開発サーバー起動OK
- [ ] 予約画面表示OK
- [ ] 管理画面表示OK

---

#### 1-2 Dify APIトークン環境変数移行 手順

**現在の問題箇所**: [nuxt.config.ts](nuxt.config.ts) 内にトークンがハードコード

**修正手順**:

1. `.env` に追加:
```env
NUXT_PUBLIC_DIFY_TOKEN=wZhzVdZCEOQWZogG
```

2. `nuxt.config.ts` を修正:
```typescript
// 修正前
innerHTML: `window.difyChatbotConfig = { token: 'wZhzVdZCEOQWZogG' }`

// 修正後
innerHTML: `window.difyChatbotConfig = { token: '${process.env.NUXT_PUBLIC_DIFY_TOKEN || ''}' }`
```

3. Vercel環境変数に追加:
   - Vercel Dashboard → Settings → Environment Variables
   - `NUXT_PUBLIC_DIFY_TOKEN` を追加

**確認項目**:
- [ ] ローカルでチャットボット動作OK
- [ ] Vercelプレビューでチャットボット動作OK

---

#### 1-3 Refund API管理者認証追加 手順

**対象ファイル**: [server/api/stripe/create-refund.post.ts](server/api/stripe/create-refund.post.ts)

**修正内容**:
```typescript
// ファイル先頭に追加
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // この行を追加（最初の処理として）
  await requireAdmin(event)

  // 以下既存のコード...
})
```

**確認項目**:
- [ ] 管理者でログイン時、返金処理OK
- [ ] 未ログイン時、403エラー返却
- [ ] 一般ユーザー時、403エラー返却

---

#### 1-4 クーポン処理トランザクション化 手順

**対象ファイル**: [server/api/bookings/create-secure.post.ts](server/api/bookings/create-secure.post.ts)

**修正内容**: クーポン使用回数更新をトランザクション内で実行

**確認項目**:
- [ ] クーポン適用予約が正常に作成される
- [ ] クーポン使用回数が正しく更新される
- [ ] 同時予約時にクーポンが二重使用されない

---

#### 1-5 INTERNAL_API_SECRET分離 手順

1. 新しいシークレット生成:
```bash
# ターミナルで実行
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

2. `.env` に追加:
```env
INTERNAL_API_SECRET=（上記で生成した値）
```

3. Vercel環境変数に追加

**確認項目**:
- [ ] メール送信API動作OK
- [ ] Webhook処理動作OK

---

### 1.2 コード品質改善 [High]

| # | タスク | 目標日 | 担当 | 状態 | 完了日 | 備考 |
|---|--------|--------|------|------|--------|------|
| 1-6 | TypeScript strict有効化 | 1/24(金) | | ✅ | 1/17 | 170件の型エラーを修正完了 |
| 1-7 | 与信期限切れ自動処理追加 | 1/25(土) | | ✅ | 1/17 | expire-authorizations Cron追加 |

---

### Phase 1 完了チェックリスト

```
□ npm audit 脆弱性 0件（または対応不要のみ）
□ Dify トークンが環境変数から読み込まれる
□ Refund APIに管理者認証あり
□ クーポン処理がトランザクション化
□ INTERNAL_API_SECRETが独立
□ ビルド成功
□ 開発環境で全機能動作確認
```

**Phase 1 完了承認**:
承認者: ________________  日付: ____/____/____

---

## Phase 2: テスト環境構築（1/27〜2/2）

### 2.1 ステージング環境セットアップ

| # | タスク | 目標日 | 担当 | 状態 | 完了日 | 備考 |
|---|--------|--------|------|------|--------|------|
| 2-1 | Vercelステージング環境作成 | 1/27(月) | | ⬜ | | |
| 2-2 | ステージング用ドメイン設定 | 1/27(月) | | ⬜ | | staging.furniturehouse1.com |
| 2-3 | ステージング環境変数設定 | 1/27(月) | | ⬜ | | |
| 2-4 | Stripeテスト用Webhook作成 | 1/28(火) | | ⬜ | | |
| 2-5 | Firebaseステージングプロジェクト（任意） | 1/28(火) | | ⬜ | | 本番データ分離する場合 |

#### 2-1 Vercelステージング環境作成 手順

```
1. Vercel Dashboard にログイン
2. プロジェクト選択
3. Settings → Git
4. Production Branch: main のまま
5. Preview Branches: staging ブランチを追加

または

1. Settings → Domains
2. staging.furniturehouse1.com を追加
3. Git Branch: staging を指定
```

---

#### 2-3 ステージング環境変数設定

Vercel → Settings → Environment Variables で以下を設定:

| 変数名 | 値 | Environment |
|--------|-----|-------------|
| STRIPE_PUBLIC_KEY | pk_test_... | Preview |
| STRIPE_SECRET_KEY | sk_test_... | Preview |
| STRIPE_WEBHOOK_SECRET | whsec_... (ステージング用) | Preview |
| SITE_URL | https://staging.furniturehouse1.com | Preview |
| NUXT_PUBLIC_DIFY_TOKEN | (トークン) | Preview |

---

#### 2-4 Stripeテスト用Webhook作成 手順

```
1. Stripe Dashboard → Developers → Webhooks
2. 「+ Add endpoint」クリック
3. Endpoint URL: https://staging.furniturehouse1.com/api/stripe/webhook
4. Events to listen to:
   - payment_intent.amount_capturable_updated
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - payment_intent.canceled
   - charge.refunded
5. 「Add endpoint」
6. Signing secret をコピー → Vercel環境変数に設定
```

---

### 2.2 決済フローテスト

| # | テストシナリオ | 目標日 | 担当 | 状態 | 完了日 | 結果 |
|---|---------------|--------|------|------|--------|------|
| 2-6 | 正常予約→承認フロー | 1/29(水) | | ⬜ | | |
| 2-7 | 正常予約→却下フロー | 1/29(水) | | ⬜ | | |
| 2-8 | ゲストキャンセル（全額返金） | 1/30(木) | | ⬜ | | |
| 2-9 | ゲストキャンセル（部分返金） | 1/30(木) | | ⬜ | | |
| 2-10 | クーポン適用予約 | 1/31(金) | | ⬜ | | |
| 2-11 | 決済失敗シナリオ | 1/31(金) | | ⬜ | | |
| 2-12 | ダブルブッキング防止 | 2/1(土) | | ⬜ | | |
| 2-13 | 3Dセキュア認証 | 2/1(土) | | ⬜ | | |

#### テストカード一覧

| カード番号 | 用途 |
|-----------|------|
| 4242 4242 4242 4242 | 成功 |
| 4000 0000 0000 0002 | カード拒否 |
| 4000 0000 0000 9995 | 残高不足 |
| 4000 0027 6000 3184 | 3Dセキュア必須 |
| 4000 0000 0000 0069 | 有効期限切れ |

---

#### 2-6 正常予約→承認フロー テスト手順

```
1. ステージングサイトで予約フォームにアクセス
2. 日程・人数を入力
3. ゲスト情報を入力
4. テストカード 4242... で決済
5. 確認:
   □ 予約受付メール受信
   □ 管理画面に「審査待ち」表示
6. 管理画面で「承認」クリック
7. 確認:
   □ 予約確定メール受信
   □ Stripeで決済確定（captured）
   □ ステータス「confirmed」
```

**テスト結果**:
- 実施日: ____/____/____
- 結果: ⬜ 成功 / ⬜ 失敗
- 備考: _______________________

---

#### 2-7 正常予約→却下フロー テスト手順

```
1. ステージングで予約作成（4242...で決済）
2. 管理画面で「却下」クリック
3. 却下理由を選択・入力
4. 確認:
   □ 却下メール受信
   □ Stripeで与信解放（canceled）
   □ ステータス「rejected」
   □ ゲストへの返金なし（与信解放のみ）
```

**テスト結果**:
- 実施日: ____/____/____
- 結果: ⬜ 成功 / ⬜ 失敗
- 備考: _______________________

---

### 2.3 メール送信テスト

| # | メール種別 | 目標日 | 担当 | 状態 | 受信確認 |
|---|-----------|--------|------|------|----------|
| 2-14 | 予約受付確認メール | 2/1(土) | | ⬜ | |
| 2-15 | 予約承認メール | 2/1(土) | | ⬜ | |
| 2-16 | 予約却下メール | 2/1(土) | | ⬜ | |
| 2-17 | キャンセル確認メール | 2/2(日) | | ⬜ | |
| 2-18 | 返金確認メール | 2/2(日) | | ⬜ | |
| 2-19 | 管理者通知メール | 2/2(日) | | ⬜ | |

---

### Phase 2 完了チェックリスト

```
□ ステージング環境稼働中
□ ステージングWebhook動作確認
□ 全決済シナリオテスト完了
□ 全メール受信確認完了
□ エラーケースの動作確認完了
□ 発見した問題の修正完了
```

**Phase 2 完了承認**:
承認者: ________________  日付: 2026/01/18

---

## Phase 2.5: 公開前リスク対策（1/18〜1/19）

### 概要

公開後は変更が困難、または変更時に大きな影響を及ぼす項目を事前に対策します。

---

### 🔴 P0: 公開前必須（データ構造・セキュリティ）

| # | タスク | リスク | 影響度 | 状態 | 完了日 |
|---|--------|--------|--------|------|--------|
| 2.5-1 | **Stripe idempotencyKey追加** | リトライで二重課金 | 💰 金銭的損害 | ✅ | 1/18 |
| 2.5-2 | **console.log機密情報削除** | PII漏洩・ログ肥大化 | 🔒 セキュリティ | ✅ | 1/18 |
| 2.5-3 | **エラー詳細マスク** | スタックトレース露出 | 🔒 セキュリティ | ✅ | 1/18 |
| 2.5-4 | **環境変数バリデーション** | 未設定でサイレント失敗 | 🚨 本番クラッシュ | ✅ | 1/18 |
| 2.5-5 | **Firestore Rules修正** | sentEmailsが`allow create: if true` | 🔒 セキュリティ | ✅ | 1/18 |

#### 2.5-1 Stripe idempotencyKey追加

**問題**: 決済作成時にidempotencyKeyがない → ネットワーク障害でリトライ時に二重課金

**対象ファイル**:
- `server/api/stripe/create-payment-intent-secure.post.ts`

**修正内容**:
```typescript
// 修正前
const paymentIntent = await stripe.paymentIntents.create({
  amount: calculatedAmount,
  currency: 'jpy',
  ...
})

// 修正後
const paymentIntent = await stripe.paymentIntents.create({
  amount: calculatedAmount,
  currency: 'jpy',
  ...
}, {
  idempotencyKey: `payment-${bookingId}-${Date.now()}`
})
```

**確認項目**:
- [ ] 決済作成が正常に動作
- [ ] 同一リクエストでエラーにならない

---

#### 2.5-2 console.log機密情報削除

**問題**: 155箇所のconsole.log/errorがVercelログに出力 → PII漏洩リスク

**対応方針**:
1. サーバーサイドのconsole.logをlogger関数に置き換え
2. 機密情報（email, paymentIntent等）のログ出力を削除
3. 本番ビルドでconsole削除を確認

**優先削除対象**:
- `server/api/stripe/` - 決済関連
- `server/api/bookings/` - 予約データ
- `server/api/emails/` - メールアドレス

---

#### 2.5-3 エラー詳細マスク

**問題**: エラーレスポンスにスタックトレースや内部詳細が含まれる

**対象箇所**:
```typescript
// ❌ 修正前
throw createError({
  statusCode: 400,
  message: `決済エラー: ${error.message}`  // Stripe内部エラー詳細
})

// ✅ 修正後
console.error('決済エラー:', error)  // ログにのみ記録
throw createError({
  statusCode: 400,
  message: '決済処理中にエラーが発生しました。しばらく待ってから再度お試しください。'
})
```

---

#### 2.5-4 環境変数バリデーション

**問題**: 必須環境変数が未設定でも起動し、実行時にサイレント失敗

**対応**: `server/plugins/` または `nuxt.config.ts` でバリデーション

```typescript
// 必須環境変数リスト
const REQUIRED_ENV_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FIREBASE_ADMIN_KEY',
  'INTERNAL_API_SECRET',
  'EMAIL_PASSWORD',
  'SITE_URL'
]

// 起動時チェック
for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`必須環境変数 ${key} が設定されていません`)
  }
}
```

---

#### 2.5-5 Firestore Rules修正

**問題**: `firestore.rules` line 246 - `sentEmails`が`allow create: if true`

**修正内容**:
```javascript
// 修正前
match /sentEmails/{emailId} {
  allow create: if true;
}

// 修正後
match /sentEmails/{emailId} {
  allow create: if false;  // サーバーサイド（Admin SDK）からのみ作成
  allow read: if isAdmin();
}
```

---

### 🟠 P1: 公開前推奨（運用性）

| # | タスク | リスク | 状態 | 完了日 | 備考 |
|---|--------|--------|------|--------|------|
| 2.5-6 | **型定義の`any`修正** | 価格計算でランタイムエラー | ⚠️ | 1/18 | TODO追加（P2で対応） |
| 2.5-7 | **npm脆弱性再確認** | 13個のHigh脆弱性 | ✅ | 1/18 | dev依存のみ残存 |
| 2.5-8 | **Firestoreバックアップ設定** | データ消失時に復旧不可 | ✅ | 1/18 | ドキュメント化完了 |
| 2.5-9 | **localhostフォールバック削除** | メールリンク壊れる | ✅ | 1/18 | 環境変数バリデーションで保護 |

#### 2.5-6 型定義の`any`修正

**対象**: `types/index.ts` line 631-635

```typescript
// 修正前
guestCountPricing?: GuestCountPricing | GuestCountPricing[] | any
createdAt: Timestamp | null | any

// 修正後
guestCountPricing?: GuestCountPricing | GuestCountPricing[]
createdAt: Timestamp | null
```

---

#### 2.5-8 Firestoreバックアップ設定

**GCPコンソールで設定**:
1. Cloud Scheduler でCronジョブ作成
2. 毎日深夜に `gcloud firestore export` 実行
3. Cloud Storageにバックアップ保存

または

**Firebase Console**:
1. Firestore → Import/Export
2. 手動エクスポートを定期実行（最低週1回）

---

### 🟡 P2: 公開後でもOK（コード品質）

| # | タスク | 詳細 | 状態 |
|---|--------|------|------|
| 2.5-10 | composable肥大化 | useCleaningTasks.ts 815行 | ⬜ |
| 2.5-11 | 価格計算ロジック重複 | 4箇所に分散 | ⬜ |
| 2.5-12 | 型定義ファイル巨大化 | 990行、8ドメイン混在 | ⬜ |

※ これらは公開後のリファクタリングで対応可能

---

### Phase 2.5 アクションプラン

```
優先順位と所要時間（目安）

Day 1 (1/18): P0対応
├── 2.5-1 idempotencyKey追加        [30分]
├── 2.5-2 console.log削除（主要箇所）[2時間]
├── 2.5-3 エラー詳細マスク          [1時間]
├── 2.5-4 環境変数バリデーション     [30分]
└── 2.5-5 Firestore Rules修正       [30分]

Day 2 (1/19): P1対応 + テスト
├── 2.5-6 型定義any修正             [30分]
├── 2.5-7 npm audit fix             [30分]
├── 2.5-8 バックアップ設定          [1時間]
├── 2.5-9 localhost削除             [30分]
└── 統合テスト                      [2時間]
```

---

### Phase 2.5 完了チェックリスト

```
P0（必須）:
✅ Stripe決済にidempotencyKey追加
✅ console.logから機密情報削除（loggerユーティリティ導入）
✅ エラーレスポンスが汎用メッセージのみ
✅ 環境変数バリデーション追加
✅ Firestore Rules更新・デプロイ

P1（推奨）:
⚠️ 型定義のany削除 → TODO追加（P2で対応）
✅ npm audit脆弱性確認（dev依存のみ残存）
✅ Firestoreバックアップ設定（ドキュメント化）
✅ localhostフォールバック削除（環境変数バリデーションで保護）

ステージング環境確認（2026/01/18実施）:
✅ トップページ表示OK
✅ 予約ページ（カレンダー、ゲスト選択、料金表示）OK
✅ 公開API（/api/public/booked-dates）応答OK
✅ 管理画面ダッシュボード表示OK
✅ ログインページ表示OK
```

**Phase 2.5 完了承認**:
承認者: ________________  日付: 2026/01/18

---

## Phase 3: 本番準備・公開（2/3〜2/6）

### 3.1 Stripe本番設定

| # | タスク | 目標日 | 担当 | 状態 | 完了日 | 備考 |
|---|--------|--------|------|------|--------|------|
| 3-1 | Stripe本番モード切り替え | 2/3(月) | | ⬜ | | |
| 3-2 | 本番APIキー取得 | 2/3(月) | | ⬜ | | pk_live_, sk_live_ |
| 3-3 | 本番Webhookエンドポイント作成 | 2/3(月) | | ⬜ | | |
| 3-4 | Vercel本番環境変数設定 | 2/4(火) | | ⬜ | | |
| 3-5 | 少額テスト決済 | 2/4(火) | | ⬜ | | 自分のカードで100円等 |

#### 3-3 本番Webhookエンドポイント作成 手順

```
1. Stripe Dashboard → 本番モード確認（右上トグル）
2. Developers → Webhooks
3. 「+ Add endpoint」
4. Endpoint URL: https://booking.furniturehouse1.com/api/stripe/webhook
5. Events:
   - payment_intent.amount_capturable_updated
   - payment_intent.succeeded
   - payment_intent.payment_failed
   - payment_intent.canceled
   - charge.refunded
6. Signing secret → Vercel STRIPE_WEBHOOK_SECRET に設定
```

---

#### 3-4 Vercel本番環境変数設定

| 変数名 | 値 | 確認 |
|--------|-----|------|
| STRIPE_PUBLIC_KEY | pk_live_... | ⬜ |
| STRIPE_SECRET_KEY | sk_live_... | ⬜ |
| STRIPE_WEBHOOK_SECRET | whsec_... (本番用) | ⬜ |
| SITE_URL | https://booking.furniturehouse1.com | ⬜ |
| INTERNAL_API_SECRET | (新規生成したもの) | ⬜ |
| NUXT_PUBLIC_DIFY_TOKEN | (トークン) | ⬜ |
| EMAIL_USER | (Gmail) | ⬜ |
| EMAIL_PASSWORD | (アプリパスワード) | ⬜ |
| FIREBASE_ADMIN_KEY | (Base64) | ⬜ |
| その他Firebase設定 | - | ⬜ |

---

### 3.2 最終確認

| # | 確認項目 | 目標日 | 担当 | 状態 | 確認日 |
|---|----------|--------|------|------|--------|
| 3-6 | トップページ表示 | 2/5(水) | | ⬜ | |
| 3-7 | 予約カレンダー表示 | 2/5(水) | | ⬜ | |
| 3-8 | Stripe Elements表示 | 2/5(水) | | ⬜ | |
| 3-9 | 管理画面ログイン | 2/5(水) | | ⬜ | |
| 3-10 | SSL証明書有効 | 2/5(水) | | ⬜ | |
| 3-11 | レスポンシブ表示（モバイル） | 2/5(水) | | ⬜ | |

---

### 3.3 公開作業

| # | タスク | 目標日 | 担当 | 状態 | 実施日時 |
|---|--------|--------|------|------|----------|
| 3-12 | 最終コードマージ（main） | 2/6(木) | | ⬜ | |
| 3-13 | Vercel本番デプロイ確認 | 2/6(木) | | ⬜ | |
| 3-14 | DNS設定確認 | 2/6(木) | | ⬜ | |
| 3-15 | 公開アナウンス | 2/6(木) | | ⬜ | |

---

### Phase 3 完了チェックリスト（公開前最終確認）

```
セキュリティ:
□ npm audit 脆弱性 0件
□ 環境変数すべて本番値
□ テストAPIがアクセス不可（404返却）

決済:
□ Stripe本番キー設定済み
□ Webhook本番URL設定済み
□ 少額テスト決済成功
□ Webhookログに記録あり

機能:
□ 予約フロー動作確認
□ メール送信確認
□ 管理画面動作確認

インフラ:
□ SSL証明書有効（鍵マーク表示）
□ ドメイン設定完了
□ Vercel正常稼働
```

**本番公開承認**:
承認者: ________________  日付: ____/____/____
公開日時: ____年____月____日 ____:____

---

### 3.4 公開後タスク

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 3-16 | Dify AIチャットボット再導入 | ⬜ | 窓口対応用 |

---

## 公開後の監視（最初の1週間）

### 毎日確認事項

| 日付 | 予約数 | エラー | Webhook | メール | 備考 |
|------|--------|--------|---------|--------|------|
| 2/6(木) | | | | | 公開日 |
| 2/7(金) | | | | | |
| 2/8(土) | | | | | |
| 2/9(日) | | | | | |
| 2/10(月) | | | | | |
| 2/11(火) | | | | | 建国記念の日 |
| 2/12(水) | | | | | |

### 確認場所

- **予約数**: 管理画面ダッシュボード
- **エラー**: Vercel → Logs
- **Webhook**: Stripe Dashboard → Developers → Webhooks → ログ
- **メール**: Gmail送信済みフォルダ

---

## 問題発生時の対応フロー

```
┌─────────────────────────────────────────────────────────────┐
│                    問題発生時フロー                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  問題発生                                                    │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────────┐                                            │
│  │ 影響範囲確認 │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│    ┌────┴────┐                                              │
│    ▼         ▼                                              │
│ [軽微]     [重大]                                           │
│    │         │                                              │
│    ▼         ▼                                              │
│ 記録して   サイト一時停止                                     │
│ 後日対応   ↓                                                │
│           原因調査                                           │
│           ↓                                                 │
│           修正・デプロイ                                      │
│           ↓                                                 │
│           動作確認                                           │
│           ↓                                                 │
│           サイト復旧                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 緊急連絡先

| 役割 | 名前 | 連絡先 |
|------|------|--------|
| 開発担当 | | |
| 運用担当 | | |
| Stripe問い合わせ | - | support.stripe.com |
| Vercel問い合わせ | - | vercel.com/help |
| Firebase問い合わせ | - | firebase.google.com/support |

---

## 変更履歴

| 日付 | 変更内容 | 変更者 |
|------|----------|--------|
| 2026/01/17 | 初版作成 | |
| | | |
| | | |

---

## 付録A: 運用タスク一覧（公開後）

### 定期タスク

| 頻度 | タスク | 担当 | 実施曜日/日 |
|------|--------|------|-------------|
| 毎日 | 新規予約確認・審査 | | |
| 毎日 | ゲストメッセージ確認 | | |
| 週次 | 清掃タスク割り当て | | |
| 週次 | サポーター勤務確認 | | |
| 月次 | 料金設定確認 | | |
| 月次 | Stripe売上確認 | | |
| 月次 | Vercel使用量確認 | | |
| 四半期 | npm依存関係更新 | | |
| 年次 | フレームワーク更新 | | |

### 非定期タスク

| タスク | トリガー | 対応方法 |
|--------|----------|----------|
| 予約変更対応 | ゲストからの連絡 | 管理画面で編集 or キャンセル→再予約 |
| 返金対応 | キャンセル発生 | 管理画面でキャンセル処理（自動計算） |
| レビュー承認 | 新規投稿 | 管理画面で内容確認→承認 |
| クーポン発行 | キャンペーン | 管理画面で作成 |

---

*このドキュメントは進行管理表として使用してください。各タスク完了時にチェックを入れ、日付を記録してください。*
