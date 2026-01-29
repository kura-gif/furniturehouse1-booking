import { ref, computed, watch, type Ref } from "vue";

// バリデーションルールの型定義
export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

// フィールドの状態
export interface FieldState {
  value: Ref<string>;
  error: Ref<string>;
  touched: Ref<boolean>;
  isValid: Ref<boolean>;
  validate: () => boolean;
  reset: () => void;
}

// バリデーション結果
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// 共通のバリデーションルール
export const validationRules = {
  required: (message = "この項目は必須です"): ValidationRule => ({
    validate: (value: string) => value.trim().length > 0,
    message,
  }),

  email: (message = "有効なメールアドレスを入力してください"): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // requiredと組み合わせて使用
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (
    min: number,
    message?: string
  ): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true; // requiredと組み合わせて使用
      return value.length >= min;
    },
    message: message || `${min}文字以上で入力してください`,
  }),

  maxLength: (
    max: number,
    message?: string
  ): ValidationRule => ({
    validate: (value: string) => value.length <= max,
    message: message || `${max}文字以内で入力してください`,
  }),

  pattern: (
    regex: RegExp,
    message: string
  ): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      return regex.test(value);
    },
    message,
  }),

  phone: (message = "有効な電話番号を入力してください"): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      // 日本の電話番号形式（ハイフンあり・なし両対応）
      const phoneRegex = /^(0\d{1,4}-?\d{1,4}-?\d{4}|\d{10,11})$/;
      return phoneRegex.test(value.replace(/[\s-]/g, ""));
    },
    message,
  }),

  postalCode: (message = "有効な郵便番号を入力してください（例：123-4567）"): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const postalRegex = /^\d{3}-?\d{4}$/;
      return postalRegex.test(value);
    },
    message,
  }),

  passwordStrength: (message = "パスワードは英数字を含む6文字以上で入力してください"): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      // 最低6文字
      return value.length >= 6;
    },
    message,
  }),

  match: (
    targetValue: () => string,
    message = "値が一致しません"
  ): ValidationRule => ({
    validate: (value: string) => value === targetValue(),
    message,
  }),
};

// 単一フィールドのバリデーション用composable
export function useFieldValidation(
  initialValue: string = "",
  rules: ValidationRule[] = []
) {
  const value = ref(initialValue);
  const error = ref("");
  const touched = ref(false);

  const validate = (): boolean => {
    for (const rule of rules) {
      if (!rule.validate(value.value)) {
        error.value = rule.message;
        return false;
      }
    }
    error.value = "";
    return true;
  };

  const isValid = computed(() => {
    if (!touched.value) return true;
    return error.value === "";
  });

  // 値が変更されたときにバリデーション実行（touched後のみ）
  watch(value, () => {
    if (touched.value) {
      validate();
    }
  });

  const reset = () => {
    value.value = initialValue;
    error.value = "";
    touched.value = false;
  };

  const touch = () => {
    touched.value = true;
    validate();
  };

  return {
    value,
    error,
    touched,
    isValid,
    validate,
    reset,
    touch,
  };
}

// フォーム全体のバリデーション用composable
export function useFormValidation<T extends Record<string, FieldState>>(
  fields: T
) {
  const isFormValid = computed(() => {
    return Object.values(fields).every((field) => {
      if (!field.touched.value) return true;
      return field.isValid.value;
    });
  });

  const validateAll = (): boolean => {
    let allValid = true;
    for (const field of Object.values(fields)) {
      field.touched.value = true;
      if (!field.validate()) {
        allValid = false;
      }
    }
    return allValid;
  };

  const resetAll = () => {
    for (const field of Object.values(fields)) {
      field.reset();
    }
  };

  const getErrors = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    for (const [key, field] of Object.entries(fields)) {
      if (field.error.value) {
        errors[key] = field.error.value;
      }
    }
    return errors;
  };

  const hasErrors = computed(() => {
    return Object.values(fields).some((field) => field.error.value !== "");
  });

  return {
    isFormValid,
    validateAll,
    resetAll,
    getErrors,
    hasErrors,
  };
}
