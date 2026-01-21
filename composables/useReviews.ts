import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  limit,
  updateDoc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import type { Review, CreateReviewRequest } from "~/types";

export const useReviews = () => {
  const { $db } = useNuxtApp();

  /**
   * レビューを作成（承認待ちステータスで投稿）
   */
  const createReview = async (
    reviewData: CreateReviewRequest,
  ): Promise<string> => {
    if (!$db) {
      throw new Error("データベースが初期化されていません");
    }

    const { user } = useAuth();

    if (!user.value) {
      throw new Error("ログインが必要です");
    }

    const reviewsRef = collection($db, "reviews");
    const docRef = await addDoc(reviewsRef, {
      bookingId: reviewData.bookingId || null,
      userId: user.value.uid,
      userName: user.value.displayName || "ゲスト",
      userEmail: user.value.email || "",
      rating: reviewData.rating,
      comment: reviewData.comment,
      stayType: reviewData.stayType,
      stayDate: reviewData.stayDate || null,
      status: "pending", // 承認待ち
      rejectionReason: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  };

  /**
   * 特定の予約に対するレビューを取得
   */
  const getReviewByBookingId = async (
    bookingId: string,
  ): Promise<Review | null> => {
    if (!$db) {
      throw new Error("データベースが初期化されていません");
    }

    const reviewsRef = collection($db, "reviews");
    const q = query(reviewsRef, where("bookingId", "==", bookingId), limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as Review;
  };

  /**
   * 承認済みのレビュー一覧を取得（公開表示用）
   */
  const getApprovedReviews = async (): Promise<Review[]> => {
    if (!$db) {
      throw new Error("データベースが初期化されていません");
    }

    const reviewsRef = collection($db, "reviews");
    const q = query(
      reviewsRef,
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  };

  /**
   * 全レビューを取得（管理者用）
   */
  const getAllReviews = async (): Promise<Review[]> => {
    if (!$db) {
      throw new Error("データベースが初期化されていません");
    }

    const reviewsRef = collection($db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  };

  /**
   * 承認待ちのレビューを取得（管理者用）
   */
  const getPendingReviews = async (): Promise<Review[]> => {
    if (!$db) {
      throw new Error("データベースが初期化されていません");
    }

    const reviewsRef = collection($db, "reviews");
    const q = query(
      reviewsRef,
      where("status", "==", "pending"),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Review[];
  };

  /**
   * レビューを承認する（管理者用）
   */
  const approveReview = async (reviewId: string): Promise<void> => {
    if (!$db) {
      throw new Error("データベースが初期化されていません");
    }

    const reviewRef = doc($db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      status: "approved",
      rejectionReason: null,
      updatedAt: serverTimestamp(),
    });
  };

  /**
   * レビューを却下する（管理者用）
   */
  const rejectReview = async (
    reviewId: string,
    reason?: string,
  ): Promise<void> => {
    if (!$db) {
      throw new Error("データベースが初期化されていません");
    }

    const reviewRef = doc($db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      status: "rejected",
      rejectionReason: reason || "",
      updatedAt: serverTimestamp(),
    });
  };

  /**
   * レビューに管理者が返信
   */
  const replyToReview = async (
    reviewId: string,
    reply: string,
  ): Promise<void> => {
    if (!$db) {
      throw new Error("データベースが初期化されていません");
    }

    const reviewRef = doc($db, "reviews", reviewId);
    await updateDoc(reviewRef, {
      adminReply: reply,
      adminRepliedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  /**
   * 平均評価を計算（承認済みレビューのみ）
   */
  const getAverageRating = async (): Promise<number> => {
    const reviews = await getApprovedReviews();
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // 小数点1桁まで
  };

  return {
    createReview,
    getReviewByBookingId,
    getApprovedReviews,
    getAllReviews,
    getPendingReviews,
    approveReview,
    rejectReview,
    replyToReview,
    getAverageRating,
  };
};
