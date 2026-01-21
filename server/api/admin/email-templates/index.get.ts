import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";

/**
 * メールテンプレート一覧取得API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event);

  const db = getFirestoreAdmin();

  // テンプレート一覧を取得
  const templatesSnapshot = await db
    .collection("emailTemplates")
    .orderBy("createdAt", "desc")
    .get();

  const templates = templatesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      type: data.type,
      subject: data.subject,
      bodyHtml: data.bodyHtml,
      variables: data.variables || [],
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
      createdBy: data.createdBy,
    };
  });

  return {
    success: true,
    templates,
  };
});
