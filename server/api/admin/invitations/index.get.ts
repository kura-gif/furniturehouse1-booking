import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";

/**
 * 管理者招待一覧取得API
 */
export default defineEventHandler(async (event) => {
  // 管理者認証チェック
  await requireAdmin(event);

  const db = getFirestoreAdmin();

  // 招待一覧を取得（最新順）
  const invitationsSnapshot = await db
    .collection("adminInvitations")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const invitations = invitationsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      status: data.status,
      invitedBy: data.invitedBy,
      invitedByName: data.invitedByName,
      createdAt: data.createdAt?.toDate?.() || null,
      expiresAt: data.expiresAt?.toDate?.() || null,
      acceptedAt: data.acceptedAt?.toDate?.() || null,
    };
  });

  return {
    success: true,
    invitations,
  };
});
