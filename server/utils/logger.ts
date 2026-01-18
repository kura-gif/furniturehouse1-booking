/**
 * サーバーサイドロガーユーティリティ
 *
 * 本番環境では重要なログのみ出力し、機密情報をマスクする
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

/**
 * 機密データをマスクする（本番環境のみ）
 */
function maskSensitiveData(data: unknown): unknown {
  if (!isProduction) return data
  if (data === null || data === undefined) return data

  if (typeof data === 'string') {
    // メールアドレスをマスク
    if (data.includes('@') && data.includes('.')) {
      const atIndex = data.indexOf('@')
      if (atIndex > 2) {
        return data.substring(0, 2) + '***' + data.substring(atIndex)
      }
    }
    // Payment Intent IDをマスク
    if (data.startsWith('pi_')) {
      return 'pi_***' + data.slice(-4)
    }
    // Client Secretをマスク
    if (data.includes('_secret_')) {
      return '***_secret_***'
    }
    // 長いトークン系をマスク
    if (data.length > 30 && /^[a-zA-Z0-9_-]+$/.test(data)) {
      return data.slice(0, 4) + '***' + data.slice(-4)
    }
    return data
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData)
  }

  if (typeof data === 'object') {
    const masked: Record<string, unknown> = {}
    const sensitiveFields = [
      'email', 'password', 'token', 'secret', 'key', 'authorization',
      'clientsecret', 'client_secret', 'paymentintentid', 'payment_intent',
      'phone', 'creditcard', 'cardnumber'
    ]
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase()
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        masked[key] = typeof value === 'string' ? maskSensitiveData(value) : '***'
      } else {
        masked[key] = maskSensitiveData(value)
      }
    }
    return masked
  }

  return data
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
    debug: (message: string, ...args: unknown[]) => {
      if (shouldLog('debug')) {
        console.log(formatMessage(prefix, message), ...args.map(maskSensitiveData))
      }
    },

    /**
     * 情報ログ（開発環境のみ）
     */
    info: (message: string, ...args: unknown[]) => {
      if (shouldLog('info')) {
        console.log(formatMessage(prefix, message), ...args.map(maskSensitiveData))
      }
    },

    /**
     * 警告ログ（本番環境でも出力）
     */
    warn: (message: string, ...args: unknown[]) => {
      if (shouldLog('warn')) {
        console.warn(formatMessage(prefix, message), ...args.map(maskSensitiveData))
      }
    },

    /**
     * エラーログ（本番環境でも出力）
     */
    error: (message: string, error?: unknown) => {
      if (shouldLog('error')) {
        if (isProduction && error instanceof Error) {
          // 本番ではスタックトレースを除外
          console.error(formatMessage(prefix, message), { message: error.message })
        } else {
          console.error(formatMessage(prefix, message), maskSensitiveData(error))
        }
      }
    },

    /**
     * 重要なビジネスイベントログ（本番環境でも出力）
     * 決済成功、予約確定などの重要イベント用
     */
    event: (eventType: string, data: Record<string, unknown>) => {
      const maskedData = maskSensitiveData(data)
      const message = `[EVENT:${eventType}] ${JSON.stringify(maskedData)}`
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
