/**
 * Sentry クライアントサイド設定
 * ブラウザでのエラー監視
 *
 * 環境変数 SENTRY_DSN を設定してください
 */

import * as Sentry from '@sentry/nuxt'

// DSNが設定されている場合のみ初期化
const dsn = import.meta.env.VITE_SENTRY_DSN || ''

if (dsn) {
  Sentry.init({
    dsn,

    // パフォーマンスモニタリング（10%サンプリング）
    tracesSampleRate: 0.1,

    // リプレイセッション（エラー時のみ）
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,

    // 環境設定
    environment: import.meta.env.MODE || 'development',

    // エラーフィルタリング
    beforeSend(event) {
      // 開発環境ではSentryに送信しない
      if (import.meta.env.DEV) {
        console.log('[Sentry] Event captured (dev mode, not sent):', event)
        return null
      }
      return event
    },

    // 機密情報のスクラブ
    beforeSendTransaction(event) {
      // URLからトークンなどを除去
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/token=[^&]+/g, 'token=***')
      }
      return event
    },
  })
}
