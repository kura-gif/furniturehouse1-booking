import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";

/**
 * メールスケジュール一覧取得API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event);

  const db = getFirestoreAdmin();

  // スケジュール一覧を取得
  const schedulesSnapshot = await db
    .collection("emailSchedules")
    .orderBy("createdAt", "desc")
    .get();

  const schedules = schedulesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      templateId: data.templateId,
      daysBeforeCheckIn: data.daysBeforeCheckIn,
      relativeToCheckOut: data.relativeToCheckOut,
      sendTime: data.sendTime,
      enabled: data.enabled,
      targetStatuses: data.targetStatuses || [],
      createdAt: data.createdAt?.toDate?.() || null,
      updatedAt: data.updatedAt?.toDate?.() || null,
      createdBy: data.createdBy,
    };
  });

  return {
    success: true,
    schedules,
  };
});
