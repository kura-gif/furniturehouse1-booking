<template>
  <div class="form-input-wrapper">
    <label
      v-if="label"
      :for="inputId"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :minlength="minlength"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? errorId : hint ? hintId : undefined"
        class="w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- 成功アイコン -->
      <div
        v-if="showSuccessIcon && touched && !hasError && modelValue"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
        aria-hidden="true"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>

      <!-- エラーアイコン -->
      <div
        v-if="hasError"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
        aria-hidden="true"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
    </div>

    <!-- ヒントテキスト -->
    <p
      v-if="hint && !hasError"
      :id="hintId"
      class="mt-1.5 text-sm text-gray-500"
    >
      {{ hint }}
    </p>

    <!-- エラーメッセージ -->
    <transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <p
        v-if="hasError"
        :id="errorId"
        class="mt-1.5 text-sm text-red-600 flex items-center gap-1"
        role="alert"
        aria-live="polite"
      >
        <svg
          class="w-4 h-4 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ error }}</span>
      </p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    minlength?: number;
    maxlength?: number;
    autocomplete?: string;
    error?: string;
    touched?: boolean;
    hint?: string;
    showSuccessIcon?: boolean;
  }>(),
  {
    type: "text",
    placeholder: "",
    required: false,
    disabled: false,
    readonly: false,
    error: "",
    touched: false,
    hint: "",
    showSuccessIcon: true,
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  blur: [];
  focus: [];
  touch: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const uniqueId = Math.random().toString(36).substring(2, 9);
const inputId = computed(() => `input-${uniqueId}`);
const errorId = computed(() => `error-${uniqueId}`);
const hintId = computed(() => `hint-${uniqueId}`);

const touched = ref(props.touched);

const hasError = computed(() => {
  return touched.value && props.error !== "";
});

const inputClasses = computed(() => {
  const baseClasses = "focus:ring-purple-500";

  if (props.disabled) {
    return `${baseClasses} bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed`;
  }

  if (props.readonly) {
    return `${baseClasses} bg-gray-50 border-gray-300`;
  }

  if (hasError.value) {
    return `${baseClasses} border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500 pr-10`;
  }

  if (touched.value && !hasError.value && props.modelValue) {
    return `${baseClasses} border-green-300 focus:border-green-500 focus:ring-green-500 pr-10`;
  }

  return `${baseClasses} border-gray-300 focus:border-purple-500`;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};

const handleBlur = () => {
  if (!touched.value) {
    touched.value = true;
    emit("touch");
  }
  emit("blur");
};

const handleFocus = () => {
  emit("focus");
};

// 外部からtouchedを同期
watch(
  () => props.touched,
  (newValue) => {
    touched.value = newValue;
  }
);

// 外部からフォーカスを設定可能に
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
});
</script>

<style scoped>
.form-input-wrapper {
  position: relative;
}
</style>
