import { getAuth } from "firebase-admin/auth";
import { getFirestoreAdmin } from "~/server/utils/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { requireValidPassword } from "~/server/utils/validation";

/**
 * 初回管理者セットアップAPI（公開エンドポイント）
 *
 * セキュリティ:
 * - 管理者が1人も存在しない場合のみ実行可能
 * - 既に管理者が存在する場合は403エラー
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, displayName } = body;

  // バリデーション
  if (!email || typeof email !== "string" || !email.trim()) {
    throw createError({
      statusCode: 400,
      message: "メールアドレスが必要です",
    });
  }

  if (!displayName || typeof displayName !== "string" || !displayName.trim()) {
    throw createError({
      statusCode: 400,
      message: "管理者名が必要です",
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

    // 既に管理者が存在するかチェック
    const adminSnapshot = await db
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    if (!adminSnapshot.empty) {
      throw createError({
        statusCode: 403,
        message: "既に管理者アカウントが存在します。このエンドポイントは初回セットアップ専用です。",
      });
    }

    // Firebase Auth でユーザーを作成
    const userRecord = await auth.createUser({
      email: email.trim(),
      password: password,
      displayName: displayName.trim(),
    });

    // Firestore にユーザードキュメントを作成（Admin SDKなのでセキュリティルールをバイパス）
    await db.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      uid: userRecord.uid,
      email: email.trim(),
      displayName: displayName.trim(),
      role: "admin",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    console.log("✅ 初回管理者アカウント作成成功:", userRecord.email);

    return {
      success: true,
      email: userRecord.email,
      displayName: displayName.trim(),
    };
  } catch (error: unknown) {
    console.error("❌ 管理者アカウント作成エラー:", error);

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
        error instanceof Error ? error.message : "管理者アカウント作成に失敗しました",
    });
  }
});
