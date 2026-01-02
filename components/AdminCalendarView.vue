<template>
  <div class="admin-calendar">
    <div class="calendar-header mb-6 flex items-center justify-between">
      <button
        @click="previousMonth"
        class="p-2 rounded-lg hover:bg-gray-100 transition-custom"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h3 class="text-2xl font-semibold">
        {{ currentMonthYear }}
      </h3>

      <button
        @click="nextMonth"
        class="p-2 rounded-lg hover:bg-gray-100 transition-custom"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- 曜日ヘッダー -->
    <div class="grid grid-cols-7 gap-2 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-sm font-medium text-gray-600 py-2"
      >
        {{ day }}
      </div>
    </div>

    <!-- カレンダーグリッド -->
    <div class="grid grid-cols-7 gap-2">
      <div
        v-for="date in calendarDays"
        :key="date.dateString"
        @click="handleDateClick(date)"
        :class="[
          'min-h-[80px] p-2 rounded-lg cursor-pointer transition-custom',
          'border-2',
          {
            'border-gray-200 bg-white': !date.booking,
            'border-purple-500 bg-purple-50': date.booking?.type === 'stay',
            'border-blue-500 bg-blue-50': date.booking?.type === 'workshop',
            'border-gray-300 bg-gray-100': date.isBlocked,
            'opacity-50': !date.isCurrentMonth,
            'hover:shadow-md': date.isCurrentMonth
          }
        ]"
      >
        <!-- 日付 -->
        <div class="text-sm font-medium mb-1" :class="date.isToday ? 'text-purple-600' : 'text-gray-700'">
          {{ date.day }}
        </div>

        <!-- 予約情報 -->
        <div v-if="date.booking" class="text-xs space-y-1">
          <div class="font-semibold truncate">
            {{ date.booking.guestName }}
          </div>
          <div class="text-gray-600">
            {{ date.booking.type === 'stay' ? '宿泊' : 'WS' }}
          </div>
          <div class="text-gray-500">
            {{ date.booking.guestCount }}名
          </div>
        </div>

        <!-- ブロック表示 -->
        <div v-if="date.isBlocked" class="text-xs text-gray-600">
          ブロック
        </div>
      </div>
    </div>

    <!-- 予約詳細モーダル -->
    <div
      v-if="selectedBooking"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="selectedBooking = null"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-semibold">予約詳細</h3>
          <button
            @click="selectedBooking = null"
            class="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- 予約ID -->
          <div>
            <label class="text-sm text-gray-600">予約ID</label>
            <p class="font-mono text-sm">{{ selectedBooking.id }}</p>
          </div>

          <!-- ゲスト情報 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">ゲスト名</label>
              <p class="font-semibold">{{ selectedBooking.guestName }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">人数</label>
              <p class="font-semibold">{{ selectedBooking.guestCount }}名</p>
            </div>
          </div>

          <!-- 連絡先 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">メールアドレス</label>
              <p class="text-sm">{{ selectedBooking.guestEmail }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">電話番号</label>
              <p class="text-sm">{{ selectedBooking.guestPhone }}</p>
            </div>
          </div>

          <!-- 日程 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">チェックイン</label>
              <p class="font-semibold">{{ formatDate(selectedBooking.startDate) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">チェックアウト</label>
              <p class="font-semibold">{{ formatDate(selectedBooking.endDate) }}</p>
            </div>
          </div>

          <!-- 料金 -->
          <div>
            <label class="text-sm text-gray-600">合計金額</label>
            <p class="text-2xl font-bold text-purple-600">
              ¥{{ selectedBooking.totalAmount.toLocaleString() }}
            </p>
          </div>

          <!-- ステータス -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">予約ステータス</label>
              <p>
                <span :class="['px-3 py-1 rounded-full text-sm', getStatusColor(selectedBooking.status)]">
                  {{ getStatusLabel(selectedBooking.status) }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">支払いステータス</label>
              <p>
                <span :class="['px-3 py-1 rounded-full text-sm', getPaymentStatusColor(selectedBooking.paymentStatus)]">
                  {{ getPaymentStatusLabel(selectedBooking.paymentStatus) }}
                </span>
              </p>
            </div>
          </div>

          <!-- 備考 -->
          <div v-if="selectedBooking.notes">
            <label class="text-sm text-gray-600">備考</label>
            <p class="text-sm whitespace-pre-wrap">{{ selectedBooking.notes }}</p>
          </div>

          <!-- アクションボタン -->
          <div class="flex gap-3 pt-4 border-t">
            <button
              v-if="selectedBooking.status === 'pending'"
              @click="confirmBooking(selectedBooking.id)"
              class="btn-primary flex-1"
            >
              予約を確定
            </button>
            <button
              v-if="selectedBooking.status !== 'cancelled'"
              @click="cancelBooking(selectedBooking.id)"
              class="btn-secondary flex-1"
            >
              キャンセル
            </button>
            <button
              @click="openMessage(selectedBooking)"
              class="btn-secondary flex-1"
            >
              メッセージ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Booking, BookingStatus, PaymentStatus } from '~/types'

interface CalendarDate {
  date: Date
  dateString: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isBlocked: boolean
  booking?: Booking
}

interface Props {
  bookings: Booking[]
}

const props = defineProps<Props>()

const weekDays = ['日', '月', '火', '水', '木', '金', '土']
const currentDate = ref(new Date())
const selectedBooking = ref<Booking | null>(null)

const currentMonthYear = computed(() => {
  return `${currentDate.value.getFullYear()}年 ${currentDate.value.getMonth() + 1}月`
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const prevLastDay = new Date(year, month, 0)

  const days: CalendarDate[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 前月の日付
  const firstDayOfWeek = firstDay.getDay()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevLastDay.getDate() - i)
    days.push(createCalendarDate(date, false))
  }

  // 当月の日付
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push(createCalendarDate(date, true))
  }

  // 次月の日付
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i)
    days.push(createCalendarDate(date, false))
  }

  return days
})

function createCalendarDate(date: Date, isCurrentMonth: boolean): CalendarDate {
  const dateString = date.toISOString().split('T')[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isToday = date.getTime() === today.getTime()

  // その日に予約があるか確認
  const booking = props.bookings.find(b => {
    const startDate = b.startDate.toDate()
    const endDate = b.endDate.toDate()
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)
    return date >= startDate && date < endDate && b.status !== 'cancelled'
  })

  return {
    date,
    dateString,
    day: date.getDate(),
    isCurrentMonth,
    isToday,
    isBlocked: false, // 将来的にブロック機能を追加
    booking
  }
}

function handleDateClick(calendarDate: CalendarDate) {
  if (calendarDate.booking) {
    selectedBooking.value = calendarDate.booking
  }
}

function previousMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1
  )
}

function nextMonth() {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1
  )
}

function formatDate(timestamp: any) {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function getStatusLabel(status: BookingStatus) {
  const labels = {
    pending: '保留中',
    confirmed: '確定',
    cancelled: 'キャンセル',
    completed: '完了'
  }
  return labels[status] || status
}

function getStatusColor(status: BookingStatus) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function getPaymentStatusLabel(status: PaymentStatus) {
  const labels = {
    pending: '支払い待ち',
    paid: '支払い済み',
    refunded: '返金済み',
    failed: '失敗'
  }
  return labels[status] || status
}

function getPaymentStatusColor(status: PaymentStatus) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function confirmBooking(bookingId: string) {
  alert(`予約 ${bookingId} を確定します（実装予定）`)
  selectedBooking.value = null
}

function cancelBooking(bookingId: string) {
  if (confirm('この予約をキャンセルしますか？')) {
    alert(`予約 ${bookingId} をキャンセルします（実装予定）`)
    selectedBooking.value = null
  }
}

function openMessage(booking: Booking) {
  alert(`${booking.guestName}さんへのメッセージ機能（実装予定）`)
}
</script>

<style scoped>
.admin-calendar {
  @apply bg-white;
}
</style>
