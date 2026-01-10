/**
 * セキュリティヘッダーミドルウェア
 * XSS、クリックジャッキング、その他の攻撃から保護
 */

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()

  // セキュリティヘッダーを設定
  const headers = {
    // XSS攻撃を防ぐ
    'X-XSS-Protection': '1; mode=block',

    // MIMEタイプスニッフィングを防ぐ
    'X-Content-Type-Options': 'nosniff',

    // クリックジャッキング攻撃を防ぐ
    'X-Frame-Options': 'DENY',

    // HTTPSを強制（本番環境のみ）
    ...(process.env.NODE_ENV === 'production' && {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    }),

    // リファラー情報の制御
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // ブラウザ機能のパーミッション制御
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(self)',

    // Content Security Policy（CSP）
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firebasestorage.googleapis.com https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  }

  // ヘッダーを設定
  Object.entries(headers).forEach(([key, value]) => {
    setHeader(event, key, value)
  })

  // CORS設定（APIエンドポイントのみ）
  const url = event.node.req.url || ''
  if (url.startsWith('/api/')) {
    setCORSHeaders(event, config)
  }

  // OPTIONSリクエストへの対応（プリフライト）
  if (event.node.req.method === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
    return
  }
})

/**
 * CORSヘッダーを設定
 */
function setCORSHeaders(event: any, config: any) {
  const allowedOrigins = [
    config.public.siteUrl,
    'https://furniturehouse1.com',
    'https://www.furniturehouse1.com',
  ]

  // 開発環境ではlocalhostを許可
  if (process.env.NODE_ENV === 'development') {
    allowedOrigins.push('http://localhost:3000')
    allowedOrigins.push('http://localhost:3001')
  }

  const origin = getHeader(event, 'origin')

  if (origin && allowedOrigins.includes(origin)) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')
    setHeader(event, 'Access-Control-Max-Age', 86400) // 24時間
  }
}
