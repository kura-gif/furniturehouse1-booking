<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="max-w-2xl mx-auto px-4 py-16">
      <!-- 審査中表示 -->
      <div class="bg-white rounded-xl shadow-md p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <h1 class="text-3xl font-semibold text-gray-900 mb-4">予約リクエストを受け付けました</h1>
          <p class="text-gray-600 mb-2">
            ご予約リクエストありがとうございます。
          </p>
          <p class="text-sm text-gray-500 mb-4">
            {{ guestEmail }} 宛に確認メールをお送りしました。
          </p>

          <!-- 審査中の説明 -->
          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-4">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-amber-800">現在、ホストが予約内容を確認しています</p>
                <p class="text-xs text-amber-700 mt-1">
                  通常48時間以内に承認または却下のご連絡をいたします。<br>
                  承認されるまでクレジットカードへの請求は行われません。
                </p>
              </div>
            </div>
          </div>

          <div v-if="bookingReference" class="mt-4 inline-block bg-gray-100 px-4 py-2 rounded-lg">
            <p class="text-xs text-gray-600">予約番号</p>
            <p class="font-mono font-semibold text-lg text-gray-900">{{ bookingReference }}</p>
            <p class="text-xs text-gray-500 mt-1">※ お問い合わせの際は、この番号をお伝えください</p>
          </div>
        </div>

        <!-- 次のステップ -->
        <div class="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 class="font-semibold text-gray-900 mb-4">今後の流れ</h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs text-amber-600 font-semibold">1</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">ホストが予約を確認</p>
                <p class="text-xs text-gray-600">通常48時間以内に審査が完了します</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs text-purple-600 font-semibold">2</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">審査結果のご連絡</p>
                <p class="text-xs text-gray-600">{{ guestEmail }} 宛にメールでお知らせします</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-xs text-green-600 font-semibold">3</span>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-900">予約確定・決済完了</p>
                <p class="text-xs text-gray-600">承認後に決済が確定し、予約が完了します</p>
              </div>
            </div>
          </div>
        </div>

        <!-- ゲストユーザー向け案内 -->
        <div v-if="!isLoggedIn" class="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h2 class="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            予約を管理するにはアカウントが必要です
          </h2>
          <p class="text-sm text-gray-700 mb-4">
            アカウントを作成すると、予約の確認、変更、キャンセル、ホストとのメッセージのやり取りができます。
          </p>
          <button
            @click="goToSignup"
            class="w-full px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            アカウントを作成する
          </button>
          <p class="text-xs text-gray-500 mt-3 text-center">
            すでにアカウントをお持ちの方は
            <NuxtLink to="/login" class="text-purple-600 hover:underline">ログイン</NuxtLink>
          </p>
        </div>

        <!-- ログイン済みユーザー向け -->
        <div v-else class="space-y-4">
          <NuxtLink
            to="/mypage"
            class="block w-full px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 text-center"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            予約を確認する
          </NuxtLink>
        </div>

        <!-- 共通ボタン -->
        <div class="mt-4">
          <NuxtLink
            to="/"
            class="block w-full px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center"
          >
            ホームに戻る
          </NuxtLink>
        </div>

        <!-- メール確認の案内 -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-600 text-center">
            審査結果はメールでお知らせします。<br>
            予約確認メールに記載されているリンクから、いつでも予約内容を確認できます。
          </p>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { getBooking } = useBookings()

const paymentIntentId = ref('')
const bookingId = ref('')
const guestEmail = ref('')
const bookingReference = ref('')
const isLoggedIn = computed(() => !!user.value)

onMounted(async () => {
  paymentIntentId.value = route.query.payment_intent as string || ''
  bookingId.value = route.query.booking_id as string || ''
  guestEmail.value = route.query.email as string || ''

  // 予約番号を取得
  if (bookingId.value) {
    try {
      const booking = await getBooking(bookingId.value)
      if (booking && booking.bookingReference) {
        bookingReference.value = booking.bookingReference
      }
    } catch (error) {
      console.error('予約情報の取得エラー:', error)
    }
  }
})

// アカウント作成ページへ遷移（メールアドレスとbookingIdを渡す）
const goToSignup = () => {
  router.push({
    path: '/signup',
    query: {
      email: guestEmail.value,
      booking_id: bookingId.value,
      redirect: '/mypage'
    }
  })
}

// SEO設定
useHead({
  title: '予約リクエスト受付完了 | 家具の家 No.1',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>
