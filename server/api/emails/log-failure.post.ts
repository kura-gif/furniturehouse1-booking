/**
 * メール送信失敗をログに記録するAPI
 * POST /api/emails/log-failure
 */

import { FieldValue } from "firebase-admin/firestore";
import { getFirestoreAdmin } from "~/server/utils/firebase-admin";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { emailType, recipient, errorMessage, metadata } = body;

    if (!emailType) {
      throw createError({
        statusCode: 400,
        message: "emailTypeは必須です",
      });
    }

    const db = getFirestoreAdmin();

    await db.collection("emailFailures").add({
      emailType,
      recipient: recipient || null,
      errorMessage: errorMessage || "Unknown error",
      metadata: metadata || {},
      resolved: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error("メール失敗ログ記録エラー:", error);
    // ログ記録自体が失敗しても、元の処理は続行させる
    return { success: false };
  }
});
