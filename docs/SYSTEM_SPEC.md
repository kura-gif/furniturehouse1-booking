# 家具の家 No.1 予約システム 全体仕様書

**バージョン**: 2.1
**最終更新日**: 2025年1月5日
**プロジェクト**: 民泊予約・清掃管理統合システム

---

## 1. システム概要

### 1.1 プロジェクト概要

坂茂氏による1995年の建築作品「家具の家 No.1」を活用した1日1組限定の宿泊施設向け予約・運営管理システム。

### 1.2 技術スタック

| カテゴリ | 技術 |
| -------- | ---- |
| フレームワーク | Nuxt 3 (Vue 3) |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| データベース | Firebase Firestore |
| 認証 | Firebase Authentication |
| ストレージ | Firebase Storage |
| 決済 | Stripe |
| ホスティング | Vercel |
| メール送信 | Nodemailer (Gmail SMTP) |

### 1.3 主要機能一覧

| 機能カテゴリ | 機能名 | 状態 |
| ------------ | ------ | ---- |
| 予約 | 宿泊予約（カレンダー選択・料金計算） | ✅ 完了 |
| 予約 | 予約確認・照会 | ✅ 完了 |
| 決済 | Stripe決済 | ✅ 完了 |
| 料金 | ダイナミックプライシング | ✅ 完了 |
| 料金 | シーズン別・曜日別・人数別料金 | ✅ 完了 |
| 管理 | 管理者ダッシュボード | ✅ 完了 |
| 管理 | 予約管理（確認・キャンセル） | ✅ 完了 |
| 管理 | ブロック日管理 | ✅ 完了 |
| 管理 | 料金設定管理 | ✅ 完了 |
| 審査 | 予約審査フロー（承認/却下） | ✅ 完了 |
| サポーター | サポーター登録・管理 | ✅ 完了 |
| サポーター | 清掃タスク管理 | ✅ 完了 |
| サポーター | 報酬計算・月次レポート | ✅ 完了 |
| メール | 予約確認メール自動送信 | ✅ 完了 |
| メール | タスク割り当て通知 | ✅ 完了 |
| メール | 審査結果通知（承認/却下） | ✅ 完了 |

---

## 2. システム構成

### 2.1 ディレクトリ構成

```
furniturehouse1/
├── pages/                    # ページコンポーネント
│   ├── index.vue             # トップページ
│   ├── booking/              # 予約関連
│   │   ├── index.vue         # 予約カレンダー
│   │   ├── request.vue       # 予約リクエスト
│   │   └── view.vue          # 予約確認
│   ├── admin/                # 管理者画面
│   │   ├── index.vue         # ダッシュボード
│   │   ├── supporters.vue    # サポーター管理
│   │   ├── cleaning-tasks.vue # 清掃タスク管理
│   │   └── compensation-report.vue # 報酬レポート
│   └── supporter/            # サポーター画面
│       ├── index.vue         # ダッシュボード
│       └── task/[id].vue     # タスク詳細
├── components/               # 再利用コンポーネント
│   ├── AppHeader.vue         # ヘッダー
│   ├── PricingCalendar.vue   # 料金カレンダー
│   ├── AdminCalendarView.vue # 管理者カレンダー
│   ├── AdminEnhancedPricingSettings.vue # 料金設定
│   └── TaskCard.vue          # タスクカード
├── composables/              # ロジック
│   ├── useAuth.ts            # 認証
│   ├── useBookings.ts        # 予約管理
│   ├── useBlockedDates.ts    # ブロック日
│   ├── useEnhancedPricing.ts # 料金計算
│   ├── useCleaningTasks.ts   # 清掃タスク
│   ├── useEmail.ts           # メール送信
│   └── usePricingSettings.ts # 料金設定
├── middleware/               # ミドルウェア
│   ├── admin.ts              # 管理者認証
│   └── supporter.ts          # サポーター認証
├── server/api/               # APIエンドポイント
│   ├── bookings/             # 予約API
│   ├── stripe/               # 決済API
│   ├── emails/               # メールAPI
│   └── admin/                # 管理者API
├── plugins/                  # プラグイン
│   └── firebase.client.ts    # Firebase初期化
├── types/                    # 型定義
│   └── index.ts              # 全型定義
└── docs/                     # ドキュメント
    ├── SYSTEM_SPEC.md        # 本仕様書
    ├── cleaning-task-spec.md # 清掃タスク仕様
    └── requirements.md       # 要件定義書
```

### 2.2 Firestoreコレクション構成

```
firestore/
├── bookings/          # 予約データ
├── users/             # ユーザーデータ（全ロール）
├── supporters/        # サポーター追加データ
├── cleaningTasks/     # 清掃タスク
├── blockedDates/      # ブロック日
├── enhancedPricingSettings/ # 料金設定
├── coupons/           # クーポン
├── reviewLogs/        # 審査ログ
├── emailTemplates/    # メールテンプレート
├── emailSchedules/    # メールスケジュール
├── sentEmails/        # 送信済みメール
└── adminInvitations/  # 管理者招待
```

---

## 3. 画面一覧

### 3.1 公開画面（ゲスト向け）

| パス | 画面名 | 説明 |
| ---- | ------ | ---- |
| `/` | トップページ | 施設紹介・ギャラリー |
| `/booking` | 予約カレンダー | 日程選択・料金確認 |
| `/booking/request` | 予約リクエスト | ゲスト情報入力・決済 |
| `/booking/view` | 予約確認 | 予約詳細表示 |
| `/login` | ログイン | Firebase Auth |

### 3.2 管理者画面

| パス | 画面名 | 説明 |
| ---- | ------ | ---- |
| `/admin` | ダッシュボード | 予約一覧・カレンダー・統計 |
| `/admin/supporters` | サポーター管理 | 登録・編集・有効/無効 |
| `/admin/cleaning-tasks` | 清掃タスク管理 | タスク一覧・割り当て |
| `/admin/compensation-report` | 報酬レポート | 月次集計・CSV出力 |

### 3.3 サポーター画面

| パス | 画面名 | 説明 |
| ---- | ------ | ---- |
| `/supporter` | ダッシュボード | 割り当てタスク一覧 |
| `/supporter/task/[id]` | タスク詳細 | チェックリスト・写真・完了報告 |

---

## 4. データモデル

### 4.1 予約（Booking）

```typescript
interface Booking {
  id: string
  bookingReference: string      // 例: FH-20250130-A3X9
  bookingToken: string          // セキュアトークン
  type: 'stay' | 'workshop'
  checkInDate: Timestamp
  checkOutDate: Timestamp
  guestCount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  status: 'pending' | 'pending_review' | 'confirmed' | 'cancelled' | 'completed' | 'payment_failed' | 'refunded' | 'rejected' | 'expired'
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'refunded' | 'failed'
  totalAmount: number
  baseAmount: number
  discountAmount: number
  stripePaymentIntentId?: string
  // 審査関連フィールド
  reviewStatus?: 'pending_review' | 'approved' | 'rejected' | 'expired'
  reviewDeadline?: Timestamp    // 審査期限（48時間後）
  reviewedAt?: Timestamp        // 審査完了日時
  reviewedBy?: string           // 審査した管理者ID
  rejectionReason?: string      // 却下理由
  rejectionCategory?: 'schedule_conflict' | 'capacity_exceeded' | 'maintenance' | 'other'
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 4.2 ユーザー（User）

```typescript
interface User {
  id: string
  uid?: string
  email: string
  displayName: string
  phone?: string
  role: 'admin' | 'user' | 'supporter'
  isActive?: boolean           // サポーター用
  hourlyRate?: number          // サポーター用
  transportationFee?: number   // サポーター用
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 4.3 清掃タスク（CleaningTask）

```typescript
interface CleaningTask {
  id: string
  bookingId: string
  bookingReference?: string
  taskType: 'pre_checkin' | 'post_checkout'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate: Timestamp
  estimatedDuration: number    // 分
  actualDuration?: number      // 分
  assignedTo?: string          // サポーターID
  assignedToName?: string
  startedAt?: Timestamp
  completedAt?: Timestamp
  checklist: ChecklistItem[]
  photos?: CleaningPhoto[]
  compensation?: Compensation
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 4.4 審査ログ（ReviewLog）

```typescript
interface ReviewLog {
  id: string
  bookingId: string
  bookingReference: string
  action: 'approved' | 'rejected' | 'expired'
  reason?: string               // 却下理由
  category?: 'schedule_conflict' | 'capacity_exceeded' | 'maintenance' | 'other'
  adminId: string
  adminName: string
  createdAt: Timestamp
}
```

### 4.5 料金設定（EnhancedPricingSetting）

```typescript
interface EnhancedPricingSetting {
  id: string
  type: 'stay' | 'workshop'
  isActive?: boolean
  seasonPeriods: SeasonPeriod[]
  guestCountPricing?: GuestCountPricing
  multiNightPricing?: MultiNightPricing
  weekendMultiplier?: number
  basePrice?: number
  cleaningFee?: number
  taxRate?: number
  childPricingRules?: ChildPricingRule[]
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 5. API仕様

### 5.1 予約API

| メソッド | パス | 説明 |
| -------- | ---- | ---- |
| POST | `/api/bookings/create-secure` | 予約作成（セキュア版） |
| POST | `/api/bookings/approve` | 予約承認（決済確定） |
| POST | `/api/bookings/reject` | 予約却下（与信解放） |
| GET | `/api/bookings/[id]` | 予約取得 |

### 5.2 決済API

| メソッド | パス | 説明 |
| -------- | ---- | ---- |
| POST | `/api/stripe/create-payment-intent-secure` | 決済Intent作成（与信確保） |
| POST | `/api/stripe/create-refund` | 返金処理 |
| POST | `/api/stripe/webhook` | Stripeウェブフック |

### 5.3 メールAPI

| メソッド | パス | 説明 |
| -------- | ---- | ---- |
| POST | `/api/emails/send-booking-confirmation` | 予約リクエスト受付メール |
| POST | `/api/emails/send-booking-approved` | 予約承認通知メール |
| POST | `/api/emails/send-booking-rejected` | 予約却下通知メール |
| POST | `/api/emails/send-refund-confirmation` | 返金完了通知メール |
| POST | `/api/emails/send-admin-notification` | 管理者通知メール |
| POST | `/api/emails/send-task-assignment` | タスク割り当て通知 |
| POST | `/api/emails/send-cleaning-completed` | 清掃完了通知 |

### 5.4 管理者API

| メソッド | パス | 説明 |
| -------- | ---- | ---- |
| POST | `/api/admin/create-supporter` | サポーター作成 |

---

## 6. 認証・認可

### 6.1 ユーザーロール

| ロール | 説明 | アクセス可能画面 |
| ------ | ---- | ---------------- |
| admin | 管理者 | 全画面 |
| supporter | サポーター | `/supporter/*` |
| user | 一般ユーザー | 公開画面のみ |

### 6.2 ミドルウェア

```typescript
// middleware/admin.ts
// - role === 'admin' のみ許可
// - 未認証は /login へリダイレクト

// middleware/supporter.ts
// - role === 'supporter' または 'admin' を許可
// - 未認証は /login へリダイレクト
```

### 6.3 Firestoreセキュリティルール

```javascript
// 管理者のみ書き込み可能なコレクション
match /supporters/{doc} { allow write: if isAdmin(); }
match /cleaningTasks/{doc} { allow write: if isAdmin() || isAssignedSupporter(); }
match /blockedDates/{doc} { allow write: if isAdmin(); }
match /enhancedPricingSettings/{doc} { allow write: if isAdmin(); }
```

---

## 7. セキュリティ

### 7.1 CSRF対策

```typescript
// nuxt.config.ts
nitro: {
  routeRules: {
    '/api/stripe/webhook': { csurf: false },
    '/api/stripe/create-payment-intent': { csurf: false },
    '/api/bookings/create': { csurf: false },
    '/api/emails/**': { csurf: false },
    '/api/admin/**': { csurf: false }
  }
}
```

### 7.2 CSP（Content Security Policy）

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
connect-src 'self' https://api.stripe.com https://*.googleapis.com https://*.firebaseio.com;
frame-src https://js.stripe.com https://hooks.stripe.com;
```

### 7.3 環境変数

| 変数名 | 用途 |
| ------ | ---- |
| STRIPE_SECRET_KEY | Stripe秘密鍵 |
| STRIPE_WEBHOOK_SECRET | Stripeウェブフック署名 |
| FIREBASE_ADMIN_KEY | Firebase Admin SDK |
| EMAIL_USER | Gmail送信アドレス |
| EMAIL_PASSWORD | Gmailアプリパスワード |

---

## 8. 運用フロー

### 8.1 予約フロー（審査あり）

```
[ゲスト] カレンダーで日程選択
    ↓
[ゲスト] ゲスト情報入力
    ↓
[システム] 料金計算
    ↓
[ゲスト] Stripe決済（与信確保のみ、請求はまだ）
    ↓
[システム] 予約作成（status: pending_review, paymentStatus: authorized）
    ↓
[システム] 予約リクエスト受付メール送信（ゲストへ）
    ↓
[システム] 新規予約リクエスト通知（管理者へ）
    ↓
[管理者] 予約内容を確認・審査（48時間以内）
    ↓
┌─────────────────────────────────────┐
│ 承認の場合                           │
│ [管理者] 承認ボタンをクリック         │
│     ↓                               │
│ [システム] 決済確定（capture）        │
│     ↓                               │
│ [システム] status: confirmed に更新   │
│     ↓                               │
│ [システム] 承認通知メール送信         │
│     ↓                               │
│ [システム] 清掃タスク自動生成         │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ 却下の場合                           │
│ [管理者] 却下ボタン → 理由入力        │
│     ↓                               │
│ [システム] 与信解放（cancel）         │
│     ↓                               │
│ [システム] status: rejected に更新    │
│     ↓                               │
│ [システム] 却下通知メール送信         │
│ （理由付き、別日程予約を促す）        │
└─────────────────────────────────────┘
```

### 8.1.1 審査フローの特徴

| 項目 | 説明 |
| ---- | ---- |
| 与信確保 | Stripe `capture_method: 'manual'` で与信のみ確保 |
| 審査期限 | 48時間（Stripe与信有効期限は7日間） |
| 承認時 | `paymentIntents.capture()` で決済確定 |
| 却下時 | `paymentIntents.cancel()` で与信解放、請求なし |
| 却下理由 | カテゴリ選択＋自由記述メッセージ |
| ゲスト通知 | 審査結果をメールで通知、予約詳細ページへのリンク付き |

### 8.2 清掃タスクフロー

```
[管理者] サポーター割り当て（status: assigned）
    ↓
[システム] 割り当て通知メール送信
    ↓
[サポーター] 作業開始（status: in_progress）
    ↓
[サポーター] チェックリスト・写真・完了報告
    ↓
[サポーター] 作業完了（status: completed）
    ↓
[システム] 完了通知メール送信
    ↓
[管理者] 報酬支払い（compensation.isPaid: true）
```

### 8.3 報酬計算フロー

```
[管理者] 月次レポート画面で期間選択
    ↓
[システム] 完了タスク集計
    ↓
[システム] 報酬計算（時給×時間＋交通費）
    ↓
[管理者] CSV出力 or 支払い済みマーク
```

---

## 9. 外部連携

### 9.1 Firebase

- **Authentication**: ユーザー認証（メール/パスワード）
- **Firestore**: データベース
- **Storage**: 清掃写真保存

### 9.2 Stripe

- **Payment Intents API**: 決済処理
- **Webhooks**: 決済完了通知

### 9.3 Vercel

- **ホスティング**: 本番環境
- **環境変数**: シークレット管理

---

## 10. 関連ドキュメント

| ドキュメント | パス | 説明 |
| ------------ | ---- | ---- |
| 要件定義書 | `docs/requirements.md` | 機能要件・非機能要件 |
| 清掃タスク仕様 | `docs/cleaning-task-spec.md` | サポーター管理詳細 |
| デプロイメント | `docs/DEPLOYMENT.md` | デプロイ手順 |
| 画像管理 | `docs/IMAGE_MANAGEMENT.md` | 画像アップロード仕様 |
| Firebase Storage | `docs/FIREBASE_STORAGE_SETUP.md` | ストレージ設定 |
| アメニティ | `docs/AMENITIES.md` | 備品管理仕様 |

---

## 11. 今後の拡張予定

### Phase 2

1. **多言語対応** - 英語・中国語
2. **レビュー・評価機能** - ゲストからのレビュー投稿
3. **会員制度** - リピーター向け割引
4. **ワークショップ予約** - 日帰り利用機能

### Phase 3

1. **プッシュ通知** - サポーターへの即時通知
2. **AI写真分析** - 清掃品質チェック
3. **自動スケジューリング** - サポーター空き状況による自動割り当て
4. **備品在庫連携** - 使用備品からの自動減算

---

## 12. 変更履歴

| 日付 | バージョン | 変更内容 |
| ---- | ---------- | -------- |
| 2025-01-05 | 2.1 | 予約審査フロー追加（与信確保・承認/却下機能） |
| 2025-01-05 | 2.0 | 清掃タスク管理・報酬計算機能追加 |
| 2025-01-04 | 1.5 | サポーター管理機能追加 |
| 2025-01-03 | 1.4 | 料金設定機能拡張 |
| 2025-01-02 | 1.3 | ブロック日管理追加 |
| 2025-01-01 | 1.2 | Stripe決済統合 |
| 2024-12-27 | 1.1 | Vercelデプロイ対応 |
| 2024-12-25 | 1.0 | 初版作成 |
