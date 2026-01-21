/**
 * オプション削除API
 * DELETE /api/admin/options/:id
 */

export default defineEventHandler(async (event) => {
  try {
    const optionId = getRouterParam(event, "id");
    if (!optionId) {
      throw createError({
        statusCode: 400,
        message: "オプションIDが必要です",
      });
    }

    const db = getFirestoreAdmin();

    // オプションの存在確認
    const optionRef = db.collection("bookingOptions").doc(optionId);
    const optionDoc = await optionRef.get();

    if (!optionDoc.exists) {
      throw createError({
        statusCode: 404,
        message: "オプションが見つかりません",
      });
    }

    await optionRef.delete();

    return {
      success: true,
      message: "オプションを削除しました",
    };
  } catch (error: unknown) {
    console.error("オプション削除エラー:", error);
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    throw createError({
      statusCode,
      message:
        error instanceof Error
          ? error.message
          : "オプションの削除に失敗しました",
    });
  }
});
