/**
 * Basic認証ミドルウェア
 *
 * 本番公開前の環境保護用
 * 環境変数 BASIC_AUTH_ENABLED=true で有効化
 *
 * 使用方法:
 * 1. Vercel環境変数に設定:
 *    - BASIC_AUTH_ENABLED=true
 *    - BASIC_AUTH_CREDENTIALS=username:password
 *
 * 2. 本番公開時:
 *    - BASIC_AUTH_ENABLED=false に変更（または削除）
 */

import type { H3Event } from 'h3'

export default defineEventHandler((event) => {
  // Basic認証が無効の場合はスキップ
  const isEnabled = process.env.BASIC_AUTH_ENABLED === 'true'
  if (!isEnabled) {
    return
  }

  // Webhookエンドポイントは除外（Stripeからのコールバック等）
  const path = event.path || ''
  const excludedPaths = [
    '/api/stripe/webhook',
    '/api/cron/',
    '/api/health',
    '/_nuxt/',
    '/__nuxt_error',
    '/favicon.ico',
  ]

  if (excludedPaths.some(excluded => path.startsWith(excluded))) {
    return
  }

  // 認証情報を取得（デフォルト値は開発用）
  const credentials = process.env.BASIC_AUTH_CREDENTIALS || 'admin:preview123'
  const colonIndex = credentials.indexOf(':')
  const expectedUser = credentials.substring(0, colonIndex)
  const expectedPass = credentials.substring(colonIndex + 1)

  // Authorizationヘッダーを確認
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return sendUnauthorized(event)
  }

  // Base64デコードして認証情報を取得
  try {
    const base64Credentials = authHeader.slice(6)
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const colonIdx = decodedCredentials.indexOf(':')
    const user = decodedCredentials.substring(0, colonIdx)
    const pass = decodedCredentials.substring(colonIdx + 1)

    if (user === expectedUser && pass === expectedPass) {
      return // 認証成功
    }
  } catch {
    // デコードエラー
  }

  return sendUnauthorized(event)
})

function sendUnauthorized(event: H3Event) {
  setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="Preview Environment"')
  setResponseStatus(event, 401)
  return 'Unauthorized'
}
