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
            <h2 class="text-xl font-semibold mb-6">予約一覧</h2>

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
                      <span class="text-sm font-medium px-3 py-1 rounded-full"
                        :class="{
                          'bg-yellow-100 text-yellow-800': booking.status === 'pending',
                          'bg-green-100 text-green-800': booking.status === 'confirmed',
                          'bg-gray-100 text-gray-800': booking.status === 'cancelled',
                          'bg-blue-100 text-blue-800': booking.status === 'completed'
                        }"
                      >
                        {{ getStatusLabel(booking.status) }}
                      </span>
                      <span class="text-sm font-medium px-3 py-1 rounded-full"
                        :class="{
                          'bg-yellow-100 text-yellow-800': booking.paymentStatus === 'pending',
                          'bg-green-100 text-green-800': booking.paymentStatus === 'paid',
                          'bg-gray-100 text-gray-800': booking.paymentStatus === 'refunded',
                          'bg-red-100 text-red-800': booking.paymentStatus === 'failed'
                        }"
                      >
                        {{ getPaymentStatusLabel(booking.paymentStatus) }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500">予約ID: {{ booking.id }}</p>
                  </div>
                </div>

                <div class="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-600 mb-1">チェックイン</p>
                    <p class="font-semibold">{{ formatDate(booking.startDate.toDate()) }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600 mb-1">チェックアウト</p>
                    <p class="font-semibold">{{ formatDate(booking.endDate.toDate()) }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600 mb-1">宿泊者数</p>
                    <p class="font-semibold">{{ booking.guestCount }}名</p>
                  </div>
                  <div>
                    <p class="text-gray-600 mb-1">合計金額</p>
                    <p class="font-semibold text-lg">¥{{ booking.totalAmount.toLocaleString() }}</p>
                  </div>
                </div>

                <div v-if="booking.notes" class="mt-4 pt-4 border-t">
                  <p class="text-sm text-gray-600 mb-1">備考</p>
                  <p class="text-sm">{{ booking.notes }}</p>
                </div>

                <div class="mt-4 pt-4 border-t flex flex-wrap gap-2">
                  <NuxtLink
                    v-if="booking.status !== 'cancelled'"
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
                    v-if="booking.status === 'pending' || booking.status === 'confirmed'"
                    @click="handleCancelBooking(booking.id)"
                    class="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-custom"
                  >
                    予約をキャンセル
                  </button>
                  <button
                    v-if="booking.paymentStatus === 'pending'"
                    @click="handlePayment(booking.id)"
                    class="px-4 py-2 text-sm btn-primary"
                  >
                    決済する
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />

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
    bookings.value = await getUserBookings(user.value.uid)
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
    pending: '予約待ち',
    confirmed: '予約確定',
    cancelled: 'キャンセル',
    completed: '完了'
  }
  return labels[status] || status
}

// 支払いステータスラベル
const getPaymentStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '未払い',
    paid: '支払い済み',
    refunded: '返金済み',
    failed: '失敗'
  }
  return labels[status] || status
}

// 日付フォーマット
const formatDate = (date: Date) => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 予約キャンセル
const handleCancelBooking = async (bookingId: string) => {
  if (!confirm('本当にこの予約をキャンセルしますか？')) return

  try {
    await cancelBooking(bookingId)
    alert('予約をキャンセルしました')
    await loadBookings()
  } catch (error) {
    console.error('キャンセルエラー:', error)
    alert('キャンセルに失敗しました')
  }
}

// 決済処理
const handlePayment = (bookingId: string) => {
  // TODO: Stripe決済ページへリダイレクト
  alert('決済機能は今後実装予定です')
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

// マウント時に予約一覧を読み込み
onMounted(async () => {
  if (user.value) {
    await loadBookings()
    await loadReviewedBookings()
  }
})
</script>
