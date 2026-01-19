<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="pt-24 pb-12">
      <div class="container-responsive max-w-6xl">
        <!-- ヘッダー -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold mb-2">マイページ</h1>
          <p class="text-gray-600">予約の確認・管理ができます</p>
        </div>

        <!-- 認証チェック -->
        <div v-if="!user" class="card text-center py-12">
          <p class="text-gray-600 mb-4">ログインが必要です</p>
          <NuxtLink to="/login" class="btn-primary inline-block px-6 py-2">
            ログイン
          </NuxtLink>
        </div>

        <!-- ローディング -->
        <div v-else-if="isLoading" class="card text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p class="text-gray-600 mt-4">読み込み中...</p>
        </div>

        <!-- 予約一覧 -->
        <div v-else>
          <!-- ユーザー情報 -->
          <div class="card mb-6">
            <h2 class="text-xl font-semibold mb-4">ユーザー情報</h2>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-gray-600">お名前:</span>
                <span class="font-medium">{{ appUser?.displayName || user.displayName || 'ゲスト' }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-gray-600">メール:</span>
                <span class="font-medium">{{ user.email }}</span>
              </div>
            </div>
          </div>

          <!-- 予約一覧 -->
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold">予約一覧</h2>
              <NuxtLink to="/booking/request" class="btn-primary text-sm px-4 py-2">
                新規予約
              </NuxtLink>
            </div>

            <!-- 予約なし -->
            <div v-if="bookings.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p class="text-gray-600 mb-4">まだ予約がありません</p>
              <NuxtLink to="/booking/request" class="btn-primary inline-block px-6 py-2">
                予約する
              </NuxtLink>
            </div>

            <!-- 予約カード -->
            <div v-else class="space-y-4">
              <div
                v-for="booking in bookings"
                :key="booking.id"
                class="border rounded-lg p-6 hover:shadow-md transition-custom"
              >
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        class="text-sm font-medium px-3 py-1 cursor-help"
                        :class="getStatusClass(booking.status)"
                        :title="getStatusDescription(booking.status)"
                      >
                        {{ getStatusLabel(booking.status) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">予約番号: {{ booking.bookingReference || booking.id }}</p>
                    <!-- 却下理由の表示 -->
                    <p v-if="booking.status === 'rejected' && booking.rejectionReason" class="text-sm text-red-600 mt-2">
                      却下理由: {{ booking.rejectionReason }}
                    </p>
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-600 mb-1">チェックイン</p>
                    <p class="font-semibold">{{ formatDateWithDay((booking.startDate ?? booking.checkInDate).toDate()) }}</p>
                    <p class="text-xs text-gray-500">{{ siteSettings.checkInTime }}〜</p>
                  </div>
                  <div>
                    <p class="text-gray-600 mb-1">チェックアウト</p>
                    <p class="font-semibold">{{ formatDateWithDay((booking.endDate ?? booking.checkOutDate).toDate()) }}</p>
                    <p class="text-xs text-gray-500">〜{{ siteSettings.checkOutTime }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600 mb-1">宿泊日数</p>
                    <p class="font-semibold">{{ calculateNights((booking.startDate ?? booking.checkInDate).toDate(), (booking.endDate ?? booking.checkOutDate).toDate()) }}泊</p>
                  </div>
                  <div>
                    <p class="text-gray-600 mb-1">宿泊者数</p>
                    <p class="font-semibold">{{ booking.guestCount }}名</p>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-100">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600 text-sm">合計金額</span>
                    <span class="font-bold text-lg text-purple-700">¥{{ (booking.totalAmount ?? 0).toLocaleString() }}</span>
                  </div>
                </div>

                <div v-if="booking.notes" class="mt-4 pt-4 border-t">
                  <p class="text-sm text-gray-600 mb-1">備考</p>
                  <p class="text-sm">{{ booking.notes }}</p>
                </div>

                <div class="mt-4 pt-4 border-t flex flex-wrap gap-2">
                  <NuxtLink
                    v-if="canMessage(booking.status)"
                    :to="`/messages/${booking.id}`"
                    class="px-4 py-2 text-sm btn-secondary"
                  >
                    メッセージ
                  </NuxtLink>
                  <button
                    v-if="booking.status === 'completed' && !hasReviewed(booking.id)"
                    @click="openReviewModal(booking)"
                    class="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-custom"
                  >
                    レビューを書く
                  </button>
                  <button
                    v-if="canCancel(booking.status)"
                    @click="handleCancelBooking(booking)"
                    class="px-4 py-2 text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-custom"
                  >
                    予約をキャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />

    <!-- キャンセル確認モーダル -->
    <div
      v-if="showCancelModal && cancelTargetBooking"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeCancelModal"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-lg w-full"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-gray-900">予約のキャンセル</h3>
          <button
            @click="closeCancelModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-custom"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 返金計算ローディング -->
        <div v-if="isCalculatingRefund" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p class="text-gray-600 mt-3">返金額を計算中...</p>
        </div>

        <!-- 返金計算結果 -->
        <div v-else-if="refundCalculation">
          <!-- 予約情報 -->
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-gray-500">チェックイン</p>
                <p class="font-medium">{{ formatDate((cancelTargetBooking.startDate ?? cancelTargetBooking.checkInDate).toDate()) }}</p>
              </div>
              <div>
                <p class="text-gray-500">チェックアウト</p>
                <p class="font-medium">{{ formatDate((cancelTargetBooking.endDate ?? cancelTargetBooking.checkOutDate).toDate()) }}</p>
              </div>
            </div>
          </div>

          <!-- キャンセルポリシー情報 -->
          <div class="border border-purple-200 bg-purple-50 rounded-lg p-4 mb-4">
            <h4 class="font-medium text-purple-900 mb-2">キャンセルポリシー</h4>
            <p class="text-sm text-purple-800 mb-3">
              チェックインまであと <span class="font-bold">{{ refundCalculation.daysBeforeCheckIn }}日</span>
            </p>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">お支払い済み金額</span>
                <span class="font-medium">¥{{ refundCalculation.originalAmount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">返金率</span>
                <span class="font-bold text-purple-700">{{ refundCalculation.refundPercentage }}%</span>
              </div>
              <div class="border-t border-purple-200 pt-2 mt-2">
                <div class="flex justify-between text-base">
                  <span class="font-medium">返金予定額</span>
                  <span class="font-bold text-green-600">¥{{ refundCalculation.refundAmount.toLocaleString() }}</span>
                </div>
              </div>
              <div v-if="refundCalculation.nonRefundableAmount > 0" class="flex justify-between text-red-600">
                <span>返金対象外</span>
                <span>¥{{ refundCalculation.nonRefundableAmount.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- 警告 -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p class="text-sm text-yellow-800">
              <strong>注意:</strong> キャンセル後の取り消しはできません。返金処理には数日かかる場合があります。
            </p>
          </div>

          <!-- アクションボタン -->
          <div class="flex gap-3">
            <button
              @click="closeCancelModal"
              class="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-custom"
            >
              戻る
            </button>
            <button
              @click="confirmCancelBooking"
              :disabled="isCancelling"
              class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-custom disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isCancelling ? 'キャンセル処理中...' : 'キャンセルを確定する' }}
            </button>
          </div>
        </div>

        <!-- エラー -->
        <div v-else-if="cancelError" class="text-center py-8">
          <p class="text-red-600 mb-4">{{ cancelError }}</p>
          <button
            @click="closeCancelModal"
            class="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-custom"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>

    <!-- キャンセル成功モーダル -->
    <div
      v-if="showCancelSuccessModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="showCancelSuccessModal = false"
    >
      <div
        class="bg-white rounded-xl p-8 max-w-md w-full text-center"
        @click.stop
      >
        <!-- 成功アイコン -->
        <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ cancelSuccessMessage }}</h3>

        <div v-if="cancelSuccessRefundAmount > 0" class="bg-green-50 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-600 mb-1">返金予定額</p>
          <p class="text-2xl font-bold text-green-600">¥{{ cancelSuccessRefundAmount.toLocaleString() }}</p>
          <p class="text-xs text-gray-500 mt-2">返金処理には数日かかる場合があります</p>
        </div>

        <button
          @click="showCancelSuccessModal = false"
          class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-custom font-medium"
        >
          OK
        </button>
      </div>
    </div>

    <!-- レビューモーダル -->
    <div
      v-if="showReviewModal && selectedBooking"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click="closeReviewModal"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-semibold">レビューを書く</h3>
          <button
            @click="closeReviewModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-custom"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitReview" class="space-y-6">
          <!-- 評価 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              総合評価 <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="reviewForm.rating = star"
                class="text-4xl transition-colors"
                :class="star <= reviewForm.rating ? 'text-yellow-500' : 'text-gray-300'"
              >
                ★
              </button>
            </div>
            <p class="text-sm text-gray-500 mt-2">
              {{ ratingLabels[reviewForm.rating] || '評価を選択してください' }}
            </p>
          </div>

          <!-- 宿泊タイプ -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              旅行の目的（任意）
            </label>
            <select
              v-model="reviewForm.stayType"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">選択してください</option>
              <option value="家族旅行">家族旅行</option>
              <option value="カップル旅行">カップル旅行</option>
              <option value="友人旅行">友人旅行</option>
              <option value="一人旅">一人旅</option>
              <option value="ビジネス">ビジネス</option>
            </select>
          </div>

          <!-- レビュー本文 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              レビュー <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="reviewForm.comment"
              rows="6"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="ご宿泊の感想をお聞かせください"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">
              {{ reviewForm.comment.length }} / 1000文字
            </p>
          </div>

          <!-- エラーメッセージ -->
          <div v-if="reviewError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-800">{{ reviewError }}</p>
          </div>

          <!-- ボタン -->
          <div class="flex gap-3">
            <button
              type="button"
              @click="closeReviewModal"
              class="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-custom"
            >
              キャンセル
            </button>
            <button
              type="submit"
              :disabled="isSubmittingReview || reviewForm.rating === 0 || !reviewForm.comment"
              class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-custom disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmittingReview ? '送信中...' : 'レビューを投稿' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Booking } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const { user, appUser } = useAuth()
const { getUserBookings, cancelBooking } = useBookings()
const { createReview, getReviewByBookingId } = useReviews()
const router = useRouter()

const bookings = ref<Booking[]>([])
const isLoading = ref(false)
const reviewedBookingIds = ref<Set<string>>(new Set())

// サイト設定（チェックイン・チェックアウト時間）
const siteSettings = ref({
  checkInTime: '15:00',
  checkOutTime: '11:00'
})

// レビューモーダル関連
const showReviewModal = ref(false)
const selectedBooking = ref<Booking | null>(null)
const isSubmittingReview = ref(false)
const reviewError = ref<string | null>(null)
const reviewForm = ref({
  rating: 0,
  comment: '',
  stayType: ''
})

// キャンセルモーダル関連
const showCancelModal = ref(false)
const cancelTargetBooking = ref<Booking | null>(null)
const isCalculatingRefund = ref(false)
const isCancelling = ref(false)
const cancelError = ref<string | null>(null)
const refundCalculation = ref<{
  originalAmount: number
  refundPercentage: number
  refundAmount: number
  nonRefundableAmount: number
  daysBeforeCheckIn: number
} | null>(null)

// キャンセル成功モーダル
const showCancelSuccessModal = ref(false)
const cancelSuccessMessage = ref('')
const cancelSuccessRefundAmount = ref(0)

const ratingLabels: Record<number, string> = {
  1: '期待外れでした',
  2: 'いまいちでした',
  3: '普通でした',
  4: '良かったです',
  5: '素晴らしかったです！'
}

// 予約一覧を取得
const loadBookings = async () => {
  if (!user.value) {
    router.push('/login')
    return
  }

  isLoading.value = true
  try {
    const allBookings = await getUserBookings(user.value.uid)
    // 今後の予約（チェックイン日が今日以降）と過去の予約を分けてソート
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcoming: Booking[] = []
    const past: Booking[] = []

    for (const booking of allBookings) {
      const checkInDate = (booking.startDate ?? booking.checkInDate).toDate()
      if (checkInDate >= today || ['pending', 'pending_review', 'confirmed'].includes(booking.status)) {
        upcoming.push(booking)
      } else {
        past.push(booking)
      }
    }

    // 今後の予約はチェックイン日が近い順、過去の予約はチェックイン日が新しい順
    upcoming.sort((a, b) => (a.startDate ?? a.checkInDate).toDate().getTime() - (b.startDate ?? b.checkInDate).toDate().getTime())
    past.sort((a, b) => (b.startDate ?? b.checkInDate).toDate().getTime() - (a.startDate ?? a.checkInDate).toDate().getTime())

    bookings.value = [...upcoming, ...past]
  } catch (error) {
    console.error('予約一覧の取得エラー:', error)
    alert('予約一覧の取得に失敗しました')
  } finally {
    isLoading.value = false
  }
}

// ステータスラベル
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '承認待ち',
    pending_review: '審査中',
    confirmed: '予約確定',
    rejected: '却下',
    cancelled: 'キャンセル済み',
    completed: '宿泊完了',
    payment_failed: '決済エラー',
    refunded: '返金済み',
    expired: '期限切れ'
  }
  return labels[status] || status
}

// ステータスに応じたCSSクラス
const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    pending_review: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-600',
    completed: 'bg-blue-100 text-blue-800',
    payment_failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
    expired: 'bg-gray-100 text-gray-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// ステータスの説明（ツールチップ用）
const getStatusDescription = (status: string) => {
  const descriptions: Record<string, string> = {
    pending: '管理者による予約の承認を待っています',
    pending_review: '予約内容を審査中です',
    confirmed: '予約が確定しました。チェックイン日をお待ちください',
    rejected: '予約が承認されませんでした',
    cancelled: 'この予約はキャンセルされました',
    completed: 'ご宿泊ありがとうございました',
    payment_failed: '決済処理に問題が発生しました',
    refunded: 'キャンセルに伴い返金処理が完了しました',
    expired: '予約の有効期限が切れました'
  }
  return descriptions[status] || ''
}

// キャンセル可能なステータスかどうか
const canCancel = (status: string) => {
  return ['pending', 'pending_review', 'confirmed'].includes(status)
}

// メッセージ可能なステータスかどうか
const canMessage = (status: string) => {
  return !['cancelled', 'rejected', 'expired', 'payment_failed'].includes(status)
}

// 日付フォーマット
const formatDate = (date: Date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 日付フォーマット（曜日付き）
const formatDateWithDay = (date: Date) => {
  const days = ['日', '月', '火', '水', '木', '金', '土']
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${days[date.getDay()]})`
}

// 宿泊日数を計算
const calculateNights = (startDate: Date, endDate: Date): number => {
  const diffTime = endDate.getTime() - startDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 予約キャンセルモーダルを開く
const handleCancelBooking = async (booking: Booking) => {
  cancelTargetBooking.value = booking
  showCancelModal.value = true
  cancelError.value = null
  refundCalculation.value = null
  isCalculatingRefund.value = true

  try {
    // 返金額を計算
    const response = await $fetch<{
      success: boolean
      calculation?: {
        originalAmount: number
        refundPercentage: number
        refundAmount: number
        nonRefundableAmount: number
        daysBeforeCheckIn: number
      }
    }>('/api/bookings/calculate-refund', {
      method: 'POST',
      body: { bookingId: booking.id }
    })

    if (response.success && response.calculation) {
      refundCalculation.value = {
        originalAmount: response.calculation.originalAmount,
        refundPercentage: response.calculation.refundPercentage,
        refundAmount: response.calculation.refundAmount,
        nonRefundableAmount: response.calculation.nonRefundableAmount,
        daysBeforeCheckIn: response.calculation.daysBeforeCheckIn
      }
    }
  } catch (error: any) {
    console.error('返金計算エラー:', error)
    cancelError.value = error.data?.message || '返金額の計算に失敗しました'
  } finally {
    isCalculatingRefund.value = false
  }
}

// キャンセルモーダルを閉じる
const closeCancelModal = () => {
  showCancelModal.value = false
  cancelTargetBooking.value = null
  refundCalculation.value = null
  cancelError.value = null
}

// キャンセルを確定
const confirmCancelBooking = async () => {
  if (!cancelTargetBooking.value || !user.value) return

  isCancelling.value = true
  cancelError.value = null

  try {
    const response = await $fetch('/api/bookings/guest-cancel', {
      method: 'POST',
      body: {
        bookingId: cancelTargetBooking.value.id,
        userId: user.value.uid
      }
    })

    if (response.success) {
      const refundInfo = response.refund
      cancelSuccessMessage.value = '予約をキャンセルしました'
      cancelSuccessRefundAmount.value = refundInfo?.processed && refundInfo?.amount > 0 ? refundInfo.amount : 0
      closeCancelModal()
      showCancelSuccessModal.value = true
      await loadBookings()
    }
  } catch (error: any) {
    console.error('キャンセルエラー:', error)
    cancelError.value = error.data?.message || 'キャンセル処理に失敗しました'
  } finally {
    isCancelling.value = false
  }
}

// レビュー済みかチェック
const hasReviewed = (bookingId: string): boolean => {
  return reviewedBookingIds.value.has(bookingId)
}

// レビューモーダルを開く
const openReviewModal = (booking: Booking) => {
  selectedBooking.value = booking
  showReviewModal.value = true
  reviewError.value = null
  reviewForm.value = {
    rating: 0,
    comment: '',
    stayType: ''
  }
}

// レビューモーダルを閉じる
const closeReviewModal = () => {
  showReviewModal.value = false
  selectedBooking.value = null
}

// レビューを投稿
const submitReview = async () => {
  if (!selectedBooking.value) return

  reviewError.value = null
  isSubmittingReview.value = true

  try {
    await createReview({
      bookingId: selectedBooking.value.id,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment,
      stayType: reviewForm.value.stayType || undefined
    })

    alert('レビューを投稿しました。ありがとうございます！')
    reviewedBookingIds.value.add(selectedBooking.value.id)
    closeReviewModal()
  } catch (error: any) {
    console.error('レビュー投稿エラー:', error)
    reviewError.value = error.message || 'レビューの投稿に失敗しました'
  } finally {
    isSubmittingReview.value = false
  }
}

// 既存のレビューをロード
const loadReviewedBookings = async () => {
  const ids = new Set<string>()

  for (const booking of bookings.value) {
    const review = await getReviewByBookingId(booking.id)
    if (review) {
      ids.add(booking.id)
    }
  }

  reviewedBookingIds.value = ids
}

// サイト設定を読み込み
const loadSiteSettings = async () => {
  try {
    const response = await fetch('/api/public/settings')
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.settings) {
        siteSettings.value = {
          checkInTime: data.settings.checkInTime || '15:00',
          checkOutTime: data.settings.checkOutTime || '11:00'
        }
      }
    }
  } catch (error) {
    console.error('設定の取得に失敗:', error)
  }
}

// マウント時に予約一覧を読み込み
onMounted(async () => {
  await loadSiteSettings()
  if (user.value) {
    await loadBookings()
    await loadReviewedBookings()
  }
})
</script>
