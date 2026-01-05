<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="pt-24 pb-12">
    <div class="container-responsive max-w-6xl">
      <!-- ヘッダー -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold mb-4">ワークショップ予約</h1>
        <p class="text-gray-600">日帰りで建築空間を活用したワークショップ・イベントが開催できます</p>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- カレンダーセクション -->
        <div class="lg:col-span-2">
          <BookingCalendar
            :booked-dates="bookedDates"
            :unavailable-dates="unavailableDates"
            @update:date-range="handleDateRangeUpdate"
          />

          <!-- ワークショップ利用時間帯選択 -->
          <div v-if="dateRange.start" class="card mt-6">
            <h3 class="text-xl font-semibold mb-4">利用時間帯を選択</h3>
            <div class="grid grid-cols-2 gap-4">
              <button
                v-for="timeSlot in timeSlots"
                :key="timeSlot.id"
                @click="selectTimeSlot(timeSlot)"
                :class="[
                  'p-4 border-2 rounded-lg transition-custom text-left',
                  selectedTimeSlot?.id === timeSlot.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                ]"
              >
                <div class="font-semibold">{{ timeSlot.name }}</div>
                <div class="text-sm text-gray-600">{{ timeSlot.time }}</div>
                <div class="text-sm font-semibold text-purple-600 mt-2">
                  ¥{{ timeSlot.price.toLocaleString() }}
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- 予約情報セクション -->
        <div class="lg:col-span-1">
          <div class="card sticky top-6">
            <h3 class="text-2xl font-semibold mb-6">予約内容</h3>

            <!-- 日付選択状態 -->
            <div v-if="!dateRange.start" class="text-center py-8 text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>カレンダーから日付を選択してください</p>
            </div>

            <!-- 予約フォーム -->
            <form v-else @submit.prevent="submitBooking" class="space-y-4">
              <!-- 参加人数 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  参加予定人数
                </label>
                <select
                  v-model="bookingForm.guestCount"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option v-for="n in 20" :key="n" :value="n">{{ n }}名</option>
                </select>
              </div>

              <!-- 主催者名/団体名 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  主催者名/団体名
                </label>
                <input
                  v-model="bookingForm.guestName"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- メールアドレス -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  v-model="bookingForm.guestEmail"
                  type="email"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- 電話番号 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  v-model="bookingForm.guestPhone"
                  type="tel"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <!-- ワークショップ内容 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ワークショップの内容
                </label>
                <textarea
                  v-model="bookingForm.notes"
                  rows="4"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="開催予定のワークショップの内容を簡単にご記入ください"
                  required
                ></textarea>
              </div>

              <!-- クーポンコード -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  クーポンコード（任意）
                </label>
                <div class="flex gap-2">
                  <input
                    v-model="bookingForm.couponCode"
                    type="text"
                    class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="コードを入力"
                  />
                  <button
                    type="button"
                    @click="applyCoupon"
                    class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-custom"
                  >
                    適用
                  </button>
                </div>
                <p v-if="couponApplied" class="text-sm text-green-600 mt-1">
                  ✓ クーポンが適用されました
                </p>
              </div>

              <!-- 料金詳細 -->
              <div v-if="selectedTimeSlot" class="border-t pt-4 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">{{ selectedTimeSlot.name }}</span>
                  <span>¥{{ selectedTimeSlot.price.toLocaleString() }}</span>
                </div>
                <div v-if="pricing.discountAmount > 0" class="flex justify-between text-sm text-green-600">
                  <span>割引</span>
                  <span>-¥{{ pricing.discountAmount.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between text-lg font-semibold pt-2 border-t">
                  <span>合計</span>
                  <span>¥{{ pricing.totalAmount.toLocaleString() }}</span>
                </div>
              </div>

              <!-- 予約ボタン -->
              <button
                type="submit"
                :disabled="isSubmitting || !selectedTimeSlot"
                class="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isSubmitting ? '処理中...' : '予約を確定する' }}
              </button>

              <p v-if="!selectedTimeSlot" class="text-xs text-red-500 text-center">
                利用時間帯を選択してください
              </p>
              <p v-else class="text-xs text-gray-500 text-center">
                予約確定後、決済ページに移動します
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { CreateBookingRequest } from '~/types'

definePageMeta({
  layout: false
})

interface DateRange {
  start: Date | null
  end: Date | null
}

interface TimeSlot {
  id: string
  name: string
  time: string
  price: number
}

const timeSlots: TimeSlot[] = [
  { id: 'morning', name: '午前', time: '9:00 - 13:00', price: 15000 },
  { id: 'afternoon', name: '午後', time: '14:00 - 18:00', price: 15000 },
  { id: 'fullday', name: '1日', time: '9:00 - 18:00', price: 25000 }
]

// モックデータ
const bookedDates = ref<Date[]>([
  new Date(2025, 0, 18),
  new Date(2025, 0, 22)
])

const unavailableDates = ref<Date[]>([
  new Date(2025, 0, 28)
])

const dateRange = ref<DateRange>({ start: null, end: null })
const selectedTimeSlot = ref<TimeSlot | null>(null)
const couponApplied = ref(false)
const isSubmitting = ref(false)

const bookingForm = reactive({
  guestCount: 10,
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  couponCode: '',
  notes: ''
})

const pricing = computed(() => {
  if (!selectedTimeSlot.value) {
    return { baseAmount: 0, discountAmount: 0, totalAmount: 0 }
  }

  const baseAmount = selectedTimeSlot.value.price
  const discountAmount = couponApplied.value ? baseAmount * 0.1 : 0
  const totalAmount = baseAmount - discountAmount

  return { baseAmount, discountAmount, totalAmount }
})

function handleDateRangeUpdate(range: DateRange) {
  // ワークショップは日帰りなので、開始日のみ使用
  dateRange.value = { start: range.start, end: range.start }
}

function selectTimeSlot(timeSlot: TimeSlot) {
  selectedTimeSlot.value = timeSlot
}

async function applyCoupon() {
  if (bookingForm.couponCode) {
    couponApplied.value = true
  }
}

async function submitBooking() {
  if (!dateRange.value.start || !selectedTimeSlot.value) return

  isSubmitting.value = true

  try {
    const bookingData: CreateBookingRequest = {
      type: 'workshop',
      startDate: dateRange.value.start,
      endDate: dateRange.value.start,
      guestCount: bookingForm.guestCount,
      guestName: bookingForm.guestName,
      guestEmail: bookingForm.guestEmail,
      guestPhone: bookingForm.guestPhone,
      couponCode: bookingForm.couponCode || undefined,
      notes: `${selectedTimeSlot.value.name}（${selectedTimeSlot.value.time}）\n\n${bookingForm.notes}`,
      totalAmount: 0, // ワークショップは無料（仮）
      baseAmount: 0,
      discountAmount: 0
    }

    console.log('ワークショップ予約データ:', bookingData)
    alert('予約が完了しました！（デモ版）')
  } catch (error) {
    console.error('予約エラー:', error)
    alert('予約処理中にエラーが発生しました')
  } finally {
    isSubmitting.value = false
  }
}
</script>
