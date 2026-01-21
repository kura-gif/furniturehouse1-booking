<script setup lang="ts">
/**
 * トースト通知コンテナ
 * app.vueまたはdefault.vueに配置して使用
 */
import { useToast } from "~/composables/useToast";

const { toasts, remove } = useToast();

const typeConfig = {
  success: {
    bgColor: "bg-green-600",
    icon: "check",
  },
  error: {
    bgColor: "bg-red-600",
    icon: "x",
  },
  warning: {
    bgColor: "bg-yellow-500",
    icon: "exclamation",
  },
  info: {
    bgColor: "bg-blue-600",
    icon: "info",
  },
};
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-x-full"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-full"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto rounded-lg shadow-lg p-4 flex items-start gap-3 text-white',
            typeConfig[toast.type].bgColor,
          ]"
          role="alert"
        >
          <!-- アイコン -->
          <div class="flex-shrink-0">
            <!-- 成功 -->
            <svg
              v-if="toast.type === 'success'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <!-- エラー -->
            <svg
              v-else-if="toast.type === 'error'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <!-- 警告 -->
            <svg
              v-else-if="toast.type === 'warning'"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <!-- 情報 -->
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <!-- メッセージ -->
          <p class="flex-1 text-sm font-medium">
            {{ toast.message }}
          </p>

          <!-- 閉じるボタン -->
          <button
            type="button"
            class="flex-shrink-0 p-1 rounded hover:bg-white/20 transition-colors"
            aria-label="閉じる"
            @click="remove(toast.id)"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
