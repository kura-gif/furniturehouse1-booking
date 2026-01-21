/**
 * Sentry サーバーサイド設定
 * APIエンドポイントでのエラー監視
 *
 * 環境変数 SENTRY_DSN を設定してください
 */

import * as Sentry from '@sentry/nuxt'

// DSNが設定されている場合のみ初期化
const dsn = process.env.SENTRY_DSN || ''

if (dsn) {
  Sentry.init({
    dsn,

    // パフォーマンスモニタリング（10%サンプリング）
    tracesSampleRate: 0.1,

    // 環境設定
    environment: process.env.NODE_ENV || 'development',

    // エラーフィルタリング
    beforeSend(event) {
      // 開発環境ではSentryに送信しない
      if (process.env.NODE_ENV === 'development') {
        return null
      }

      // 機密情報をマスク
      if (event.request?.headers) {
        const headers = event.request.headers as Record<string, string>
        if (headers['authorization']) {
          headers['authorization'] = '***'
        }
        if (headers['x-internal-secret']) {
          headers['x-internal-secret'] = '***'
        }
      }

      return event
    },
  })
}
