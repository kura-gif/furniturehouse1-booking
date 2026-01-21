<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">アメニティ・設備管理</h2>
      <div class="flex gap-2">
        <button
          v-if="localAmenities.length === 0"
          @click="initializeDefaultAmenities"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          初期データを投入
        </button>
        <button
          @click="showAddModal = true"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          + 新規追加
        </button>
      </div>
    </div>

    <!-- カテゴリータブ -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        @click="selectedCategory = 'all'"
        :class="[
          'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
          selectedCategory === 'all'
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        ]"
      >
        すべて
      </button>
      <button
        v-for="(label, key) in amenityCategories"
        :key="key"
        @click="selectedCategory = key"
        :class="[
          'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
          selectedCategory === key
            ? 'bg-indigo-100 text-indigo-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        ]"
      >
        {{ label }}
      </button>
    </div>

    <!-- アメニティリスト -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">読み込み中...</p>
    </div>

    <div
      v-else-if="localAmenities.length === 0"
      class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg"
    >
      <p class="text-gray-600 mb-4">アメニティが登録されていません</p>
      <button
        @click="initializeDefaultAmenities"
        class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        初期データを投入する
      </button>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="amenity in filteredAmenities"
        :key="amenity.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
      >
        <div class="flex items-center gap-4 flex-1">
          <div class="flex items-center gap-3">
            <input
              type="checkbox"
              :checked="amenity.available"
              @change="toggleAvailability(amenity.id)"
              class="w-5 h-5 text-indigo-600 rounded"
            />
            <component
              :is="getIconComponent(amenity.icon)"
              class="w-6 h-6 text-gray-600"
            />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h3 class="font-medium text-gray-900">{{ amenity.name }}</h3>
              <span
                class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
              >
                {{ amenityCategories[amenity.category] }}
              </span>
            </div>
            <p v-if="amenity.description" class="text-sm text-gray-500 mt-1">
              {{ amenity.description }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="editAmenity(amenity)"
            class="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            @click="handleDeleteAmenity(amenity.id)"
            class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 追加/編集モーダル -->
    <div
      v-if="showAddModal || editingAmenity"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      @click="closeModal"
    >
      <div
        @click.stop
        class="bg-white rounded-xl shadow-2xl max-w-2xl w-full m-4 p-6"
      >
        <h3 class="text-xl font-bold text-gray-900 mb-6">
          {{ editingAmenity ? "アメニティを編集" : "新規アメニティを追加" }}
        </h3>

        <form @submit.prevent="saveAmenity" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >名前</label
            >
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >説明（任意）</label
            >
            <input
              v-model="formData.description"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >カテゴリ</label
            >
            <select
              v-model="formData.category"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option
                v-for="(label, key) in amenityCategories"
                :key="key"
                :value="key"
              >
                {{ label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >アイコン</label
            >
            <div class="relative">
              <button
                type="button"
                @click="showIconPicker = !showIconPicker"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent flex items-center justify-between bg-white"
              >
                <div class="flex items-center gap-2">
                  <component
                    :is="getIconComponent(formData.icon)"
                    class="w-5 h-5 text-gray-600"
                  />
                  <span>{{ formData.icon }}</span>
                </div>
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- アイコン選択ドロップダウン -->
              <div
                v-if="showIconPicker"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
              >
                <button
                  v-for="icon in availableIcons"
                  :key="icon"
                  type="button"
                  @click="selectIcon(icon)"
                  class="w-full px-3 py-2 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left"
                  :class="formData.icon === icon ? 'bg-indigo-100' : ''"
                >
                  <component
                    :is="getIconComponent(icon)"
                    class="w-5 h-5 text-gray-600 flex-shrink-0"
                  />
                  <span class="text-sm">{{ icon }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="formData.available"
              type="checkbox"
              id="available"
              class="w-5 h-5 text-indigo-600 rounded"
            />
            <label for="available" class="text-sm font-medium text-gray-700"
              >トップページに表示</label
            >
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {{ editingAmenity ? "更新" : "追加" }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  amenityCategories,
  amenities as defaultAmenities,
  type Amenity,
} from "~/config/amenities";
import {
  WifiIcon,
  TruckIcon,
  SunIcon,
  FireIcon,
  BeakerIcon,
  CubeIcon,
  Square3Stack3DIcon,
  ShoppingBagIcon,
  HomeIcon,
  HomeModernIcon,
  DocumentIcon,
  BoltIcon,
  ArrowsUpDownIcon,
  RectangleStackIcon,
  TvIcon,
  BookOpenIcon,
  SparklesIcon,
  PhotoIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ArrowPathIcon,
  ScissorsIcon,
  FolderIcon,
  CircleStackIcon,
} from "@heroicons/vue/24/outline";

const {
  getAllAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  toggleAmenityAvailability,
} = useAmenities();

// アイコンマッピング
const iconComponents: Record<string, any> = {
  // 基本設備
  wifi: WifiIcon,
  truck: TruckIcon,
  sun: SunIcon,
  fire: FireIcon,
  bolt: BoltIcon,

  // キッチン・調理
  beaker: BeakerIcon,
  cube: CubeIcon, // 冷蔵庫
  "square-3-stack-3d": Square3Stack3DIcon, // 電子レンジ
  cup: BeakerIcon, // コーヒーメーカー
  "shopping-bag": ShoppingBagIcon, // 食器
  "wrench-screwdriver": WrenchScrewdriverIcon, // キッチンツール
  "circle-stack": CircleStackIcon, // 食器とカトラリー

  // バスルーム
  home: HomeIcon, // 浴室
  "arrow-path": ArrowPathIcon, // 洗濯機・乾燥機
  scissors: ScissorsIcon, // ヘアドライヤー（代替）

  // 寝室・リネン
  "home-modern": HomeModernIcon,
  document: DocumentIcon, // タオル
  "arrows-up-down": ArrowsUpDownIcon, // ハンガー
  "rectangle-stack": RectangleStackIcon, // 遮光カーテン・シーツ
  folder: FolderIcon, // バスタオル（代替）

  // エンターテインメント
  tv: TvIcon,
  "book-open": BookOpenIcon,

  // 屋外・景観
  sparkles: SparklesIcon,
  photo: PhotoIcon,

  // 安全設備
  "bell-alert": BellAlertIcon,
  "shield-check": ShieldCheckIcon,
  heart: HeartIcon,
};

const getIconComponent = (iconName: string) => {
  return iconComponents[iconName] || BeakerIcon;
};

const availableIcons = Object.keys(iconComponents);

// 状態管理
const selectedCategory = ref("all");
const showAddModal = ref(false);
const editingAmenity = ref<Amenity | null>(null);
const localAmenities = ref<Amenity[]>([]);
const isLoading = ref(false);
const showIconPicker = ref(false);

const formData = ref({
  name: "",
  description: "",
  category: "basic" as Amenity["category"],
  icon: "wifi",
  available: true,
});

// アメニティデータを取得
const loadAmenities = async () => {
  isLoading.value = true;
  try {
    localAmenities.value = await getAllAmenities();
  } catch (error) {
    console.error("アメニティ取得エラー:", error);
    alert("アメニティの取得に失敗しました");
  } finally {
    isLoading.value = false;
  }
};

// マウント時にデータを読み込み
onMounted(() => {
  loadAmenities();
});

// フィルタリング
const filteredAmenities = computed(() => {
  if (selectedCategory.value === "all") {
    return localAmenities.value;
  }
  return localAmenities.value.filter(
    (a) => a.category === selectedCategory.value,
  );
});

// アメニティ操作
const toggleAvailability = async (id: string) => {
  const amenity = localAmenities.value.find((a) => a.id === id);
  if (amenity) {
    const newAvailability = !amenity.available;
    try {
      await toggleAmenityAvailability(id, newAvailability);
      amenity.available = newAvailability;
      console.log("Toggle availability:", id, amenity.available);
    } catch (error) {
      console.error("利用可能状態の更新に失敗:", error);
      alert("利用可能状態の更新に失敗しました");
    }
  }
};

const editAmenity = (amenity: Amenity) => {
  editingAmenity.value = amenity;
  formData.value = {
    name: amenity.name,
    description: amenity.description,
    category: amenity.category,
    icon: amenity.icon,
    available: amenity.available,
  };
};

const handleDeleteAmenity = async (id: string) => {
  if (confirm("このアメニティを削除してもよろしいですか?")) {
    try {
      await deleteAmenity(id);
      localAmenities.value = localAmenities.value.filter((a) => a.id !== id);
      console.log("Delete amenity:", id);
    } catch (error) {
      console.error("アメニティの削除に失敗:", error);
      alert("アメニティの削除に失敗しました");
    }
  }
};

const saveAmenity = async () => {
  try {
    if (editingAmenity.value) {
      // 編集
      await updateAmenity(editingAmenity.value.id, formData.value);
      const index = localAmenities.value.findIndex(
        (a) => a.id === editingAmenity.value!.id,
      );
      if (index !== -1) {
        localAmenities.value[index] = {
          ...localAmenities.value[index],
          ...formData.value,
        };
      }
      console.log("Update amenity:", editingAmenity.value.id, formData.value);
    } else {
      // 新規追加
      const newAmenityId = await createAmenity(formData.value);
      const newAmenity: Amenity = {
        id: newAmenityId,
        ...formData.value,
      };
      localAmenities.value.push(newAmenity);
      console.log("Add amenity:", newAmenity);
    }
    closeModal();
  } catch (error) {
    console.error("アメニティの保存に失敗:", error);
    alert("アメニティの保存に失敗しました");
  }
};

const selectIcon = (icon: string) => {
  formData.value.icon = icon;
  showIconPicker.value = false;
};

const closeModal = () => {
  showAddModal.value = false;
  editingAmenity.value = null;
  showIconPicker.value = false;
  formData.value = {
    name: "",
    description: "",
    category: "basic",
    icon: "wifi",
    available: true,
  };
};

// 初期データを投入
const initializeDefaultAmenities = async () => {
  if (
    !confirm("初期データを投入しますか？既存のデータがある場合は追加されます。")
  ) {
    return;
  }

  isLoading.value = true;
  try {
    let successCount = 0;
    for (const amenity of defaultAmenities) {
      const { id, ...amenityData } = amenity;
      await createAmenity(amenityData);
      successCount++;
    }

    alert(`${successCount}件のアメニティを投入しました`);
    await loadAmenities();
  } catch (error) {
    console.error("初期データ投入エラー:", error);
    alert("初期データの投入に失敗しました");
  } finally {
    isLoading.value = false;
  }
};
</script>
