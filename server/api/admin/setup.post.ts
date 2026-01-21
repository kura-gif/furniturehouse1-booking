import { getFirestoreAdmin, getAuthAdmin } from '~/server/utils/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

/**
 * 管理者ユーザーをセットアップするAPI
 * 認証済みユーザーをadminロールで登録する
 *
 * WARNING: 本番環境では使用後に削除すること
 */
export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - No token provided'
    })
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const auth = getAuthAdmin()
    const decodedToken = await auth.verifyIdToken(idToken)
    const uid = decodedToken.uid
    const email = decodedToken.email

    const db = getFirestoreAdmin()

    // 既存のユーザーを確認
    const userDoc = await db.collection('users').doc(uid).get()

    if (userDoc.exists) {
      // 既存ユーザーをadminに更新
      await db.collection('users').doc(uid).update({
        role: 'admin',
        updatedAt: Timestamp.now()
      })

      return {
        success: true,
        message: 'User updated to admin',
        uid,
        email
      }
    }

    // 新規ユーザーをadminとして作成
    const now = Timestamp.now()
    await db.collection('users').doc(uid).set({
      email: email,
      displayName: email?.split('@')[0] || 'Admin',
      role: 'admin',
      createdAt: now,
      updatedAt: now
    })

    return {
      success: true,
      message: 'Admin user created',
      uid,
      email
    }
  } catch (error: unknown) {
    console.error('[API /admin/setup] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to setup admin user'
    })
  }
})
