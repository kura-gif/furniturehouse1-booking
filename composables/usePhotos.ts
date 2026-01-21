import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import type { Photo } from "~/config/photos";

export const usePhotos = () => {
  const { $db } = useNuxtApp();

  // 全写真を取得
  const getAllPhotos = async (): Promise<Photo[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "photos"),
        orderBy("category", "asc"),
        orderBy("order", "asc"),
      );
      const querySnapshot = await getDocs(q);

      const photos: Photo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        photos.push({
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate(),
        } as Photo);
      });

      return photos;
    } catch (error) {
      console.error("Get photos error:", error);
      throw new Error("写真の取得に失敗しました");
    }
  };

  // 公開中の写真のみ取得
  const getVisiblePhotos = async (): Promise<Photo[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(
        collection($db, "photos"),
        where("isVisible", "==", true),
        orderBy("category", "asc"),
        orderBy("order", "asc"),
      );
      const querySnapshot = await getDocs(q);

      const photos: Photo[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        photos.push({
          id: doc.id,
          ...data,
          uploadedAt: data.uploadedAt?.toDate(),
        } as Photo);
      });

      return photos;
    } catch (error) {
      console.error("Get visible photos error:", error);
      throw new Error("公開中の写真の取得に失敗しました");
    }
  };

  // 写真を追加
  const createPhoto = async (photoData: Omit<Photo, "id">): Promise<string> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const docRef = await addDoc(collection($db, "photos"), {
        ...photoData,
        uploadedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Create photo error:", error);
      throw new Error("写真の追加に失敗しました");
    }
  };

  // 写真を更新
  const updatePhoto = async (
    photoId: string,
    photoData: Partial<Photo>,
  ): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const photoRef = doc($db, "photos", photoId);
      await updateDoc(photoRef, photoData);
    } catch (error) {
      console.error("Update photo error:", error);
      throw new Error("写真の更新に失敗しました");
    }
  };

  // 写真を削除
  const deletePhoto = async (photoId: string): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      // Firestoreから削除
      const photoRef = doc($db, "photos", photoId);
      await deleteDoc(photoRef);
    } catch (error) {
      console.error("Delete photo error:", error);
      throw new Error("写真の削除に失敗しました");
    }
  };

  // 写真の公開状態を切り替え
  const togglePhotoVisibility = async (
    photoId: string,
    isVisible: boolean,
  ): Promise<void> => {
    await updatePhoto(photoId, { isVisible });
  };

  // 写真の順序を更新
  const updatePhotoOrder = async (
    photoId: string,
    order: number,
  ): Promise<void> => {
    await updatePhoto(photoId, { order });
  };

  return {
    getAllPhotos,
    getVisiblePhotos,
    createPhoto,
    updatePhoto,
    deletePhoto,
    togglePhotoVisibility,
    updatePhotoOrder,
  };
};
