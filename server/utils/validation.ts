/**
 * 入力検証スキーマ
 * Zodを使用した型安全なバリデーション
 */

import { z } from "zod";

/**
 * 予約作成データのスキーマ
 */
export const createBookingSchema = z
  .object({
    checkInDate: z.string().refine((date) => {
      const checkIn = new Date(date);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return checkIn >= tomorrow;
    }, "チェックイン日は明日以降を選択してください"),

    checkOutDate: z.string(),

    guestCount: z
      .number()
      .min(1, "ゲスト数は1名以上です")
      .max(10, "ゲスト数は最大10名です"),

    guestName: z
      .string()
      .min(1, "名前を入力してください")
      .max(100, "名前は100文字以内です"),

    guestEmail: z
      .string()
      .email("有効なメールアドレスを入力してください")
      .max(255, "メールアドレスは255文字以内です"),

    guestPhone: z
      .string()
      .regex(
        /^0\d{1,4}-?\d{1,4}-?\d{4}$/,
        "有効な電話番号を入力してください（例: 090-1234-5678）",
      ),

    notes: z
      .string()
      .max(1000, "備考は1000文字以内です")
      .optional()
      .or(z.literal("")),

    couponCode: z
      .string()
      .max(50, "クーポンコードは50文字以内です")
      .optional()
      .or(z.literal("")),

    amount: z.number().min(50, "金額は50円以上である必要があります").optional(), // クライアントから送信されるが、サーバーで再計算して検証
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkInDate);
      const checkOut = new Date(data.checkOutDate);
      return checkOut > checkIn;
    },
    {
      message: "チェックアウト日はチェックイン日より後でなければなりません",
      path: ["checkOutDate"],
    },
  );

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Payment Intent作成データのスキーマ
 */
export const createPaymentIntentSchema = z.object({
  checkInDate: z.string(),
  checkOutDate: z.string(),
  guestCount: z.number().min(1).max(10),
  couponCode: z.string().optional().or(z.literal("")),
});

export type CreatePaymentIntentInput = z.infer<
  typeof createPaymentIntentSchema
>;

/**
 * Payment Intent更新データのスキーマ
 */
export const updatePaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment Intent IDが必要です"),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type UpdatePaymentIntentInput = z.infer<
  typeof updatePaymentIntentSchema
>;

/**
 * バリデーションエラーをフォーマット
 */
export const formatValidationError = (error: z.ZodError): string => {
  if (!error.issues || !Array.isArray(error.issues)) {
    return "バリデーションエラーが発生しました";
  }
  return error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
};

/**
 * バリデーションヘルパー
 */
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = formatValidationError(error);
      throw createError({
        statusCode: 400,
        message,
      });
    }
    throw error;
  }
};

/**
 * パスワード強度ポリシー
 * - 最小8文字
 * - 大文字を含む
 * - 小文字を含む
 * - 数字を含む
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];

  if (!password || typeof password !== "string") {
    return { isValid: false, errors: ["パスワードを入力してください"] };
  }

  if (password.length < 8) {
    errors.push("パスワードは8文字以上で設定してください");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("パスワードには大文字を含めてください");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("パスワードには小文字を含めてください");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("パスワードには数字を含めてください");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * パスワードバリデーションでエラーをスロー
 */
export const requireValidPassword = (password: string): void => {
  const result = validatePassword(password);
  if (!result.isValid) {
    throw createError({
      statusCode: 400,
      message: result.errors.join("、"),
    });
  }
};
