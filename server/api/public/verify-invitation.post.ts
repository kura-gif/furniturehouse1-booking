import { getFirestoreAdmin } from '~/server/utils/firebase-admin'

/**
 * 招待トークン検証API（公開エンドポイント）
 *
 * 認証不要で招待の有効性を確認する
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token } = body

  if (!token || typeof token !== 'string') {
    throw createError({
      statusCode: 400,
      message: 'トークンが必要です'
    })
  }

  try {
    const db = getFirestoreAdmin()

    // トークンで招待を検索
    const invitationsSnapshot = await db
      .collection('adminInvitations')
      .where('token', '==', token)
      .where('status', '==', 'pending')
      .limit(1)
      .get()

    if (invitationsSnapshot.empty) {
      return {
        valid: false,
        error: '招待が見つからないか、既に使用されています'
      }
    }

    const invitationDoc = invitationsSnapshot.docs[0]
    const invitationData = invitationDoc.data()

    // 有効期限チェック
    const expiresAt = invitationData.expiresAt
    const expiryDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt)

    if (expiryDate < new Date()) {
      // 期限切れの場合、ステータスを更新
      await invitationDoc.ref.update({
        status: 'expired'
      })

      return {
        valid: false,
        error: '招待の有効期限が切れています'
      }
    }

    // 招待情報を返す
    return {
      valid: true,
      invitation: {
        id: invitationDoc.id,
        email: invitationData.email,
        invitedBy: invitationData.invitedBy,
        invitedByName: invitationData.invitedByName,
        createdAt: invitationData.createdAt,
        expiresAt: invitationData.expiresAt
      }
    }
  } catch (error: unknown) {
    console.error('招待検証エラー:', error)
    throw createError({
      statusCode: 500,
      message: '招待の検証に失敗しました',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
