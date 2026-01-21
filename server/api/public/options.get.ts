/**
 * 公開用オプション一覧取得API
 * GET /api/public/options
 */

export default defineEventHandler(async (event) => {
  try {
    const db = getFirestoreAdmin();

    // インデックス不要: 全件取得してフィルタリング・ソート
    const snapshot = await db.collection("bookingOptions").get();

    const options = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          dailyLimit: data.dailyLimit,
          isActive: data.isActive,
          order: data.order || 0,
        };
      })
      .filter((opt) => opt.isActive === true)
      .sort((a, b) => a.order - b.order)
      .map(({ isActive, order, ...rest }) => rest); // 内部フィールドを除外

    return {
      success: true,
      options,
    };
  } catch (error: unknown) {
    console.error("オプション取得エラー:", error);
    throw createError({
      statusCode: 500,
      message: "オプションの取得に失敗しました",
    });
  }
});
