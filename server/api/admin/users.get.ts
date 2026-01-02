import { getFirestoreAdmin } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/auth'

/**
 * 管理者一覧取得API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event)

  const db = getFirestoreAdmin()

  // 管理者ユーザーの一覧を取得
  const usersSnapshot = await db
    .collection('users')
    .where('role', '==', 'admin')
    .orderBy('createdAt', 'desc')
    .get()

  const users = usersSnapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      email: data.email,
      displayName: data.displayName,
      invitedBy: data.invitedBy || null,
      createdAt: data.createdAt?.toDate?.() || null,
      lastLoginAt: data.lastLoginAt?.toDate?.() || null
    }
  })

  return {
    success: true,
    users
  }
})
