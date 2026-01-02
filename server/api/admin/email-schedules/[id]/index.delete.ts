import { getFirestoreAdmin } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/auth'

/**
 * メールスケジュール削除API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event)

  const scheduleId = getRouterParam(event, 'id')
  if (!scheduleId) {
    throw createError({
      statusCode: 400,
      message: 'スケジュールIDが必要です'
    })
  }

  const db = getFirestoreAdmin()

  // スケジュールの存在確認
  const scheduleDoc = await db.collection('emailSchedules').doc(scheduleId).get()
  if (!scheduleDoc.exists) {
    throw createError({
      statusCode: 404,
      message: 'スケジュールが見つかりません'
    })
  }

  // スケジュールを削除
  await scheduleDoc.ref.delete()

  return {
    success: true,
    message: 'スケジュールを削除しました'
  }
})
