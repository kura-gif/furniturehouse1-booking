<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <h1 class="text-2xl font-bold">レビュー管理</h1>
        </div>
        <button @click="handleLogout" class="btn-secondary text-sm">ログアウト</button>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- タブ -->
      <div class="mb-6 border-b border-gray-200">
        <div class="flex gap-4">
          <button
            @click="activeTab = 'pending'"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'pending' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            承認待ち ({{ pendingReviews.length }})
          </button>
          <button
            @click="activeTab = 'approved'"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'approved' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            承認済み ({{ approvedReviews.length }})
          </button>
          <button
            @click="activeTab = 'rejected'"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'rejected' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            却下済み ({{ rejectedReviews.length }})
          </button>
        </div>
      </div>

      <!-- 承認待ちレビュー -->
      <div v-if="activeTab === 'pending'" class="space-y-4">
        <div v-if="pendingReviews.length === 0" class="card text-center py-8 text-gray-500">
          承認待ちのレビューはありません
        </div>
        <div
          v-for="review in pendingReviews"
          :key="review.id"
          class="card"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-lg">{{ review.userName }}</h3>
              <p class="text-sm text-gray-600">{{ review.userEmail }}</p>
              <p class="text-sm text-gray-500 mt-1">
                投稿日: {{ formatDate(review.createdAt) }}
              </p>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-1 mb-1">
                <span v-for="star in review.rating" :key="star" class="text-yellow-500 text-lg">★</span>
              </div>
              <p v-if="review.stayType" class="text-sm text-gray-600">{{ review.stayType }}</p>
              <p v-if="review.stayDate" class="text-sm text-gray-600">{{ review.stayDate }}</p>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-gray-800 whitespace-pre-wrap">{{ review.comment }}</p>
          </div>

          <div class="flex gap-2">
            <button
              @click="handleApprove(review.id!)"
              :disabled="isProcessing"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              承認
            </button>
            <button
              @click="openRejectModal(review)"
              :disabled="isProcessing"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              却下
            </button>
          </div>
        </div>
      </div>

      <!-- 承認済みレビュー -->
      <div v-if="activeTab === 'approved'" class="space-y-4">
        <div v-if="approvedReviews.length === 0" class="card text-center py-8 text-gray-500">
          承認済みのレビューはありません
        </div>
        <div
          v-for="review in approvedReviews"
          :key="review.id"
          class="card bg-green-50 border-green-200"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-lg">{{ review.userName }}</h3>
              <p class="text-sm text-gray-600">{{ review.userEmail }}</p>
              <p class="text-sm text-gray-500 mt-1">
                承認日: {{ formatDate(review.updatedAt) }}
              </p>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-1 mb-1">
                <span v-for="star in review.rating" :key="star" class="text-yellow-500 text-lg">★</span>
              </div>
              <p v-if="review.stayType" class="text-sm text-gray-600">{{ review.stayType }}</p>
              <p v-if="review.stayDate" class="text-sm text-gray-600">{{ review.stayDate }}</p>
            </div>
          </div>

          <div>
            <p class="text-gray-800 whitespace-pre-wrap">{{ review.comment }}</p>
          </div>
        </div>
      </div>

      <!-- 却下済みレビュー -->
      <div v-if="activeTab === 'rejected'" class="space-y-4">
        <div v-if="rejectedReviews.length === 0" class="card text-center py-8 text-gray-500">
          却下されたレビューはありません
        </div>
        <div
          v-for="review in rejectedReviews"
          :key="review.id"
          class="card bg-red-50 border-red-200"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-lg">{{ review.userName }}</h3>
              <p class="text-sm text-gray-600">{{ review.userEmail }}</p>
              <p class="text-sm text-gray-500 mt-1">
                却下日: {{ formatDate(review.updatedAt) }}
              </p>
            </div>
            <div class="text-right">
              <div class="flex items-center gap-1 mb-1">
                <span v-for="star in review.rating" :key="star" class="text-yellow-500 text-lg">★</span>
              </div>
              <p v-if="review.stayType" class="text-sm text-gray-600">{{ review.stayType }}</p>
              <p v-if="review.stayDate" class="text-sm text-gray-600">{{ review.stayDate }}</p>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-gray-800 whitespace-pre-wrap">{{ review.comment }}</p>
          </div>

          <div v-if="review.rejectionReason" class="bg-red-100 border border-red-300 rounded-lg p-3">
            <p class="text-sm font-medium text-red-800">却下理由:</p>
            <p class="text-sm text-red-700 mt-1">{{ review.rejectionReason }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 却下理由入力モーダル -->
    <div
      v-if="showRejectModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="closeRejectModal"
    >
      <div @click.stop class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 class="text-xl font-semibold mb-4">レビューを却下</h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            却下理由（任意）
          </label>
          <textarea
            v-model="rejectionReason"
            rows="4"
            placeholder="却下理由を入力してください"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeRejectModal"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            @click="confirmReject"
            :disabled="isProcessing"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            却下する
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Review } from '~/types'

definePageMeta({
  middleware: 'admin'
})

const { getAllReviews, getPendingReviews, approveReview, rejectReview } = useReviews()
const { logout } = useAuth()
const router = useRouter()

// レビューデータ
const allReviews = ref<Review[]>([])
const activeTab = ref<'pending' | 'approved' | 'rejected'>('pending')

// レビューをステータスごとにフィルタリング
const pendingReviews = computed(() => allReviews.value.filter(r => r.status === 'pending'))
const approvedReviews = computed(() => allReviews.value.filter(r => r.status === 'approved'))
const rejectedReviews = computed(() => allReviews.value.filter(r => r.status === 'rejected'))

// 却下モーダル
const showRejectModal = ref(false)
const selectedReview = ref<Review | null>(null)
const rejectionReason = ref('')
const isProcessing = ref(false)

// レビューを読み込み
const loadReviews = async () => {
  try {
    allReviews.value = await getAllReviews()
  } catch (error) {
    console.error('レビューの取得に失敗:', error)
    alert('レビューの取得に失敗しました')
  }
}

// 承認処理
const handleApprove = async (reviewId: string) => {
  if (!confirm('このレビューを承認しますか？')) return

  isProcessing.value = true
  try {
    await approveReview(reviewId)
    await loadReviews()
    alert('レビューを承認しました')
  } catch (error) {
    console.error('承認エラー:', error)
    alert('承認に失敗しました')
  } finally {
    isProcessing.value = false
  }
}

// 却下モーダルを開く
const openRejectModal = (review: Review) => {
  selectedReview.value = review
  rejectionReason.value = ''
  showRejectModal.value = true
}

// 却下モーダルを閉じる
const closeRejectModal = () => {
  showRejectModal.value = false
  selectedReview.value = null
  rejectionReason.value = ''
}

// 却下確定
const confirmReject = async () => {
  if (!selectedReview.value?.id) return

  isProcessing.value = true
  try {
    await rejectReview(selectedReview.value.id, rejectionReason.value)
    await loadReviews()
    closeRejectModal()
    alert('レビューを却下しました')
  } catch (error) {
    console.error('却下エラー:', error)
    alert('却下に失敗しました')
  } finally {
    isProcessing.value = false
  }
}

// 日付フォーマット
const formatDate = (timestamp: any): string => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

// ログアウト
const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('ログアウトエラー:', error)
  }
}

// 初期読み込み
onMounted(() => {
  loadReviews()
})

// SEO設定
useHead({
  title: 'レビュー管理 | 管理ダッシュボード',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.container-responsive {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
</style>
