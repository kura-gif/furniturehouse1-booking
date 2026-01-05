<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- ヘッダー -->
      <div class="mb-8">
        <NuxtLink to="/" class="text-purple-600 hover:underline text-sm mb-4 inline-block">
          ← トップページに戻る
        </NuxtLink>
        <h1 class="text-3xl font-semibold text-gray-900">ゲストレビュー</h1>
        <div class="flex items-center gap-3 mt-4">
          <div class="flex items-center gap-1">
            <svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span class="text-2xl font-semibold">{{ averageRating > 0 ? averageRating.toFixed(1) : '5.0' }}</span>
          </div>
          <span class="text-gray-600">（{{ reviews.length }}件のレビュー）</span>
        </div>
      </div>

      <!-- レビュー投稿ボタン -->
      <div v-if="user" class="mb-8">
        <NuxtLink
          to="/reviews/new"
          class="inline-flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          レビューを書く
        </NuxtLink>
      </div>

      <!-- ローディング -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-600 mt-4">読み込み中...</p>
      </div>

      <!-- レビューがない場合 -->
      <div v-else-if="reviews.length === 0" class="text-center py-12 bg-white rounded-xl shadow-sm">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-gray-600 text-lg">まだレビューがありません</p>
        <p class="text-gray-500 text-sm mt-2">最初のレビューを投稿しませんか？</p>
        <NuxtLink
          v-if="user"
          to="/reviews/new"
          class="inline-block mt-6 px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
        >
          レビューを投稿
        </NuxtLink>
      </div>

      <!-- レビュー一覧 -->
      <div v-else class="space-y-6">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="bg-white rounded-xl shadow-sm p-6"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ review.userName }}</h3>
              <p class="text-sm text-gray-500">
                {{ review.stayDate || formatDate(review.createdAt) }}
                <span v-if="review.stayType" class="ml-2">・{{ review.stayType }}</span>
              </p>
            </div>
            <div class="flex items-center gap-1">
              <span v-for="star in 5" :key="star" :class="star <= review.rating ? 'text-yellow-500' : 'text-gray-300'">
                ★
              </span>
            </div>
          </div>

          <p class="text-gray-700 whitespace-pre-wrap leading-relaxed">{{ review.comment }}</p>

          <!-- 管理者からの返信 -->
          <div v-if="review.adminReply" class="mt-4 bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span class="font-medium text-purple-800">ホストからの返信</span>
              <span class="text-xs text-gray-500">{{ formatDate(review.adminRepliedAt) }}</span>
            </div>
            <p class="text-gray-700 text-sm">{{ review.adminReply }}</p>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import type { Review } from '~/types'

definePageMeta({
  layout: false
})

const { getApprovedReviews, getAverageRating } = useReviews()
const { user } = useAuth()

const reviews = ref<Review[]>([])
const averageRating = ref(0)
const isLoading = ref(true)

// レビュー読み込み
const loadReviews = async () => {
  isLoading.value = true
  try {
    reviews.value = await getApprovedReviews()
    averageRating.value = await getAverageRating()
  } catch (error) {
    console.error('レビューの取得に失敗:', error)
  } finally {
    isLoading.value = false
  }
}

// 日付フォーマット
const formatDate = (timestamp: any): string => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月`
}

onMounted(() => {
  loadReviews()
})

// SEO設定
useHead({
  title: 'ゲストレビュー | 家具の家 No.1',
  meta: [
    { name: 'description', content: '家具の家 No.1 に宿泊されたゲストの皆様からのレビューをご覧いただけます。' }
  ]
})
</script>
