/**
 * サーバーサイドロガーユーティリティ
 *
 * 本番環境では重要なログのみ出力し、
 * 開発環境では詳細なログを出力する
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  prefix?: string
}

const isProduction = process.env.NODE_ENV === 'production'

// ログレベルの優先度
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
}

// 本番環境では warn 以上のみ出力
const MIN_LOG_LEVEL: LogLevel = isProduction ? 'warn' : 'debug'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

function formatMessage(prefix: string | undefined, message: string): string {
  const timestamp = new Date().toISOString()
  if (prefix) {
    return `[${timestamp}] [${prefix}] ${message}`
  }
  return `[${timestamp}] ${message}`
}

export function createLogger(options: LoggerOptions = {}) {
  const { prefix } = options

  return {
    /**
     * デバッグログ（開発環境のみ）
     */
    debug: (message: string, ...args: any[]) => {
      if (shouldLog('debug')) {
        console.log(formatMessage(prefix, message), ...args)
      }
    },

    /**
     * 情報ログ（開発環境のみ）
     */
    info: (message: string, ...args: any[]) => {
      if (shouldLog('info')) {
        console.log(formatMessage(prefix, message), ...args)
      }
    },

    /**
     * 警告ログ（本番環境でも出力）
     */
    warn: (message: string, ...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage(prefix, message), ...args)
      }
    },

    /**
     * エラーログ（本番環境でも出力）
     */
    error: (message: string, ...args: any[]) => {
      if (shouldLog('error')) {
        console.error(formatMessage(prefix, message), ...args)
      }
    },

    /**
     * 重要なビジネスイベントログ（本番環境でも出力）
     * 決済成功、予約確定などの重要イベント用
     */
    event: (eventType: string, data: Record<string, any>) => {
      const message = `[EVENT:${eventType}] ${JSON.stringify(data)}`
      console.log(formatMessage(prefix, message))
    }
  }
}

// デフォルトロガー
export const logger = createLogger()

// 各モジュール用のロガー
export const stripeLogger = createLogger({ prefix: 'Stripe' })
export const authLogger = createLogger({ prefix: 'Auth' })
export const bookingLogger = createLogger({ prefix: 'Booking' })
export const emailLogger = createLogger({ prefix: 'Email' })
export const adminLogger = createLogger({ prefix: 'Admin' })
