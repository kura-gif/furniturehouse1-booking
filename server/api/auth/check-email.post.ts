import { getAuthAdmin } from "~/server/utils/firebase-admin";
import { z } from "zod";

const checkEmailSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
});

/**
 * シンプルなインメモリレート制限
 * 注: サーバーレス環境では各インスタンスで別のメモリを使うため完全ではないが、
 * 同一インスタンスへの連続攻撃は防げる
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1分
const RATE_LIMIT_MAX_REQUESTS = 10; // 1分間に10回まで

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // 古いレコードをクリーンアップ（メモリリーク防止）
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap) {
      if (value.resetAt < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // 新しいウィンドウを開始
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false; // レート制限超過
  }

  record.count++;
  return true;
}

/**
 * メールアドレスが既に登録されているかチェックするAPI
 * ゲストユーザーが予約時に既存アカウントのメールを使用することを防ぐ
 */
export default defineEventHandler(async (event) => {
  // レート制限チェック（ユーザー列挙攻撃を防ぐ）
  const ip =
    getHeader(event, "x-forwarded-for")?.split(",")[0]?.trim() ||
    getHeader(event, "x-real-ip") ||
    "unknown";

  if (!checkRateLimit(ip)) {
    throw createError({
      statusCode: 429,
      message: "リクエストが多すぎます。しばらく待ってから再度お試しください。",
    });
  }

  try {
    const body = await readBody(event);

    const result = checkEmailSchema.safeParse(body);
    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error.issues[0]?.message || "無効なメールアドレスです",
      });
    }

    const { email } = result.data;

    const auth = getAuthAdmin();

    try {
      // Firebase Authでメールアドレスが登録されているかチェック
      await auth.getUserByEmail(email);

      // ユーザーが見つかった場合、既に登録済み
      return {
        exists: true,
        message:
          "このメールアドレスは既に登録されています。ログインしてください。",
      };
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError.code === "auth/user-not-found") {
        return {
          exists: false,
          message: "",
        };
      }

      // その他のエラー
      console.error("[API /auth/check-email] Error:", error);
      throw createError({
        statusCode: 500,
        message: "メールアドレスの確認中にエラーが発生しました",
      });
    }
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    console.error("[API /auth/check-email] Unexpected error:", error);
    throw createError({
      statusCode: 500,
      message: "サーバーエラーが発生しました",
    });
  }
});
