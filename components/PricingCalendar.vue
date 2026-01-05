<template>
  <div class="pricing-calendar">
    <!-- カレンダーヘッダー -->
    <div class="flex items-center justify-between mb-6">
      <button
        @click="previousMonth"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        :disabled="isPreviousMonthDisabled"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div class="text-center">
        <h3 class="text-lg font-semibold">{{ currentMonthName }}</h3>
      </div>

      <button
        @click="nextMonth"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- 曜日ヘッダー -->
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div
        v-for="(day, index) in weekDays"
        :key="day"
        :class="[
          'text-center text-sm font-medium py-2',
          index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-600'
        ]"
      >
        {{ day }}
      </div>
    </div>

    <!-- カレンダーグリッド -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="date in calendarDays"
        :key="date.dateString"
        @click="handleDateClick(date)"
        :class="[
          'min-h-[70px] p-2 rounded-lg cursor-pointer transition-all border-2',
          {
            'border-transparent bg-white hover:border-gray-300': !date.isSelected && !date.isInRange && !date.disabled,
            'border-purple-500 bg-purple-50': date.isSelected,
            'bg-purple-100 border-transparent': date.isInRange && !date.isSelected,
            'opacity-40 cursor-not-allowed': date.disabled || !date.isCurrentMonth,
            'border-gray-300 bg-gray-50': date.isBlocked && date.isCurrentMonth,
          }
        ]"
      >
        <!-- 日付 -->
        <div
          class="text-sm font-medium mb-1"
          :class="{
            'text-purple-600 font-bold': date.isToday,
            'text-red-600': !date.isToday && (date.isHoliday || date.isSunday) && date.isCurrentMonth,
            'text-blue-600': !date.isToday && !date.isHoliday && !date.isSunday && date.isSaturday && date.isCurrentMonth,
            'text-gray-400': !date.isCurrentMonth,
            'text-gray-700': date.isCurrentMonth && !date.isToday && !date.isHoliday && !date.isSunday && !date.isSaturday
          }"
        >
          {{ date.day }}
        </div>

        <!-- 料金表示 -->
        <div v-if="date.isCurrentMonth && !date.isBlocked && date.price" class="text-xs font-semibold text-gray-900">
          ¥{{ formatPrice(date.price) }}
        </div>

        <!-- ブロック表示 -->
        <div v-if="date.isBlocked && date.isCurrentMonth" class="text-xs text-gray-500">
          予約不可
        </div>

        <!-- 祝日名 -->
        <div v-if="date.holidayName && date.isCurrentMonth" class="text-xs text-red-600 truncate">
          {{ date.holidayName }}
        </div>
      </div>
    </div>

    <!-- 選択中の期間表示 -->
    <div v-if="checkInDate || checkOutDate" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs text-gray-600 mb-1">チェックイン</p>
          <p class="font-semibold">{{ checkInDate ? formatDisplayDate(checkInDate) : '日付を選択' }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-600 mb-1">チェックアウト</p>
          <p class="font-semibold">{{ checkOutDate ? formatDisplayDate(checkOutDate) : '日付を選択' }}</p>
        </div>
      </div>

      <div v-if="checkInDate && checkOutDate" class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-700">{{ nights }}泊</span>
          <span class="text-lg font-bold text-purple-600">¥{{ formatPrice(totalPrice) }}</span>
        </div>
        <button
          @click="handleClearDates"
          class="w-full mt-2 text-sm text-gray-600 hover:text-gray-900"
        >
          日付をクリア
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { isHoliday, getHolidayName, isSunday, isSaturday } from '~/utils/holidays'

interface CalendarDate {
  date: Date
  dateString: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  disabled: boolean
  isBlocked: boolean
  isSunday: boolean
  isSaturday: boolean
  isHoliday: boolean
  holidayName: string | null
  price: number | null
}

interface Props {
  modelCheckIn?: string
  modelCheckOut?: string
  adults?: number
  children?: number
}

const props = withDefaults(defineProps<Props>(), {
  adults: 1,
  children: 0
})

const emit = defineEmits<{
  'update:modelCheckIn': [value: string]
  'update:modelCheckOut': [value: string]
  'datesSelected': [checkIn: string, checkOut: string, nights: number, totalPrice: number]
}>()

const { blockedDates, loadBlockedDates, isDateBlocked } = useBlockedDates()
const { calculatePrice, loadFromFirestore } = useEnhancedPricing()

const weekDays = ['日', '月', '火', '水', '木', '金', '土']
const currentMonth = ref(new Date())
const checkInDate = ref(props.modelCheckIn || '')
const checkOutDate = ref(props.modelCheckOut || '')

// Watch for prop changes
watch(() => props.modelCheckIn, (newVal) => {
  checkInDate.value = newVal || ''
})

watch(() => props.modelCheckOut, (newVal) => {
  checkOutDate.value = newVal || ''
})

// Load blocked dates and pricing settings on mount
onMounted(async () => {
  await Promise.all([
    loadBlockedDates(),
    loadFromFirestore()
  ])
  console.log('✅ PricingCalendar: Loaded blocked dates and pricing settings')
})

const currentMonthName = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth() + 1
  return `${year}年${month}月`
})

const isPreviousMonthDisabled = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const firstDayOfCurrentMonth = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1)
  const firstDayOfPreviousMonth = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
  return firstDayOfPreviousMonth < new Date(today.getFullYear(), today.getMonth(), 1)
})

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

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
  const dateString = formatDateString(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isToday = date.getTime() === today.getTime()
  const isPast = date < today
  const blocked = isDateBlocked(date)

  // Check if date is selected or in range
  const isSelected = dateString === checkInDate.value || dateString === checkOutDate.value
  const isInRange = checkInDate.value && checkOutDate.value &&
    dateString > checkInDate.value && dateString < checkOutDate.value

  // Calculate price for this date
  let price: number | null = null
  if (isCurrentMonth && !blocked && !isPast) {
    try {
      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)
      // childrenAgesは空配列として渡す（子供の年齢情報がない場合）
      const priceCalc = calculatePrice(date, nextDay, props.adults, [])
      if (priceCalc && priceCalc.summary?.averagePricePerNight) {
        price = Math.floor(priceCalc.summary.averagePricePerNight)
      }
    } catch (error) {
      console.error('料金計算エラー:', error)
      price = null
    }
  }

  return {
    date,
    dateString,
    day: date.getDate(),
    isCurrentMonth,
    isToday,
    isSelected,
    isInRange,
    disabled: isPast || blocked,
    isBlocked: blocked,
    isSunday: isSunday(date),
    isSaturday: isSaturday(date),
    isHoliday: isHoliday(date),
    holidayName: getHolidayName(date),
    price
  }
}

function handleDateClick(dateObj: CalendarDate) {
  if (dateObj.disabled || !dateObj.isCurrentMonth) return

  if (!checkInDate.value || (checkInDate.value && checkOutDate.value)) {
    // Set check-in date
    checkInDate.value = dateObj.dateString
    checkOutDate.value = ''
    emit('update:modelCheckIn', dateObj.dateString)
    emit('update:modelCheckOut', '')
  } else {
    // Set check-out date
    if (dateObj.dateString > checkInDate.value) {
      checkOutDate.value = dateObj.dateString
      emit('update:modelCheckOut', dateObj.dateString)

      // Calculate total price and emit
      const nights = calculateNights()
      const total = calculateTotalPrice()
      emit('datesSelected', checkInDate.value, checkOutDate.value, nights, total)
    } else {
      // Swap dates if check-out is before check-in
      checkOutDate.value = checkInDate.value
      checkInDate.value = dateObj.dateString
      emit('update:modelCheckIn', dateObj.dateString)
      emit('update:modelCheckOut', checkOutDate.value)

      const nights = calculateNights()
      const total = calculateTotalPrice()
      emit('datesSelected', checkInDate.value, checkOutDate.value, nights, total)
    }
  }
}

function handleClearDates() {
  checkInDate.value = ''
  checkOutDate.value = ''
  emit('update:modelCheckIn', '')
  emit('update:modelCheckOut', '')
}

function previousMonth() {
  if (isPreviousMonthDisabled.value) return
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1
  )
}

function nextMonth() {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1
  )
}

const nights = computed(() => {
  return calculateNights()
})

function calculateNights(): number {
  if (!checkInDate.value || !checkOutDate.value) return 0
  const checkIn = new Date(checkInDate.value)
  const checkOut = new Date(checkOutDate.value)
  const diffTime = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const totalPrice = computed(() => {
  return calculateTotalPrice()
})

function calculateTotalPrice(): number {
  if (!checkInDate.value || !checkOutDate.value) return 0
  const checkIn = new Date(checkInDate.value)
  const checkOut = new Date(checkOutDate.value)
  // childrenAgesは空配列として渡す（子供の年齢情報がない場合）
  const priceCalc = calculatePrice(checkIn, checkOut, props.adults, [])
  return priceCalc?.totalPrice || 0
}

function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function formatPrice(price: number): string {
  return price.toLocaleString()
}
</script>

<style scoped>
.pricing-calendar {
  @apply bg-white;
}
</style>
