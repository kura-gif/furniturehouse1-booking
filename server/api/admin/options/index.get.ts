/**
 * オプション一覧取得API
 * GET /api/admin/options
 */

export default defineEventHandler(async (event) => {
  try {
    const db = getFirestoreAdmin()

    const snapshot = await db
      .collection('bookingOptions')
      .orderBy('order', 'asc')
      .get()

    const options = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return {
      success: true,
      options
    }
  } catch (error: unknown) {
    console.error('オプション取得エラー:', error)
    throw createError({
      statusCode: 500,
      message: 'オプションの取得に失敗しました'
    })
  }
})
