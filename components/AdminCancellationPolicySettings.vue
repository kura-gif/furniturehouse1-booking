<template>
  <div class="card">
    <h2 class="text-2xl font-semibold mb-6">キャンセルポリシー設定</h2>

    <!-- ローディング -->
    <div v-if="isLoading" class="text-center py-8">
      <div
        class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"
      ></div>
      <p class="text-gray-600 mt-4">読み込み中...</p>
    </div>

    <div v-else>
      <!-- 現在のポリシー表示 -->
      <div class="mb-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <h3 class="font-semibold text-purple-900 mb-2">
          現在のポリシー: {{ currentPolicy.name }}
        </h3>
        <p class="text-sm text-purple-700 whitespace-pre-line">
          {{ policyDescription }}
        </p>
      </div>

      <!-- ポリシー編集フォーム -->
      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- ポリシー名 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ポリシー名
          </label>
          <input
            v-model="editPolicy.name"
            type="text"
            required
            class="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="例: 標準、柔軟"
          />
        </div>

        <!-- ルール設定 -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <label class="block text-sm font-medium text-gray-700">
              返金ルール
            </label>
            <button
              type="button"
              @click="addRule"
              class="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              + ルールを追加
            </button>
          </div>

          <div class="space-y-3">
            <div
              v-for="(rule, index) in editPolicy.rules"
              :key="index"
              class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
            >
              <div class="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >チェックイン何日前まで</label
                  >
                  <input
                    v-model.number="rule.daysBeforeCheckIn"
                    type="number"
                    min="0"
                    required
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label class="block text-xs text-gray-600 mb-1"
                    >返金率 (%)</label
                  >
                  <input
                    v-model.number="rule.refundPercentage"
                    type="number"
                    min="0"
                    max="100"
                    required
                    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button
                v-if="editPolicy.rules.length > 1"
                type="button"
                @click="removeRule(index)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

          <p class="text-xs text-gray-500 mt-2">
            ※ルールは日数の大きい順に適用されます。例:
            5日前まで100%、3日前まで50%、0日前（当日）まで0%
          </p>
        </div>

        <!-- プレビュー -->
        <div class="p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-700 mb-2">プレビュー</h4>
          <p class="text-sm text-gray-600 whitespace-pre-line">
            {{ previewDescription }}
          </p>
        </div>

        <!-- シミュレーター -->
        <div class="p-4 border rounded-lg">
          <h4 class="font-medium text-gray-700 mb-4">返金シミュレーター</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-gray-600 mb-1"
                >チェックイン日</label
              >
              <input
                v-model="simCheckInDate"
                type="date"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">予約金額</label>
              <input
                v-model.number="simAmount"
                type="number"
                min="0"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div class="flex items-end">
              <div v-if="simResult" class="p-3 bg-purple-50 rounded-lg w-full">
                <p class="text-xs text-gray-600">
                  チェックイン{{ simResult.daysBeforeCheckIn }}日前
                </p>
                <p class="font-semibold text-purple-600">
                  返金率: {{ simResult.refundPercentage }}%
                </p>
                <p class="text-sm text-gray-900">
                  返金額: ¥{{ simResult.refundAmount.toLocaleString() }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 保存ボタン -->
        <div class="flex gap-3">
          <button type="submit" :disabled="isSaving" class="btn-primary">
            {{ isSaving ? "保存中..." : "設定を保存" }}
          </button>
          <button type="button" @click="resetToDefault" class="btn-secondary">
            デフォルトに戻す
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  CancellationPolicy,
  CancellationPolicyRule,
  RefundCalculation,
} from "~/types";

const {
  defaultPolicy,
  getActivePolicy,
  savePolicy,
  generatePolicyDescription,
  calculateRefundSync,
} = useCancellationPolicy();

const currentPolicy = ref<CancellationPolicy>({ ...defaultPolicy });
const editPolicy = ref<CancellationPolicy>({ ...defaultPolicy });
const isLoading = ref(true);
const isSaving = ref(false);

// シミュレーター
const simCheckInDate = ref("");
const simAmount = ref(30000);

// ポリシー説明文
const policyDescription = computed(() =>
  generatePolicyDescription(currentPolicy.value.rules),
);
const previewDescription = computed(() =>
  generatePolicyDescription(editPolicy.value.rules),
);

// シミュレーション結果
const simResult = computed((): RefundCalculation | null => {
  if (!simCheckInDate.value || !simAmount.value) return null;

  const checkInDate = new Date(simCheckInDate.value);
  return calculateRefundSync(editPolicy.value, checkInDate, simAmount.value);
});

// ポリシーを読み込み
const loadPolicy = async () => {
  isLoading.value = true;
  try {
    const policy = await getActivePolicy();
    currentPolicy.value = { ...policy };
    editPolicy.value = {
      ...policy,
      rules: [...policy.rules],
    };
  } catch (error) {
    console.error("ポリシー読み込みエラー:", error);
  } finally {
    isLoading.value = false;
  }
};

// ルールを追加
const addRule = () => {
  editPolicy.value.rules.push({
    daysBeforeCheckIn: 0,
    refundPercentage: 0,
  });
};

// ルールを削除
const removeRule = (index: number) => {
  editPolicy.value.rules.splice(index, 1);
};

// 保存
const handleSave = async () => {
  isSaving.value = true;
  try {
    // ルールを日数の降順でソート
    editPolicy.value.rules.sort(
      (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn,
    );
    editPolicy.value.isActive = true;

    await savePolicy(editPolicy.value);
    currentPolicy.value = { ...editPolicy.value };
    alert("キャンセルポリシーを保存しました");
  } catch (error) {
    console.error("保存エラー:", error);
    alert("保存に失敗しました");
  } finally {
    isSaving.value = false;
  }
};

// デフォルトに戻す
const resetToDefault = () => {
  if (confirm("デフォルト設定に戻しますか？")) {
    editPolicy.value = {
      ...defaultPolicy,
      rules: [...defaultPolicy.rules],
    };
  }
};

// 初期化
onMounted(() => {
  loadPolicy();

  // シミュレーター用に明日の日付をデフォルト設定
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 7);
  simCheckInDate.value = tomorrow.toISOString().split("T")[0];
});
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.btn-primary {
  @apply px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}
</style>
