<template>
  <span :class="badgeClass" class="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1">
    <svg v-if="status === 'paid'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
    </svg>
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  status: 'pending' | 'paid' | 'refunded' | 'failed'
}>()

const badgeClass = computed(() => {
  switch (props.status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'refunded':
      return 'bg-gray-100 text-gray-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const statusText = computed(() => {
  switch (props.status) {
    case 'pending':
      return '支払い待ち'
    case 'paid':
      return '支払い済み'
    case 'refunded':
      return '返金済み'
    case 'failed':
      return '支払い失敗'
    default:
      return props.status
  }
})
</script>
