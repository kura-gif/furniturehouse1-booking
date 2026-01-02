<template>
  <span :class="badgeClass" class="px-3 py-1 rounded-full text-xs font-semibold">
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}>()

const badgeClass = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'pending':
      return '予約待ち'
    case 'confirmed':
      return '予約確定'
    case 'cancelled':
      return 'キャンセル'
    case 'completed':
      return '完了'
    default:
      return props.status
  }
})
</script>
