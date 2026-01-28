import { getFirestoreAdmin } from "~/server/utils/firebase-admin";

/**
 * 管理者存在チェックAPI（公開エンドポイント）
 *
 * 初回セットアップ画面で管理者が既に存在するかをチェックするために使用
 * セキュリティ: 管理者の詳細情報は返さず、存在の有無のみを返す
 */
export default defineEventHandler(async () => {
  try {
    const db = getFirestoreAdmin();

    // 管理者が存在するかチェック
    const adminSnapshot = await db
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    return {
      exists: !adminSnapshot.empty,
    };
  } catch (error: unknown) {
    console.error("❌ 管理者チェックエラー:", error);

    // エラー時は安全側に倒して管理者存在とみなす
    return {
      exists: true,
    };
  }
});
