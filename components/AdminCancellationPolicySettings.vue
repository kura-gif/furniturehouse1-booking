<template>
  <div class="card">
    <h2 class="text-2xl font-semibold mb-2">キャンセルポリシー設定</h2>
    <p class="text-sm text-gray-500 mb-6">
      返金ルールと詳細ページの表示内容を一括で管理できます。返金ルールを変更すると、表示テキストが自動生成されます。
    </p>

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
      <form @submit.prevent="handleSave" class="space-y-8">
        <!-- セクション1: 返金ルール -->
        <div class="border-b pb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-sm">1</span>
            返金ルール設定
          </h3>

          <!-- ポリシー名 -->
          <div class="mb-4">
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
          <div class="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-medium text-gray-700 mb-2">返金ルール プレビュー</h4>
            <p class="text-sm text-gray-600 whitespace-pre-line">
              {{ previewDescription }}
            </p>
          </div>
        </div>

        <!-- セクション2: 自動生成テキストプレビュー -->
        <div class="border-b pb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-sm">2</span>
            表示テキスト（自動生成）
          </h3>
          <p class="text-sm text-gray-500 mb-4">
            上記の返金ルールから自動生成されます。トップページやキャンセルポリシーページに表示されます。
          </p>

          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-300 rounded-lg">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                    キャンセル日時
                  </th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
                    キャンセル料
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ generatedTexts.cancelPolicyFree || '（ルールを設定してください）' }}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <span class="font-semibold text-green-600">
                      {{ generatedTexts.cancelPolicyFreeDesc || '-' }}
                    </span>
                  </td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ generatedTexts.cancelPolicyPartial || '（ルールを設定してください）' }}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <span class="font-semibold text-red-600">
                      {{ generatedTexts.cancelPolicyPartialDesc || '-' }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="px-4 py-3 text-sm text-gray-700">
                    {{ generatedTexts.cancelPolicyNoShow }}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <span class="font-semibold text-red-600">
                      {{ generatedTexts.cancelPolicyNoShowDesc }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- セクション3: 詳細ページ設定 -->
        <div class="border-b pb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 bg-purple-600 text-white rounded-full text-sm">3</span>
            詳細ページ設定
          </h3>
          <p class="text-sm text-gray-500 mb-4">
            「キャンセルポリシー」詳細ページに表示される追加情報を編集できます。
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                キャンセル手続き方法
              </label>
              <textarea
                v-model="policyTexts.cancelPolicyProcedure"
                rows="3"
                placeholder="キャンセル手続きの方法を記載"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                例外事項（各行が1項目）
              </label>
              <textarea
                v-model="policyTexts.cancelPolicyExceptions"
                rows="4"
                placeholder="- 自然災害の場合&#10;- 施設都合の場合"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                注意事項（各行が1項目）
              </label>
              <textarea
                v-model="policyTexts.cancelPolicyNotes"
                rows="4"
                placeholder="- キャンセル料の計算基準&#10;- 返金処理について"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- セクション4: シミュレーター -->
        <div class="pb-8">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span class="flex items-center justify-center w-6 h-6 bg-gray-400 text-white rounded-full text-sm">?</span>
            返金シミュレーター
          </h3>
          <div class="p-4 border rounded-lg">
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
        </div>

        <!-- 保存ボタン -->
        <div class="flex gap-3 pt-4 border-t">
          <button type="submit" :disabled="isSaving" class="btn-primary">
            {{ isSaving ? "保存中..." : "すべての設定を保存" }}
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
import type { CancelPolicyTexts } from "~/composables/useCancellationPolicy";

const { user } = useAuth();

const {
  defaultPolicy,
  getActivePolicy,
  generatePolicyDescription,
  generateDisplayTexts,
  getPolicyTexts,
  savePolicy,
  calculateRefundSync,
} = useCancellationPolicy();

const currentPolicy = ref<CancellationPolicy>({ ...defaultPolicy });
const editPolicy = ref<CancellationPolicy>({ ...defaultPolicy });
const policyTexts = ref<Pick<CancelPolicyTexts, 'cancelPolicyProcedure' | 'cancelPolicyExceptions' | 'cancelPolicyNotes'>>({
  cancelPolicyProcedure: "",
  cancelPolicyExceptions: "",
  cancelPolicyNotes: "",
});
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

// 自動生成された表示テキスト
const generatedTexts = computed(() =>
  generateDisplayTexts(editPolicy.value.rules),
);

// シミュレーション結果
const simResult = computed((): RefundCalculation | null => {
  if (!simCheckInDate.value || !simAmount.value) return null;

  const checkInDate = new Date(simCheckInDate.value);
  return calculateRefundSync(editPolicy.value, checkInDate, simAmount.value);
});

// ポリシーとテキストを読み込み
const loadPolicy = async () => {
  isLoading.value = true;
  try {
    // 返金ルールを読み込み
    const policy = await getActivePolicy();
    currentPolicy.value = { ...policy };
    editPolicy.value = {
      ...policy,
      rules: [...policy.rules],
    };

    // 詳細ページ用テキストを読み込み
    const texts = await getPolicyTexts();
    policyTexts.value = {
      cancelPolicyProcedure: texts.cancelPolicyProcedure,
      cancelPolicyExceptions: texts.cancelPolicyExceptions,
      cancelPolicyNotes: texts.cancelPolicyNotes,
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
  if (!user.value) {
    alert("ログインが必要です");
    return;
  }

  isSaving.value = true;
  try {
    // ルールを日数の降順でソート
    editPolicy.value.rules.sort(
      (a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn,
    );
    editPolicy.value.isActive = true;

    // 1. 返金ルールを保存（cancellationPoliciesコレクション）
    await savePolicy(editPolicy.value);

    // 2. 表示テキストをAPI経由で保存（settings/facilityドキュメント）
    const idToken = await user.value.getIdToken();
    const textsToSave = {
      ...generatedTexts.value,
      cancelPolicyProcedure: policyTexts.value.cancelPolicyProcedure,
      cancelPolicyExceptions: policyTexts.value.cancelPolicyExceptions,
      cancelPolicyNotes: policyTexts.value.cancelPolicyNotes,
    };

    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(textsToSave),
    });

    if (!response.ok) {
      throw new Error("表示テキストの保存に失敗しました");
    }

    currentPolicy.value = { ...editPolicy.value };
    alert("キャンセルポリシーを保存しました。\n返金ルールと表示テキストが連動して更新されました。");
  } catch (error) {
    console.error("保存エラー:", error);
    alert("保存に失敗しました");
  } finally {
    isSaving.value = false;
  }
};

// デフォルトに戻す
const resetToDefault = () => {
  if (confirm("デフォルト設定に戻しますか？\n返金ルールと詳細ページ設定の両方がリセットされます。")) {
    editPolicy.value = {
      ...defaultPolicy,
      rules: [...defaultPolicy.rules],
    };
    policyTexts.value = {
      cancelPolicyProcedure:
        "予約サイトからキャンセル\nご予約時にご利用いただいた予約サイトにログインし、「予約の管理」または「キャンセル」メニューからお手続きください。",
      cancelPolicyExceptions:
        "- 悪天候や自然災害等で当社が施設の利用が危険と判断した場合\n- 施設の設備故障等により利用が不可能となった場合\n- その他、やむを得ない事由により当社が利用不可と判断した場合",
      cancelPolicyNotes:
        "- キャンセル料の計算は、施設利用日を基準とします\n- キャンセル料には、基本利用料金および清掃料等の追加料金が含まれます\n- 返金処理には、決済方法により数日〜数週間かかる場合があります",
    };
  }
};

// 初期化
onMounted(() => {
  loadPolicy();

  // シミュレーター用に1週間後の日付をデフォルト設定
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  simCheckInDate.value = futureDate.toISOString().split("T")[0];
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
