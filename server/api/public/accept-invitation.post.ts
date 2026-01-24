import { getAuth } from "firebase-admin/auth";
import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireValidPassword } from "~/server/utils/validation";

/**
 * 招待受け入れAPI（公開エンドポイント）
 *
 * 認証不要で招待を受け入れてアカウントを作成する
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { token, displayName, password } = body;

  // バリデーション
  if (!token || typeof token !== "string") {
    throw createError({
      statusCode: 400,
      message: "トークンが必要です",
    });
  }

  if (!displayName || typeof displayName !== "string" || !displayName.trim()) {
    throw createError({
      statusCode: 400,
      message: "表示名が必要です",
    });
  }

  if (!password || typeof password !== "string") {
    throw createError({
      statusCode: 400,
      message: "パスワードが必要です",
    });
  }

  // パスワード強度チェック
  requireValidPassword(password);

  try {
    const db = getFirestoreAdmin();
    const auth = getAuth();

    // トークンで招待を検索
    const invitationsSnapshot = await db
      .collection("adminInvitations")
      .where("token", "==", token)
      .where("status", "==", "pending")
      .limit(1)
      .get();

    if (invitationsSnapshot.empty) {
      throw createError({
        statusCode: 404,
        message: "招待が見つからないか、既に使用されています",
      });
    }

    const invitationDoc = invitationsSnapshot.docs[0];
    const invitationData = invitationDoc.data();

    // 有効期限チェック
    const expiresAt = invitationData.expiresAt;
    const expiryDate = expiresAt.toDate
      ? expiresAt.toDate()
      : new Date(expiresAt);

    if (expiryDate < new Date()) {
      await invitationDoc.ref.update({ status: "expired" });
      throw createError({
        statusCode: 400,
        message: "招待の有効期限が切れています",
      });
    }

    // Firebase Auth でユーザーを作成
    const userRecord = await auth.createUser({
      email: invitationData.email,
      password: password,
      displayName: displayName.trim(),
    });

    // Firestore にユーザードキュメントを作成
    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      uid: userRecord.uid,
      email: invitationData.email,
      displayName: displayName.trim(),
      role: "admin",
      invitedBy: invitationData.invitedBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp(),
    });

    // 招待ステータスを承認済みに更新
    await invitationDoc.ref.update({
      status: "accepted",
      acceptedAt: FieldValue.serverTimestamp(),
    });

    console.log("✅ 管理者アカウント作成成功:", userRecord.email);

    return {
      success: true,
      email: userRecord.email,
      displayName: displayName.trim(),
    };
  } catch (error: unknown) {
    console.error("❌ アカウント作成エラー:", error);

    const firebaseError = error as {
      code?: string;
      statusCode?: number;
      message?: string;
    };

    // Firebase エラーをユーザーフレンドリーなメッセージに変換
    if (firebaseError.code === "auth/email-already-exists") {
      throw createError({
        statusCode: 400,
        message: "このメールアドレスは既に使用されています",
      });
    }

    if (firebaseError.code === "auth/invalid-email") {
      throw createError({
        statusCode: 400,
        message: "無効なメールアドレスです",
      });
    }

    if (firebaseError.code === "auth/weak-password") {
      throw createError({
        statusCode: 400,
        message: "パスワードが弱すぎます",
      });
    }

    // その他のエラー
    throw createError({
      statusCode: firebaseError.statusCode || 500,
      message:
        error instanceof Error ? error.message : "アカウント作成に失敗しました",
    });
  }
});
