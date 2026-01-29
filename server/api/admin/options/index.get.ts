/**
 * オプション一覧取得API
 * GET /api/admin/options
 */

import { requireAdmin } from "~/server/utils/auth";

export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event);

  try {
    const db = getFirestoreAdmin();

    const snapshot = await db
      .collection("bookingOptions")
      .orderBy("order", "asc")
      .get();

    const options = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
