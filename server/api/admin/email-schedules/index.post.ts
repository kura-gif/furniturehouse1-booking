import { FieldValue } from 'firebase-admin/firestore'
import { getFirestoreAdmin } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/auth'

/**
 * メールスケジュール作成API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  const admin = await requireAdmin(event)

  const body = await readBody(event)
  const {
    name,
    description,
    templateId,
    daysBeforeCheckIn,
    relativeToCheckOut,
    sendTime,
    enabled,
    targetStatuses
  } = body

  // 入力検証
  if (!name || !templateId || daysBeforeCheckIn === undefined || !sendTime) {
    throw createError({
      statusCode: 400,
      message: '必須項目が不足しています'
    })
  }

  // daysBeforeCheckInの検証（0-30日）
  if (daysBeforeCheckIn < 0 || daysBeforeCheckIn > 30) {
    throw createError({
      statusCode: 400,
      message: 'チェックイン前日数は0〜30の範囲で指定してください'
    })
  }

  // sendTimeの形式検証（HH:mm）
  const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/
  if (!timeRegex.test(sendTime)) {
    throw createError({
      statusCode: 400,
      message: '送信時刻は HH:mm 形式で指定してください'
    })
  }

  const db = getFirestoreAdmin()

  // テンプレートの存在確認
  const templateDoc = await db.collection('emailTemplates').doc(templateId).get()
  if (!templateDoc.exists) {
    throw createError({
      statusCode: 404,
      message: '指定されたテンプレートが見つかりません'
    })
  }

  // スケジュールを作成
  const scheduleRef = db.collection('emailSchedules').doc()
  await scheduleRef.set({
    name,
    description: description || '',
    templateId,
    daysBeforeCheckIn,
    relativeToCheckOut: relativeToCheckOut || false,
    sendTime,
    enabled: enabled !== false, // デフォルトはtrue
    targetStatuses: targetStatuses || ['confirmed'],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: admin.uid
  })

  return {
    success: true,
    scheduleId: scheduleRef.id,
    message: 'スケジュールを作成しました'
  }
})
