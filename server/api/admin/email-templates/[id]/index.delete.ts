import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";

/**
 * メールテンプレート削除API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event);

  const templateId = getRouterParam(event, "id");
  if (!templateId) {
    throw createError({
      statusCode: 400,
      message: "テンプレートIDが必要です",
    });
  }

  const db = getFirestoreAdmin();

  // テンプレートの存在確認
  const templateDoc = await db
    .collection("emailTemplates")
    .doc(templateId)
    .get();
  if (!templateDoc.exists) {
    throw createError({
      statusCode: 404,
      message: "テンプレートが見つかりません",
    });
  }

  // このテンプレートを使用しているスケジュールがあるかチェック
  const schedulesSnapshot = await db
    .collection("emailSchedules")
    .where("templateId", "==", templateId)
    .limit(1)
    .get();

  if (!schedulesSnapshot.empty) {
    throw createError({
      statusCode: 400,
      message: "このテンプレートは使用中のため削除できません",
    });
  }

  // テンプレートを削除
  await templateDoc.ref.delete();

  return {
    success: true,
    message: "テンプレートを削除しました",
  };
});
