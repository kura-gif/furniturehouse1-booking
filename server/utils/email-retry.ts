/**
 * メール送信リトライユーティリティ
 *
 * 一時的なネットワーク障害やSMTPサーバーの過負荷に対応するため、
 * 指数バックオフによるリトライ機能を提供
 */

import { emailLogger } from "./logger";

interface EmailRetryOptions {
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries?: number;
  /** 初期遅延時間（ミリ秒、デフォルト: 1000） */
  initialDelayMs?: number;
  /** 最大遅延時間（ミリ秒、デフォルト: 10000） */
  maxDelayMs?: number;
  /** リトライ対象のHTTPステータスコード */
  retryableStatusCodes?: number[];
}

interface FetchOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

/** メールAPI共通レスポンス型 */
interface EmailApiResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/** バッチ送信の個別結果 */
interface EmailBatchResult {
  success: boolean;
  result?: EmailApiResponse;
  error?: unknown;
}

const DEFAULT_OPTIONS: Required<EmailRetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
};

/**
 * 指数バックオフで遅延時間を計算
 */
function calculateDelay(
  attempt: number,
  initialDelayMs: number,
  maxDelayMs: number,
): number {
  // 指数バックオフ + ジッター
  const exponentialDelay = initialDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 最大30%のジッター
  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * 遅延実行
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * エラーがリトライ可能かどうかを判定
 */
function isRetryableError(
  error: unknown,
  retryableStatusCodes: number[],
): boolean {
  // FetchError（$fetch のエラー）
  if (error && typeof error === "object") {
    const err = error as {
      statusCode?: number;
      status?: number;
      message?: string;
    };

    // ステータスコードがリトライ対象か
    const statusCode = err.statusCode || err.status;
    if (statusCode && retryableStatusCodes.includes(statusCode)) {
      return true;
    }

    // ネットワークエラー
    if (err.message) {
      const networkErrors = [
        "ECONNRESET",
        "ETIMEDOUT",
        "ECONNREFUSED",
        "ENOTFOUND",
        "EPIPE",
        "network",
        "timeout",
        "socket hang up",
      ];
      return networkErrors.some((ne) =>
        err.message!.toLowerCase().includes(ne.toLowerCase()),
      );
    }
  }

  return false;
}

/**
 * リトライ付きでメールAPIを呼び出す
 *
 * @example
 * ```typescript
 * await sendEmailWithRetry('/api/emails/send-booking-confirmation', {
 *   method: 'POST',
 *   headers: { 'x-internal-secret': config.internalApiSecret },
 *   body: { to: email, ... }
 * })
 * ```
 */
export async function sendEmailWithRetry(
  url: string,
  options: FetchOptions,
  retryOptions: EmailRetryOptions = {},
): Promise<EmailApiResponse> {
  const opts: Required<EmailRetryOptions> = {
    ...DEFAULT_OPTIONS,
    ...retryOptions,
  };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const result = await $fetch<EmailApiResponse>(url, {
        method: options.method,
        headers: options.headers,
        body: options.body,
      });

      if (attempt > 0) {
        emailLogger.info(`メール送信成功（リトライ${attempt}回目）`, { url });
      }

      return result;
    } catch (error) {
      lastError = error;

      // 最後の試行またはリトライ不可能なエラーの場合は即座にthrow
      if (
        attempt >= opts.maxRetries ||
        !isRetryableError(error, opts.retryableStatusCodes)
      ) {
        emailLogger.error(`メール送信失敗（${attempt + 1}回目で断念）`, error);
        throw error;
      }

      // リトライ前に遅延
      const delayMs = calculateDelay(
        attempt,
        opts.initialDelayMs,
        opts.maxDelayMs,
      );
      emailLogger.warn(
        `メール送信リトライ（${attempt + 1}/${opts.maxRetries}、${Math.round(delayMs)}ms後）`,
        {
          url,
          error: error instanceof Error ? error.message : String(error),
        },
      );

      await delay(delayMs);
    }
  }

  // ここには到達しないはずだが、TypeScriptの型チェックのため
  throw lastError;
}

/**
 * 複数のメール送信を並列実行し、一部が失敗しても続行する
 *
 * @returns 成功・失敗の結果配列
 */
export async function sendEmailsBatch(
  requests: Array<{ url: string; options: FetchOptions }>,
  retryOptions: EmailRetryOptions = {},
): Promise<EmailBatchResult[]> {
  const results = await Promise.allSettled(
    requests.map((req) =>
      sendEmailWithRetry(req.url, req.options, retryOptions),
    ),
  );

  return results.map((result): EmailBatchResult => {
    if (result.status === "fulfilled") {
      return { success: true, result: result.value };
    } else {
      return { success: false, error: result.reason };
    }
  });
}
