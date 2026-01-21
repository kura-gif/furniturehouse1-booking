import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import type { InventoryItem, InventoryStatus } from "~/types";

export const useInventory = () => {
  const { $db } = useNuxtApp();

  // 在庫ステータスを計算
  const getInventoryStatus = (item: InventoryItem): InventoryStatus => {
    if (item.currentStock <= 0) {
      return "out_of_stock";
    } else if (item.currentStock <= item.reorderThreshold) {
      return "low";
    }
    return "sufficient";
  };

  // 全在庫アイテムを取得
  const getAllInventoryItems = async (): Promise<InventoryItem[]> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const q = query(collection($db, "inventory"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);

      const items: InventoryItem[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...docSnap.data(),
        } as InventoryItem);
      });

      return items;
    } catch (error) {
      console.error("Get inventory items error:", error);
      throw new Error("在庫アイテムの取得に失敗しました");
    }
  };

  // 在庫アイテムを追加
  const createInventoryItem = async (
    itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      // undefinedのフィールドを除去
      const cleanData: Record<string, unknown> = {
        name: itemData.name,
        currentStock: itemData.currentStock,
        unit: itemData.unit,
        reorderThreshold: itemData.reorderThreshold,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      if (itemData.purchaseUrl) {
        cleanData.purchaseUrl = itemData.purchaseUrl;
      }
      if (itemData.notes) {
        cleanData.notes = itemData.notes;
      }

      const docRef = await addDoc(collection($db, "inventory"), cleanData);
      return docRef.id;
    } catch (error) {
      console.error("Create inventory item error:", error);
      throw new Error("在庫アイテムの追加に失敗しました");
    }
  };

  // 在庫アイテムを更新
  const updateInventoryItem = async (
    itemId: string,
    itemData: Partial<Omit<InventoryItem, "id" | "createdAt" | "updatedAt">>,
  ): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      // undefinedのフィールドを除去
      const cleanData: Record<string, unknown> = {
        updatedAt: Timestamp.now(),
      };
      if (itemData.name !== undefined) cleanData.name = itemData.name;
      if (itemData.currentStock !== undefined)
        cleanData.currentStock = itemData.currentStock;
      if (itemData.unit !== undefined) cleanData.unit = itemData.unit;
      if (itemData.reorderThreshold !== undefined)
        cleanData.reorderThreshold = itemData.reorderThreshold;
      if (itemData.purchaseUrl !== undefined)
        cleanData.purchaseUrl = itemData.purchaseUrl;
      if (itemData.notes !== undefined) cleanData.notes = itemData.notes;

      const itemRef = doc($db, "inventory", itemId);
      await updateDoc(itemRef, cleanData);
    } catch (error) {
      console.error("Update inventory item error:", error);
      throw new Error("在庫アイテムの更新に失敗しました");
    }
  };

  // 在庫数を更新
  const updateStock = async (
    itemId: string,
    newStock: number,
  ): Promise<void> => {
    await updateInventoryItem(itemId, { currentStock: newStock });
  };

  // 在庫アイテムを削除
  const deleteInventoryItem = async (itemId: string): Promise<void> => {
    if (!$db) throw new Error("Firestore is not initialized");

    try {
      const itemRef = doc($db, "inventory", itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error("Delete inventory item error:", error);
      throw new Error("在庫アイテムの削除に失敗しました");
    }
  };

  // 発注が必要なアイテムを取得
  const getLowStockItems = async (): Promise<InventoryItem[]> => {
    const allItems = await getAllInventoryItems();
    return allItems.filter((item) => getInventoryStatus(item) !== "sufficient");
  };

  return {
    getInventoryStatus,
    getAllInventoryItems,
    createInventoryItem,
    updateInventoryItem,
    updateStock,
    deleteInventoryItem,
    getLowStockItems,
  };
};
