import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import type { GuestMessage } from "~/types";

export const useMessaging = () => {
  const { $db } = useNuxtApp();

  // ========================================
  // ゲストメッセージ管理
  // ========================================

  /**
   * 予約のメッセージ一覧を取得
   */
  const getMessages = async (bookingId: string): Promise<GuestMessage[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "guestMessages"),
        where("bookingId", "==", bookingId),
        orderBy("createdAt", "asc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GuestMessage[];
    } catch (error) {
      console.error("Get messages error:", error);
      throw new Error("メッセージの取得に失敗しました");
    }
  };

  /**
   * メッセージをリアルタイムで監視
   */
  const subscribeToMessages = (
    bookingId: string,
    callback: (messages: GuestMessage[]) => void,
  ) => {
    if (!$db) throw new Error("Firestore is not initialized");

    const q = query(
      collection($db, "guestMessages"),
      where("bookingId", "==", bookingId),
      orderBy("createdAt", "asc"),
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as GuestMessage[];
      callback(messages);
    });
  };

  /**
   * メッセージを送信
   */
  const sendMessage = async (
    bookingId: string,
    senderId: string,
    senderType: "admin" | "guest",
    senderName: string,
    message: string,
  ): Promise<string> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const messageData: Omit<GuestMessage, "id"> = {
        bookingId,
        senderId,
        senderType,
        senderName,
        message,
        isRead: false,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection($db, "guestMessages"),
        messageData,
      );
      return docRef.id;
    } catch (error) {
      console.error("Send message error:", error);
      throw new Error("メッセージの送信に失敗しました");
    }
  };

  /**
   * メッセージを既読にする
   */
  const markMessageAsRead = async (messageId: string): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const docRef = doc($db, "guestMessages", messageId);
      await updateDoc(docRef, { isRead: true });
    } catch (error) {
      console.error("Mark message as read error:", error);
      throw new Error("メッセージの既読更新に失敗しました");
    }
  };

  /**
   * 予約の未読メッセージをすべて既読にする
   */
  const markAllMessagesAsRead = async (
    bookingId: string,
    currentUserId: string,
  ): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      // 自分以外が送信した未読メッセージを取得
      const q = query(
        collection($db, "guestMessages"),
        where("bookingId", "==", bookingId),
        where("senderId", "!=", currentUserId),
        where("isRead", "==", false),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) return;

      // バッチで一括更新
      const batch = writeBatch($db);
      querySnapshot.docs.forEach((document) => {
        batch.update(document.ref, { isRead: true });
      });

      await batch.commit();
    } catch (error) {
      console.error("Mark all messages as read error:", error);
      throw new Error("メッセージの一括既読更新に失敗しました");
    }
  };

  /**
   * 予約の未読メッセージ数を取得
   */
  const getUnreadCount = async (
    bookingId: string,
    currentUserId: string,
  ): Promise<number> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "guestMessages"),
        where("bookingId", "==", bookingId),
        where("senderId", "!=", currentUserId),
        where("isRead", "==", false),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Get unread count error:", error);
      return 0;
    }
  };

  /**
   * 管理者の全未読メッセージ数を取得
   */
  const getAdminUnreadCount = async (): Promise<number> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "guestMessages"),
        where("senderType", "==", "guest"),
        where("isRead", "==", false),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Get admin unread count error:", error);
      return 0;
    }
  };

  return {
    getMessages,
    subscribeToMessages,
    sendMessage,
    markMessageAsRead,
    markAllMessagesAsRead,
    getUnreadCount,
    getAdminUnreadCount,
  };
};
