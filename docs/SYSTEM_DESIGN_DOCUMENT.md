# 家具の家 No.1 予約システム - システム設計図書

**ドキュメントバージョン**: 1.1
**作成日**: 2026年1月17日
**最終更新**: 2026年1月20日
**プロジェクト名**: furniturehouse1
**本番URL**: https://booking.furniturehouse1.com/

---

## 目次

1. [システム概要](#1-システム概要)
2. [アーキテクチャ設計](#2-アーキテクチャ設計)
3. [技術スタック](#3-技術スタック)
4. [ディレクトリ構造](#4-ディレクトリ構造)
5. [データベース設計](#5-データベース設計)
6. [API設計](#6-api設計)
7. [認証・認可設計](#7-認証認可設計)
8. [決済システム設計](#8-決済システム設計)
9. [メール通知システム](#9-メール通知システム)
10. [フロントエンド設計](#10-フロントエンド設計)
11. [セキュリティ設計](#11-セキュリティ設計)
12. [外部連携](#12-外部連携)
13. [デプロイメント構成](#13-デプロイメント構成)
14. [問題点と改善提案](#14-問題点と改善提案)

---

## 1. システム概要

### 1.1 プロジェクト概要

「家具の家 No.1」は、建築家・坂茂氏の初期作品である住宅への宿泊予約を管理するWebアプリケーションシステムです。

### 1.2 主要機能

| 機能カテゴリ | 機能名 | 説明 |
|------------|-------|------|
| **予約管理** | 予約作成 | ゲスト/ログインユーザーの予約作成 |
| | 予約審査 | 管理者による予約承認/却下 |
| | 予約変更・キャンセル | ゲストによる変更・キャンセル |
| **決済** | Stripe決済 | クレジットカード決済（与信確保→審査→確定方式） |
| | 返金処理 | キャンセルポリシーに基づく返金 |
| **ユーザー管理** | 認証 | Email/Password、Google OAuth |
| | ロール管理 | admin, user, supporter |
| **運営管理** | 清掃タスク管理 | サポーターへのタスク割り当て |
| | 在庫管理 | 備品在庫の追跡 |
| | レビュー管理 | 口コミの承認・管理 |
| **コミュニケーション** | メッセージング | ゲスト-管理者間チャット |
| | メール通知 | 自動メール配信 |
| **ゲストガイド** | 施設案内 | WiFi、アメニティ、周辺情報 |

### 1.3 ユーザーロール

```
┌─────────────────────────────────────────────────────────────┐
│                     ユーザーロール構成                        │
├─────────────────────────────────────────────────────────────┤
│  Admin (管理者)                                              │
│  ├── 全データへのフルアクセス                                  │
│  ├── 予約承認/却下                                           │
│  ├── サポーター管理                                          │
│  ├── 料金設定・クーポン管理                                    │
│  └── システム設定                                            │
│                                                             │
│  User (一般ユーザー)                                          │
│  ├── 予約作成・確認・キャンセル                                │
│  ├── レビュー投稿                                            │
│  └── メッセージ送信                                          │
│                                                             │
│  Supporter (サポーター)                                       │
│  ├── 割り当てタスクの確認・実行                                │
│  ├── 清掃記録の登録                                          │
│  └── 在庫・メンテナンス記録                                    │
│                                                             │
│  Guest (未認証ゲスト)                                         │
│  └── 予約作成（トークンベースアクセス）                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. アーキテクチャ設計

### 2.1 全体アーキテクチャ

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              クライアント層                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │   ブラウザ    │  │   モバイル    │  │   管理画面   │                      │
│  │  (Vue 3/Nuxt) │  │   ブラウザ    │  │  (Admin)    │                      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                      │
└─────────┼──────────────────┼──────────────────┼────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              Vercel Edge                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Nuxt 3 (Nitro Runtime)                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │   Pages    │  │ Components │  │ Composables│  │ Middleware │    │   │
│  │  │  (Vue 3)   │  │  (Vue 3)   │  │ (状態管理) │  │ (認証/ルート)│    │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    Server API (Nitro)                        │   │   │
│  │  │  /api/bookings/*  /api/stripe/*  /api/admin/*  /api/emails/* │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                            外部サービス層                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐     │
│  │   Firebase   │  │    Stripe   │  │  Gmail SMTP │  │   Dify AI  │     │
│  │  Firestore   │  │  (決済処理)  │  │ (メール送信) │  │ (チャットボット)│     │
│  │  Auth        │  │  Webhooks   │  │             │  │             │     │
│  │  Storage     │  │             │  │             │  │             │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘     │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 データフロー図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        予約フロー（審査制）                               │
└─────────────────────────────────────────────────────────────────────────┘

[ゲスト]                    [システム]                    [管理者]
   │                           │                            │
   │  1. 予約フォーム入力      │                            │
   ├──────────────────────────►│                            │
   │                           │                            │
   │  2. Payment Intent作成    │                            │
   │     (capture_method:manual)│                            │
   │◄──────────────────────────┤                            │
   │                           │                            │
   │  3. カード情報入力        │                            │
   ├──────────────────────────►│                            │
   │                           │                            │
   │  4. 与信確保 (authorize)  │                            │
   │     Stripe API            │                            │
   │◄──────────────────────────┤                            │
   │                           │                            │
   │                           │  5. Webhook:               │
   │                           │     amount_capturable_updated
   │                           │                            │
   │  6. 予約受付メール        │  7. 新規予約通知           │
   │◄──────────────────────────┤───────────────────────────►│
   │                           │                            │
   │                           │  8. 審査 (承認/却下)       │
   │                           │◄───────────────────────────┤
   │                           │                            │
   │                     [承認の場合]                        │
   │                           │                            │
   │                           │  9. capture実行            │
   │                           │     Stripe API             │
   │                           │                            │
   │  10. 予約確定メール       │                            │
   │◄──────────────────────────┤                            │
   │                           │                            │
   │                     [却下の場合]                        │
   │                           │                            │
   │                           │  9'. Payment Intent        │
   │                           │      キャンセル            │
   │                           │                            │
   │  10'. 却下通知メール      │                            │
   │◄──────────────────────────┤                            │
```

### 2.3 コンポーネント依存関係

```
┌─────────────────────────────────────────────────────────────────┐
│                      Pages (Vue Components)                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  booking/index.vue                                       │    │
│  │    ├── BookingCalendar.vue                              │    │
│  │    ├── GuestSelector.vue                                │    │
│  │    ├── PricingBreakdown.vue                             │    │
│  │    └── [Stripe Elements]                                │    │
│  │                                                          │    │
│  │  admin/index.vue                                         │    │
│  │    ├── AdminCalendarView.vue                            │    │
│  │    ├── StatusBadge.vue                                  │    │
│  │    └── PaymentStatusBadge.vue                           │    │
│  │                                                          │    │
│  │  guide/*.vue                                             │    │
│  │    ├── GuideHeader.vue                                  │    │
│  │    ├── GuideBottomNav.vue                               │    │
│  │    └── GuideEmergencyContact.vue                        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                     Composables                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │  useAuth    │  │ useBookings │  │ usePricing  │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │useStripe    │  │ useCoupon   │  │useMessaging │      │    │
│  │  │Payment      │  │             │  │             │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 技術スタック

### 3.1 フロントエンド

| 技術 | バージョン | 用途 |
|-----|----------|------|
| Nuxt 3 | ^3.15.3 | フレームワーク |
| Vue 3 | latest | UIライブラリ |
| Tailwind CSS | ^6.12.2 | スタイリング |
| @nuxtjs/i18n | ^10.2.1 | 多言語対応 (日本語/英語) |
| @heroicons/vue | ^2.2.0 | アイコン |
| VueFire | ^3.2.2 | Firebase統合 |

### 3.2 バックエンド

| 技術 | バージョン | 用途 |
|-----|----------|------|
| Nitro | (Nuxt内蔵) | サーバーランタイム |
| Firebase Admin SDK | ^13.6.0 | サーバーサイドFirebase操作 |
| Stripe | 17.3.1 | 決済処理 |
| Nodemailer | ^6.9.15 | メール送信 |
| Zod | ^4.2.1 | バリデーション |
| nuxt-csurf | ^1.6.5 | CSRF保護 |

### 3.3 インフラストラクチャ

| サービス | 用途 |
|---------|------|
| Vercel | ホスティング・デプロイ |
| Firebase Firestore | NoSQLデータベース |
| Firebase Auth | 認証 |
| Firebase Cloud Storage | ファイルストレージ |
| Gmail SMTP | メール送信 |

### 3.4 外部サービス

| サービス | 用途 |
|---------|------|
| Stripe | 決済処理 |
| Dify AI | AIチャットボット |
| OpenWeather API | 天気情報 |
| SwitchBot API | スマートホーム制御 |

---

## 4. ディレクトリ構造

```
furniturehouse1/
├── pages/                          # Nuxtページ（自動ルーティング）
│   ├── index.vue                   # トップページ
│   ├── login.vue                   # ログイン
│   ├── signup.vue                  # サインアップ
│   ├── mypage.vue                  # マイページ
│   ├── booking/                    # 予約関連
│   │   ├── index.vue               # 予約フォーム
│   │   ├── view.vue                # 予約確認
│   │   ├── request.vue             # 予約リクエスト詳細
│   │   └── complete.vue            # 予約完了
│   ├── admin/                      # 管理者画面
│   │   ├── index.vue               # ダッシュボード
│   │   ├── setup.vue               # 施設設定
│   │   ├── options.vue             # オプション管理
│   │   ├── cleaning-tasks.vue      # 清掃タスク
│   │   ├── reviews.vue             # レビュー管理
│   │   ├── invitations.vue         # 招待管理
│   │   ├── supporters.vue          # サポーター管理
│   │   └── messages/               # メッセージ管理
│   ├── supporter/                  # サポーター画面
│   │   ├── index.vue               # ダッシュボード
│   │   └── task/[id].vue           # タスク詳細
│   ├── guide/                      # ゲストガイド
│   │   ├── index.vue               # ガイドトップ
│   │   ├── access.vue              # アクセス
│   │   ├── wifi.vue                # WiFi情報
│   │   ├── area.vue                # 周辺情報
│   │   ├── rules.vue               # ハウスルール
│   │   ├── checkin.vue             # チェックイン
│   │   ├── amenities.vue           # アメニティ
│   │   └── faq.vue                 # FAQ
│   └── reviews/                    # レビュー
│       ├── index.vue               # 一覧
│       └── new.vue                 # 投稿
│
├── components/                     # 再利用可能コンポーネント (24個)
│   ├── AppHeader.vue               # 共通ヘッダー
│   ├── AppFooter.vue               # 共通フッター
│   ├── Breadcrumb.vue              # パンくずナビ
│   ├── BookingCalendar.vue         # 予約カレンダー
│   ├── GuestSelector.vue           # ゲスト人数選択
│   ├── PricingBreakdown.vue        # 料金内訳
│   ├── PricingCalendar.vue         # 料金カレンダー
│   ├── StatusBadge.vue             # ステータスバッジ
│   ├── PaymentStatusBadge.vue      # 決済ステータスバッジ
│   ├── TaskCard.vue                # タスクカード
│   ├── FeatureCard.vue             # 機能カード
│   ├── WeatherWidget.vue           # 天気ウィジェット
│   ├── Admin*.vue                  # 管理者用コンポーネント群
│   └── guide/                      # ガイド用コンポーネント
│
├── composables/                    # 状態管理・ビジネスロジック (21個)
│   ├── useAuth.ts                  # 認証
│   ├── useBookings.ts              # 予約管理
│   ├── useStripePayment.ts         # Stripe決済
│   ├── usePricing.ts               # 料金計算
│   ├── useEnhancedPricing.ts       # 拡張料金計算
│   ├── useCoupon.ts                # クーポン
│   ├── useCancellationPolicy.ts    # キャンセルポリシー
│   ├── useCleaningTasks.ts         # 清掃タスク
│   ├── useMessaging.ts             # メッセージング
│   ├── useConversations.ts         # 会話管理
│   ├── useReviews.ts               # レビュー
│   ├── useGuestGuide.ts            # ゲストガイド
│   ├── useInventory.ts             # 在庫管理
│   ├── useMaintenance.ts           # メンテナンス
│   └── ...                         # その他
│
├── server/                         # サーバーサイド
│   ├── api/                        # APIエンドポイント (69個)
│   │   ├── auth/                   # 認証API
│   │   │   ├── user.get.ts
│   │   │   └── check-email.post.ts
│   │   ├── bookings/               # 予約API
│   │   │   ├── create-secure.post.ts
│   │   │   ├── approve.post.ts
│   │   │   ├── reject.post.ts
│   │   │   ├── guest-cancel.post.ts
│   │   │   ├── modify.post.ts
│   │   │   └── calculate-refund.post.ts
│   │   ├── stripe/                 # Stripe API
│   │   │   ├── create-payment-intent-secure.post.ts
│   │   │   ├── update-payment-intent.post.ts
│   │   │   ├── create-refund.post.ts
│   │   │   └── webhook.post.ts
│   │   ├── emails/                 # メールAPI (12個)
│   │   ├── admin/                  # 管理者API
│   │   ├── public/                 # 公開API
│   │   ├── conversations/          # 会話API
│   │   ├── cron/                   # 定期実行API
│   │   └── ...
│   ├── middleware/                 # サーバーミドルウェア
│   ├── plugins/                    # サーバープラグイン
│   └── utils/                      # ユーティリティ
│       ├── firebase-admin.ts       # Firebase Admin SDK
│       ├── auth.ts                 # 認証ヘルパー
│       ├── email-template.ts       # メールテンプレート
│       ├── pricing.ts              # 料金計算
│       ├── validation.ts           # Zodバリデーション
│       └── logger.ts               # ロギング
│
├── middleware/                     # クライアントミドルウェア (5個)
│   ├── auth.ts                     # 認証必須
│   ├── admin.ts                    # 管理者権限必須
│   ├── supporter.ts                # サポーター権限必須
│   ├── guest-guide.ts              # ゲストガイドアクセス
│   └── domain-redirect.ts          # ドメインリダイレクト
│
├── plugins/                        # クライアントプラグイン
│   ├── firebase.client.ts          # Firebase初期化
│   └── stripe.client.ts            # Stripe.js初期化
│
├── layouts/                        # レイアウト
│   └── guide.vue                   # ゲストガイド用
│
├── i18n/locales/                   # 翻訳ファイル
│   ├── ja.json                     # 日本語
│   └── en.json                     # 英語
│
├── types/                          # TypeScript型定義
│   └── index.ts                    # 主要型定義 (約100インターフェース)
│
├── assets/css/                     # スタイル
│   └── main.css                    # グローバルCSS
│
├── public/                         # 静的ファイル
├── config/                         # 設定ファイル
│
├── nuxt.config.ts                  # Nuxt設定
├── tailwind.config.js              # Tailwind設定
├── firestore.rules                 # Firestoreセキュリティルール
├── firestore.indexes.json          # Firestoreインデックス
├── vercel.json                     # Vercel設定
└── package.json                    # 依存関係
```

---

## 5. データベース設計

### 5.1 コレクション一覧

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Firestore Collections                            │
├────────────────────────────────────────────────────────────────────────┤
│  ◆ Core Collections                                                     │
│  ├── users                    # ユーザー情報                             │
│  ├── bookings                 # 予約データ                               │
│  ├── conversations            # 会話スレッド                             │
│  └── messages                 # メッセージ                               │
│                                                                         │
│  ◆ Pricing & Calendar                                                   │
│  ├── pricing                  # 基本料金設定                             │
│  ├── enhancedPricingSettings  # 拡張料金設定                             │
│  ├── calendar                 # カレンダー設定                           │
│  ├── blockedDates             # ブロック日                               │
│  ├── coupons                  # クーポン                                 │
│  ├── cancellationPolicies     # キャンセルポリシー                        │
│  └── bookingOptions           # 予約オプション                           │
│                                                                         │
│  ◆ Operations                                                           │
│  ├── cleaningTasks            # 清掃タスク                               │
│  ├── supportTasks             # サポートタスク                           │
│  ├── supporters               # サポーター                               │
│  ├── supporterAvailability    # サポーター稼働可能日                      │
│  ├── inventory                # 在庫                                     │
│  └── maintenanceRecords       # メンテナンス記録                         │
│                                                                         │
│  ◆ Reviews & Content                                                    │
│  ├── reviews                  # レビュー                                 │
│  ├── photos                   # 写真                                     │
│  ├── amenities                # アメニティ                               │
│  ├── guideAmenities           # ガイド用アメニティ                        │
│  ├── guideAreaSpots           # 周辺スポット                             │
│  ├── guideFaqs                # FAQ                                      │
│  └── guideRulesAgreements     # ルール同意記録                           │
│                                                                         │
│  ◆ Admin & System                                                       │
│  ├── adminInvitations         # 管理者招待                               │
│  ├── guideTokens              # ゲストガイドトークン                      │
│  ├── emailTemplates           # メールテンプレート                        │
│  ├── emailSchedules           # メールスケジュール                        │
│  ├── sentEmails               # 送信済みメールログ                        │
│  └── webhookLogs              # Webhookログ                              │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 主要コレクションスキーマ

#### bookings コレクション

```typescript
interface Booking {
  id: string
  userId?: string                    // ログインユーザーの場合のみ
  bookingReference: string           // 予約番号 (例: FH-20250117-A3X9)
  bookingToken: string               // ゲストアクセス用トークン
  type: 'stay' | 'workshop'

  // 日程
  checkInDate: Timestamp
  checkOutDate: Timestamp

  // ゲスト情報
  guestCount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  guestPostalCode: string       // 郵便番号（法定必須）
  guestAddress: string          // 住所（法定必須）
  guestOccupation: string       // 職業（法定必須）
  isForeignNational: boolean    // 外国籍フラグ
  guestNationality?: string     // 国籍（外国籍の場合必須）
  guestPassportNumber?: string  // パスポート番号（外国籍の場合必須）

  // ステータス
  status: 'pending' | 'pending_review' | 'confirmed' |
          'cancelled' | 'completed' | 'payment_failed' |
          'refunded' | 'rejected' | 'expired'
  paymentStatus: 'pending' | 'authorized' | 'paid' |
                 'refunded' | 'failed' | 'canceled'

  // 金額
  totalAmount: number
  baseAmount: number
  discountAmount: number
  couponId?: string

  // Stripe連携
  stripePaymentIntentId?: string

  // 審査関連
  reviewStatus?: 'pending_review' | 'approved' | 'rejected' | 'expired'
  reviewDeadline?: Timestamp
  reviewedAt?: Timestamp
  reviewedBy?: string
  rejectionReason?: string
  rejectionCategory?: 'schedule_conflict' | 'capacity_exceeded' |
                      'maintenance' | 'other'

  // オプション
  selectedOptions?: SelectedBookingOption[]
  optionsTotalPrice?: number

  // タイムスタンプ
  createdAt: Timestamp
  updatedAt: Timestamp
  paidAt?: Timestamp
  refundedAt?: Timestamp
  canceledAt?: Timestamp
}
```

#### users コレクション

```typescript
interface User {
  id: string
  uid?: string                       // Firebase Auth UID
  email: string
  displayName: string
  phone?: string
  role: 'admin' | 'user' | 'supporter'
  invitedBy?: string                 // 招待者UID
  lastLoginAt?: Timestamp

  // サポーター固有
  isActive?: boolean
  hourlyRate?: number
  transportationFee?: number

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

#### cleaningTasks コレクション

```typescript
interface CleaningTask {
  id: string
  bookingId: string
  bookingReference?: string
  taskType: 'pre_checkin' | 'post_checkout'
  status: 'pending' | 'assigned' | 'in_progress' |
          'completed' | 'cancelled'

  scheduledDate: Timestamp
  estimatedDuration: number          // 予定時間（分）
  actualDuration?: number            // 実績時間（分）

  assignedTo?: string                // サポーターID
  assignedToName?: string
  assignedToUid?: string             // Firebase UID

  startTime?: Timestamp
  endTime?: Timestamp

  checklist: ChecklistItem[]
  photos?: CleaningPhoto[]
  suppliesUsed?: UsedSupply[]
  notes?: string

  compensation?: {
    hourlyRate: number
    hoursWorked?: number
    transportationFee: number
    totalAmount: number
    isPaid: boolean
    paidAt?: Timestamp
  }

  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 5.3 インデックス設計

```json
{
  "indexes": [
    {
      "collectionGroup": "bookings",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "checkInDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "bookings",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "cleaningTasks",
      "fields": [
        { "fieldPath": "assignedToUid", "order": "ASCENDING" },
        { "fieldPath": "scheduledDate", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "conversations",
      "fields": [
        { "fieldPath": "guestEmail", "order": "ASCENDING" },
        { "fieldPath": "lastMessageAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reviews",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### 5.4 ER図（概念）

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │  bookings   │     │cleaningTasks│
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │◄────│ userId (FK) │────►│ bookingId   │
│ email       │     │ id (PK)     │     │ id (PK)     │
│ role        │     │ status      │     │ assignedTo  │──┐
│ displayName │     │ checkInDate │     │ status      │  │
└─────────────┘     │ totalAmount │     └─────────────┘  │
                    │ stripePI_ID │                       │
      ┌─────────────┤             │     ┌─────────────┐  │
      │             └─────────────┘     │ supporters  │  │
      │                   │             ├─────────────┤  │
      │                   │             │ id (PK)     │◄─┘
      │                   │             │ name        │
      ▼                   ▼             │ hourlyRate  │
┌─────────────┐     ┌─────────────┐     └─────────────┘
│conversations│     │   reviews   │
├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │
│ bookingId   │     │ bookingId   │
│ guestEmail  │     │ userId      │
│ unreadCount │     │ rating      │
└─────────────┘     │ status      │
      │             └─────────────┘
      ▼
┌─────────────┐
│  messages   │
├─────────────┤
│ id (PK)     │
│ convId (FK) │
│ content     │
│ senderType  │
└─────────────┘
```

---

## 6. API設計

### 6.1 API一覧

#### 認証API (`/api/auth/`)

| エンドポイント | メソッド | 説明 | 認証 |
|--------------|--------|------|-----|
| `/api/auth/user` | GET | 現在のユーザー情報取得 | Bearer Token |
| `/api/auth/check-email` | POST | メール存在確認 | - |

#### 予約API (`/api/bookings/`)

| エンドポイント | メソッド | 説明 | 認証 |
|--------------|--------|------|-----|
| `/api/bookings/create-secure` | POST | 予約作成 | - |
| `/api/bookings/approve` | POST | 予約承認 | Admin |
| `/api/bookings/reject` | POST | 予約却下 | Admin |
| `/api/bookings/guest-cancel` | POST | ゲストキャンセル | Token |
| `/api/bookings/modify` | POST | 予約変更 | User |
| `/api/bookings/calculate-refund` | POST | 返金額計算 | - |

#### Stripe API (`/api/stripe/`)

| エンドポイント | メソッド | 説明 | 認証 |
|--------------|--------|------|-----|
| `/api/stripe/create-payment-intent-secure` | POST | Payment Intent作成 | - |
| `/api/stripe/update-payment-intent` | POST | Payment Intent更新 | - |
| `/api/stripe/create-refund` | POST | 返金処理 | Admin |
| `/api/stripe/webhook` | POST | Webhookハンドラ | Stripe Signature |

#### メールAPI (`/api/emails/`)

| エンドポイント | メソッド | 説明 |
|--------------|--------|------|
| `/api/emails/send-booking-confirmation` | POST | 予約確認メール |
| `/api/emails/send-booking-approved` | POST | 承認メール |
| `/api/emails/send-booking-rejected` | POST | 却下メール |
| `/api/emails/send-booking-cancelled` | POST | キャンセルメール |
| `/api/emails/send-booking-modified` | POST | 変更メール |
| `/api/emails/send-checkin-reminder` | POST | チェックインリマインダー |
| `/api/emails/send-checkout-thankyou` | POST | サンキューメール |
| `/api/emails/send-payment-failed` | POST | 決済失敗メール |
| `/api/emails/send-refund-confirmation` | POST | 返金確認メール |
| `/api/emails/send-admin-notification` | POST | 管理者通知 |
| `/api/emails/send-task-assignment` | POST | タスク割り当て通知 |
| `/api/emails/send-message-notification` | POST | メッセージ通知 |

#### 管理者API (`/api/admin/`)

| エンドポイント | メソッド | 説明 |
|--------------|--------|------|
| `/api/admin/settings` | GET/PUT | 施設設定 |
| `/api/admin/users` | GET | ユーザー一覧 |
| `/api/admin/invite` | POST | 管理者招待 |
| `/api/admin/accept-invitation` | POST | 招待受諾 |
| `/api/admin/create-supporter` | POST | サポーター作成 |
| `/api/admin/upload-image` | POST | 画像アップロード |
| `/api/admin/consistency-check` | POST | データ整合性チェック |
| `/api/admin/options/*` | CRUD | オプション管理 |
| `/api/admin/email-templates/*` | CRUD | メールテンプレート |
| `/api/admin/email-schedules/*` | CRUD | メールスケジュール |
| `/api/admin/invitations/*` | CRUD | 招待管理 |

#### 公開API (`/api/public/`)

| エンドポイント | メソッド | 説明 |
|--------------|--------|------|
| `/api/public/settings` | GET | 施設情報 |
| `/api/public/booked-dates` | GET | 予約済み日付 |
| `/api/public/options` | GET | 予約オプション一覧 |
| `/api/public/options-availability` | POST | オプション在庫確認 |
| `/api/public/verify-invitation` | POST | 招待トークン検証 |
| `/api/public/accept-invitation` | POST | 招待受諾 |

#### Cron API (`/api/cron/`)

| エンドポイント | メソッド | 実行時間 | 説明 |
|--------------|--------|---------|------|
| `/api/cron/send-reminders` | POST | 毎日 00:00 | リマインダー送信 |
| `/api/cron/send-thankyou` | POST | 毎日 01:00 | サンキューメール送信 |

### 6.2 API認証フロー

```
┌─────────────────────────────────────────────────────────────────┐
│                       API認証パターン                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Bearer Token認証（ユーザーAPI）                               │
│  ┌──────────┐     ┌────────────┐     ┌────────────┐            │
│  │ Client   │────►│ Firebase   │────►│ Server API │            │
│  │          │◄────│ ID Token   │◄────│ (verify)   │            │
│  └──────────┘     └────────────┘     └────────────┘            │
│                                                                  │
│  2. Internal Secret認証（サーバー間通信）                         │
│  ┌──────────┐     ┌────────────┐                                │
│  │ Server   │────►│ Server API │                                │
│  │ (Webhook)│     │ x-internal │                                │
│  │          │     │ -secret    │                                │
│  └──────────┘     └────────────┘                                │
│                                                                  │
│  3. Stripe Signature認証（Webhook）                              │
│  ┌──────────┐     ┌────────────┐                                │
│  │ Stripe   │────►│ Webhook    │                                │
│  │ Webhook  │     │ signature  │                                │
│  │          │     │ verify     │                                │
│  └──────────┘     └────────────┘                                │
│                                                                  │
│  4. Booking Token認証（ゲストアクセス）                           │
│  ┌──────────┐     ┌────────────┐                                │
│  │ Guest    │────►│ API        │                                │
│  │ (no auth)│     │ token      │                                │
│  │          │     │ verify     │                                │
│  └──────────┘     └────────────┘                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. 認証・認可設計

### 7.1 認証方式

| 方式 | 対象 | 実装 |
|-----|-----|-----|
| Email/Password | 一般ユーザー | Firebase Auth |
| Google OAuth | 一般ユーザー | Firebase Auth + Google Provider |
| Booking Token | ゲスト | カスタムトークン（32文字） |
| Guest Guide Token | 宿泊ゲスト | カスタムトークン（有効期限付き） |
| Admin Invitation Token | 管理者招待 | カスタムトークン（7日有効） |

### 7.2 認可マトリクス

```
┌────────────────────┬────────┬────────┬───────────┬────────┐
│ リソース           │ Admin  │ User   │ Supporter │ Guest  │
├────────────────────┼────────┼────────┼───────────┼────────┤
│ 予約作成           │   ✓    │   ✓    │    -      │   ✓    │
│ 自分の予約閲覧     │   ✓    │   ✓    │    -      │   ✓*   │
│ 全予約閲覧         │   ✓    │   -    │    -      │   -    │
│ 予約承認/却下      │   ✓    │   -    │    -      │   -    │
│ 予約キャンセル     │   ✓    │   ✓**  │    -      │   ✓*   │
├────────────────────┼────────┼────────┼───────────┼────────┤
│ 清掃タスク閲覧     │   ✓    │   -    │    ✓***   │   -    │
│ 清掃タスク更新     │   ✓    │   -    │    ✓***   │   -    │
│ 清掃タスク作成     │   ✓    │   -    │    -      │   -    │
├────────────────────┼────────┼────────┼───────────┼────────┤
│ レビュー投稿       │   ✓    │   ✓    │    -      │   -    │
│ レビュー承認       │   ✓    │   -    │    -      │   -    │
│ レビュー閲覧(承認済)│   ✓    │   ✓    │    ✓      │   ✓    │
├────────────────────┼────────┼────────┼───────────┼────────┤
│ メッセージ送信     │   ✓    │   ✓    │    -      │   -    │
│ 全会話閲覧         │   ✓    │   -    │    -      │   -    │
├────────────────────┼────────┼────────┼───────────┼────────┤
│ 料金設定           │   ✓    │   -    │    -      │   -    │
│ クーポン管理       │   ✓    │   -    │    -      │   -    │
│ ユーザー管理       │   ✓    │   -    │    -      │   -    │
├────────────────────┼────────┼────────┼───────────┼────────┤
│ ゲストガイド       │   ✓    │   -    │    -      │   ✓****│
└────────────────────┴────────┴────────┴───────────┴────────┘

* トークン必須
** 自分の予約のみ
*** 割り当てられたタスクのみ
**** ガイドトークン必須（チェックアウト後7日まで有効）
```

### 7.3 Firestoreセキュリティルール（抜粋）

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ヘルパー関数
    function isAdmin() {
      return request.auth != null &&
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // 予約コレクション
    match /bookings/{bookingId} {
      // ゲストも予約作成可能（必須フィールドチェック）
      allow create: if request.resource.data.status == 'pending' &&
                       request.resource.data.guestName is string &&
                       request.resource.data.guestEmail is string &&
                       request.resource.data.guestPhone is string &&
                       request.resource.data.bookingReference is string &&
                       request.resource.data.bookingToken is string;

      // 認証ユーザーは自分の予約を閲覧可能
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      resource.data.guestEmail == request.auth.token.email);

      // 管理者はフルアクセス
      allow read, write: if isAdmin();
    }

    // 公開コレクション
    match /pricing/{pricingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

---

## 8. 決済システム設計

### 8.1 決済フロー（与信確保→審査→確定方式）

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Stripe決済フロー（審査制）                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────┐         ┌─────────┐         ┌─────────┐                    │
│  │  ゲスト  │         │ システム │         │  Stripe │                    │
│  └────┬────┘         └────┬────┘         └────┬────┘                    │
│       │                   │                   │                          │
│       │ 1. 予約フォーム入力│                   │                          │
│       ├──────────────────►│                   │                          │
│       │                   │                   │                          │
│       │                   │ 2. PaymentIntent  │                          │
│       │                   │    作成           │                          │
│       │                   │ capture_method:   │                          │
│       │                   │ manual            │                          │
│       │                   ├──────────────────►│                          │
│       │                   │                   │                          │
│       │                   │◄──────────────────┤                          │
│       │                   │ 3. client_secret  │                          │
│       │                   │                   │                          │
│       │ 4. Stripe Elements│                   │                          │
│       │    カード入力     │                   │                          │
│       │                   │                   │                          │
│       │ 5. confirmCardPayment                 │                          │
│       ├────────────────────────────────────────►                          │
│       │                   │                   │                          │
│       │◄────────────────────────────────────────                          │
│       │ 6. 与信確保完了   │                   │                          │
│       │    (amount_capturable)               │                          │
│       │                   │                   │                          │
│       │                   │ 7. Webhook:       │                          │
│       │                   │ payment_intent.   │                          │
│       │                   │ amount_capturable │                          │
│       │                   │ _updated          │                          │
│       │                   │◄──────────────────┤                          │
│       │                   │                   │                          │
│       │                   │ 8. 予約ステータス │                          │
│       │                   │    pending_review │                          │
│       │                   │                   │                          │
│       │                   │                   │                          │
│       │  ═════════════════ 管理者審査 ═══════════════════                 │
│       │                   │                   │                          │
│       │               [承認の場合]            │                          │
│       │                   │                   │                          │
│       │                   │ 9. capture()      │                          │
│       │                   ├──────────────────►│                          │
│       │                   │                   │                          │
│       │                   │◄──────────────────┤                          │
│       │                   │ 10. 決済確定      │                          │
│       │                   │                   │                          │
│       │ 11. 予約確定メール│                   │                          │
│       │◄──────────────────┤                   │                          │
│       │                   │                   │                          │
│       │               [却下の場合]            │                          │
│       │                   │                   │                          │
│       │                   │ 9'. cancel()      │                          │
│       │                   ├──────────────────►│                          │
│       │                   │ (与信解放)        │                          │
│       │                   │                   │                          │
│       │ 10'. 却下通知メール                   │                          │
│       │◄──────────────────┤                   │                          │
│       │                   │                   │                          │
└───────┴───────────────────┴───────────────────┴──────────────────────────┘
```

### 8.2 Stripe Webhookイベント

| イベント | 処理内容 |
|---------|---------|
| `payment_intent.amount_capturable_updated` | 与信確保成功 → `pending_review`に更新、確認メール送信 |
| `payment_intent.succeeded` | 決済確定 → `confirmed`に更新（承認APIからのcapture後） |
| `payment_intent.payment_failed` | 決済失敗 → `payment_failed`に更新、エラーメール送信 |
| `payment_intent.canceled` | 決済キャンセル → `cancelled`に更新（却下時） |
| `charge.refunded` | 返金完了 → `refunded`に更新、返金通知メール送信 |

### 8.3 返金ポリシー

```typescript
const cancellationRules = [
  { daysBeforeCheckIn: 7, refundPercentage: 100 },  // 7日以上前: 100%返金
  { daysBeforeCheckIn: 3, refundPercentage: 50 },   // 3-6日前: 50%返金
  { daysBeforeCheckIn: 1, refundPercentage: 30 },   // 1-2日前: 30%返金
  { daysBeforeCheckIn: 0, refundPercentage: 0 },    // 当日: 返金なし
]
```

---

## 9. メール通知システム

### 9.1 送信メール一覧

| メールタイプ | トリガー | 受信者 |
|------------|---------|-------|
| 予約受付確認 | 与信確保成功（Webhook） | ゲスト |
| 予約承認通知 | 管理者承認 | ゲスト |
| 予約却下通知 | 管理者却下 | ゲスト |
| 予約キャンセル通知 | ゲストキャンセル | ゲスト、管理者 |
| チェックインリマインダー | Cron（チェックイン1日/3日/7日前） | ゲスト |
| チェックアウトサンキュー | Cron（チェックアウト翌日） | ゲスト |
| 決済失敗通知 | 決済エラー（Webhook） | ゲスト、管理者 |
| 返金完了通知 | 返金完了（Webhook） | ゲスト、管理者 |
| 新規予約通知 | 予約受付 | 管理者 |
| タスク割り当て通知 | タスク割り当て | サポーター |
| メッセージ通知 | 新規メッセージ | ゲスト/管理者 |

### 9.2 メール送信設定

```typescript
// nuxt.config.ts
runtimeConfig: {
  emailUser: process.env.EMAIL_USER,           // Gmail送信アカウント
  emailPassword: process.env.EMAIL_PASSWORD,   // アプリパスワード
  emailFrom: process.env.EMAIL_FROM,           // 送信元アドレス
  emailReplyTo: process.env.EMAIL_REPLY_TO,    // 返信先アドレス
}

// Gmail SMTP設定
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailUser,
    pass: config.emailPassword
  }
})
```

### 9.3 Cronジョブ設定（vercel.json）

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 0 * * *"     // 毎日 00:00 (UTC)
    },
    {
      "path": "/api/cron/send-thankyou",
      "schedule": "0 1 * * *"     // 毎日 01:00 (UTC)
    }
  ]
}
```

---

## 10. フロントエンド設計

### 10.1 ページ構成

```
/                           # トップページ
├── /login                  # ログイン
├── /signup                 # サインアップ
├── /mypage                 # マイページ（予約一覧）
│
├── /booking/               # 予約フロー
│   ├── /                   # 予約フォーム
│   ├── /view               # 予約確認
│   ├── /request            # 予約リクエスト詳細
│   └── /complete           # 予約完了
│
├── /admin/                 # 管理者画面
│   ├── /                   # ダッシュボード
│   ├── /setup              # 施設設定
│   ├── /options            # オプション管理
│   ├── /cleaning-tasks     # 清掃タスク
│   ├── /reviews            # レビュー管理
│   ├── /invitations        # 招待管理
│   ├── /supporters         # サポーター管理
│   ├── /compensation-report # 報酬レポート
│   └── /messages/          # メッセージ管理
│       ├── /               # 一覧
│       └── /[id]           # 詳細
│
├── /supporter/             # サポーター画面
│   ├── /                   # ダッシュボード
│   └── /task/[id]          # タスク詳細
│
├── /guide/                 # ゲストガイド
│   ├── /                   # ガイドトップ
│   ├── /access             # アクセス
│   ├── /wifi               # WiFi情報
│   ├── /area               # 周辺情報
│   ├── /rules              # ハウスルール
│   ├── /checkin            # チェックイン
│   ├── /amenities          # アメニティ
│   ├── /faq                # FAQ
│   └── /about              # 施設について
│
├── /reviews/               # レビュー
│   ├── /                   # 一覧
│   └── /new                # 投稿
│
├── /messages/[id]          # メッセージ詳細
├── /accept-invitation      # 招待受諾
├── /terms                  # 利用規約
├── /privacy                # プライバシーポリシー
├── /cancellation-policy    # キャンセルポリシー
├── /house-rules            # ハウスルール
├── /workshop               # ワークショップ
├── /neighborhood           # 近隣情報
└── /access                 # アクセス
```

### 10.2 状態管理（Composables）

```typescript
// 認証状態
const { user, appUser, isAdmin, login, logout } = useAuth()

// 予約管理
const { createBooking, getBooking, cancelBooking } = useBookings()

// 決済処理
const { createPaymentIntent, confirmPayment } = useStripePayment()

// 料金計算
const { calculatePrice } = usePricing()
const { calculateEnhancedPrice } = useEnhancedPricing()

// クーポン
const { validateCoupon, applyCoupon } = useCoupon()

// メッセージング
const { sendMessage, getConversation } = useMessaging()
```

### 10.3 UIコンポーネント設計

```
┌─────────────────────────────────────────────────────────────┐
│                      レイアウト構成                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    AppHeader.vue                        │ │
│  │  [ロゴ]    [ナビゲーション]    [言語切替] [ログイン]     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Breadcrumb.vue                       │ │
│  │  トップ > 予約 > 確認                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │                     ページコンテンツ                      │ │
│  │                                                          │ │
│  │  ┌──────────────────┐  ┌──────────────────┐             │ │
│  │  │ BookingCalendar  │  │ PricingBreakdown │             │ │
│  │  │                  │  │                  │             │ │
│  │  │ [カレンダー]      │  │ [料金内訳]       │             │ │
│  │  │                  │  │                  │             │ │
│  │  └──────────────────┘  └──────────────────┘             │ │
│  │                                                          │ │
│  │  ┌──────────────────┐                                   │ │
│  │  │  GuestSelector   │                                   │ │
│  │  │ [人数選択]        │                                   │ │
│  │  └──────────────────┘                                   │ │
│  │                                                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    AppFooter.vue                        │ │
│  │  [リンク]    [利用規約]    [プライバシー]    [© 2025]    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 10.4 多言語対応

```json
// i18n/locales/ja.json
{
  "common": {
    "booking": "予約",
    "cancel": "キャンセル",
    "confirm": "確認"
  },
  "booking": {
    "title": "宿泊予約",
    "checkIn": "チェックイン",
    "checkOut": "チェックアウト",
    "guests": "宿泊人数"
  }
}

// i18n/locales/en.json
{
  "common": {
    "booking": "Booking",
    "cancel": "Cancel",
    "confirm": "Confirm"
  },
  "booking": {
    "title": "Accommodation Booking",
    "checkIn": "Check-in",
    "checkOut": "Check-out",
    "guests": "Number of Guests"
  }
}
```

---

## 11. セキュリティ設計

### 11.1 CSRF保護

```typescript
// nuxt.config.ts
csurf: {
  https: process.env.NODE_ENV === 'production',
  cookie: {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  },
  methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE']
}

// 除外ルート
nitro: {
  routeRules: {
    '/api/stripe/webhook': { csurf: false },      // Stripe Webhook
    '/api/public/**': { csurf: false },           // 公開API
    '/api/cron/**': { csurf: false },             // Cronジョブ
  }
}
```

### 11.2 Content Security Policy

```typescript
'Content-Security-Policy': `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://js.stripe.com
    https://m.stripe.com
    https://*.firebaseio.com
    https://apis.google.com
    https://accounts.google.com
    https://*.firebaseapp.com
    https://udify.app;
  style-src 'self' 'unsafe-inline'
    https://fonts.googleapis.com
    https://accounts.google.com;
  font-src 'self'
    https://fonts.gstatic.com
    data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' https: wss: blob:;
  frame-src
    https://js.stripe.com
    https://hooks.stripe.com
    https://*.firebaseapp.com
    https://www.youtube.com
    https://youtube.com
    https://accounts.google.com
    https://apis.google.com
    https://udify.app;
  worker-src 'self' blob:;
`
```

### 11.3 認証トークン管理

| トークン種別 | 有効期限 | 用途 |
|------------|---------|------|
| Firebase ID Token | 1時間（自動更新） | ユーザー認証 |
| Booking Token | 無期限 | ゲスト予約アクセス |
| Guest Guide Token | チェックアウト後7日 | ゲストガイドアクセス |
| Admin Invitation Token | 7日 | 管理者招待 |

### 11.4 機密情報管理

```
┌─────────────────────────────────────────────────────────────┐
│                   環境変数（機密情報）                       │
├─────────────────────────────────────────────────────────────┤
│  Stripe                                                      │
│  ├── STRIPE_SECRET_KEY          # Stripe秘密鍵              │
│  ├── STRIPE_PUBLIC_KEY          # Stripe公開鍵              │
│  └── STRIPE_WEBHOOK_SECRET      # Webhook署名検証シークレット│
│                                                              │
│  Firebase                                                    │
│  ├── FIREBASE_API_KEY           # Firebase API Key          │
│  ├── FIREBASE_AUTH_DOMAIN       # Auth Domain               │
│  ├── FIREBASE_PROJECT_ID        # Project ID                │
│  ├── FIREBASE_STORAGE_BUCKET    # Storage Bucket            │
│  ├── FIREBASE_ADMIN_KEY         # Admin SDK Key (Base64)    │
│  ├── FIREBASE_CLIENT_EMAIL      # Service Account Email     │
│  └── FIREBASE_PRIVATE_KEY       # Private Key               │
│                                                              │
│  Email                                                       │
│  ├── EMAIL_USER                 # Gmail送信アカウント        │
│  ├── EMAIL_PASSWORD             # Gmailアプリパスワード      │
│  ├── EMAIL_FROM                 # 送信元アドレス             │
│  └── EMAIL_REPLY_TO             # 返信先アドレス             │
│                                                              │
│  Other                                                       │
│  ├── INTERNAL_API_SECRET        # 内部API認証シークレット    │
│  ├── CRON_SECRET                # Cron認証シークレット       │
│  ├── SWITCHBOT_TOKEN            # SwitchBot API Token       │
│  ├── SWITCHBOT_SECRET           # SwitchBot Secret          │
│  └── OPENWEATHER_API_KEY        # OpenWeather API Key       │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. 外部連携

### 12.1 Firebase連携

```typescript
// クライアントサイド: plugins/firebase.client.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    // ...
  }

  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  return {
    provide: {
      auth,
      db
    }
  }
})

// サーバーサイド: server/utils/firebase-admin.ts
import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

let app: App | null = null

export function getFirestoreAdmin() {
  if (!app) {
    const config = useRuntimeConfig()
    const serviceAccount = JSON.parse(
      Buffer.from(config.firebaseAdminKey, 'base64').toString()
    )
    app = initializeApp({
      credential: cert(serviceAccount)
    })
  }
  return getFirestore(app)
}
```

### 12.2 Stripe連携

```typescript
// server/api/stripe/create-payment-intent-secure.post.ts
import Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  const body = await readBody(event)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: body.amount,
    currency: 'jpy',
    capture_method: 'manual',  // 与信確保のみ（審査後にcapture）
    metadata: {
      bookingReference: body.bookingReference
    }
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  }
})
```

### 12.3 Dify AIチャットボット

```typescript
// nuxt.config.ts
app: {
  head: {
    script: [
      {
        innerHTML: `
          window.difyChatbotConfig = {
            token: 'wZhzVdZCEOQWZogG'
          }
        `,
        type: 'text/javascript'
      },
      {
        src: 'https://udify.app/embed.min.js',
        id: 'wZhzVdZCEOQWZogG',
        defer: true
      }
    ]
  }
}
```

---

## 13. デプロイメント構成

### 13.1 Vercel設定

```json
// vercel.json
{
  "framework": "nuxtjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "cleanUrls": true,
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/send-thankyou",
      "schedule": "0 1 * * *"
    }
  ]
}
```

### 13.2 デプロイフロー

```
┌─────────────────────────────────────────────────────────────┐
│                      デプロイフロー                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [開発環境]                                                  │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐               │
│  │   Git   │────►│ Vercel  │────►│ Preview │               │
│  │  Push   │     │  Build  │     │  Deploy │               │
│  └─────────┘     └─────────┘     └─────────┘               │
│                                                              │
│  [本番環境]                                                  │
│      │                                                       │
│      ▼                                                       │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐               │
│  │  main   │────►│ Vercel  │────►│Production│               │
│  │  branch │     │  Build  │     │  Deploy │               │
│  └─────────┘     └─────────┘     └─────────┘               │
│                                                              │
│                       ▼                                      │
│               ┌─────────────┐                                │
│               │   Edge      │                                │
│               │   Network   │                                │
│               └─────────────┘                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 13.3 環境別設定

| 環境 | URL | 用途 |
|-----|-----|-----|
| Production | booking.furniturehouse1.com | 本番環境 |
| Preview | *.vercel.app | プレビュー環境 |
| Development | localhost:3001 | ローカル開発 |

---

## 14. 問題点と改善提案

### 14.1 アーキテクチャの問題点

| 問題 | 重要度 | 説明 | 改善提案 |
|-----|-------|------|---------|
| **TypeScript strict mode無効** | 高 | `strict: false`, `typeCheck: false`で型安全性が低下 | strict modeを有効化し、型エラーを修正 |
| **CSRF除外範囲が広すぎる** | 高 | `/api/admin/**`, `/api/emails/**`等が全て除外 | 必要最小限のエンドポイントのみ除外 |
| **テストコードの欠如** | 高 | 単体テスト・E2Eテストが存在しない | Jest/Vitest + Playwright/Cypressの導入 |
| **エラーハンドリングの不統一** | 中 | APIごとにエラー処理が異なる | 共通エラーハンドラーの実装 |
| **ログ管理の不足** | 中 | console.logが多用、本番では削除される | 構造化ログ（Pino等）の導入 |

### 14.2 セキュリティの問題点

| 問題 | 重要度 | 説明 | 改善提案 |
|-----|-------|------|---------|
| **Dify APIトークンのハードコード** | 高 | `nuxt.config.ts`にトークンが直接記述 | 環境変数に移動 |
| **`'unsafe-inline'`と`'unsafe-eval'`の使用** | 中 | CSPでインラインスクリプトとevalを許可 | nonceベースのCSPに移行 |
| **レート制限の欠如** | 中 | API呼び出しの制限なし | Vercel Edge Middlewareでレート制限実装 |
| **入力バリデーションの不統一** | 中 | 一部APIでZodバリデーション未使用 | 全APIでZodバリデーション統一 |
| **sentEmailsのcreate権限** | 低 | `allow create: if true;`で誰でも作成可能 | サーバーサイドのみに制限 |

### 14.3 パフォーマンスの問題点

| 問題 | 重要度 | 説明 | 改善提案 |
|-----|-------|------|---------|
| **Firestoreクエリの最適化不足** | 中 | N+1クエリが発生する可能性 | バッチ読み取り、キャッシュ戦略の実装 |
| **画像最適化の不足** | 中 | 画像サイズ・フォーマットの最適化なし | Nuxt Imageモジュールの導入 |
| **バンドルサイズの未最適化** | 低 | 未使用コードの存在可能性 | bundle analyzerで分析・最適化 |

### 14.4 保守性の問題点

| 問題 | 重要度 | 説明 | 改善提案 |
|-----|-------|------|---------|
| **型定義の重複・不整合** | 中 | `types/index.ts`に後方互換性のための重複プロパティが多い | 型定義の整理、マイグレーション実施 |
| **Composablesの肥大化** | 中 | 一部のcomposableが大きすぎる | 責務の分離、細分化 |
| **マジックナンバーの存在** | 低 | 数値がハードコードされている箇所あり | 定数ファイルへの集約 |
| **ドキュメントの不足** | 低 | API仕様書、開発ガイドが不完全 | OpenAPI/Swagger仕様書の作成 |

### 14.5 機能面の問題点

| 問題 | 重要度 | 説明 | 改善提案 |
|-----|-------|------|---------|
| **予約変更機能の制限** | 中 | 日程変更時の料金再計算が複雑 | 変更ワークフローの明確化 |
| **通知設定のカスタマイズ不可** | 低 | ユーザーがメール通知を制御できない | 通知設定機能の追加 |
| **検索・フィルター機能の不足** | 低 | 管理画面での予約検索が限定的 | 高度な検索・フィルター機能の追加 |

### 14.6 推奨アクション（優先順位）

1. **即時対応（高優先度）**
   - CSRF除外範囲の見直し
   - Dify APIトークンの環境変数移行

2. **短期対応（中優先度）**
   - 共通エラーハンドラーの実装
   - 構造化ログの導入
   - レート制限の実装
   - Zodバリデーションの統一

3. **中期対応（低優先度）**
   - TypeScript strict modeの有効化と型エラー修正
   - テストフレームワークの導入
   - 型定義の整理
   - ドキュメントの整備
   - パフォーマンス最適化
   - 機能改善

### 14.7 ⚠️ 公開前チェックリスト（2月上旬予定）

> **重要**: Stripe本番キー設定時には、必ずステージング環境を構築すること

| タスク | 時期 | 説明 |
|-------|------|------|
| **ステージング環境構築** | Stripe本番設定1週間前 | Vercelプレビューブランチまたは専用環境を準備 |
| **Stripe本番キー設定** | 公開1週間前 | 本番決済の動作確認はステージング環境で実施 |
| **Webhook動作確認** | 公開1週間前 | 予約確認メール、与信確保→キャプチャフローの検証 |
| **決済フロー完全テスト** | 公開3日前 | 予約→審査→確定→キャンセル→返金の全フロー確認 |
| **本番デプロイ** | 公開日 | 最終確認後にデプロイ |

**ステージング環境が必要な理由**:
- 本番決済を直接テストするのは危険（二重課金、与信失敗等のリスク）
- Webhookの設定ミスで予約確認メールが送られない可能性
- 公開後の機能修正時にも必須となる

---

## 付録

### A. 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview

# サンプルデータ投入
npm run seed

# メールテンプレート投入
npm run seed:email-templates

# テストデータクリーンアップ
npm run cleanup

# デプロイ
npm run deploy
```

### B. 環境変数テンプレート

```env
# Firebase
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_ADMIN_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=
EMAIL_REPLY_TO=

# Other
INTERNAL_API_SECRET=
CRON_SECRET=
SITE_URL=
BRAND_SITE_URL=

# Optional
SWITCHBOT_TOKEN=
SWITCHBOT_SECRET=
SWITCHBOT_DEVICE_ID=
OPENWEATHER_API_KEY=
```

### C. 参考リンク

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vue 3 Documentation](https://vuejs.org/guide/introduction.html)

---

**ドキュメント作成者**: Claude (AI Assistant)
**最終更新日**: 2026年1月20日
