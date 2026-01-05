<template>
  <div class="space-y-4">
    <!-- 大人（16歳以上） -->
    <div class="flex items-center justify-between py-3">
      <div>
        <p class="font-medium text-gray-900">大人</p>
        <p class="text-sm text-gray-500">16歳以上</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="decrementAdults"
          :disabled="adults <= 1"
          class="w-8 h-8 rounded-full border-2 transition-colors"
          :class="adults <= 1
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'"
          type="button"
        >
          <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <span class="w-8 text-center font-medium text-gray-900">{{ adults }}</span>
        <button
          @click="incrementAdults"
          :disabled="totalGuests >= maxGuests"
          class="w-8 h-8 rounded-full border-2 transition-colors"
          :class="totalGuests >= maxGuests
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'"
          type="button"
        >
          <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 子ども（7〜15歳） -->
    <div class="flex items-center justify-between py-3 border-t border-gray-200">
      <div>
        <p class="font-medium text-gray-900">子ども</p>
        <p class="text-sm text-gray-500">7〜15歳（大人料金の50%）</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="decrementChildren"
          :disabled="children <= 0"
          class="w-8 h-8 rounded-full border-2 transition-colors"
          :class="children <= 0
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'"
          type="button"
        >
          <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <span class="w-8 text-center font-medium text-gray-900">{{ children }}</span>
        <button
          @click="incrementChildren"
          :disabled="totalGuests >= maxGuests"
          class="w-8 h-8 rounded-full border-2 transition-colors"
          :class="totalGuests >= maxGuests
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'"
          type="button"
        >
          <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 乳幼児（0〜6歳） -->
    <div class="flex items-center justify-between py-3 border-t border-gray-200">
      <div>
        <p class="font-medium text-gray-900">乳幼児</p>
        <p class="text-sm text-gray-500">0〜6歳（無料）</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="decrementInfants"
          :disabled="infants <= 0"
          class="w-8 h-8 rounded-full border-2 transition-colors"
          :class="infants <= 0
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'"
          type="button"
        >
          <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <span class="w-8 text-center font-medium text-gray-900">{{ infants }}</span>
        <button
          @click="incrementInfants"
          :disabled="totalGuests >= maxGuests"
          class="w-8 h-8 rounded-full border-2 transition-colors"
          :class="totalGuests >= maxGuests
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-300 text-gray-700 hover:border-gray-400'"
          type="button"
        >
          <svg class="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 合計表示 -->
    <div v-if="showTotal" class="pt-3 border-t border-gray-200">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">合計</span>
        <span class="font-medium text-gray-900">{{ totalGuests }}名</span>
      </div>
      <p v-if="totalGuests >= maxGuests" class="text-xs text-amber-600 mt-1">
        最大{{ maxGuests }}名までご宿泊いただけます
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: { adults: number; children: number; infants: number }
  maxGuests?: number
  showTotal?: boolean
}>(), {
  maxGuests: 4,
  showTotal: true
})

const emit = defineEmits<{
  'update:modelValue': [value: { adults: number; children: number; infants: number }]
}>()

const adults = computed({
  get: () => props.modelValue.adults,
  set: (value) => emit('update:modelValue', { ...props.modelValue, adults: value })
})

const children = computed({
  get: () => props.modelValue.children,
  set: (value) => emit('update:modelValue', { ...props.modelValue, children: value })
})

const infants = computed({
  get: () => props.modelValue.infants || 0,
  set: (value) => emit('update:modelValue', { ...props.modelValue, infants: value })
})

const totalGuests = computed(() => adults.value + children.value + infants.value)

const incrementAdults = () => {
  if (totalGuests.value < props.maxGuests) {
    adults.value++
  }
}

const decrementAdults = () => {
  if (adults.value > 1) {
    adults.value--
  }
}

const incrementChildren = () => {
  if (totalGuests.value < props.maxGuests) {
    children.value++
  }
}

const decrementChildren = () => {
  if (children.value > 0) {
    children.value--
  }
}

const incrementInfants = () => {
  if (totalGuests.value < props.maxGuests) {
    infants.value++
  }
}

const decrementInfants = () => {
  if (infants.value > 0) {
    infants.value--
  }
}
</script>
