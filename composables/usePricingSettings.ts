import { ref } from "vue";
import type { DetailedPricingSetting } from "~/types";
import { createDemoPricingSetting } from "./usePricing";

/**
 * 料金設定の管理用Composable
 */
export const usePricingSettings = () => {
  const pricingSettings = ref<DetailedPricingSetting | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Firestoreから料金設定を読み込む
   */
  async function loadPricingSettings(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Firestoreから読み込む実装
      // const { $db } = useNuxtApp()
      // const docRef = doc($db, 'settings', 'pricing')
      // const docSnap = await getDoc(docRef)
      //
      // if (docSnap.exists()) {
      //   pricingSettings.value = docSnap.data() as DetailedPricingSetting
      // } else {
      //   // デフォルト設定を使用
      //   pricingSettings.value = createDemoPricingSetting()
      // }

      // デモ用: ローカルストレージから読み込み
      const stored = localStorage.getItem("pricingSettings");
      if (stored) {
        pricingSettings.value = JSON.parse(stored);
      } else {
        pricingSettings.value = createDemoPricingSetting();
      }
    } catch (e) {
      console.error("料金設定の読み込みエラー:", e);
      error.value = "料金設定の読み込みに失敗しました";
      // エラー時はデフォルト設定を使用
      pricingSettings.value = createDemoPricingSetting();
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Firestoreに料金設定を保存する
   */
  async function savePricingSettings(
    settings: DetailedPricingSetting,
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // TODO: Firestoreに保存する実装
      // const { $db } = useNuxtApp()
      // const docRef = doc($db, 'settings', 'pricing')
      // await setDoc(docRef, {
      //   ...settings,
      //   updatedAt: serverTimestamp()
      // })

      // デモ用: ローカルストレージに保存
      localStorage.setItem("pricingSettings", JSON.stringify(settings));
      pricingSettings.value = settings;
    } catch (e) {
      console.error("料金設定の保存エラー:", e);
      error.value = "料金設定の保存に失敗しました";
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * デフォルト設定にリセット
   */
  async function resetToDefault(): Promise<void> {
    const defaultSettings = createDemoPricingSetting();
    await savePricingSettings(defaultSettings);
  }

  return {
    pricingSettings,
    isLoading,
    error,
    loadPricingSettings,
    savePricingSettings,
    resetToDefault,
  };
};
