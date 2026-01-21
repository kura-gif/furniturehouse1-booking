/**
 * エラーハンドリングユーティリティ
 * TypeScript strict mode対応のエラー処理ヘルパー
 */

import type { H3Event } from "h3";

/**
 * エラーオブジェクトから安全にメッセージを取得
 * 注意: この関数はログ用です。クライアントに返す場合は getSafeErrorMessage を使用してください
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "Unknown error occurred";
}

/**
 * クライアントに返す安全なエラーメッセージを取得
 * 内部実装の詳細を漏洩させない
 *
 * @param error - エラーオブジェクト
 * @param fallbackMessage - フォールバックメッセージ（ユーザー向けの安全なメッセージ）
 * @returns 安全なエラーメッセージ
 */
export function getSafeErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  // createError で作成されたエラーはそのまま返す（意図的なユーザー向けメッセージ）
  if (error && typeof error === "object" && "statusCode" in error) {
    const httpError = error as {
      statusCode: number;
      message?: string;
      statusMessage?: string;
    };
    // 4xx エラーはユーザー向けメッセージなのでそのまま返す
    if (httpError.statusCode >= 400 && httpError.statusCode < 500) {
      return httpError.message || httpError.statusMessage || fallbackMessage;
    }
  }

  // 5xx エラーや内部エラーはフォールバックメッセージを返す
  // 詳細はログに記録されているので、クライアントには安全なメッセージのみ
  return fallbackMessage;
}

/**
 * エラーオブジェクトから安全にステータスコードを取得
 */
export function getErrorStatusCode(
  error: unknown,
  defaultCode: number = 500,
): number {
  if (error && typeof error === "object") {
    const err = error as { statusCode?: number; status?: number };
    return err.statusCode || err.status || defaultCode;
  }
  return defaultCode;
}

/**
 * Stripeエラーかどうかを判定
 */
export function isStripeError(
  error: unknown,
): error is { code?: string; message: string } {
  return (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

/**
 * Stripeエラーコードを取得
 */
export function getStripeErrorCode(error: unknown): string | undefined {
  if (isStripeError(error)) {
    return (error as { code?: string }).code;
  }
  return undefined;
}

/**
 * Firestore Timestampかどうかを判定
 */
export interface FirestoreTimestamp {
  toDate: () => Date;
}

export function isFirestoreTimestamp(
  value: unknown,
): value is FirestoreTimestamp {
  return (
    value !== null &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  );
}

/**
 * クライアントIPアドレスを取得
 */
export function getClientIP(event: H3Event): string {
  // Vercelの場合
  const forwardedFor = getHeader(event, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  // Cloudflareの場合
  const cfConnectingIp = getHeader(event, "cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // 実IPアドレス
  const realIp = getHeader(event, "x-real-ip");
  if (realIp) {
    return realIp;
  }

  // フォールバック
  return event.node.req.socket.remoteAddress || "unknown";
}

/**
 * RuntimeConfigの型定義（使用する部分のみ）
 */
export interface AppRuntimeConfig {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  internalApiSecret: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  public: {
    siteUrl: string;
    firebaseProjectId: string;
    firebaseStorageBucket?: string;
  };
}

/**
 * エラーをSentryに送信（一時的に無効化）
 * 本番環境でのみ送信される
 *
 * @param error - キャプチャするエラー
 * @param context - 追加のコンテキスト情報
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  // Sentry一時的に無効化
  console.error("[Error captured]", error, context);
}

/**
 * カスタムメッセージをSentryに送信（一時的に無効化）
 *
 * @param message - 送信するメッセージ
 * @param level - ログレベル
 */
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
): void {
  // Sentry一時的に無効化
  console.log(`[${level}] ${message}`);
}
