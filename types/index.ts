import { Timestamp } from 'firebase/firestore'

/**
 * 予約タイプ
 */
export type BookingType = 'stay' | 'workshop'

/**
 * 予約ステータス
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'payment_failed' | 'refunded'

/**
 * 支払いステータス
 */
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

/**
 * 予約情報
 */
export interface Booking {
  id: string
  userId?: string // ゲストユーザーの場合はundefined
  bookingReference: string // 人間が読みやすい予約番号（例: FH-20250130-A3X9）
  bookingToken: string // 予約確認用トークン（セキュアなランダム文字列）
  type: BookingType
  checkInDate: Timestamp
  checkOutDate: Timestamp
  guestCount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  status: BookingStatus
  paymentStatus: PaymentStatus
  totalAmount: number
  baseAmount: number
  discountAmount: number
  couponId?: string
  stripePaymentIntentId?: string
  notes?: string
  paidAt?: Timestamp // 支払い完了日時
  paymentError?: string // 決済エラーメッセージ
  refundedAt?: Timestamp // 返金日時
  refundAmount?: number // 返金額
  canceledAt?: Timestamp // キャンセル日時
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * ユーザー情報
 */
export interface User {
  id: string
  uid?: string // Firebase Auth UID（互換性のため）
  email: string
  displayName: string
  phone?: string
  role: 'admin' | 'user'
  invitedBy?: string // 招待した管理者のUID（新規追加時）
  lastLoginAt?: Timestamp // 最終ログイン日時
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * クーポン情報
 */
export interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minAmount?: number
  maxDiscount?: number
  validFrom: Timestamp
  validUntil: Timestamp
  usageLimit?: number
  usageCount: number
  isActive: boolean
  applicableTypes?: BookingType[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 価格設定
 */
export interface PricingSetting {
  id: string
  type: BookingType
  basePrice: number
  seasonalPricing: SeasonalPrice[]
  weekdayMultiplier: number
  weekendMultiplier: number
  lastMinuteDiscount?: {
    daysBeforeBooking: number
    discountPercentage: number
  }
  earlyBirdDiscount?: {
    daysBeforeBooking: number
    discountPercentage: number
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * シーズンタイプ
 */
export type SeasonType = 'regular' | 'high' | 'off'

/**
 * 泊数カテゴリ
 */
export type NightCategory = '1night' | '2nights' | '3nights_plus'

/**
 * 曜日タイプ
 */
export type DayType = 'weekday' | 'weekend'

/**
 * シーズナル価格設定
 */
export interface SeasonalPrice {
  name: string
  startDate: string // MM-DD形式
  endDate: string // MM-DD形式
  multiplier: number
}

/**
 * シーズン期間設定
 */
export interface SeasonPeriod {
  seasonType: SeasonType
  startDate: string // MM-DD形式
  endDate: string // MM-DD形式
  description?: string
}

/**
 * 料金レート（シーズン x 泊数 x 曜日タイプ x 宿泊者数）
 */
export interface PriceRate {
  seasonType: SeasonType
  nightCategory: NightCategory
  dayType: DayType
  guestCount: number
  pricePerNight: number
}

/**
 * 詳細価格設定
 */
export interface DetailedPricingSetting {
  id: string
  type: BookingType
  seasonPeriods: SeasonPeriod[] // シーズン期間定義
  priceRates: PriceRate[] // 各条件の料金レート
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * カレンダー設定（利用可能日/ブロック日）
 */
export interface CalendarSetting {
  id: string
  date: Timestamp
  isAvailable: boolean
  reason?: string // ブロックされている理由
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * メールテンプレート
 */
export interface EmailTemplate {
  id: string
  name: string // テンプレート名
  type: 'booking_confirmation' | 'checkin_reminder' | 'checkout_thanks' | 'custom'
  subject: string // 件名（変数使用可）
  bodyHtml: string // HTML本文（変数使用可）
  variables: string[] // 使用可能な変数のリスト
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // 作成した管理者のUID
}

/**
 * 予約作成リクエスト
 */
export interface CreateBookingRequest {
  type: BookingType
  checkInDate: Date
  checkOutDate: Date
  guestCount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  totalAmount: number
  baseAmount: number
  discountAmount: number
  couponCode?: string
  notes?: string
}

/**
 * 価格計算結果
 */
export interface PriceCalculation {
  baseAmount: number
  discountAmount: number
  totalAmount: number
  breakdown: {
    numberOfNights: number
    nightCategory: NightCategory
    nightlyBreakdown: {
      date: string
      seasonType: SeasonType
      dayType: DayType
      rate: number
      description: string
    }[]
    subtotal: number
    couponDiscount?: number
  }
}

/**
 * 施設サポーター情報
 */
export interface Supporter {
  id: string
  name: string
  email: string
  phone?: string
  hourlyRate: number // 時給
  transportationFee: number // 往復交通費（ガソリン代）
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 施設サポート予定時間
 */
export type SupportDuration = 2 | 3 | 4

/**
 * 施設サポートステータス
 */
export type SupportStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

/**
 * 施設サポートタスク
 */
export interface SupportTask {
  id: string
  bookingId: string
  supporterId?: string // 割り当てられたサポーター
  scheduledDate: Timestamp // 予定日
  scheduledDuration: SupportDuration // 予定時間（2, 3, 4時間）
  actualStartTime?: Timestamp // 実際の開始時間
  actualEndTime?: Timestamp // 実際の終了時間
  actualDuration?: number // 実際の作業時間（分）
  status: SupportStatus
  checklistCompleted: {
    linenChange: boolean
    bathroom: boolean
    kitchen: boolean
    garbageCollection: boolean
    floor: boolean
    windows: boolean
  }
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * サポーターの利用可能スケジュール
 */
export interface SupporterAvailability {
  id: string
  supporterId: string
  date: Timestamp
  isAvailable: boolean // true: OK日, false: NG日
  timeSlots?: {
    start: string // HH:mm形式
    end: string // HH:mm形式
  }[]
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * サポートチャットメッセージ
 */
export interface SupportMessage {
  id: string
  taskId: string
  senderId: string // 送信者ID（管理者 or サポーター）
  senderType: 'admin' | 'supporter'
  senderName: string
  message: string
  isRead: boolean
  createdAt: Timestamp
}

/**
 * ゲストメッセージ（予約ごとのチャット）
 */
export interface GuestMessage {
  id: string
  bookingId: string // 予約ID
  senderId: string // 送信者ID（管理者 or ゲスト）
  senderType: 'admin' | 'guest'
  senderName: string
  message: string
  isRead: boolean
  createdAt: Timestamp
}

/**
 * レビューステータス
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

/**
 * レビュー情報
 */
export interface Review {
  id: string
  bookingId?: string // 関連する予約ID（オプション）
  userId: string // レビューを書いたユーザーID
  userName: string // レビューを書いたユーザー名
  userEmail: string // レビューを書いたユーザーのEmail
  rating: number // 1-5の評価
  comment: string // レビュー本文
  stayType?: string // 宿泊タイプ（例：「2名」「4名」）
  stayDate?: string // 宿泊日（例：「2024年11月」）
  status: ReviewStatus // 承認ステータス
  rejectionReason?: string // 却下理由
  adminReply?: string // 管理者からの返信
  adminRepliedAt?: Timestamp // 返信日時
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * レビュー作成リクエスト
 */
export interface CreateReviewRequest {
  bookingId?: string
  rating: number
  comment: string
  stayType?: string
  stayDate?: string
}

/**
 * 管理者招待ステータス
 */
export type InvitationStatus = 'pending' | 'accepted' | 'expired'

/**
 * 管理者招待情報
 */
export interface AdminInvitation {
  id: string
  email: string // 招待先メールアドレス
  token: string // ランダム生成トークン（64文字）
  invitedBy: string // 招待した管理者のUID
  invitedByName: string // 招待した管理者の名前
  status: InvitationStatus
  createdAt: Timestamp
  expiresAt: Timestamp // 7日後に期限切れ
  acceptedAt?: Timestamp
}

/**
 * メールスケジュール
 */
export interface EmailSchedule {
  id: string
  name: string // 設定名（例: "1週間前リマインダー"）
  description: string // 説明
  templateId: string // emailTemplatesのID
  daysBeforeCheckIn: number // チェックイン何日前（7, 3, 1, 0など）
  relativeToCheckOut: boolean // false=チェックイン基準、true=チェックアウト基準
  sendTime: string // "09:00" 形式
  enabled: boolean // 有効/無効
  targetStatuses: string[] // 対象予約ステータス ['confirmed']
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string // 作成した管理者のUID
}

/**
 * 送信済みメールログ
 */
export interface SentEmail {
  id: string
  bookingId: string
  scheduleId: string // emailSchedulesのID
  templateId: string
  recipientEmail: string
  subject: string
  sentAt: Timestamp
  status: 'sent' | 'failed'
  error?: string
}
