<template>
  <div class="flex items-start justify-between">
    <div class="flex-1">
      <div class="flex items-center gap-3 mb-2">
        <span
          :class="[
            'px-2 py-1 rounded-full text-xs font-semibold',
            taskTypeStyle,
          ]"
        >
          {{ taskTypeLabel }}
        </span>
        <span
          :class="['px-2 py-1 rounded-full text-xs font-semibold', statusStyle]"
        >
          {{ statusLabel }}
        </span>
      </div>
      <h3 class="font-semibold text-gray-900 mb-1">
        {{ formatDate(task.scheduledDate) }} の清掃
      </h3>
      <div class="text-sm text-gray-600 space-y-1">
        <p v-if="task.bookingId">予約ID: {{ task.bookingId.slice(0, 8) }}...</p>
        <p>予定時間: {{ task.estimatedDuration }}分</p>
        <p v-if="task.checklist && task.checklist.length > 0">
          チェックリスト: {{ completedItems }}/{{ task.checklist.length }}
        </p>
      </div>
    </div>

    <div class="text-right ml-4">
      <div v-if="showCompensation && task.compensation" class="mb-2">
        <p class="text-lg font-bold text-green-600">
          ¥{{ task.compensation.totalAmount?.toLocaleString() }}
        </p>
        <p class="text-xs text-gray-500">
          {{ task.compensation.isPaid ? "支払い済み" : "未払い" }}
        </p>
      </div>

      <div
        v-if="task.status === 'in_progress'"
        class="text-sm text-yellow-600 font-medium"
      >
        作業中
      </div>

      <div v-if="task.actualDuration" class="text-sm text-gray-500">
        実績: {{ task.actualDuration }}分
      </div>

      <svg
        class="w-5 h-5 text-gray-400 mt-2 ml-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5l7 7-7 7"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { CleaningTask, CleaningTaskStatus } from "~/types";

const props = defineProps<{
  task: CleaningTask;
  showCompensation?: boolean;
}>();

// タスクタイプのラベル
const taskTypeLabel = computed(() => {
  return props.task.taskType === "pre_checkin"
    ? "チェックイン前"
    : "チェックアウト後";
});

// タスクタイプのスタイル
const taskTypeStyle = computed(() => {
  return props.task.taskType === "pre_checkin"
    ? "bg-blue-100 text-blue-800"
    : "bg-purple-100 text-purple-800";
});

// ステータスのラベル
const statusLabel = computed(() => {
  const labels: Record<CleaningTaskStatus, string> = {
    pending: "未割当",
    assigned: "割当済",
    in_progress: "作業中",
    completed: "完了",
    cancelled: "キャンセル",
  };
  return labels[props.task.status] || props.task.status;
});

// ステータスのスタイル
const statusStyle = computed(() => {
  const styles: Record<CleaningTaskStatus, string> = {
    pending: "bg-gray-100 text-gray-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return styles[props.task.status] || "bg-gray-100 text-gray-800";
});

// 完了したチェックリスト項目数
const completedItems = computed(() => {
  if (!props.task.checklist) return 0;
  return props.task.checklist.filter((item) => item.completed).length;
});

// 日付フォーマット
function formatDate(
  timestamp:
    | { toDate?: () => Date }
    | Date
    | string
    | number
    | null
    | undefined,
) {
  if (!timestamp) return "-";
  try {
    const date =
      typeof timestamp === "object" &&
      timestamp !== null &&
      "toDate" in timestamp &&
      timestamp.toDate
        ? timestamp.toDate()
        : new Date(timestamp as string | number | Date);
    if (isNaN(date.getTime())) return "-";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "本日";
    if (diffDays === 1) return "明日";
    if (diffDays === -1) return "昨日";

    return `${date.getMonth() + 1}/${date.getDate()}`;
  } catch {
    return "-";
  }
}
</script>
