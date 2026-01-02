<template>
  <div class="border-t border-gray-200 pt-4 space-y-2">
    <!-- 基本料金 -->
    <div class="flex justify-between text-sm">
      <span class="text-gray-600">¥{{ pricePerNight.toLocaleString() }} × {{ nights }}泊</span>
      <span class="text-gray-900">¥{{ (pricePerNight * nights).toLocaleString() }}</span>
    </div>

    <!-- 清掃料 -->
    <div v-if="cleaningFee > 0" class="flex justify-between text-sm">
      <span class="text-gray-600">清掃料</span>
      <span class="text-gray-900">¥{{ cleaningFee.toLocaleString() }}</span>
    </div>

    <!-- 割引 -->
    <div v-if="discount > 0" class="flex justify-between text-sm">
      <span class="text-gray-600">割引</span>
      <span class="text-green-600">-¥{{ discount.toLocaleString() }}</span>
    </div>

    <!-- 小計 -->
    <div class="border-t border-gray-200 pt-2 mt-2"></div>
    <div class="flex justify-between text-sm text-gray-600">
      <span>小計</span>
      <span>¥{{ subtotal.toLocaleString() }}</span>
    </div>

    <!-- 税金 -->
    <div class="flex justify-between text-sm text-gray-600">
      <span>税金・サービス料 ({{ (taxRate * 100).toFixed(1) }}%)</span>
      <span>¥{{ taxAmount.toLocaleString() }}</span>
    </div>

    <!-- 合計 -->
    <div class="border-t-2 border-gray-300 pt-3 mt-3"></div>
    <div class="flex justify-between font-semibold text-lg">
      <span class="text-gray-900">合計（税込）</span>
      <span class="text-gray-900">¥{{ totalAmount.toLocaleString() }}</span>
    </div>

    <!-- 補足説明 -->
    <div v-if="showDetails" class="pt-2 mt-2 border-t border-gray-100">
      <p class="text-xs text-gray-500">
        ※ 表示料金は確定料金です
      </p>
      <p v-if="cancellationPolicy" class="text-xs text-gray-500 mt-1">
        {{ cancellationPolicy }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  pricePerNight: number
  nights: number
  cleaningFee?: number
  discount?: number
  taxRate?: number
  showDetails?: boolean
  cancellationPolicy?: string
}>(), {
  cleaningFee: 0,
  discount: 0,
  taxRate: 0.123, // 12.3%
  showDetails: false
})

// 小計（税抜き）
const subtotal = computed(() => {
  return (props.pricePerNight * props.nights) + props.cleaningFee - props.discount
})

// 税額
const taxAmount = computed(() => {
  return Math.round(subtotal.value * props.taxRate)
})

// 合計（税込み）
const totalAmount = computed(() => {
  return subtotal.value + taxAmount.value
})
</script>
