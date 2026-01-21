<template>
  <div class="booking-calendar" role="region" aria-label="予約カレンダー">
    <div class="calendar-header mb-6 flex items-center justify-between">
      <button
        @click="previousMonth"
        class="p-2 rounded-lg hover:bg-gray-100 transition-custom focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label="前月を表示"
        type="button"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <h3 class="text-2xl font-semibold" aria-live="polite" aria-atomic="true">
        {{ currentMonthYear }}
      </h3>

      <button
        @click="nextMonth"
        class="p-2 rounded-lg hover:bg-gray-100 transition-custom focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label="次月を表示"
        type="button"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- 曜日ヘッダー -->
    <div class="grid grid-cols-7 gap-2 mb-2" role="row">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-sm font-medium text-gray-600 py-2"
        role="columnheader"
        :abbr="day"
      >
        {{ day }}
      </div>
    </div>

    <!-- カレンダーグリッド -->
    <div class="grid grid-cols-7 gap-2" role="grid" aria-label="日付を選択">
      <button
        v-for="date in calendarDays"
        :key="date.dateString"
        @click="selectDate(date)"
        @keydown.enter="selectDate(date)"
        @keydown.space.prevent="selectDate(date)"
        :disabled="!date.isAvailable"
        :aria-disabled="!date.isAvailable"
        :aria-selected="date.isSelected"
        :aria-label="getDateAriaLabel(date)"
        :tabindex="date.isCurrentMonth && date.isAvailable ? 0 : -1"
        role="gridcell"
        type="button"
        :class="[
          'aspect-square p-2 rounded-lg transition-custom',
          'flex items-center justify-center relative',
          'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
          {
            'text-gray-300': !date.isCurrentMonth,
            'bg-gray-100': date.isToday && !date.isSelected,
            'gradient-primary text-white': date.isSelected,
            'hover:bg-gray-50 cursor-pointer': date.isAvailable && !date.isSelected,
            'cursor-not-allowed opacity-50': !date.isAvailable,
            'border-2 border-purple-500': date.isInRange && !date.isSelected
          }
        ]"
      >
        <span class="text-sm font-medium">{{ date.day }}</span>

        <!-- 予約済みマーク -->
        <span
          v-if="date.isBooked"
          class="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-red-500"
          aria-hidden="true"
        ></span>
      </button>
    </div>

    <!-- 選択された日付の表示 -->
    <div v-if="selectedRange.start" class="mt-6 p-4 bg-gray-50 rounded-lg" role="status" aria-live="polite" aria-label="選択された日程">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600" id="checkin-label">チェックイン</p>
          <p class="font-semibold" aria-labelledby="checkin-label">{{ formatDate(selectedRange.start) }}</p>
        </div>
        <div v-if="selectedRange.end" aria-hidden="true">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <div v-if="selectedRange.end">
          <p class="text-sm text-gray-600" id="checkout-label">チェックアウト</p>
          <p class="font-semibold" aria-labelledby="checkout-label">{{ formatDate(selectedRange.end) }}</p>
        </div>
      </div>

      <div v-if="selectedRange.start && selectedRange.end" class="mt-3 pt-3 border-t">
        <p class="text-sm text-gray-600" id="nights-label">宿泊日数</p>
        <p class="font-semibold" aria-labelledby="nights-label">{{ numberOfNights }}泊</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface CalendarDate {
  date: Date
  dateString: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isAvailable: boolean
  isBooked: boolean
  isSelected: boolean
  isInRange: boolean
}

interface DateRange {
  start: Date | null
  end: Date | null
}

const props = defineProps<{
  bookedDates?: Date[]
  unavailableDates?: Date[]
}>()

const emit = defineEmits<{
  'update:dateRange': [range: DateRange]
}>()

const { loadBlockedDates, loadBookedDates, isDateBlocked, isDateBooked } = useBlockedDates()

const weekDays = ['日', '月', '火', '水', '木', '金', '土']
const currentDate = ref(new Date())
const selectedRange = ref<DateRange>({ start: null, end: null })
const isLoading = ref(true)

// Load blocked dates and booked dates on mount
onMounted(async () => {
  await Promise.all([
    loadBlockedDates(),
    loadBookedDates()
  ])
  isLoading.value = false
})

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

const numberOfNights = computed(() => {
  if (!selectedRange.value.start || !selectedRange.value.end) return 0
  const diffTime = selectedRange.value.end.getTime() - selectedRange.value.start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

function createCalendarDate(date: Date, isCurrentMonth: boolean): CalendarDate {
  const dateString = date.toISOString().split('T')[0]
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = date.getTime() === today.getTime()

  // propsからの予約済み日付チェック（後方互換性）
  const isBookedFromProps = props.bookedDates?.some(d =>
    d.toISOString().split('T')[0] === dateString
  ) || false

  // useBlockedDatesからの予約済み日付チェック（pending_review, confirmedステータス）
  const isBookedFromApi = isDateBooked(date)

  // ブロック日付チェック
  const isBlocked = isDateBlocked(date)

  const isUnavailable = props.unavailableDates?.some(d =>
    d.toISOString().split('T')[0] === dateString
  ) || false

  const isPast = date < today
  const isBooked = isBookedFromProps || isBookedFromApi
  const isAvailable = !isBooked && !isUnavailable && !isBlocked && !isPast

  const isSelected = !!(
    (selectedRange.value.start && date.getTime() === selectedRange.value.start.getTime()) ||
    (selectedRange.value.end && date.getTime() === selectedRange.value.end.getTime())
  )

  const isInRange = !!(selectedRange.value.start && selectedRange.value.end &&
    date > selectedRange.value.start && date < selectedRange.value.end)

  return {
    date,
    dateString,
    day: date.getDate(),
    isCurrentMonth,
    isToday,
    isAvailable,
    isBooked,
    isSelected,
    isInRange
  }
}

function selectDate(calendarDate: CalendarDate) {
  if (!calendarDate.isAvailable) return

  const { date } = calendarDate

  if (!selectedRange.value.start || (selectedRange.value.start && selectedRange.value.end)) {
    selectedRange.value = { start: date, end: null }
  } else if (date > selectedRange.value.start) {
    selectedRange.value.end = date
    emit('update:dateRange', selectedRange.value)
  } else {
    selectedRange.value = { start: date, end: null }
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

function formatDate(date: Date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 日付のアクセシビリティラベルを生成
 */
function getDateAriaLabel(calendarDate: CalendarDate): string {
  const dateLabel = formatDate(calendarDate.date)
  const parts = [dateLabel]

  if (calendarDate.isToday) {
    parts.push('今日')
  }
  if (calendarDate.isSelected) {
    parts.push('選択中')
  }
  if (calendarDate.isInRange) {
    parts.push('選択範囲内')
  }
  if (calendarDate.isBooked) {
    parts.push('予約済み')
  }
  if (!calendarDate.isAvailable && !calendarDate.isBooked) {
    parts.push('予約不可')
  }

  return parts.join('、')
}
</script>

<style scoped>
.booking-calendar {
  @apply bg-white rounded-xl shadow-md p-6;
}
</style>
