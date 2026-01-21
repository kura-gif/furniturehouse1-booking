/**
 * レート制限ミドルウェア
 * APIエンドポイントへの過度なリクエストを制限
 *
 * Upstash Redisを使用した分散レート制限
 * Redis未設定時はインメモリにフォールバック
 */

import { Redis } from "@upstash/redis";
import { getClientIP } from "~/server/utils/error-handling";
import { apiLogger } from "~/server/utils/logger";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitStore {
  [key: string]: RateLimitEntry;
}

// Redis クライアント（環境変数が設定されている場合のみ初期化）
let redis: Redis | null = null;
let redisAvailable = false;

function initRedis(): void {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      redis = new Redis({ url, token });
      redisAvailable = true;
      apiLogger.info("Redis rate limiting enabled");
    } catch {
      apiLogger.warn("Failed to initialize Redis, falling back to in-memory");
      redisAvailable = false;
    }
  } else {
    apiLogger.info("Redis not configured, using in-memory rate limiting");
  }
}

// 初期化
initRedis();

// インメモリストア（フォールバック用）
const rateLimitStore: RateLimitStore = {};

// インメモリストアのクリーンアップ間隔（5分ごと）
setInterval(
  () => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach((key) => {
      if (rateLimitStore[key].resetAt < now) {
        delete rateLimitStore[key];
      }
    });
  },
  5 * 60 * 1000,
);

/**
 * Redisを使用したレート制限チェック
 */
async function checkRateLimitWithRedis(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ allowed: boolean; count: number; resetAt: number }> {
  if (!redis) {
    throw new Error("Redis not initialized");
  }

  const windowSec = Math.ceil(windowMs / 1000);
  const now = Date.now();
  const resetAt = now + windowMs;

  try {
    // INCRとEXPIREをパイプラインで実行
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, windowSec);
    const results = await pipeline.exec<[number, number]>();

    const count = results[0];

    return {
      allowed: count <= limit,
      count,
      resetAt,
    };
  } catch (error) {
    apiLogger.warn("Redis error, falling back to in-memory", { error });
    redisAvailable = false;
    throw error;
  }
}

/**
 * インメモリストアを使用したレート制限チェック
 */
function checkRateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; count: number; resetAt: number } {
  const now = Date.now();

  // 既存エントリをチェック
  if (rateLimitStore[key]) {
    // ウィンドウがリセットされた場合
    if (rateLimitStore[key].resetAt < now) {
      rateLimitStore[key] = {
        count: 1,
        resetAt: now + windowMs,
      };
    } else {
      // カウントを増加
      rateLimitStore[key].count++;
    }
  } else {
    // 新規エントリを作成
    rateLimitStore[key] = {
      count: 1,
      resetAt: now + windowMs,
    };
  }

  return {
    allowed: rateLimitStore[key].count <= limit,
    count: rateLimitStore[key].count,
    resetAt: rateLimitStore[key].resetAt,
  };
}

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || "";

  // テスト用バイパス（開発環境のみ）
  if (process.env.NODE_ENV !== "production") {
    const testBypass = getHeader(event, "x-test-bypass-rate-limit");
    if (testBypass === process.env.INTERNAL_API_SECRET) {
      return;
    }
  }

  // 特定のAPIエンドポイントのみレート制限を適用
  const shouldRateLimit =
    url.startsWith("/api/stripe") ||
    url.startsWith("/api/bookings") ||
    url.startsWith("/api/emails");

  if (!shouldRateLimit) {
    return;
  }

  // Webhookは除外（Stripeからのリクエスト）
  if (url.includes("/webhook")) {
    return;
  }

  // クライアントIPを取得
  const clientIP = getClientIP(event);
  const key = `rate_limit:${clientIP}:${url}`;

  // レート制限の設定
  const config = getRateLimitConfig(url);
  const { limit, windowMs } = config;

  let result: { allowed: boolean; count: number; resetAt: number };

  // Redisが利用可能な場合はRedisを使用、そうでなければインメモリ
  if (redisAvailable && redis) {
    try {
      result = await checkRateLimitWithRedis(key, limit, windowMs);
    } catch {
      // Redis障害時はインメモリにフォールバック
      result = checkRateLimitInMemory(key, limit, windowMs);
    }
  } else {
    result = checkRateLimitInMemory(key, limit, windowMs);
  }

  // レート制限ヘッダーを設定
  setHeader(event, "X-RateLimit-Limit", limit.toString());
  setHeader(
    event,
    "X-RateLimit-Remaining",
    Math.max(0, limit - result.count).toString(),
  );
  setHeader(event, "X-RateLimit-Reset", new Date(result.resetAt).toISOString());

  // 制限を超えた場合
  if (!result.allowed) {
    const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000);

    apiLogger.warn("Rate limit exceeded", {
      ip: clientIP,
      url,
      count: result.count,
      limit,
    });

    throw createError({
      statusCode: 429,
      message: `リクエストが多すぎます。${resetIn}秒後に再度お試しください。`,
    });
  }
});

/**
 * URLに応じたレート制限設定を取得
 */
function getRateLimitConfig(url: string): { limit: number; windowMs: number } {
  // 決済関連API: 厳しい制限
  if (url.includes("/stripe/create-payment-intent")) {
    return {
      limit: 5, // 5リクエスト
      windowMs: 60 * 1000, // 1分
    };
  }

  // 予約作成API: 厳しい制限
  if (url.includes("/bookings/create")) {
    return {
      limit: 3, // 3リクエスト
      windowMs: 60 * 1000, // 1分
    };
  }

  // メール送信API: 中程度の制限
  if (url.includes("/emails")) {
    return {
      limit: 10, // 10リクエスト
      windowMs: 60 * 1000, // 1分
    };
  }

  // その他のAPI: 緩い制限
  return {
    limit: 30, // 30リクエスト
    windowMs: 60 * 1000, // 1分
  };
}
