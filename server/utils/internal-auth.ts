/**
 * 内部API認証ユーティリティ
 * 内部API呼び出しとCronジョブの認証を一元管理
 */

import type { H3Event } from 'h3'

interface InternalAuthConfig {
  internalApiSecret: string
  cronSecret?: string
}

/**
 * 内部API認証を要求
 * x-internal-secretヘッダーを検証
 *
 * @throws 401エラー - 認証失敗時
 */
export function requireInternalAuth(
  event: H3Event,
  config: InternalAuthConfig
): void {
  const secret = getHeader(event, 'x-internal-secret')

  if (!secret || secret !== config.internalApiSecret) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Invalid internal secret',
    })
  }
}

/**
 * 内部APIまたはCronジョブの認証を要求
 * Vercel Cronとカスタムcron secretの両方をサポート
 *
 * @throws 403エラー - 認証失敗時
 */
export function requireInternalOrCronAuth(
  event: H3Event,
  config: InternalAuthConfig
): void {
  // 1. 内部API認証をチェック
  const internalSecret = getHeader(event, 'x-internal-secret')
  if (internalSecret === config.internalApiSecret) {
    return // 認証成功
  }

  // 2. Vercel Cron認証をチェック
  const vercelAuth = getHeader(event, 'authorization')
  if (config.cronSecret && vercelAuth === `Bearer ${config.cronSecret}`) {
    return // 認証成功
  }

  // 3. カスタムCron secret認証をチェック
  const cronSecret = getHeader(event, 'x-cron-secret')
  if (cronSecret && (cronSecret === config.cronSecret || cronSecret === config.internalApiSecret)) {
    return // 認証成功
  }

  // すべての認証に失敗
  throw createError({
    statusCode: 403,
    message: 'このAPIは内部呼び出し専用です',
  })
}

/**
 * 内部API認証が有効かどうかを確認（エラーをスローしない）
 */
export function isInternalRequest(
  event: H3Event,
  config: InternalAuthConfig
): boolean {
  try {
    requireInternalAuth(event, config)
    return true
  } catch {
    return false
  }
}
