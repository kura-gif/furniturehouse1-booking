<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <!-- ローディング -->
    <div v-if="isLoading" class="max-w-2xl mx-auto px-4 py-16 mt-16">
      <div class="bg-white rounded-xl shadow-md p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-600">予約情報を読み込んでいます...</p>
      </div>
    </div>

    <!-- エラー -->
    <div v-else-if="error" class="max-w-2xl mx-auto px-4 py-16 mt-16">
      <div class="bg-white rounded-xl shadow-md p-8 text-center">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-gray-900 mb-4">予約が見つかりません</h1>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <NuxtLink
          to="/"
          class="inline-block px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
          style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
        >
          ホームに戻る
        </NuxtLink>
      </div>
    </div>

    <!-- 予約詳細 -->
    <div v-else-if="booking" class="max-w-3xl mx-auto px-4 py-16 mt-16">
      <div class="bg-white rounded-xl shadow-md p-8">
        <!-- ヘッダー -->
        <div class="border-b border-gray-200 pb-6 mb-6">
          <div class="flex items-center justify-between mb-2">
            <h1 class="text-2xl font-semibold text-gray-900">予約詳細</h1>
            <StatusBadge :status="booking.status" />
          </div>
          <p class="text-sm text-gray-600">
            予約番号: <span class="font-mono font-semibold">{{ booking.bookingReference }}</span>
          </p>
        </div>

        <!-- 宿泊情報 -->
        <div class="space-y-6 mb-8">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-4">宿泊情報</h2>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-1">チェックイン</p>
                <p class="font-medium text-gray-900">{{ formatDate(booking.startDate) }}</p>
                <p class="text-xs text-gray-500">15:00以降</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">チェックアウト</p>
                <p class="font-medium text-gray-900">{{ formatDate(booking.endDate) }}</p>
                <p class="text-xs text-gray-500">11:00まで</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">宿泊数</p>
                <p class="font-medium text-gray-900">{{ nights }}泊</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-1">ゲスト人数</p>
                <p class="font-medium text-gray-900">{{ booking.guestCount }}名</p>
              </div>
            </div>
          </div>

          <!-- ゲスト情報 -->
          <div class="border-t border-gray-200 pt-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">ゲスト情報</h2>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-600">お名前</p>
                <p class="font-medium text-gray-900">{{ booking.guestName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">メールアドレス</p>
                <p class="font-medium text-gray-900">{{ booking.guestEmail }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">電話番号</p>
                <p class="font-medium text-gray-900">{{ booking.guestPhone }}</p>
              </div>
            </div>
          </div>

          <!-- 料金詳細 -->
          <div class="border-t border-gray-200 pt-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">料金詳細</h2>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">基本料金</span>
                <span class="text-gray-900">¥{{ booking.baseAmount.toLocaleString() }}</span>
              </div>
              <div v-if="booking.discountAmount > 0" class="flex justify-between text-sm">
                <span class="text-gray-600">割引</span>
                <span class="text-green-600">-¥{{ booking.discountAmount.toLocaleString() }}</span>
              </div>
              <div class="border-t border-gray-200 pt-2 mt-2"></div>
              <div class="flex justify-between font-semibold text-lg">
                <span class="text-gray-900">合計金額</span>
                <span class="text-gray-900">¥{{ booking.totalAmount.toLocaleString() }}</span>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <PaymentStatusBadge :status="booking.paymentStatus" />
              </div>
            </div>
          </div>

          <!-- 備考 -->
          <div v-if="booking.notes" class="border-t border-gray-200 pt-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-2">備考</h2>
            <p class="text-gray-700 whitespace-pre-wrap">{{ booking.notes }}</p>
          </div>
        </div>

        <!-- アカウント作成促進 -->
        <div v-if="!isLoggedIn" class="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
          <h3 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            アカウントを作成してさらに便利に
          </h3>
          <ul class="text-sm text-gray-700 space-y-2 mb-4">
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              予約の変更・キャンセル
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              ホストとのメッセージ
            </li>
            <li class="flex items-center gap-2">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
              </svg>
              レビューの投稿
            </li>
          </ul>
          <button
            @click="goToSignup"
            class="w-full px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            アカウントを作成する
          </button>
          <p class="text-xs text-gray-500 mt-3 text-center">
            すでにアカウントをお持ちの方は
            <NuxtLink :to="`/login?redirect=/booking/view?token=${token}`" class="text-purple-600 hover:underline">ログイン</NuxtLink>
          </p>
        </div>

        <!-- ログイン済みの場合 -->
        <div v-else class="space-y-3">
          <NuxtLink
            to="/mypage"
            class="block w-full px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 text-center"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            マイページで管理する
          </NuxtLink>
        </div>

        <!-- ホームに戻る -->
        <div class="mt-4">
          <NuxtLink
            to="/"
            class="block w-full px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
          >
            ホームに戻る
          </NuxtLink>
        </div>

        <!-- キャンセルポリシー -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-xs text-gray-500 text-center">
            📋 キャンセルポリシー: チェックイン5日前まで全額返金可能
          </p>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/types'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { getBookingByToken } = useBookings()

const token = ref(route.query.token as string || '')
const booking = ref<Booking | null>(null)
const isLoading = ref(true)
const error = ref('')
const isLoggedIn = computed(() => !!user.value)

// 予約情報を取得
onMounted(async () => {
  if (!token.value) {
    error.value = '予約確認リンクが無効です'
    isLoading.value = false
    return
  }

  try {
    const result = await getBookingByToken(token.value)
    if (result) {
      booking.value = result
    } else {
      error.value = 'この予約は見つかりませんでした。確認メール内のリンクが正しいかご確認ください。'
    }
  } catch (e) {
    console.error('予約取得エラー:', e)
    error.value = '予約情報の取得中にエラーが発生しました'
  } finally {
    isLoading.value = false
  }
})

// 日付フォーマット
const formatDate = (timestamp: any) => {
  if (!timestamp) return ''
  const date = timestamp.toDate()
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }).format(date)
}

// 宿泊数計算
const nights = computed(() => {
  if (!booking.value) return 0
  const start = booking.value.startDate.toDate()
  const end = booking.value.endDate.toDate()
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
})

// アカウント作成ページへ遷移
const goToSignup = () => {
  router.push({
    path: '/signup',
    query: {
      email: booking.value?.guestEmail,
      booking_id: booking.value?.id,
      redirect: `/booking/view?token=${token.value}`
    }
  })
}

// SEO設定
useHead({
  title: '予約詳細 | 家具の家 No.1',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
/* ステータスバッジのスタイルはグローバルまたはコンポーネントで定義 */
</style>
