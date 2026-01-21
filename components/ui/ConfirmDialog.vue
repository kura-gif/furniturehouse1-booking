<script setup lang="ts">
/**
 * 確認ダイアログコンポーネント
 * app.vueまたはdefault.vueに配置して使用
 */
import { useConfirmDialog } from "~/composables/useConfirmDialog";

const { state, handleConfirm, handleCancel } = useConfirmDialog();

const typeConfig = {
  info: {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    confirmBtnClass: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  },
  warning: {
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    confirmBtnClass: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
  },
  danger: {
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    confirmBtnClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  },
};

const currentConfig = computed(
  () => typeConfig[state.value.options.type || "info"],
);

// ESCキーでキャンセル
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && state.value.isOpen) {
    handleCancel();
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="state.isOpen"
        class="fixed inset-0 z-[10000] overflow-y-auto"
        aria-labelledby="confirm-dialog-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- オーバーレイ -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          aria-hidden="true"
          @click="handleCancel"
        />

        <!-- ダイアログ -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="state.isOpen"
              class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform"
            >
              <div class="flex items-start gap-4">
                <!-- アイコン -->
                <div
                  :class="[
                    'flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full',
                    currentConfig.iconBg,
                  ]"
                >
                  <!-- 情報アイコン -->
                  <svg
                    v-if="state.options.type === 'info' || !state.options.type"
                    :class="['w-6 h-6', currentConfig.iconColor]"
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
                  <!-- 警告アイコン -->
                  <svg
                    v-else-if="state.options.type === 'warning'"
                    :class="['w-6 h-6', currentConfig.iconColor]"
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
                  <!-- 危険アイコン -->
                  <svg
                    v-else-if="state.options.type === 'danger'"
                    :class="['w-6 h-6', currentConfig.iconColor]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>

                <!-- コンテンツ -->
                <div class="flex-1 min-w-0">
                  <h3
                    id="confirm-dialog-title"
                    class="text-lg font-semibold text-gray-900"
                  >
                    {{ state.options.title }}
                  </h3>
                  <p class="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                    {{ state.options.message }}
                  </p>
                </div>
              </div>

              <!-- ボタン -->
              <div class="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  @click="handleCancel"
                >
                  {{ state.options.cancelText }}
                </button>
                <button
                  type="button"
                  :class="[
                    'px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                    currentConfig.confirmBtnClass,
                  ]"
                  @click="handleConfirm"
                >
                  {{ state.options.confirmText }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
