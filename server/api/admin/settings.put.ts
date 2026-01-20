import { getFirestoreAdmin, getAuthAdmin } from '~/server/utils/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

/**
 * 施設設定を保存するAPI
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

    // ユーザーが管理者かチェック
    const db = getFirestoreAdmin()
    const userDoc = await db.collection('users').doc(uid).get()

    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: 'Forbidden - Admin access required'
      })
    }

    // リクエストボディを取得
    const body = await readBody(event)

    if (!body) {
      throw createError({
        statusCode: 400,
        message: 'Bad Request - No settings data provided'
      })
    }

    // 設定を保存
    await db.collection('settings').doc('facility').set({
      ...body,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: uid
    }, { merge: true })

    return {
      success: true,
      message: '設定を保存しました'
    }
  } catch (error: unknown) {
    console.error('[API /admin/settings] Error:', error instanceof Error ? error.message : 'Unknown error')
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    // 内部エラーは詳細を漏洩させない
    throw createError({
      statusCode: 500,
      message: '設定の保存に失敗しました'
    })
  }
})
