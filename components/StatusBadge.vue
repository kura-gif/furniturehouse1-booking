<template>
  <span :class="badgeClass" class="px-3 py-1 rounded-full text-xs font-semibold">
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import type { BookingStatus } from '~/types'

const props = defineProps<{
  status: BookingStatus
}>()

const badgeClass = computed(() => {
  switch (props.status) {
    case 'pending':
    case 'pending_review':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
    case 'rejected':
      return 'bg-gray-100 text-gray-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'payment_failed':
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'refunded':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'pending':
      return '予約待ち'
    case 'pending_review':
      return '審査中'
    case 'confirmed':
      return '予約確定'
    case 'cancelled':
      return 'キャンセル'
    case 'completed':
      return '完了'
    case 'payment_failed':
      return '決済エラー'
    case 'refunded':
      return '返金済み'
    case 'rejected':
      return '却下'
    case 'expired':
      return '期限切れ'
    default:
      return props.status
  }
})
</script>
