/**
 * レート制限ミドルウェア
 * APIエンドポイントへの過度なリクエストを制限
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitStore {
  [key: string]: RateLimitEntry
}

// インメモリストア（本番環境ではRedis推奨）
const rateLimitStore: RateLimitStore = {}

// クリーンアップ間隔（5分ごと）
setInterval(() => {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach((key) => {
    if (rateLimitStore[key].resetAt < now) {
      delete rateLimitStore[key]
    }
  })
}, 5 * 60 * 1000)

export default defineEventHandler((event) => {
  const url = event.node.req.url || ''

  // 特定のAPIエンドポイントのみレート制限を適用
  const shouldRateLimit =
    url.startsWith('/api/stripe') ||
    url.startsWith('/api/bookings') ||
    url.startsWith('/api/emails')

  if (!shouldRateLimit) {
    return
  }

  // Webhookは除外（Stripeからのリクエスト）
  if (url.includes('/webhook')) {
    return
  }

  // クライアントIPを取得
  const clientIP = getClientIP(event)
  const key = `${clientIP}:${url}`
  const now = Date.now()

  // レート制限の設定
  const config = getRateLimitConfig(url)
  const { limit, windowMs } = config

  // 既存エントリをチェック
  if (rateLimitStore[key]) {
    // ウィンドウがリセットされた場合
    if (rateLimitStore[key].resetAt < now) {
      rateLimitStore[key] = {
        count: 1,
        resetAt: now + windowMs,
      }
    } else {
      // カウントを増加
      rateLimitStore[key].count++

      // 制限を超えた場合
      if (rateLimitStore[key].count > limit) {
        const resetIn = Math.ceil((rateLimitStore[key].resetAt - now) / 1000)

        console.warn(`⚠️ Rate limit exceeded for ${clientIP} on ${url}`)

        throw createError({
          statusCode: 429,
          message: `リクエストが多すぎます。${resetIn}秒後に再度お試しください。`,
        })
      }
    }
  } else {
    // 新規エントリを作成
    rateLimitStore[key] = {
      count: 1,
      resetAt: now + windowMs,
    }
  }

  // レート制限ヘッダーを設定
  setHeader(event, 'X-RateLimit-Limit', limit.toString())
  setHeader(event, 'X-RateLimit-Remaining', (limit - rateLimitStore[key].count).toString())
  setHeader(event, 'X-RateLimit-Reset', new Date(rateLimitStore[key].resetAt).toISOString())
})

/**
 * クライアントIPアドレスを取得
 */
function getClientIP(event: any): string {
  // Vercelの場合
  const forwardedFor = getHeader(event, 'x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // Cloudflareの場合
  const cfConnectingIp = getHeader(event, 'cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  // 実IPアドレス
  const realIp = getHeader(event, 'x-real-ip')
  if (realIp) {
    return realIp
  }

  // フォールバック
  return event.node.req.socket.remoteAddress || 'unknown'
}

/**
 * URLに応じたレート制限設定を取得
 */
function getRateLimitConfig(url: string): { limit: number; windowMs: number } {
  // 決済関連API: 厳しい制限
  if (url.includes('/stripe/create-payment-intent')) {
    return {
      limit: 5, // 5リクエスト
      windowMs: 60 * 1000, // 1分
    }
  }

  // 予約作成API: 厳しい制限
  if (url.includes('/bookings/create')) {
    return {
      limit: 3, // 3リクエスト
      windowMs: 60 * 1000, // 1分
    }
  }

  // メール送信API: 中程度の制限
  if (url.includes('/emails')) {
    return {
      limit: 10, // 10リクエスト
      windowMs: 60 * 1000, // 1分
    }
  }

  // その他のAPI: 緩い制限
  return {
    limit: 30, // 30リクエスト
    windowMs: 60 * 1000, // 1分
  }
}
