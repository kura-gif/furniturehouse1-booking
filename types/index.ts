import { Timestamp } from 'firebase/firestore'

/**
 * 予約タイプ
 */
export type BookingType = 'stay' | 'workshop'

/**
 * 予約ステータス
 */
export type BookingStatus = 'pending' | 'pending_review' | 'confirmed' | 'cancelled' | 'completed' | 'payment_failed' | 'refunded' | 'rejected' | 'expired'

/**
 * 審査ステータス
 */
export type BookingReviewStatus = 'pending_review' | 'approved' | 'rejected' | 'expired'

/**
 * 却下理由カテゴリ
 */
export type RejectionCategory = 'schedule_conflict' | 'capacity_exceeded' | 'maintenance' | 'other'

/**
 * 予約ステータス（簡易版 - 後方互換性）
 */
export type SimpleBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

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
  startDate?: Timestamp // checkInDateのエイリアス（後方互換性）
  endDate?: Timestamp // checkOutDateのエイリアス（後方互換性）
  guestCount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  guestPostalCode?: string      // 郵便番号
  guestAddress?: string         // 住所
  guestOccupation?: string      // 職業
  isForeignNational?: boolean   // 外国籍かどうか
  guestNationality?: string     // 国籍（外国籍の場合）
  guestPassportNumber?: string  // パスポート番号（外国籍の場合）
  // 法人予約関連
  isCorporate?: boolean         // 法人予約かどうか
  companyName?: string          // 会社名
  invoiceRequired?: boolean     // 請求書発行要否
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
  // 審査関連フィールド
  reviewStatus?: BookingReviewStatus // 審査ステータス
  reviewDeadline?: Timestamp // 審査期限（48時間後）
  reviewedAt?: Timestamp // 審査完了日時
  reviewedBy?: string // 審査した管理者ID
  reviewedByName?: string // 審査した管理者名
  rejectionReason?: string // 却下理由（メッセージ）
  rejectionCategory?: RejectionCategory // 却下カテゴリ
  // オプション関連
  selectedOptions?: SelectedBookingOption[]  // 選択したオプション
  optionsTotalPrice?: number                 // オプション合計金額
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 審査ログ
 */
export interface ReviewLog {
  id: string
  bookingId: string
  bookingReference: string
  action: 'approved' | 'rejected' | 'expired'
  reason?: string
  category?: RejectionCategory
  adminId: string
  adminName: string
  createdAt: Timestamp
}

/**
 * ユーザーロール
 */
export type UserRole = 'admin' | 'user' | 'supporter'

/**
 * ユーザー情報
 */
export interface User {
  id: string
  uid?: string // Firebase Auth UID（互換性のため）
  email: string
  displayName: string
  phone?: string
  role: UserRole
  invitedBy?: string // 招待した管理者のUID（新規追加時）
  lastLoginAt?: Timestamp // 最終ログイン日時
  // サポーター固有のプロパティ（オプショナル）
  isActive?: boolean // サポーターが有効かどうか
  hourlyRate?: number // 時給
  transportationFee?: number // 交通費
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
  multiplier?: number // シーズン倍率（オプション）
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
  checkInDate?: Date
  checkOutDate?: Date
  startDate?: Date // checkInDateのエイリアス（後方互換性）
  endDate?: Date // checkOutDateのエイリアス（後方互換性）
  guestCount: number
  guestName: string
  guestEmail: string
  guestPhone: string
  guestPostalCode?: string      // 郵便番号
  guestAddress?: string         // 住所
  guestOccupation?: string      // 職業
  isForeignNational?: boolean   // 外国籍かどうか
  guestNationality?: string     // 国籍（外国籍の場合）
  guestPassportNumber?: string  // パスポート番号（外国籍の場合）
  // 法人予約関連
  isCorporate?: boolean         // 法人予約かどうか
  companyName?: string          // 会社名
  invoiceRequired?: boolean     // 請求書発行要否
  totalAmount: number
  baseAmount: number
  discountAmount: number
  couponCode?: string
  notes?: string
  selectedOptions?: SelectedBookingOption[]  // 選択したオプション
  optionsTotalPrice?: number                 // オプション合計金額
  stripePaymentIntentId?: string             // Stripe Payment Intent ID
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

/**
 * 清掃タスクステータス
 */
export type CleaningTaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'

/**
 * 清掃タスクタイプ
 */
export type CleaningTaskType = 'pre_checkin' | 'post_checkout'

/**
 * チェックリスト項目（新形式）
 */
export interface ChecklistItem {
  id?: string
  item?: string // レガシー互換
  label?: string // 新形式
  completed: boolean
  isCustom?: boolean
  createdBy?: string
  createdAt?: Timestamp
}

/**
 * 清掃写真
 */
export interface CleaningPhoto {
  id: string
  url: string
  storagePath: string
  uploadedAt: Timestamp
  uploadedBy: string
}

/**
 * 使用備品
 */
export interface UsedSupply {
  id?: string
  name: string
  supplyName?: string
  quantity: number
}

/**
 * 報酬情報
 */
export interface Compensation {
  hourlyRate: number
  hoursWorked?: number
  transportationFee: number
  totalAmount: number
  calculatedAmount?: number
  isPaid: boolean
  paidAt?: Timestamp
}

/**
 * 清掃タスク
 */
export interface CleaningTask {
  id: string
  bookingId: string
  bookingReference?: string
  taskType: CleaningTaskType
  type?: CleaningTaskType // 後方互換性
  status: CleaningTaskStatus
  scheduledDate: Timestamp
  estimatedDuration: number // 予定作業時間（分）
  actualDuration?: number // 実際の作業時間（分）
  actualHours?: number // 実際の作業時間（時間）
  guestCount?: number // 宿泊人数
  assignedTo?: string // サポーターID
  assignedToName?: string // サポーター名
  startTime?: Timestamp
  endTime?: Timestamp
  startedAt?: Timestamp
  completedAt?: Timestamp
  checklist: ChecklistItem[]
  photos?: CleaningPhoto[]
  photoRequestedByAdmin?: boolean
  suppliesUsed?: UsedSupply[]
  usedSupplies?: UsedSupply[] // 後方互換性
  notes?: string
  adminNotes?: string
  compensation?: Compensation
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 人数別料金設定
 */
export interface GuestCountPricing {
  guestCount: number
  pricePerNight: number
  // 拡張版プロパティ（オプション）
  baseGuestCount?: number // 基本人数（例: 2人）
  thirdGuestRate?: number // 3人目の料金率
  additionalGuestRates?: {
    fourth: number
    fifth: number
    sixth: number
  }
}

/**
 * 連泊料金設定
 */
export interface MultiNightPricing {
  nightCount: number
  discountPercentage: number
  // 拡張版プロパティ（オプション）
  rates?: {
    night1: number
    night2: number
    night3: number
    night4: number
    night5: number
    night6Plus: number
  }
}

/**
 * 子供料金ルール
 */
export interface ChildPricingRule {
  ageFrom?: number
  ageTo?: number
  discountType?: 'free' | 'percentage'
  discountValue?: number
  // 代替プロパティ名（互換性のため）
  minAge?: number
  maxAge?: number
  priceRate?: number
}

/**
 * 祝日カレンダー
 */
export interface HolidayCalendar {
  year: number
  holidays: string[] // YYYY-MM-DD形式
}

/**
 * 拡張価格設定
 */
export interface EnhancedPricingSetting {
  id: string
  name?: string
  type: BookingType
  isActive?: boolean
  seasonPeriods: SeasonPeriod[]
  // TODO: P2で型を厳格化（現在は既存コードとの互換性のためany許容）
  guestCountPricing?: GuestCountPricing | GuestCountPricing[] | any
  multiNightPricing?: MultiNightPricing | MultiNightPricing[] | any
  weekendMultiplier?: number
  createdAt: Timestamp | null | any
  updatedAt: Timestamp | null | any
  // 拡張版プロパティ（オプション）
  basePrice?: number // 基本料金
  basePriceAdult?: number // 大人基本料金
  seasonMultipliers?: {
    regular: number
    high: number
    off: number
  }
  dayTypePricing?: {
    weekday?: number
    weekend?: number
    weekendSurcharge?: number  // 旧形式（固定金額）- 後方互換性のため残す
    weekendMultiplier?: number // 新形式（倍率）- 1.3 = 30%増し
  }
  dayTypeSurcharges?: {
    weekday: number
    weekend: number
  }
  dayTypeMultipliers?: {
    weekday: number  // 1.0 = 追加なし
    weekend: number  // 1.3 = 30%増し
  }
  cleaningFee?: number
  taxRate?: number
  childPricingRules?: ChildPricingRule[]
  holidayCalendar?: HolidayCalendar[]
}

/**
 * 拡張版毎泊明細
 */
export interface EnhancedNightlyBreakdown {
  date: string
  seasonType: SeasonType
  dayType: DayType
  baseRate?: number
  guestAdjustment?: number
  weekendMultiplier?: number
  finalRate?: number
  description: string
  // 拡張版プロパティ（オプション）
  nightNumber?: number
  basePrice?: number
  seasonMultiplier?: number
  dayTypeSurcharge?: number   // 旧形式（固定金額）- 後方互換性のため
  dayTypeMultiplier?: number  // 新形式（倍率）
  basePriceAfterAdjustments?: number
  guestCountCharges?: {
    guest3rd?: number
    guest4th?: number
    guest5th?: number
    guest6th?: number
    total: number
  }
  childCharges?: {
    freeChildren: number
    discountedChildren: number
    total: number
  }
  nightRate?: number
  nightRateDescription?: string
  subtotalBeforeNightRate?: number
  nightTotal?: number
}

/**
 * 拡張価格計算結果
 */
export interface EnhancedPriceCalculation {
  baseAmount?: number
  discountAmount?: number
  totalAmount: number
  breakdown?: {
    numberOfNights: number
    guestCount: number
    nightlyBreakdown: EnhancedNightlyBreakdown[]
    subtotal: number
    multiNightDiscount?: number
    couponDiscount?: number
  }
  // 拡張版プロパティ（オプション）
  checkInDate?: Date
  checkOutDate?: Date
  numberOfNights?: number
  adultCount?: number
  childrenAges?: number[]
  totalGuestCount?: number
  nightlyBreakdown?: EnhancedNightlyBreakdown[]
  subtotal?: number
  cleaningFee?: number
  subtotalBeforeTax?: number
  tax?: number
  couponDiscount?: number
  totalPrice?: number
  summary?: {
    averagePricePerNight: number
    averagePricePerPerson: number
  }
}

/**
 * 会話ステータス
 */
export type ConversationStatus = 'open' | 'closed'

/**
 * 会話スレッド
 */
export interface Conversation {
  id: string
  bookingId?: string           // 予約紐付け（予約前は null）
  bookingReference?: string    // 予約番号
  guestEmail: string           // ゲストのメール
  guestName: string            // ゲスト名
  guestUserId?: string         // ログインユーザーの場合
  subject?: string             // 件名（予約前の問い合わせ用）
  status: ConversationStatus   // 会話ステータス
  lastMessageAt: Timestamp     // 最終メッセージ日時
  lastMessagePreview?: string  // 最終メッセージプレビュー
  unreadByAdmin: number        // 管理者未読数
  unreadByGuest: number        // ゲスト未読数
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * メッセージ送信者タイプ
 */
export type MessageSenderType = 'guest' | 'admin'

/**
 * メッセージ
 */
export interface Message {
  id: string
  conversationId: string
  senderType: MessageSenderType
  senderName: string
  senderId?: string            // ユーザーID
  content: string
  attachments?: {              // 添付ファイル（画像等）
    url: string
    type: string
    name: string
  }[]
  isRead: boolean
  createdAt: Timestamp
}

/**
 * キャンセルポリシールール
 */
export interface CancellationPolicyRule {
  daysBeforeCheckIn: number  // チェックイン何日前まで
  refundPercentage: number   // 返金率（0-100）
}

/**
 * キャンセルポリシー設定
 */
export interface CancellationPolicy {
  id?: string
  name: string                        // ポリシー名（例: 標準、柔軟）
  description?: string                // 説明文
  rules: CancellationPolicyRule[]     // ルール（日数順に並べる）
  isActive: boolean                   // 有効かどうか
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

/**
 * 返金計算結果
 */
export interface RefundCalculation {
  originalAmount: number              // 元の金額
  refundPercentage: number            // 返金率
  refundAmount: number                // 返金額
  daysBeforeCheckIn: number           // チェックイン何日前か
  appliedRule: CancellationPolicyRule // 適用されたルール
  isCancellable: boolean              // キャンセル可能か
}

/**
 * 予約オプション（BBQ設備、レンタサイクルなど）
 */
export interface BookingOption {
  id: string
  name: string                        // オプション名（例: BBQ設備セット）
  description: string                 // 説明文
  price: number                       // 料金（固定）
  imageUrl?: string                   // サムネイル画像URL
  dailyLimit: number                  // 1日あたりの予約可能数
  isActive: boolean                   // 有効かどうか
  order: number                       // 表示順
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * 予約に紐づくオプション情報
 */
export interface SelectedBookingOption {
  optionId: string
  name: string
  price: number
  imageUrl?: string
}

/**
 * 在庫ステータス
 */
export type InventoryStatus = 'sufficient' | 'low' | 'out_of_stock'

/**
 * 在庫アイテム
 */
export interface InventoryItem {
  id: string
  name: string
  currentStock: number
  unit: string // 枚、本、ロール、個など
  reorderThreshold: number // 発注目安数量
  purchaseUrl?: string // 購入URL（Amazon等）
  notes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * メンテナンスステータス
 */
export type MaintenanceStatus = 'good' | 'needs_attention' | 'under_maintenance' | 'broken'

/**
 * メンテナンス記録
 */
export interface MaintenanceRecord {
  id: string
  equipmentName: string
  lastMaintenanceDate: Timestamp
  nextScheduledDate?: Timestamp
  status: MaintenanceStatus
  description?: string
  cost?: number
  performedBy?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * ゲストガイドアクセストークン
 */
export interface GuestGuideToken {
  id: string
  bookingId: string
  bookingReference: string
  token: string // セキュアなランダム文字列
  guestName: string
  guestEmail: string
  checkInDate: Timestamp
  checkOutDate: Timestamp
  isActive: boolean
  rulesAgreedAt?: Timestamp
  accessedAt?: Timestamp
  expiresAt: Timestamp // チェックアウト後7日など
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * ガイドコンテンツカテゴリ
 */
export type GuideContentCategory = 'amenities' | 'area' | 'faq' | 'rules'

/**
 * 周辺スポットカテゴリ
 */
export type AreaSpotCategory = 'cafe' | 'restaurant' | 'shopping' | 'activity' | 'spa'

/**
 * アメニティカテゴリ
 */
export type AmenityCategory = 'kitchen' | 'bath' | 'amenity' | 'appliance'

/**
 * ガイドブック - アメニティアイテム
 */
export interface GuideAmenityItem {
  id: string
  name: string
  nameEn?: string
  category: AmenityCategory
  description?: string
  descriptionEn?: string
  imageUrl?: string
  brandUrl?: string
  order: number
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * ガイドブック - 周辺スポット
 */
export interface GuideAreaSpot {
  id: string
  name: string
  nameEn?: string
  category: AreaSpotCategory
  description?: string
  descriptionEn?: string
  address?: string
  phone?: string
  website?: string
  googleMapsUrl?: string
  imageUrl?: string
  distanceMinutes?: number // 車で何分
  isRecommended: boolean
  order: number
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * ガイドブック - FAQ
 */
export interface GuideFaq {
  id: string
  question: string
  questionEn?: string
  answer: string
  answerEn?: string
  category?: string
  order: number
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

/**
 * ガイドブック - ハウスルール同意記録
 */
export interface GuideRulesAgreement {
  id: string
  tokenId: string
  bookingId: string
  bookingReference: string
  guestName: string
  guestEmail: string
  agreedAt: Timestamp
  ipAddress?: string
  userAgent?: string
}
