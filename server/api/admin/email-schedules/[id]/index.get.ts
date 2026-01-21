import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";

/**
 * メールスケジュール取得API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event);

  const scheduleId = getRouterParam(event, "id");
  if (!scheduleId) {
    throw createError({
      statusCode: 400,
      message: "スケジュールIDが必要です",
    });
  }

  const db = getFirestoreAdmin();
  const scheduleDoc = await db
    .collection("emailSchedules")
    .doc(scheduleId)
    .get();

  if (!scheduleDoc.exists) {
    throw createError({
      statusCode: 404,
      message: "スケジュールが見つかりません",
    });
  }

  const data = scheduleDoc.data();
  return {
    success: true,
    schedule: {
      id: scheduleDoc.id,
      name: data?.name,
      description: data?.description,
      templateId: data?.templateId,
      daysBeforeCheckIn: data?.daysBeforeCheckIn,
      relativeToCheckOut: data?.relativeToCheckOut,
      sendTime: data?.sendTime,
      enabled: data?.enabled,
      targetStatuses: data?.targetStatuses || [],
      createdAt: data?.createdAt?.toDate?.() || null,
      updatedAt: data?.updatedAt?.toDate?.() || null,
      createdBy: data?.createdBy,
    },
  };
});
