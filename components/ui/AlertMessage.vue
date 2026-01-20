<script setup lang="ts">
/**
 * アラートメッセージコンポーネント
 * WCAG対応: role="alert", aria-live, aria-atomic
 */

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  dismissible?: boolean
  autoDismiss?: boolean
  autoDismissDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: true,
  autoDismiss: false,
  autoDismissDelay: 5000
})

const emit = defineEmits<{
  dismiss: []
}>()

const isVisible = ref(true)

const typeConfig = computed(() => {
  const configs = {
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-800',
      iconColor: 'text-green-400',
      icon: 'check-circle'
    },
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      textColor: 'text-red-800',
      iconColor: 'text-red-400',
      icon: 'x-circle'
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-400',
      icon: 'exclamation-triangle'
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-400',
      icon: 'information-circle'
    }
  }
  return configs[props.type]
})

// aria-live の値を決定（エラーは即座に、その他は丁寧に）
const ariaLive = computed(() => props.type === 'error' ? 'assertive' : 'polite')

// role の値を決定（エラーと警告はalert、その他はstatus）
const role = computed(() => ['error', 'warning'].includes(props.type) ? 'alert' : 'status')

const dismiss = () => {
  isVisible.value = false
  emit('dismiss')
}

// 自動非表示
let dismissTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  if (props.autoDismiss) {
    dismissTimeout = setTimeout(() => {
      dismiss()
    }, props.autoDismissDelay)
  }
})

onUnmounted(() => {
  if (dismissTimeout) {
    clearTimeout(dismissTimeout)
  }
})
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 transform -translate-y-2"
    enter-to-class="opacity-100 transform translate-y-0"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 transform translate-y-0"
    leave-to-class="opacity-0 transform -translate-y-2"
  >
    <div
      v-if="isVisible"
      :role="role"
      :aria-live="ariaLive"
      aria-atomic="true"
      :class="[
        'rounded-lg border p-4',
        typeConfig.bgColor,
        typeConfig.borderColor
      ]"
    >
      <div class="flex">
        <!-- アイコン -->
        <div class="flex-shrink-0">
          <!-- 成功アイコン -->
          <svg
            v-if="type === 'success'"
            :class="['h-5 w-5', typeConfig.iconColor]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- エラーアイコン -->
          <svg
            v-else-if="type === 'error'"
            :class="['h-5 w-5', typeConfig.iconColor]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- 警告アイコン -->
          <svg
            v-else-if="type === 'warning'"
            :class="['h-5 w-5', typeConfig.iconColor]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clip-rule="evenodd"
            />
          </svg>

          <!-- 情報アイコン -->
          <svg
            v-else
            :class="['h-5 w-5', typeConfig.iconColor]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- メッセージ -->
        <div class="ml-3 flex-1">
          <p :class="['text-sm font-medium', typeConfig.textColor]">
            {{ message }}
          </p>
        </div>

        <!-- 閉じるボタン -->
        <div v-if="dismissible" class="ml-auto pl-3">
          <button
            type="button"
            :class="[
              'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
              typeConfig.bgColor,
              typeConfig.textColor,
              'hover:opacity-75'
            ]"
            aria-label="閉じる"
            @click="dismiss"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
