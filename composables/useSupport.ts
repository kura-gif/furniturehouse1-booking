import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import type {
  Supporter,
  SupportTask,
  SupporterAvailability,
  SupportMessage,
  SupportDuration,
  SupportStatus,
} from "~/types";

export const useSupport = () => {
  const { $db } = useNuxtApp();

  // ========================================
  // サポーター管理
  // ========================================

  // サポーター一覧を取得
  const getAllSupporters = async (): Promise<Supporter[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(collection($db, "supporters"), orderBy("name", "asc"));

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Supporter[];
    } catch (error) {
      console.error("Get supporters error:", error);
      throw new Error("サポーター一覧の取得に失敗しました");
    }
  };

  // アクティブなサポーター一覧を取得
  const getActiveSupporters = async (): Promise<Supporter[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "supporters"),
        where("isActive", "==", true),
        orderBy("name", "asc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Supporter[];
    } catch (error) {
      console.error("Get active supporters error:", error);
      throw new Error("アクティブサポーターの取得に失敗しました");
    }
  };

  // サポーターを作成
  const createSupporter = async (
    supporterData: Omit<Supporter, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const supporter = {
        ...supporterData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection($db, "supporters"), supporter);
      return docRef.id;
    } catch (error) {
      console.error("Create supporter error:", error);
      throw new Error("サポーターの作成に失敗しました");
    }
  };

  // サポーター情報を更新
  const updateSupporter = async (
    supporterId: string,
    data: Partial<Supporter>,
  ): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const docRef = doc($db, "supporters", supporterId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Update supporter error:", error);
      throw new Error("サポーター情報の更新に失敗しました");
    }
  };

  // サポーターを削除
  const deleteSupporter = async (supporterId: string): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const docRef = doc($db, "supporters", supporterId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Delete supporter error:", error);
      throw new Error("サポーターの削除に失敗しました");
    }
  };

  // ========================================
  // 施設サポートタスク管理
  // ========================================

  // サポートタスク一覧を取得
  const getAllSupportTasks = async (): Promise<SupportTask[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "supportTasks"),
        orderBy("scheduledDate", "desc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupportTask[];
    } catch (error) {
      console.error("Get support tasks error:", error);
      throw new Error("サポートタスクの取得に失敗しました");
    }
  };

  // 予約IDからサポートタスクを取得
  const getSupportTaskByBookingId = async (
    bookingId: string,
  ): Promise<SupportTask | null> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "supportTasks"),
        where("bookingId", "==", bookingId),
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as SupportTask;
    } catch (error) {
      console.error("Get support task error:", error);
      throw new Error("サポートタスクの取得に失敗しました");
    }
  };

  // サポートタスクを作成
  const createSupportTask = async (
    taskData: Omit<SupportTask, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const task = {
        ...taskData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(collection($db, "supportTasks"), task);
      return docRef.id;
    } catch (error) {
      console.error("Create support task error:", error);
      throw new Error("サポートタスクの作成に失敗しました");
    }
  };

  // サポートタスクを更新
  const updateSupportTask = async (
    taskId: string,
    data: Partial<SupportTask>,
  ): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const docRef = doc($db, "supportTasks", taskId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Update support task error:", error);
      throw new Error("サポートタスクの更新に失敗しました");
    }
  };

  // サポーターをタスクに割り当て
  const assignSupporter = async (
    taskId: string,
    supporterId: string,
  ): Promise<void> => {
    await updateSupportTask(taskId, { supporterId, status: "scheduled" });
  };

  // タスクを完了にする
  const completeSupportTask = async (
    taskId: string,
    actualDuration: number,
  ): Promise<void> => {
    await updateSupportTask(taskId, {
      status: "completed",
      actualDuration,
      actualEndTime: Timestamp.now(),
    });
  };

  // ========================================
  // サポーターの利用可能スケジュール管理
  // ========================================

  // サポーターの利用可能スケジュールを取得
  const getSupporterAvailability = async (
    supporterId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<SupporterAvailability[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "supporterAvailability"),
        where("supporterId", "==", supporterId),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "asc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupporterAvailability[];
    } catch (error) {
      console.error("Get supporter availability error:", error);
      throw new Error("サポーター利用可能スケジュールの取得に失敗しました");
    }
  };

  // 利用可能スケジュールを登録/更新
  const setSupporterAvailability = async (
    supporterId: string,
    date: Date,
    isAvailable: boolean,
    timeSlots?: { start: string; end: string }[],
    notes?: string,
  ): Promise<string> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      // 既存のスケジュールを検索
      const dateTimestamp = Timestamp.fromDate(date);
      const q = query(
        collection($db, "supporterAvailability"),
        where("supporterId", "==", supporterId),
        where("date", "==", dateTimestamp),
      );

      const querySnapshot = await getDocs(q);

      const availabilityData = {
        supporterId,
        date: dateTimestamp,
        isAvailable,
        timeSlots,
        notes,
        updatedAt: Timestamp.now(),
      };

      if (!querySnapshot.empty) {
        // 既存のスケジュールを更新
        const docRef = doc(
          $db,
          "supporterAvailability",
          querySnapshot.docs[0].id,
        );
        await updateDoc(docRef, availabilityData);
        return querySnapshot.docs[0].id;
      } else {
        // 新規作成
        const docRef = await addDoc(collection($db, "supporterAvailability"), {
          ...availabilityData,
          createdAt: Timestamp.now(),
        });
        return docRef.id;
      }
    } catch (error) {
      console.error("Set supporter availability error:", error);
      throw new Error("利用可能スケジュールの登録に失敗しました");
    }
  };

  // ========================================
  // チャットメッセージ管理
  // ========================================

  // タスクのメッセージ一覧を取得
  const getSupportMessages = async (
    taskId: string,
  ): Promise<SupportMessage[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "supportMessages"),
        where("taskId", "==", taskId),
        orderBy("createdAt", "asc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as SupportMessage[];
    } catch (error) {
      console.error("Get support messages error:", error);
      throw new Error("メッセージの取得に失敗しました");
    }
  };

  // メッセージを送信
  const sendSupportMessage = async (
    taskId: string,
    senderId: string,
    senderType: "admin" | "supporter",
    senderName: string,
    message: string,
  ): Promise<string> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const messageData: Omit<SupportMessage, "id"> = {
        taskId,
        senderId,
        senderType,
        senderName,
        message,
        isRead: false,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(
        collection($db, "supportMessages"),
        messageData,
      );
      return docRef.id;
    } catch (error) {
      console.error("Send support message error:", error);
      throw new Error("メッセージの送信に失敗しました");
    }
  };

  // メッセージを既読にする
  const markMessageAsRead = async (messageId: string): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const docRef = doc($db, "supportMessages", messageId);
      await updateDoc(docRef, { isRead: true });
    } catch (error) {
      console.error("Mark message as read error:", error);
      throw new Error("メッセージの既読更新に失敗しました");
    }
  };

  // ========================================
  // 料金計算
  // ========================================

  // タスクの料金を計算
  const calculateTaskCost = (
    supporter: Supporter,
    actualDuration: number,
  ): {
    laborCost: number;
    transportationFee: number;
    totalCost: number;
  } => {
    const hours = actualDuration / 60;
    const laborCost = supporter.hourlyRate * hours;
    const transportationFee = supporter.transportationFee;

    return {
      laborCost: Math.round(laborCost),
      transportationFee,
      totalCost: Math.round(laborCost) + transportationFee,
    };
  };

  return {
    // サポーター管理
    getAllSupporters,
    getActiveSupporters,
    createSupporter,
    updateSupporter,
    deleteSupporter,

    // タスク管理
    getAllSupportTasks,
    getSupportTaskByBookingId,
    createSupportTask,
    updateSupportTask,
    assignSupporter,
    completeSupportTask,

    // スケジュール管理
    getSupporterAvailability,
    setSupporterAvailability,

    // チャット管理
    getSupportMessages,
    sendSupportMessage,
    markMessageAsRead,

    // 料金計算
    calculateTaskCost,
  };
};
