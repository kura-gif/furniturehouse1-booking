import { getFirestoreAdmin, getAuthAdmin } from "~/server/utils/firebase-admin";

/**
 * 現在のユーザー情報を取得するAPI
 * Firebase Auth トークンからユーザー情報を取得
 * usersコレクションにない場合はsupportersコレクションも検索
 */
export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, "authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized - No token provided",
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    console.log("[API /auth/user] Verifying token...");
    const auth = getAuthAdmin();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    console.log("[API /auth/user] Token verified, uid:", uid);

    const db = getFirestoreAdmin();
    console.log("[API /auth/user] Fetching user document...");
    const userDoc = await db.collection("users").doc(uid).get();
    console.log("[API /auth/user] User doc exists:", userDoc.exists);

    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log("[API /auth/user] User role:", userData?.role);
      return {
        success: true,
        user: {
          id: userDoc.id,
          uid: uid,
          email: userData?.email,
          displayName: userData?.displayName,
          role: userData?.role,
          createdAt: userData?.createdAt?.toDate?.() || null,
          updatedAt: userData?.updatedAt?.toDate?.() || null,
        },
      };
    }

    // usersコレクションにない場合、supportersコレクションを検索
    console.log(
      "[API /auth/user] User not found in users collection, checking supporters...",
    );
    const supportersSnapshot = await db
      .collection("supporters")
      .where("uid", "==", uid)
      .limit(1)
      .get();

    if (!supportersSnapshot.empty) {
      const supporterDoc = supportersSnapshot.docs[0];
      const supporterData = supporterDoc.data();
      console.log("[API /auth/user] Found supporter:", supporterData?.name);
      return {
        success: true,
        user: {
          id: supporterDoc.id,
          uid: uid,
          email: supporterData?.email,
          displayName: supporterData?.name || supporterData?.displayName,
          role: "supporter",
          hourlyRate: supporterData?.hourlyRate,
          transportationFee: supporterData?.transportationFee,
          isActive: supporterData?.isActive,
          createdAt: supporterData?.createdAt?.toDate?.() || null,
          updatedAt: supporterData?.updatedAt?.toDate?.() || null,
        },
      };
    }

    console.log("[API /auth/user] User not found in any collection");
    return {
      success: false,
      error: "User not found",
      user: null,
    };
  } catch (error: unknown) {
    console.error("[API /auth/user] Error:", error);
    throw createError({
      statusCode: 401,
      message: "認証に失敗しました",
    });
  }
});
