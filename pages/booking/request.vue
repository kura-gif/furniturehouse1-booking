<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="max-w-4xl mx-auto px-6 py-12 mt-16">
      <!-- ヘッダー -->
      <div class="mb-8">
        <button @click="$router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        <h1 class="text-3xl font-semibold mb-6" style="color: #231815;">予約をリクエスト</h1>

        <!-- ステップインジケータ -->
        <div class="flex items-center justify-center">
          <div class="flex items-center w-full max-w-2xl">
            <!-- ステップ1 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <span class="ml-2 text-sm font-medium text-gray-900 hidden sm:inline">予約内容</span>
              </div>
            </div>
            <div class="flex-1 h-0.5 bg-purple-600 mx-2"></div>

            <!-- ステップ2 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <span class="ml-2 text-sm font-medium text-gray-900 hidden sm:inline">お客様情報</span>
              </div>
            </div>
            <div class="flex-1 h-0.5 bg-gray-200 mx-2"></div>

            <!-- ステップ3 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <span class="ml-2 text-sm font-medium text-gray-400 hidden sm:inline">お支払い</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左側: フォーム -->
        <div class="lg:col-span-2 space-y-8">
          <!-- ステップ1: 予約内容の確認 -->
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 class="text-xl font-semibold mb-4" style="color: #231815;">
              1. 予約内容をご確認ください
            </h2>

            <div class="space-y-4">
              <!-- 予約内容 -->
              <div class="border-b border-gray-200 pb-4">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">チェックイン</span>
                    <span class="text-gray-900">{{ formatDisplayDate(checkInDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">チェックアウト</span>
                    <span class="text-gray-900">{{ formatDisplayDate(checkOutDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">宿泊人数</span>
                    <span class="text-gray-900">大人{{ adults }}人、乳幼児{{ children }}人</span>
                  </div>
                </div>
              </div>

              <!-- 料金詳細 -->
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">¥{{ pricePerNight.toLocaleString() }} × {{ numberOfNights }}泊</span>
                  <span class="text-gray-900">¥{{ subtotal.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">税金</span>
                  <span class="text-gray-900">¥{{ taxAmount.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-gray-200 font-semibold text-base">
                  <span>合計（JPY）</span>
                  <span>¥{{ totalAmount.toLocaleString() }}</span>
                </div>
              </div>

              <!-- キャンセルポリシー -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 class="font-medium text-gray-900 mb-2">キャンセル無料</h3>
                <p class="text-sm text-gray-700">
                  {{ cancellationDeadline }}までにキャンセルすれば、全額が返金されます。
                </p>
              </div>
            </div>
          </div>

          <!-- ステップ2: ゲスト情報の入力 -->
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 class="text-xl font-semibold mb-4" style="color: #231815;">
              2. ゲスト情報を入力してください
            </h2>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  お名前 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="guestName"
                  type="text"
                  placeholder="山田 太郎"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="guestEmail"
                  type="email"
                  placeholder="example@email.com"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="guestPhone"
                  type="tel"
                  placeholder="090-1234-5678"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <h3 class="text-lg font-semibold mb-4" style="color: #231815;">
              お支払い情報
            </h3>

            <!-- Stripe Card Element -->
            <div v-if="paymentReady" class="space-y-4">
              <div id="card-element" class="p-4 border border-gray-200 rounded-lg bg-white"></div>
              <p class="text-xs text-gray-500">
                お支払い情報は安全に暗号化されて処理されます
              </p>
            </div>

            <!-- ローディング状態 -->
            <div v-else class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
              <p class="text-sm text-gray-600">決済フォームを準備中...</p>
            </div>
          </div>

          <!-- 同意事項 -->
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                v-model="agreedToTerms"
                class="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
              />
              <span class="text-sm text-gray-700">
                <strong>ハウスルール</strong>、<strong>キャンセルポリシー</strong>、および
                <strong>ゲストへの返金ポリシー</strong>に同意します。また、家具の家が
                <strong>支払いに関する規約</strong>に従って料金の請求を行うことに同意します。
              </span>
            </label>
          </div>

          <!-- 送信ボタン -->
          <div class="flex gap-4">
            <button
              type="button"
              @click="$router.back()"
              class="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              @click="handleSubmit"
              :disabled="!isFormValid || isSubmitting"
              class="flex-1 px-6 py-4 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
            >
              {{ isSubmitting ? '処理中...' : 'リクエストを送信' }}
            </button>
          </div>
        </div>

        <!-- 右側: 予約サマリーカード -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200 sticky top-24">
            <!-- 物件情報 -->
            <div class="flex gap-4 mb-6 pb-6 border-b border-gray-200">
              <img
                src="https://storage.googleapis.com/production-os-assets/assets/ee624b9f-8615-4f77-a680-72fbc0876d71"
                alt="家具の家 No.1"
                class="w-24 h-24 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">家具の家 No.1</h3>
                <p class="text-sm text-gray-600">家具の家 No.1に滞在する</p>
              </div>
            </div>

            <!-- 日程 -->
            <div class="mb-6 pb-6 border-b border-gray-200">
              <h4 class="font-semibold text-gray-900 mb-3">日程</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">チェックイン</span>
                  <span class="text-gray-900">{{ formatDisplayDate(checkInDate) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">チェックアウト</span>
                  <span class="text-gray-900">{{ formatDisplayDate(checkOutDate) }}</span>
                </div>
              </div>
            </div>

            <!-- ゲスト -->
            <div class="mb-6 pb-6 border-b border-gray-200">
              <h4 class="font-semibold text-gray-900 mb-3">ゲスト</h4>
              <p class="text-sm text-gray-900">大人{{ adults }}人、乳幼児{{ children }}人</p>
            </div>

            <!-- 料金の詳細 -->
            <div class="space-y-3 text-sm mb-6">
              <div class="flex justify-between">
                <span class="text-gray-600 underline">¥{{ pricePerNight.toLocaleString() }} x {{ numberOfNights }}泊</span>
                <span class="text-gray-900">¥{{ subtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 underline">清掃料金</span>
                <span class="text-gray-900">¥{{ cleaningFee.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">税金</span>
                <span class="text-gray-900">¥{{ taxAmount.toLocaleString() }}</span>
              </div>
            </div>

            <!-- 合計 -->
            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-900">合計額 JPY</span>
                <span class="font-semibold text-gray-900 text-xl">¥{{ totalAmount.toLocaleString() }}</span>
              </div>
              <button type="button" class="text-sm underline text-gray-600 hover:text-gray-900 mt-2">
                料金内訳
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />

    <!-- 決済前確認モーダル -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">予約内容の最終確認</h3>

        <div class="space-y-3 mb-6">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">チェックイン</span>
            <span class="font-medium text-gray-900">{{ formatDisplayDate(checkInDate) }} 15:00以降</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">チェックアウト</span>
            <span class="font-medium text-gray-900">{{ formatDisplayDate(checkOutDate) }} 11:00まで</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">宿泊人数</span>
            <span class="font-medium text-gray-900">大人{{ adults }}名、子ども{{ children }}名</span>
          </div>
          <div class="border-t pt-3 flex justify-between">
            <span class="font-semibold text-gray-900">合計金額</span>
            <span class="font-semibold text-lg text-gray-900">¥{{ totalAmount.toLocaleString() }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showConfirmation = false"
            class="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            修正する
          </button>
          <button
            @click="proceedToPayment"
            class="flex-1 px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            決済へ進む
          </button>
        </div>
      </div>
    </div>

    <!-- 決済処理中のローディング -->
    <div v-if="isProcessing" class="fixed inset-0 bg-white/95 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">決済処理中...</h3>
        <p class="text-sm text-gray-600 mb-1">カード情報を確認しています</p>
        <p class="text-xs text-gray-500">この画面を閉じないでください（最大30秒）</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const { createBooking } = useBookings()
const { createPaymentIntent, initializeElements, confirmCardPayment } = useStripePayment()

// クエリパラメータから予約情報を取得
const checkInDate = ref(route.query.checkIn as string || '')
const checkOutDate = ref(route.query.checkOut as string || '')
const adults = ref(parseInt(route.query.adults as string) || 1)
const children = ref(parseInt(route.query.children as string) || 0)

// 料金設定
const pricePerNight = 16782
const cleaningFee = 0
const taxRate = 0.123 // 12.3%

// 計算
const numberOfNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 0
  const start = new Date(checkInDate.value)
  const end = new Date(checkOutDate.value)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
})

const subtotal = computed(() => pricePerNight * numberOfNights.value)
const taxAmount = computed(() => Math.round(subtotal.value * taxRate))
const totalAmount = computed(() => subtotal.value + cleaningFee + taxAmount.value)

// ゲスト情報
const guestName = ref('')
const guestEmail = ref('')
const guestPhone = ref('')

// 支払い関連（Stripe）
const paymentReady = ref(false)
const clientSecret = ref('')
let cardElement: any = null

// 同意
const agreedToTerms = ref(false)
const isSubmitting = ref(false)

// モーダル・ローディング
const showConfirmation = ref(false)
const isProcessing = ref(false)

const cancellationDeadline = computed(() => {
  if (!checkInDate.value) return ''
  const date = new Date(checkInDate.value)
  date.setDate(date.getDate() - 5) // チェックイン5日前
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

// 日付フォーマット
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 初期化処理
onMounted(async () => {
  try {
    // Payment Intentを作成
    const guestCount = adults.value + children.value

    const result = await createPaymentIntent(
      checkInDate.value,
      checkOutDate.value,
      guestCount
    )

    console.log('📦 Payment Intent作成結果:', result)

    if (!result || !result.clientSecret) {
      console.error('❌ clientSecretが取得できませんでした:', result)
      throw new Error('決済の準備に失敗しました')
    }

    clientSecret.value = result.clientSecret
    console.log('✅ clientSecret取得成功:', result.clientSecret.substring(0, 30) + '...')

    // Stripe Elementsを初期化
    const elements = await initializeElements(result.clientSecret)

    // paymentReadyをtrueにしてDOMをレンダリング
    paymentReady.value = true

    // DOMの準備を待ってからマウント
    await nextTick()

    // Card Elementを作成してマウント
    const cardElementContainer = document.getElementById('card-element')
    if (!cardElementContainer) {
      throw new Error('決済フォーム要素が見つかりません')
    }

    // Card Elementを作成（スタイル付き、郵便番号非表示）
    cardElement = elements.create('card', {
      hidePostalCode: true, // 郵便番号フィールドを非表示
      style: {
        base: {
          fontSize: '16px',
          color: '#30313d',
          fontFamily: 'system-ui, sans-serif',
          '::placeholder': {
            color: '#9ca3af'
          }
        },
        invalid: {
          color: '#df1b41'
        }
      }
    })

    console.log('🎨 Card Element作成完了、マウント開始...')
    cardElement.mount('#card-element')
    console.log('✅ Card Elementマウント完了')
  } catch (error: any) {
    console.error('Stripe初期化エラー:', error)
    alert('決済フォームの準備に失敗しました。ページを再読み込みしてください。')
  }
})

// バリデーション
const isFormValid = computed(() => {
  // ゲスト情報のチェック
  if (!guestName.value.trim() || !guestEmail.value.trim() || !guestPhone.value.trim()) {
    return false
  }

  // 決済フォームの準備完了チェック
  if (!paymentReady.value) {
    return false
  }

  // 同意のチェック
  if (!agreedToTerms.value) return false

  return true
})

// 送信処理（確認モーダルを表示）
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('すべての項目を正しく入力してください')
    return
  }

  // 確認モーダルを表示
  showConfirmation.value = true
}

// 決済処理の実行
const proceedToPayment = async () => {
  showConfirmation.value = false
  isProcessing.value = true
  isSubmitting.value = true

  try {
    // Payment Intentのmetadataを更新（最新のゲスト情報を含める）
    const config = useRuntimeConfig()
    const { csrf } = useCsrf()

    await $fetch('/api/stripe/update-payment-intent', {
      method: 'POST',
      headers: {
        'csrf-token': csrf || ''
      },
      body: {
        paymentIntentId: clientSecret.value.split('_secret_')[0],
        metadata: {
          guestName: guestName.value,
          guestEmail: guestEmail.value,
          guestPhone: guestPhone.value,
          checkIn: checkInDate.value,
          checkOut: checkOutDate.value,
          guests: `大人${adults.value}人、乳幼児${children.value}人`,
          totalAmount: totalAmount.value.toString()
        }
      }
    })

    // 予約をFirestoreに保存
    const bookingData = {
      type: 'stay' as const,
      startDate: new Date(checkInDate.value),
      endDate: new Date(checkOutDate.value),
      guestCount: adults.value + children.value,
      guestName: guestName.value,
      guestEmail: guestEmail.value,
      guestPhone: guestPhone.value,
      totalAmount: totalAmount.value,
      baseAmount: subtotal.value,
      discountAmount: 0,
      notes: `決済ID: ${clientSecret.value.split('_secret_')[0]}`
    }

    const bookingId = await createBooking(bookingData)
    console.log('✅ 予約作成成功:', bookingId)

    // Stripe決済を確定（Card Element用）
    // ローカル開発環境（HTTP）ではStripe決済が制限されるため、テスト環境では決済をスキップ
    const isLocalDev = window.location.hostname === 'localhost'

    if (isLocalDev) {
      // ローカル開発: 決済スキップして完了ページへ
      console.log('🔧 ローカル開発環境: 決済をスキップします')
      const paymentIntentId = clientSecret.value.split('_secret_')[0]
      router.push({
        path: '/booking/complete',
        query: {
          payment_intent: paymentIntentId,
          booking_id: bookingId,
          email: guestEmail.value
        }
      })
    } else {
      // 本番環境: 実際に決済を実行
      const paymentIntent = await confirmCardPayment(clientSecret.value, cardElement)

      // 決済成功後、完了ページにリダイレクト
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        router.push({
          path: '/booking/complete',
          query: {
            payment_intent: paymentIntent.id,
            booking_id: bookingId,
            email: guestEmail.value
          }
        })
      }
    }
  } catch (error: any) {
    console.error('予約・決済エラー:', error)
    alert(error.message || '予約・決済の処理に失敗しました')
    isProcessing.value = false
    isSubmitting.value = false
  }
}

// SEO設定
useHead({
  title: '予約をリクエスト | 家具の家 No.1',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
