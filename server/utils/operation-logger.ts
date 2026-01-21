/**
 * 運用ログの自動保存ユーティリティ
 *
 * 重要な操作をFirestoreに自動記録し、保守運用時の追跡を可能にする
 * コンソールログと異なり、永続化されるため後から参照可能
 */

import { FieldValue } from 'firebase-admin/firestore'
import type { Firestore } from 'firebase-admin/firestore'

/**
 * ログカテゴリ
 */
export type LogCategory =
  | 'booking'      // 予約関連（作成、承認、却下、キャンセル）
  | 'payment'      // 決済関連（与信、確定、返金）
  | 'email'        // メール送信
  | 'cron'         // 定期実行タスク
  | 'auth'         // 認証・認可
  | 'admin'        // 管理者操作
  | 'system'       // システムイベント
  | 'error'        // エラー

/**
 * ログレベル
 */
export type LogLevel = 'info' | 'warn' | 'error'

/**
 * 操作ログのエントリ
 */
export interface OperationLogEntry {
  category: LogCategory
  level: LogLevel
  action: string
  message: string
  data?: Record<string, unknown>
  bookingId?: string
  bookingReference?: string
  userId?: string
  userEmail?: string
  ipAddress?: string
  userAgent?: string
  duration?: number  // 処理時間（ミリ秒）
  error?: {
    message: string
    code?: string
    stack?: string
  }
}

/**
 * Firestoreに保存されるログドキュメント
 */
interface StoredLog extends Omit<OperationLogEntry, 'error'> {
  timestamp: FieldValue
  environment: string
  error?: {
    message: string
    code?: string
  }
}

// キャッシュされたFirestoreインスタンス
let cachedDb: Firestore | null = null

/**
 * Firestoreインスタンスを取得（遅延初期化）
 */
function getDb(): Firestore | null {
  if (cachedDb) return cachedDb

  try {
    // グローバル関数が定義されている場合のみ使用
    if (typeof getFirestoreAdmin === 'function') {
      cachedDb = getFirestoreAdmin()
      return cachedDb
    }
  } catch {
    // Firestoreが利用できない場合は無視
  }
  return null
}

/**
 * 機密データをマスク
 */
function maskSensitiveFields(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = [
    'email', 'password', 'token', 'secret', 'key', 'authorization',
    'clientSecret', 'client_secret', 'paymentIntentId', 'payment_intent',
    'phone', 'creditCard', 'cardNumber'
  ]

  const masked: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase()
    if (sensitiveKeys.some(sk => lowerKey.includes(sk.toLowerCase()))) {
      if (typeof value === 'string') {
        // メールは部分マスク
        if (lowerKey.includes('email') && value.includes('@')) {
          const atIndex = value.indexOf('@')
          masked[key] = atIndex > 2 ? value.substring(0, 2) + '***' + value.substring(atIndex) : '***@***'
        } else if (value.length > 8) {
          masked[key] = value.slice(0, 4) + '***'
        } else {
          masked[key] = '***'
        }
      } else {
        masked[key] = '***'
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      masked[key] = maskSensitiveFields(value as Record<string, unknown>)
    } else {
      masked[key] = value
    }
  }
  return masked
}

/**
 * 操作ログをFirestoreに保存
 */
export async function logOperation(entry: OperationLogEntry): Promise<void> {
  const db = getDb()

  // コンソールにも出力（Vercelログで確認可能）
  const logPrefix = `[OperationLog] [${entry.category}] [${entry.level.toUpperCase()}]`
  const logMessage = `${logPrefix} ${entry.action}: ${entry.message}`

  if (entry.level === 'error') {
    console.error(logMessage, entry.error?.message || '')
  } else if (entry.level === 'warn') {
    console.warn(logMessage)
  } else {
    console.log(logMessage)
  }

  // Firestoreが利用できない場合はコンソールログのみ
  if (!db) {
    return
  }

  try {
    const isProduction = process.env.NODE_ENV === 'production'

    const logDoc: StoredLog = {
      category: entry.category,
      level: entry.level,
      action: entry.action,
      message: entry.message,
      timestamp: FieldValue.serverTimestamp(),
      environment: isProduction ? 'production' : 'development',
    }

    // オプションフィールドを追加
    if (entry.data) {
      logDoc.data = isProduction ? maskSensitiveFields(entry.data) : entry.data
    }
    if (entry.bookingId) logDoc.bookingId = entry.bookingId
    if (entry.bookingReference) logDoc.bookingReference = entry.bookingReference
    if (entry.userId) logDoc.userId = entry.userId
    if (entry.userEmail) {
      logDoc.userEmail = isProduction
        ? entry.userEmail.replace(/^(.{2}).*(@.*)$/, '$1***$2')
        : entry.userEmail
    }
    if (entry.ipAddress) logDoc.ipAddress = entry.ipAddress
    if (entry.userAgent) logDoc.userAgent = entry.userAgent
    if (entry.duration !== undefined) logDoc.duration = entry.duration

    // エラー情報（スタックトレースは本番では除外）
    if (entry.error) {
      logDoc.error = {
        message: entry.error.message,
        code: entry.error.code,
      }
    }

    await db.collection('operationLogs').add(logDoc)
  } catch (error) {
    // ログ保存自体のエラーは握りつぶす（無限ループ防止）
    console.error('[OperationLog] Failed to save log:', error)
  }
}

/**
 * 予約関連の操作ログ
 */
export const bookingLogger = {
  created: (bookingId: string, bookingReference: string, data?: Record<string, unknown>) =>
    logOperation({
      category: 'booking',
      level: 'info',
      action: 'BOOKING_CREATED',
      message: `予約が作成されました: ${bookingReference}`,
      bookingId,
      bookingReference,
      data,
    }),

  approved: (bookingId: string, bookingReference: string, adminEmail?: string) =>
    logOperation({
      category: 'booking',
      level: 'info',
      action: 'BOOKING_APPROVED',
      message: `予約が承認されました: ${bookingReference}`,
      bookingId,
      bookingReference,
      userEmail: adminEmail,
    }),

  rejected: (bookingId: string, bookingReference: string, reason: string, adminEmail?: string) =>
    logOperation({
      category: 'booking',
      level: 'info',
      action: 'BOOKING_REJECTED',
      message: `予約が却下されました: ${bookingReference} (理由: ${reason})`,
      bookingId,
      bookingReference,
      userEmail: adminEmail,
      data: { reason },
    }),

  cancelled: (bookingId: string, bookingReference: string, cancelledBy: 'guest' | 'admin', refundAmount?: number) =>
    logOperation({
      category: 'booking',
      level: 'info',
      action: 'BOOKING_CANCELLED',
      message: `予約がキャンセルされました: ${bookingReference} (${cancelledBy === 'guest' ? 'ゲスト' : '管理者'}によるキャンセル)`,
      bookingId,
      bookingReference,
      data: { cancelledBy, refundAmount },
    }),

  modified: (bookingId: string, bookingReference: string, changes: Record<string, unknown>) =>
    logOperation({
      category: 'booking',
      level: 'info',
      action: 'BOOKING_MODIFIED',
      message: `予約が変更されました: ${bookingReference}`,
      bookingId,
      bookingReference,
      data: changes,
    }),

  expired: (bookingId: string, bookingReference: string) =>
    logOperation({
      category: 'booking',
      level: 'warn',
      action: 'BOOKING_EXPIRED',
      message: `予約の与信期限が切れました: ${bookingReference}`,
      bookingId,
      bookingReference,
    }),
}

/**
 * 決済関連の操作ログ
 */
export const paymentLogger = {
  authorized: (bookingId: string, bookingReference: string, amount: number) =>
    logOperation({
      category: 'payment',
      level: 'info',
      action: 'PAYMENT_AUTHORIZED',
      message: `与信を確保しました: ${bookingReference} (${amount.toLocaleString()}円)`,
      bookingId,
      bookingReference,
      data: { amount },
    }),

  captured: (bookingId: string, bookingReference: string, amount: number) =>
    logOperation({
      category: 'payment',
      level: 'info',
      action: 'PAYMENT_CAPTURED',
      message: `決済を確定しました: ${bookingReference} (${amount.toLocaleString()}円)`,
      bookingId,
      bookingReference,
      data: { amount },
    }),

  refunded: (bookingId: string, bookingReference: string, amount: number) =>
    logOperation({
      category: 'payment',
      level: 'info',
      action: 'PAYMENT_REFUNDED',
      message: `返金を実行しました: ${bookingReference} (${amount.toLocaleString()}円)`,
      bookingId,
      bookingReference,
      data: { amount },
    }),

  failed: (bookingId: string, bookingReference: string, errorMessage: string, errorCode?: string) =>
    logOperation({
      category: 'payment',
      level: 'error',
      action: 'PAYMENT_FAILED',
      message: `決済に失敗しました: ${bookingReference}`,
      bookingId,
      bookingReference,
      error: { message: errorMessage, code: errorCode },
    }),

  released: (bookingId: string, bookingReference: string) =>
    logOperation({
      category: 'payment',
      level: 'info',
      action: 'PAYMENT_RELEASED',
      message: `与信を解放しました: ${bookingReference}`,
      bookingId,
      bookingReference,
    }),
}

/**
 * メール送信の操作ログ
 */
export const emailOperationLogger = {
  sent: (emailType: string, to: string, bookingReference?: string) =>
    logOperation({
      category: 'email',
      level: 'info',
      action: 'EMAIL_SENT',
      message: `メールを送信しました: ${emailType} → ${to}`,
      bookingReference,
      data: { emailType, to },
    }),

  failed: (emailType: string, to: string, errorMessage: string, bookingReference?: string) =>
    logOperation({
      category: 'email',
      level: 'error',
      action: 'EMAIL_FAILED',
      message: `メール送信に失敗しました: ${emailType} → ${to}`,
      bookingReference,
      error: { message: errorMessage },
      data: { emailType, to },
    }),
}

/**
 * Cron実行の操作ログ
 */
export const cronLogger = {
  started: (jobName: string) =>
    logOperation({
      category: 'cron',
      level: 'info',
      action: 'CRON_STARTED',
      message: `Cronジョブを開始しました: ${jobName}`,
      data: { jobName },
    }),

  completed: (jobName: string, results: Record<string, unknown>, duration: number) =>
    logOperation({
      category: 'cron',
      level: 'info',
      action: 'CRON_COMPLETED',
      message: `Cronジョブが完了しました: ${jobName}`,
      data: { jobName, results },
      duration,
    }),

  failed: (jobName: string, errorMessage: string, duration?: number) =>
    logOperation({
      category: 'cron',
      level: 'error',
      action: 'CRON_FAILED',
      message: `Cronジョブが失敗しました: ${jobName}`,
      error: { message: errorMessage },
      data: { jobName },
      duration,
    }),

  warning: (jobName: string, message: string, data?: Record<string, unknown>) =>
    logOperation({
      category: 'cron',
      level: 'warn',
      action: 'CRON_WARNING',
      message: `Cronジョブで警告: ${jobName} - ${message}`,
      data: { jobName, ...data },
    }),
}

/**
 * 管理者操作の操作ログ
 */
export const adminLogger = {
  login: (userEmail: string, ipAddress?: string) =>
    logOperation({
      category: 'admin',
      level: 'info',
      action: 'ADMIN_LOGIN',
      message: `管理者がログインしました: ${userEmail}`,
      userEmail,
      ipAddress,
    }),

  settingsUpdated: (userEmail: string, settingType: string, changes?: Record<string, unknown>) =>
    logOperation({
      category: 'admin',
      level: 'info',
      action: 'SETTINGS_UPDATED',
      message: `設定が更新されました: ${settingType}`,
      userEmail,
      data: { settingType, changes },
    }),

  supporterCreated: (userEmail: string, supporterEmail: string) =>
    logOperation({
      category: 'admin',
      level: 'info',
      action: 'SUPPORTER_CREATED',
      message: `サポーターが追加されました: ${supporterEmail}`,
      userEmail,
      data: { supporterEmail },
    }),

  invitationSent: (userEmail: string, inviteeEmail: string, role: string) =>
    logOperation({
      category: 'admin',
      level: 'info',
      action: 'INVITATION_SENT',
      message: `招待を送信しました: ${inviteeEmail} (${role})`,
      userEmail,
      data: { inviteeEmail, role },
    }),
}

/**
 * システムイベントの操作ログ
 */
export const systemLogger = {
  startup: (environment: string) =>
    logOperation({
      category: 'system',
      level: 'info',
      action: 'SYSTEM_STARTUP',
      message: `システムが起動しました (${environment})`,
      data: { environment },
    }),

  healthCheck: (status: 'healthy' | 'degraded' | 'unhealthy', details?: Record<string, unknown>) =>
    logOperation({
      category: 'system',
      level: status === 'unhealthy' ? 'error' : status === 'degraded' ? 'warn' : 'info',
      action: 'HEALTH_CHECK',
      message: `ヘルスチェック: ${status}`,
      data: { status, ...details },
    }),

  consistencyCheckCompleted: (issuesFound: number, autoFixed: number) =>
    logOperation({
      category: 'system',
      level: issuesFound > 0 ? 'warn' : 'info',
      action: 'CONSISTENCY_CHECK',
      message: `整合性チェック完了: ${issuesFound}件の問題を検出、${autoFixed}件を自動修復`,
      data: { issuesFound, autoFixed },
    }),
}

/**
 * エラーログ（汎用）
 */
export const errorLogger = {
  unexpected: (action: string, error: Error, context?: Record<string, unknown>) =>
    logOperation({
      category: 'error',
      level: 'error',
      action,
      message: `予期しないエラーが発生しました: ${error.message}`,
      error: {
        message: error.message,
        stack: error.stack,
      },
      data: context,
    }),

  validation: (action: string, message: string, context?: Record<string, unknown>) =>
    logOperation({
      category: 'error',
      level: 'warn',
      action,
      message: `バリデーションエラー: ${message}`,
      data: context,
    }),

  external: (service: string, errorMessage: string, context?: Record<string, unknown>) =>
    logOperation({
      category: 'error',
      level: 'error',
      action: 'EXTERNAL_SERVICE_ERROR',
      message: `外部サービスエラー (${service}): ${errorMessage}`,
      error: { message: errorMessage },
      data: { service, ...context },
    }),
}
