/**
 * オプション削除API
 * DELETE /api/admin/options/:id
 */

export default defineEventHandler(async (event) => {
  try {
    const optionId = getRouterParam(event, 'id')
    if (!optionId) {
      throw createError({
        statusCode: 400,
        message: 'オプションIDが必要です'
      })
    }

    const db = getFirestoreAdmin()

    // オプションの存在確認
    const optionRef = db.collection('bookingOptions').doc(optionId)
    const optionDoc = await optionRef.get()

    if (!optionDoc.exists) {
      throw createError({
        statusCode: 404,
        message: 'オプションが見つかりません'
      })
    }

    await optionRef.delete()

    return {
      success: true,
      message: 'オプションを削除しました'
    }
  } catch (error: any) {
    console.error('オプション削除エラー:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'オプションの削除に失敗しました'
    })
  }
})
