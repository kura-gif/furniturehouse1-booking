<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">
            ← 管理ダッシュボード
          </NuxtLink>
          <h1 class="text-2xl font-bold">報酬計算・月次レポート</h1>
        </div>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- 期間選択 -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold mb-4">集計期間</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >年</label
            >
            <select
              v-model="selectedYear"
              class="input-field"
              @change="loadReport"
            >
              <option v-for="year in availableYears" :key="year" :value="year">
                {{ year }}年
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >月</label
            >
            <select
              v-model="selectedMonth"
              class="input-field"
              @change="loadReport"
            >
              <option v-for="month in 12" :key="month" :value="month">
                {{ month }}月
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >サポーター</label
            >
            <select
              v-model="selectedSupporterId"
              class="input-field"
              @change="loadReport"
            >
              <option value="">すべて</option>
              <option
                v-for="supporter in supporters"
                :key="supporter.id"
                :value="supporter.id"
              >
                {{ supporter.name }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="exportCsv"
              :disabled="!reportData.length"
              class="btn-primary w-full"
            >
              CSVエクスポート
            </button>
          </div>
        </div>
      </div>

      <!-- サマリーカード -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">総タスク数</h3>
          <p class="text-3xl font-bold text-blue-600">
            {{ summary.totalTasks }}
          </p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">総作業時間</h3>
          <p class="text-3xl font-bold text-purple-600">
            {{ summary.totalHours.toFixed(1) }}時間
          </p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">総報酬額</h3>
          <p class="text-3xl font-bold text-green-600">
            ¥{{ summary.totalCompensation.toLocaleString() }}
          </p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">未払い額</h3>
          <p class="text-3xl font-bold text-red-600">
            ¥{{ summary.unpaidAmount.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- サポーター別サマリー -->
      <div class="card mb-6">
        <h2 class="text-lg font-semibold mb-4">サポーター別サマリー</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="spinner w-12 h-12 mx-auto"></div>
          <p class="text-gray-600 mt-4">読み込み中...</p>
        </div>

        <div
          v-else-if="supporterSummaries.length === 0"
          class="text-center text-gray-500 py-8"
        >
          該当するデータがありません
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  サポーター
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  タスク数
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  作業時間
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  時給
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  交通費
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  報酬合計
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  支払い状況
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="s in supporterSummaries" :key="s.supporterId">
                <td class="px-6 py-4 whitespace-nowrap font-medium">
                  {{ s.supporterName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{{ s.taskCount }}件</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ s.totalHours.toFixed(1) }}時間
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ¥{{ s.hourlyRate.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ¥{{ s.totalTransportation.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap font-semibold">
                  ¥{{ s.totalCompensation.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs',
                      s.unpaidCount === 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800',
                    ]"
                  >
                    {{
                      s.unpaidCount === 0
                        ? "全て支払い済み"
                        : `${s.unpaidCount}件未払い`
                    }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- タスク詳細一覧 -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">タスク詳細一覧</h2>

        <div
          v-if="reportData.length === 0 && !loading"
          class="text-center text-gray-500 py-8"
        >
          該当するデータがありません
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  日付
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  予約番号
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  タイプ
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  担当者
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  作業時間
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  時給
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  交通費
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  報酬額
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  支払い
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                >
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="task in reportData" :key="task.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ formatDate(task.completedAt || task.scheduledDate) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-mono">
                  {{ task.bookingReference }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs',
                      (task.taskType || task.type) === 'pre_checkin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800',
                    ]"
                  >
                    {{
                      (task.taskType || task.type) === "pre_checkin"
                        ? "チェックイン前"
                        : "チェックアウト後"
                    }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ task.assignedToName || "-" }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{
                    task.actualHours
                      ? task.actualHours.toFixed(2) + "時間"
                      : "-"
                  }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  ¥{{ (task.compensation?.hourlyRate || 0).toLocaleString() }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  ¥{{
                    (task.compensation?.transportationFee || 0).toLocaleString()
                  }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                  ¥{{
                    (task.compensation?.calculatedAmount || 0).toLocaleString()
                  }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs',
                      task.compensation?.isPaid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800',
                    ]"
                  >
                    {{ task.compensation?.isPaid ? "済" : "未払い" }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <button
                    v-if="
                      task.status === 'completed' && !task.compensation?.isPaid
                    "
                    @click="markAsPaidSingle(task.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    支払済にする
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 一括支払いボタン -->
        <div v-if="unpaidTasks.length > 0" class="mt-6 pt-6 border-t">
          <div class="flex items-center justify-between">
            <p class="text-gray-600">
              未払いタスク: <strong>{{ unpaidTasks.length }}件</strong> （合計
              <strong>¥{{ unpaidTotalAmount.toLocaleString() }}</strong
              >）
            </p>
            <button @click="markAllAsPaid" class="btn-primary">
              すべて支払い済みにする
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import type { CleaningTask } from "~/types";

definePageMeta({
  layout: false,
  middleware: "admin",
});

const { $db } = useNuxtApp();
const toast = useToast();
const confirmDialog = useConfirmDialog();

interface SupporterInfo {
  id: string;
  name: string;
  hourlyRate: number;
  transportationFee: number;
}

interface SupporterSummary {
  supporterId: string;
  supporterName: string;
  taskCount: number;
  totalHours: number;
  hourlyRate: number;
  totalTransportation: number;
  totalCompensation: number;
  unpaidCount: number;
}

const currentDate = new Date();
const selectedYear = ref(currentDate.getFullYear());
const selectedMonth = ref(currentDate.getMonth() + 1);
const selectedSupporterId = ref("");

const supporters = ref<SupporterInfo[]>([]);
const reportData = ref<CleaningTask[]>([]);
const loading = ref(false);

// 利用可能な年のリスト（過去3年〜来年）
const availableYears = computed(() => {
  const years = [];
  for (
    let y = currentDate.getFullYear() - 3;
    y <= currentDate.getFullYear() + 1;
    y++
  ) {
    years.push(y);
  }
  return years;
});

// サマリー計算
const summary = computed(() => {
  const completedTasks = reportData.value.filter(
    (t) => t.status === "completed",
  );
  return {
    totalTasks: completedTasks.length,
    totalHours: completedTasks.reduce(
      (sum, t) => sum + (t.actualHours || 0),
      0,
    ),
    totalCompensation: completedTasks.reduce(
      (sum, t) => sum + (t.compensation?.calculatedAmount || 0),
      0,
    ),
    unpaidAmount: completedTasks
      .filter((t) => !t.compensation?.isPaid)
      .reduce((sum, t) => sum + (t.compensation?.calculatedAmount || 0), 0),
  };
});

// サポーター別サマリー
const supporterSummaries = computed<SupporterSummary[]>(() => {
  const summaryMap = new Map<string, SupporterSummary>();

  reportData.value.forEach((task) => {
    if (task.status !== "completed" || !task.assignedTo) return;

    const supporterId = task.assignedTo;
    const existing = summaryMap.get(supporterId);

    if (existing) {
      existing.taskCount++;
      existing.totalHours += task.actualHours || 0;
      existing.totalTransportation += task.compensation?.transportationFee || 0;
      existing.totalCompensation += task.compensation?.calculatedAmount || 0;
      if (!task.compensation?.isPaid) existing.unpaidCount++;
    } else {
      summaryMap.set(supporterId, {
        supporterId,
        supporterName: task.assignedToName || "不明",
        taskCount: 1,
        totalHours: task.actualHours || 0,
        hourlyRate: task.compensation?.hourlyRate || 0,
        totalTransportation: task.compensation?.transportationFee || 0,
        totalCompensation: task.compensation?.calculatedAmount || 0,
        unpaidCount: task.compensation?.isPaid ? 0 : 1,
      });
    }
  });

  return Array.from(summaryMap.values()).sort(
    (a, b) => b.totalCompensation - a.totalCompensation,
  );
});

// 未払いタスク
const unpaidTasks = computed(() =>
  reportData.value.filter(
    (t) => t.status === "completed" && !t.compensation?.isPaid,
  ),
);

const unpaidTotalAmount = computed(() =>
  unpaidTasks.value.reduce(
    (sum, t) => sum + (t.compensation?.calculatedAmount || 0),
    0,
  ),
);

// サポーター一覧を読み込み
const loadSupporters = async () => {
  if (!$db) return;
  try {
    const supportersRef = collection($db, "supporters");
    const snapshot = await getDocs(supportersRef);
    supporters.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || doc.data().displayName,
      hourlyRate: doc.data().hourlyRate || 0,
      transportationFee: doc.data().transportationFee || 0,
    }));
  } catch (error) {
    console.error("❌ サポーター読み込みエラー:", error);
  }
};

// レポートデータを読み込み
const loadReport = async () => {
  if (!$db) return;
  loading.value = true;
  try {
    const startDate = new Date(selectedYear.value, selectedMonth.value - 1, 1);
    const endDate = new Date(
      selectedYear.value,
      selectedMonth.value,
      0,
      23,
      59,
      59,
    );

    const tasksRef = collection($db, "cleaningTasks");
    let q = query(
      tasksRef,
      where("scheduledDate", ">=", Timestamp.fromDate(startDate)),
      where("scheduledDate", "<=", Timestamp.fromDate(endDate)),
      orderBy("scheduledDate", "desc"),
    );

    const snapshot = await getDocs(q);
    let tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as CleaningTask[];

    // サポーターフィルター
    if (selectedSupporterId.value) {
      tasks = tasks.filter((t) => t.assignedTo === selectedSupporterId.value);
    }

    reportData.value = tasks;
    console.log("✅ レポートデータ読み込み完了:", tasks.length, "件");
  } catch (error) {
    console.error("❌ レポートデータ読み込みエラー:", error);
    toast.error("データの読み込みに失敗しました");
  } finally {
    loading.value = false;
  }
};

// 単一タスクを支払い済みにする
const markAsPaidSingle = async (taskId: string) => {
  if (!$db) return;
  if (!(await confirmDialog.confirm("このタスクを支払い済みにしますか？")))
    return;

  try {
    const taskRef = doc($db, "cleaningTasks", taskId);
    await updateDoc(taskRef, {
      "compensation.isPaid": true,
      "compensation.paidAt": Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    await loadReport();
    toast.success("支払い済みにしました");
  } catch (error) {
    console.error("❌ 支払い記録エラー:", error);
    toast.error("支払い記録に失敗しました");
  }
};

// 全て支払い済みにする
const markAllAsPaid = async () => {
  if (!$db) return;
  if (
    !(await confirmDialog.confirm({
      title: "一括支払い確認",
      message: `${unpaidTasks.value.length}件のタスクを全て支払い済みにしますか？\n合計金額: ¥${unpaidTotalAmount.value.toLocaleString()}`,
      type: "warning",
    }))
  ) {
    return;
  }

  try {
    const updates = unpaidTasks.value.map((task) => {
      const taskRef = doc($db, "cleaningTasks", task.id);
      return updateDoc(taskRef, {
        "compensation.isPaid": true,
        "compensation.paidAt": Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    });

    await Promise.all(updates);
    await loadReport();
    toast.success("全ての支払いを記録しました");
  } catch (error) {
    console.error("❌ 一括支払い記録エラー:", error);
    toast.error("一部の支払い記録に失敗しました");
  }
};

// CSVエクスポート
const exportCsv = () => {
  if (reportData.value.length === 0) {
    toast.warning("エクスポートするデータがありません");
    return;
  }

  // ヘッダー行
  const headers = [
    "日付",
    "予約番号",
    "タスクタイプ",
    "担当者",
    "作業時間（時間）",
    "時給（円）",
    "交通費（円）",
    "報酬額（円）",
    "支払い状況",
  ];

  // データ行
  const rows = reportData.value
    .filter((t) => t.status === "completed")
    .map((task) => [
      formatDate(task.completedAt || task.scheduledDate),
      task.bookingReference || "",
      (task.taskType || task.type) === "pre_checkin"
        ? "チェックイン前"
        : "チェックアウト後",
      task.assignedToName || "",
      task.actualHours?.toFixed(2) || "0",
      task.compensation?.hourlyRate || 0,
      task.compensation?.transportationFee || 0,
      task.compensation?.calculatedAmount || 0,
      task.compensation?.isPaid ? "支払い済み" : "未払い",
    ]);

  // サマリー行を追加
  rows.push([]);
  rows.push(["--- サマリー ---"]);
  rows.push(["総タスク数", summary.value.totalTasks]);
  rows.push(["総作業時間", summary.value.totalHours.toFixed(1) + "時間"]);
  rows.push([
    "総報酬額",
    "¥" + summary.value.totalCompensation.toLocaleString(),
  ]);
  rows.push(["未払い額", "¥" + summary.value.unpaidAmount.toLocaleString()]);

  // サポーター別サマリー
  rows.push([]);
  rows.push(["--- サポーター別サマリー ---"]);
  rows.push([
    "サポーター名",
    "タスク数",
    "作業時間",
    "時給",
    "交通費合計",
    "報酬合計",
    "未払い件数",
  ]);
  supporterSummaries.value.forEach((s) => {
    rows.push([
      s.supporterName,
      s.taskCount,
      s.totalHours.toFixed(1) + "時間",
      "¥" + s.hourlyRate.toLocaleString(),
      "¥" + s.totalTransportation.toLocaleString(),
      "¥" + s.totalCompensation.toLocaleString(),
      s.unpaidCount + "件",
    ]);
  });

  // CSVテキスト作成
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // BOM付きでUTF-8エンコード（Excelで文字化けしないように）
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8" });

  // ダウンロード
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `compensation-report_${selectedYear.value}-${String(selectedMonth.value).padStart(2, "0")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 日付フォーマット
const formatDate = (
  timestamp: Timestamp | Date | string | null | undefined,
) => {
  if (!timestamp) return "-";
  try {
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  } catch {
    return "-";
  }
};

onMounted(() => {
  loadSupporters();
  loadReport();
});
</script>
