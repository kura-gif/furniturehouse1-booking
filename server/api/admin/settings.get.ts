import { getFirestoreAdmin, getAuthAdmin } from '~/server/utils/firebase-admin'

/**
 * 施設設定を取得するAPI
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

    // 設定を取得
    const settingsDoc = await db.collection('settings').doc('facility').get()

    if (!settingsDoc.exists) {
      // デフォルト設定を返す
      return {
        success: true,
        settings: {
          checkInTime: '14:00',
          checkOutTime: '11:00',
          keyInfo: '',
          wifiPassword: '',
          parkingInfo: '',
          ownerPhone: '',
          plumbingPhone: '',
          electricPhone: '',
          locksmithPhone: '',
          houseRules: '',
          restaurants: '',
          attractions: '',
          convenience: ''
        }
      }
    }

    return {
      success: true,
      settings: settingsDoc.data()
    }
  } catch (error: any) {
    console.error('[API /admin/settings] Error:', error.message)
    if (error.statusCode) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: `Failed to get settings: ${error.message}`
    })
  }
})
