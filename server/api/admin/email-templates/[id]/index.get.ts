import { getFirestoreAdmin } from '~/server/utils/firebase-admin'
import { requireAdmin } from '~/server/utils/auth'

/**
 * メールテンプレート取得API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event)

  const templateId = getRouterParam(event, 'id')
  if (!templateId) {
    throw createError({
      statusCode: 400,
      message: 'テンプレートIDが必要です'
    })
  }

  const db = getFirestoreAdmin()
  const templateDoc = await db.collection('emailTemplates').doc(templateId).get()

  if (!templateDoc.exists) {
    throw createError({
      statusCode: 404,
      message: 'テンプレートが見つかりません'
    })
  }

  const data = templateDoc.data()
  return {
    success: true,
    template: {
      id: templateDoc.id,
      name: data?.name,
      type: data?.type,
      subject: data?.subject,
      bodyHtml: data?.bodyHtml,
      variables: data?.variables || [],
      createdAt: data?.createdAt?.toDate?.() || null,
      updatedAt: data?.updatedAt?.toDate?.() || null,
      createdBy: data?.createdBy
    }
  }
})
