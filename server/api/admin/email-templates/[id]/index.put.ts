import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";

/**
 * メールテンプレート更新API
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

  const body = await readBody(event);
  const { name, type, subject, bodyHtml, variables } = body;

  // 入力検証
  if (!name || !type || !subject || !bodyHtml) {
    throw createError({
      statusCode: 400,
      message: "必須項目が不足しています",
    });
  }

  // typeの検証
  const validTypes = [
    "booking_confirmation",
    "checkin_reminder",
    "checkout_thanks",
    "custom",
  ];
  if (!validTypes.includes(type)) {
    throw createError({
      statusCode: 400,
      message: "無効なテンプレートタイプです",
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

  // テンプレートを更新
  await templateDoc.ref.update({
    name,
    type,
    subject,
    bodyHtml,
    variables: variables || [],
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    message: "テンプレートを更新しました",
  };
});
