import { FieldValue } from 'firebase-admin/firestore'
import { getFirestoreAdmin } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/auth'

/**
 * 管理者招待取り消しAPI
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event)

  const invitationId = getRouterParam(event, 'id')
  if (!invitationId) {
    throw createError({
      statusCode: 400,
      message: '招待IDが必要です'
    })
  }

  const db = getFirestoreAdmin()

  // 招待を取得
  const invitationDoc = await db.collection('adminInvitations').doc(invitationId).get()

  if (!invitationDoc.exists) {
    throw createError({
      statusCode: 404,
      message: '招待が見つかりません'
    })
  }

  const invitation = invitationDoc.data()

  // pending状態のみ取り消し可能
  if (invitation?.status !== 'pending') {
    throw createError({
      statusCode: 400,
      message: 'この招待は取り消しできません'
    })
  }

  // ステータスを expired に更新（完全削除はしない）
  await invitationDoc.ref.update({
    status: 'expired',
    updatedAt: FieldValue.serverTimestamp()
  })

  return {
    success: true,
    message: '招待を取り消しました'
  }
})
