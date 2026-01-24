import { getAuth } from "firebase-admin/auth";
import { Timestamp } from "firebase-admin/firestore";
import {
  getFirestoreAdmin,
  initializeFirebaseAdmin,
} from "~/server/utils/firebase-admin";
import { requireAdmin } from "~/server/utils/auth";
import { requireValidPassword } from "~/server/utils/validation";

/**
 * サポーターを作成するAPI（管理者専用）
 * Firebase Admin SDKを使用してユーザーを作成するため、現在のセッションに影響しない
 */
export default defineEventHandler(async (event) => {
  // 管理者権限チェック
  await requireAdmin(event);

  const body = await readBody(event);
  const {
    email,
    password,
    displayName,
    phone,
    hourlyRate,
    transportationFee,
    isActive,
  } = body;

  // バリデーション
  if (!email || !password || !displayName) {
    throw createError({
      statusCode: 400,
      statusMessage: "メールアドレス、パスワード、氏名は必須です",
    });
  }

  // パスワード強度チェック
  requireValidPassword(password);

  try {
    // Firebase Admin SDKが初期化されていることを確認
    initializeFirebaseAdmin();
    const auth = getAuth();
    const db = getFirestoreAdmin();

    // 1. Firebase Authenticationでユーザーを作成
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    console.log("✅ サポーターアカウント作成:", userRecord.uid);

    // 2. usersコレクションにユーザー情報を保存（ドキュメントIDをuidに設定）
    await db
      .collection("users")
      .doc(userRecord.uid)
      .set({
        email,
        displayName,
        phone: phone || "",
        role: "supporter",
        isActive: isActive !== false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

    console.log("✅ ユーザー情報をFirestoreに保存:", userRecord.uid);

    // 3. supportersコレクションにサポーター固有情報を保存
    const supporterDoc = await db.collection("supporters").add({
      uid: userRecord.uid,
      userId: userRecord.uid,
      email,
      name: displayName,
      phone: phone || "",
      hourlyRate: hourlyRate || 1500,
      transportationFee: transportationFee || 500,
      isActive: isActive !== false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    console.log("✅ サポーター情報をFirestoreに保存:", supporterDoc.id);

    return {
      success: true,
      userId: userRecord.uid,
      userDocId: userRecord.uid,
      supporterDocId: supporterDoc.id,
    };
  } catch (error: unknown) {
    console.error("❌ サポーター作成エラー:", error);

    const firebaseError = error as { code?: string };

    // Firebase Authエラーのハンドリング
    if (firebaseError.code === "auth/email-already-exists") {
      throw createError({
        statusCode: 400,
        statusMessage: "このメールアドレスは既に使用されています",
      });
    }

    if (firebaseError.code === "auth/invalid-email") {
      throw createError({
        statusCode: 400,
        statusMessage: "メールアドレスの形式が正しくありません",
      });
    }

    if (firebaseError.code === "auth/weak-password") {
      throw createError({
        statusCode: 400,
        statusMessage: "パスワードが弱すぎます",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        "サポーターの作成に失敗しました: " +
        (error instanceof Error ? error.message : "Unknown error"),
    });
  }
});
