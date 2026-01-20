<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="max-w-4xl mx-auto px-6 py-12 mt-16">
      <!-- ヘッダー -->
      <div class="mb-8">
        <h1 class="text-3xl font-semibold text-gray-900 mb-2">マイページ</h1>
        <p class="text-gray-600">予約の確認・管理ができます</p>
      </div>

      <!-- ユーザー情報 -->
      <div class="bg-white rounded-xl shadow-md p-6 mb-8">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
            <span class="text-2xl font-semibold text-purple-600">
              {{ userInitial }}
            </span>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900">{{ appUser?.displayName }}</h2>
            <p class="text-gray-600">{{ appUser?.email }}</p>
          </div>
        </div>
      </div>

      <!-- 予約一覧 -->
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">予約一覧</h2>
        </div>

        <!-- ローディング -->
        <div v-if="isLoading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p class="text-gray-600">予約を読み込み中...</p>
        </div>

        <!-- 予約なし -->
        <div v-else-if="bookings.length === 0" class="p-8 text-center">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-gray-600 mb-4">まだ予約がありません</p>
          <NuxtLink
            to="/booking"
            class="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            予約する
          </NuxtLink>
        </div>

        <!-- 予約リスト -->
        <div v-else class="divide-y divide-gray-200">
          <div
            v-for="booking in bookings"
            :key="booking.id"
            class="p-6 hover:bg-gray-50 transition-colors"
          >
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <!-- 予約情報 -->
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-sm font-medium text-gray-500">{{ booking.bookingReference }}</span>
                  <span
                    class="px-2 py-1 text-xs font-medium rounded-full"
                    :class="getStatusClass(booking.status)"
                  >
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </div>
                <div class="text-lg font-semibold text-gray-900 mb-1">
                  {{ formatDate(booking.checkInDate) }} 〜 {{ formatDate(booking.checkOutDate) }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ booking.guestCount }}名 ・ ¥{{ booking.totalAmount?.toLocaleString() }}
                </div>
              </div>

              <!-- アクション -->
              <div class="flex gap-2">
                <NuxtLink
                  :to="`/booking/view?id=${booking.id}`"
                  class="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  詳細を見る
                </NuxtLink>
                <button
                  v-if="canCancel(booking)"
                  @click="handleCancel(booking)"
                  class="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ホストへの問い合わせ -->
      <div class="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">お問い合わせ</h2>
        <p class="text-gray-600 mb-4">
          ご質問やご要望がございましたら、お気軽にお問い合わせください。
        </p>
        <a
          href="mailto:info@example.com"
          class="inline-flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          メールで問い合わせる
        </a>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import type { Booking } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const { user, appUser } = useAuth()
const { getUserBookings } = useBookings()
const { confirm: showConfirmDialog } = useConfirmDialog()

const bookings = ref<Booking[]>([])
const isLoading = ref(true)

// ユーザーのイニシャル
const userInitial = computed(() => {
  const name = appUser.value?.displayName || appUser.value?.email || ''
  return name.charAt(0).toUpperCase()
})

// 予約を読み込み
onMounted(async () => {
  if (user.value) {
    try {
      bookings.value = await getUserBookings(user.value.uid)
    } catch (_error) {
      // 予約の取得に失敗
    } finally {
      isLoading.value = false
    }
  } else {
    isLoading.value = false
  }
})

// 日付フォーマット
const formatDate = (timestamp: any): string => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

// ステータスラベル
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '審査中',
    pending_review: '審査中',
    confirmed: '確定',
    cancelled: 'キャンセル済',
    completed: '完了'
  }
  return labels[status] || status
}

// ステータスのクラス
const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// キャンセル可能かどうか
const canCancel = (booking: Booking): boolean => {
  // 確定前またはキャンセルポリシー期間内のみキャンセル可能
  if (booking.status === 'cancelled' || booking.status === 'completed') {
    return false
  }
  // チェックイン日の5日前まで
  const checkInDate = booking.checkInDate?.toDate ? booking.checkInDate.toDate() : new Date(booking.checkInDate as unknown as string | number)
  const now = new Date()
  const fiveDaysBefore = new Date(checkInDate)
  fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5)
  return now < fiveDaysBefore
}

// キャンセル処理
const handleCancel = async (booking: Booking) => {
  const confirmed = await showConfirmDialog({
    title: '予約のキャンセル',
    message: 'この予約をキャンセルしますか？\nキャンセルポリシーに基づき返金処理が行われます。',
    confirmText: 'キャンセルする',
    cancelText: '戻る',
    type: 'warning'
  })

  if (!confirmed) {
    return
  }
  // キャンセルページへ遷移
  navigateTo(`/booking/cancel?id=${booking.id}`)
}

// SEO
useHead({
  title: 'マイページ | 家具の家 No.1'
})
</script>
