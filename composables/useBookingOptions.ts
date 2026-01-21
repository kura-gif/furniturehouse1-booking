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
import type { BookingOption, SelectedBookingOption } from "~/types";

export const useBookingOptions = () => {
  const { $db } = useNuxtApp();
  const db = $db as ReturnType<
    typeof import("firebase/firestore").getFirestore
  >;

  /**
   * 有効なオプション一覧を取得
   */
  const getActiveOptions = async (): Promise<BookingOption[]> => {
    if (!db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection(db, "bookingOptions"),
        where("isActive", "==", true),
        orderBy("order", "asc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookingOption[];
    } catch (error) {
      console.error("オプション取得エラー:", error);
      throw new Error("オプションの取得に失敗しました");
    }
  };

  /**
   * 全オプション一覧を取得（管理用）
   */
  const getAllOptions = async (): Promise<BookingOption[]> => {
    if (!db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection(db, "bookingOptions"),
        orderBy("order", "asc"),
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BookingOption[];
    } catch (error) {
      console.error("オプション取得エラー:", error);
      throw new Error("オプションの取得に失敗しました");
    }
  };

  /**
   * オプションを作成
   */
  const createOption = async (
    option: Omit<BookingOption, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> => {
    if (!db) throw new Error("Firestore is not initialized");

    try {
      const docRef = await addDoc(collection(db, "bookingOptions"), {
        ...option,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("オプション作成エラー:", error);
      throw new Error("オプションの作成に失敗しました");
    }
  };

  /**
   * オプションを更新
   */
  const updateOption = async (
    optionId: string,
    updates: Partial<Omit<BookingOption, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void> => {
    if (!db) throw new Error("Firestore is not initialized");

    try {
      const docRef = doc(db, "bookingOptions", optionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("オプション更新エラー:", error);
      throw new Error("オプションの更新に失敗しました");
    }
  };

  /**
   * オプションを削除
   */
  const deleteOption = async (optionId: string): Promise<void> => {
    if (!db) throw new Error("Firestore is not initialized");

    try {
      await deleteDoc(doc(db, "bookingOptions", optionId));
    } catch (error) {
      console.error("オプション削除エラー:", error);
      throw new Error("オプションの削除に失敗しました");
    }
  };

  /**
   * 指定日のオプション予約状況を確認
   * @param optionId オプションID
   * @param date 対象日
   * @returns 予約済み数
   */
  const getOptionBookingCount = async (
    optionId: string,
    date: Date,
  ): Promise<number> => {
    if (!db) throw new Error("Firestore is not initialized");

    try {
      // 日付の開始と終了を取得
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // 指定日にチェックインする確定済み予約を検索
      const q = query(
        collection(db, "bookings"),
        where("status", "in", ["confirmed", "pending", "pending_review"]),
        where("checkInDate", ">=", Timestamp.fromDate(startOfDay)),
        where("checkInDate", "<=", Timestamp.fromDate(endOfDay)),
      );

      const querySnapshot = await getDocs(q);
      let count = 0;

      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        const selectedOptions =
          (booking.selectedOptions as SelectedBookingOption[]) || [];
        if (selectedOptions.some((opt) => opt.optionId === optionId)) {
          count++;
        }
      });

      return count;
    } catch (error) {
      console.error("オプション予約状況確認エラー:", error);
      return 0;
    }
  };

  /**
   * オプションが指定日に予約可能かチェック
   */
  const isOptionAvailable = async (
    optionId: string,
    date: Date,
  ): Promise<boolean> => {
    if (!db) throw new Error("Firestore is not initialized");

    try {
      // オプション情報を取得
      const optionDoc = await getDoc(doc(db, "bookingOptions", optionId));
      if (!optionDoc.exists()) return false;

      const option = optionDoc.data() as BookingOption;
      if (!option.isActive) return false;

      // 予約数を確認
      const bookingCount = await getOptionBookingCount(optionId, date);
      return bookingCount < option.dailyLimit;
    } catch (error) {
      console.error("オプション可用性確認エラー:", error);
      return false;
    }
  };

  /**
   * 複数のオプションの可用性を一括チェック
   */
  const checkOptionsAvailability = async (
    optionIds: string[],
    date: Date,
  ): Promise<Record<string, boolean>> => {
    const results: Record<string, boolean> = {};

    await Promise.all(
      optionIds.map(async (optionId) => {
        results[optionId] = await isOptionAvailable(optionId, date);
      }),
    );

    return results;
  };

  return {
    getActiveOptions,
    getAllOptions,
    createOption,
    updateOption,
    deleteOption,
    getOptionBookingCount,
    isOptionAvailable,
    checkOptionsAvailability,
  };
};
