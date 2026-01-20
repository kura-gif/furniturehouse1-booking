import { getAuth } from 'firebase-admin/auth'
import { getFirestoreAdmin } from './firebase-admin'
import type { H3Event } from 'h3'

/**
 * リクエストから Firebase ID Token を検証し、ユーザー情報を取得
 */
export async function verifyAuth(event: H3Event) {
  const authHeader = getHeader(event, 'Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: '認証が必要です'
    })
  }

  const idToken = authHeader.substring(7)

  try {
    const auth = getAuth()
    const decodedToken = await auth.verifyIdToken(idToken)

    return {
      uid: decodedToken.uid,
      email: decodedToken.email || ''
    }
  } catch (error: unknown) {
    console.error('認証エラー:', error)
    throw createError({
      statusCode: 401,
      statusMessage: '無効な認証トークンです'
    })
  }
}

/**
 * ユーザーが管理者かどうかを確認
 */
export async function requireAdmin(event: H3Event) {
  const { uid } = await verifyAuth(event)

  const db = getFirestoreAdmin()
  const userDoc = await db.collection('users').doc(uid).get()

  if (!userDoc.exists) {
    throw createError({
      statusCode: 403,
      statusMessage: 'ユーザー情報が見つかりません'
    })
  }

  const userData = userDoc.data()
  if (userData?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: '管理者権限が必要です'
    })
  }

  return {
    uid,
    email: userData.email,
    displayName: userData.displayName
  }
}
