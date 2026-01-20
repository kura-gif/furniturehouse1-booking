<script setup lang="ts">
/**
 * ローディング状態付きボタンコンポーネント
 * WCAG対応: aria-busy, aria-disabled, aria-label
 */

interface Props {
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loadingText?: string
  ariaLabel?: string
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  type: 'button',
  variant: 'primary',
  size: 'md',
  loadingText: '処理中...',
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.loading || props.disabled)

const variantClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus:ring-indigo-500 disabled:border-gray-300 disabled:text-gray-400'
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  return [
    base,
    variants[props.variant],
    sizes[props.size],
    props.fullWidth ? 'w-full' : '',
    isDisabled.value ? 'cursor-not-allowed opacity-75' : ''
  ].join(' ')
})

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading"
    :aria-disabled="isDisabled"
    :aria-label="ariaLabel"
    :class="variantClasses"
    @click="handleClick"
  >
    <!-- ローディングスピナー -->
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- ボタンテキスト -->
    <span v-if="loading">{{ loadingText }}</span>
    <slot v-else />
  </button>
</template>
