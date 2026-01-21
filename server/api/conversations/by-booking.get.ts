import { Timestamp } from "firebase-admin/firestore";
import { getFirestoreAdmin, getAuthAdmin } from "~/server/utils/firebase-admin";

export default defineEventHandler(async (event) => {
  try {
    // 認証チェック
    const authHeader = getHeader(event, "authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw createError({
        statusCode: 401,
        statusMessage: "認証が必要です",
      });
    }

    const idToken = authHeader.substring(7);
    const auth = getAuthAdmin();

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch {
      throw createError({
        statusCode: 401,
        statusMessage: "無効なトークンです",
      });
    }

    const userEmail = decodedToken.email;
    const userId = decodedToken.uid;

    // クエリパラメータから予約IDを取得
    const query = getQuery(event);
    const bookingId = query.bookingId as string;

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        statusMessage: "予約IDが必要です",
      });
    }

    const db = getFirestoreAdmin();

    // 予約情報を取得してアクセス権を確認
    const bookingDoc = await db.collection("bookings").doc(bookingId).get();
    if (!bookingDoc.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: "予約が見つかりません",
      });
    }

    const bookingData = bookingDoc.data()!;

    // アクセス権の確認（userIdまたはguestEmailで照合）
    if (bookingData.userId !== userId && bookingData.guestEmail !== userEmail) {
      throw createError({
        statusCode: 403,
        statusMessage: "この予約へのアクセス権がありません",
      });
    }

    // 会話を検索
    const conversationsQuery = await db
      .collection("conversations")
      .where("bookingId", "==", bookingId)
      .limit(1)
      .get();

    if (!conversationsQuery.empty) {
      const conversationDoc = conversationsQuery.docs[0];
      return {
        success: true,
        conversation: {
          id: conversationDoc.id,
          ...conversationDoc.data(),
        },
        booking: {
          id: bookingDoc.id,
          ...bookingData,
        },
      };
    }

    // 会話が存在しない場合は新規作成
    const now = Timestamp.now();
    const newConversation = {
      bookingId,
      bookingReference: bookingData.bookingReference,
      guestName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      guestUserId: userId || null,
      status: "open",
      lastMessageAt: now,
      lastMessagePreview: "",
      unreadByAdmin: 0,
      unreadByGuest: 0,
      createdAt: now,
      updatedAt: now,
    };

    const newConversationRef = await db
      .collection("conversations")
      .add(newConversation);

    return {
      success: true,
      conversation: {
        id: newConversationRef.id,
        ...newConversation,
      },
      booking: {
        id: bookingDoc.id,
        ...bookingData,
      },
    };
  } catch (error: unknown) {
    console.error("会話取得エラー:", error);

    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage:
        error instanceof Error ? error.message : "会話の取得に失敗しました",
    });
  }
});
