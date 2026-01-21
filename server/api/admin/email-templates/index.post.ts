import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";

/**
 * メールテンプレート作成API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  const admin = await requireAdmin(event);

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

  // テンプレートを作成
  const templateRef = db.collection("emailTemplates").doc();
  await templateRef.set({
    name,
    type,
    subject,
    bodyHtml,
    variables: variables || [],
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    createdBy: admin.uid,
  });

  return {
    success: true,
    templateId: templateRef.id,
    message: "テンプレートを作成しました",
  };
});
