/**
 * 公開用オプション一覧取得API
 * GET /api/public/options
 */

export default defineEventHandler(async (event) => {
  try {
    console.log("🔍 options.get: Starting...");
    let db;
    try {
      db = getFirestoreAdmin();
      console.log("✅ options.get: Firestore initialized");
    } catch (firestoreError) {
      console.error("❌ options.get: Firestore initialization failed:", firestoreError);
      throw firestoreError;
    }

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
    console.error("❌ options.get error:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw createError({
      statusCode: 500,
      message: "オプションの取得に失敗しました",
    });
  }
});
