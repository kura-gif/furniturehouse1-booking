import crypto from 'crypto'

/**
 * 招待トークンを生成（64文字のランダム文字列）
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * 招待の有効期限を取得（7日後）
 */
export function getInvitationExpiry(): Date {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7) // 7日後
  return expiry
}

/**
 * 招待が期限切れかどうかをチェック
 */
export function isInvitationExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}
