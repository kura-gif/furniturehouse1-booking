/**
 * メール送信トランスポーター共通ユーティリティ
 * nodemailerの設定を一元管理
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

interface EmailAddresses {
  fromEmail: string
  replyToEmail: string
}

interface EmailRuntimeConfig {
  smtpHost?: string
  smtpPort?: number
  smtpUser?: string
  smtpPass?: string
  emailUser?: string
  emailPassword?: string
  emailFrom?: string
  emailReplyTo?: string
}

let cachedTransporter: Transporter | null = null

/**
 * メール送信用トランスポーターを取得
 * 設定済みのnodemailerインスタンスを返す
 */
export function getEmailTransporter(config: EmailRuntimeConfig): Transporter {
  // キャッシュがあれば再利用
  if (cachedTransporter) {
    return cachedTransporter
  }

  // SMTP設定の優先順位: 明示的なSMTP設定 > Gmail互換設定
  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    cachedTransporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort || 587,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    })
  } else if (config.emailUser && config.emailPassword) {
    // Gmail互換設定（後方互換性のため）
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    })
  } else {
    throw new Error('メール送信設定が不足しています')
  }

  return cachedTransporter
}

/**
 * From/ReplyToメールアドレスを取得
 */
export function getEmailAddresses(config: EmailRuntimeConfig): EmailAddresses {
  const baseEmail = config.smtpUser || config.emailUser || ''

  return {
    fromEmail: config.emailFrom || config.emailReplyTo || baseEmail,
    replyToEmail: config.emailReplyTo || config.emailFrom || baseEmail,
  }
}

/**
 * トランスポーターとアドレスを一括取得
 */
export function getEmailSetup(config: EmailRuntimeConfig): {
  transporter: Transporter
  fromEmail: string
  replyToEmail: string
} {
  const transporter = getEmailTransporter(config)
  const { fromEmail, replyToEmail } = getEmailAddresses(config)

  return { transporter, fromEmail, replyToEmail }
}

/**
 * キャッシュをクリア（テスト用）
 */
export function clearTransporterCache(): void {
  cachedTransporter = null
}
