/**
 * 公開用オプション一覧取得API
 * GET /api/public/options
 */

export default defineEventHandler(async (event) => {
  try {
    const db = getFirestoreAdmin()

    const snapshot = await db
      .collection('bookingOptions')
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get()

    const options = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        dailyLimit: data.dailyLimit
      }
    })

    return {
      success: true,
      options
    }
  } catch (error: any) {
    console.error('オプション取得エラー:', error)
    throw createError({
      statusCode: 500,
      message: 'オプションの取得に失敗しました'
    })
  }
})
