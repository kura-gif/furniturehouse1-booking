<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">サポーターダッシュボード</h1>
          <p class="text-sm text-gray-600">清掃タスク管理</p>
        </div>
        <div class="flex items-center gap-4">
          <span v-if="appUser" class="text-sm text-gray-600">
            {{ appUser.displayName }}さん
          </span>
          <button @click="handleLogout" class="btn-secondary text-sm">ログアウト</button>
        </div>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- サマリーカード -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <h3 class="text-sm text-blue-700 mb-2">本日のタスク</h3>
          <p class="text-3xl font-bold text-blue-600">{{ todayTasks.length }}</p>
        </div>
        <div class="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
          <h3 class="text-sm text-yellow-700 mb-2">未完了タスク</h3>
          <p class="text-3xl font-bold text-yellow-600">{{ pendingTasks.length }}</p>
        </div>
        <div class="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <h3 class="text-sm text-green-700 mb-2">今月の完了</h3>
          <p class="text-3xl font-bold text-green-600">{{ monthlyCompletedCount }}</p>
        </div>
        <div class="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
          <h3 class="text-sm text-purple-700 mb-2">今月の報酬（税込）</h3>
          <p class="text-2xl font-bold text-purple-600">¥{{ monthlyEarnings.toLocaleString() }}</p>
        </div>
      </div>

      <!-- タブナビゲーション -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-custom',
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
              <span
                v-if="tab.id === 'pending' && pendingTasks.length > 0"
                class="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                {{ pendingTasks.length }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- 本日のタスクタブ -->
      <div v-if="currentTab === 'today'" class="space-y-4">
        <div v-if="todayTasks.length === 0" class="card text-center py-12">
          <p class="text-gray-500">本日のタスクはありません</p>
        </div>
        <div
          v-for="task in todayTasks"
          :key="task.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewTask(task)"
        >
          <TaskCard :task="task" />
        </div>
      </div>

      <!-- 未完了タスクタブ -->
      <div v-if="currentTab === 'pending'" class="space-y-4">
        <div v-if="pendingTasks.length === 0" class="card text-center py-12">
          <p class="text-gray-500">未完了のタスクはありません</p>
        </div>
        <div
          v-for="task in pendingTasks"
          :key="task.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewTask(task)"
        >
          <TaskCard :task="task" />
        </div>
      </div>

      <!-- 完了タスクタブ -->
      <div v-if="currentTab === 'completed'" class="space-y-4">
        <div v-if="completedTasks.length === 0" class="card text-center py-12">
          <p class="text-gray-500">完了したタスクはありません</p>
        </div>
        <div
          v-for="task in completedTasks"
          :key="task.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewTask(task)"
        >
          <TaskCard :task="task" :showCompensation="true" />
        </div>
      </div>

      <!-- 報酬履歴タブ -->
      <div v-if="currentTab === 'earnings'" class="space-y-6">
        <!-- 月別サマリー -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">報酬サマリー</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">今月の稼働時間</p>
              <p class="text-2xl font-bold">{{ monthlyHours }}時間</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">今月の報酬（税込）</p>
              <p class="text-2xl font-bold text-green-600">¥{{ monthlyEarnings.toLocaleString() }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">支払いステータス</p>
              <p class="text-lg font-semibold">
                <span v-if="unpaidAmount > 0" class="text-yellow-600">
                  未払い: ¥{{ unpaidAmount.toLocaleString() }}
                </span>
                <span v-else class="text-green-600">すべて支払い済み</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 完了タスクと報酬一覧 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">報酬履歴</h2>
          <div v-if="completedTasks.length === 0" class="text-center py-8 text-gray-500">
            報酬履歴はありません
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日付</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">タスク</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">稼働時間</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">報酬</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="task in completedTasks" :key="task.id">
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ formatDate(task.scheduledDate) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ task.taskType === 'pre_checkin' ? 'チェックイン前清掃' : 'チェックアウト後清掃' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ task.actualDuration ? (task.actualDuration / 60).toFixed(1) : '-' }}時間
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                    ¥{{ (task.compensation?.totalAmount || 0).toLocaleString() }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs',
                        task.compensation?.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      ]"
                    >
                      {{ task.compensation?.isPaid ? '支払い済み' : '未払い' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- タスク詳細モーダル -->
    <div
      v-if="selectedTask"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="selectedTask = null"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-semibold">タスク詳細</h3>
          <button
            @click="selectedTask = null"
            class="p-2 hover:bg-gray-100 rounded-lg transition-custom"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- タスク基本情報 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600">タスクタイプ</p>
              <p class="font-semibold">
                {{ selectedTask.taskType === 'pre_checkin' ? 'チェックイン前清掃' : 'チェックアウト後清掃' }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">予定日</p>
              <p class="font-semibold">{{ formatDate(selectedTask.scheduledDate) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">予定時間</p>
              <p class="font-semibold">{{ selectedTask.estimatedDuration }}分</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">ステータス</p>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-semibold',
                  getStatusColor(selectedTask.status)
                ]"
              >
                {{ getStatusLabel(selectedTask.status) }}
              </span>
            </div>
          </div>

          <!-- チェックリスト -->
          <div>
            <h4 class="font-semibold mb-3">清掃チェックリスト</h4>
            <div class="space-y-2">
              <label
                v-for="(item, index) in selectedTask.checklist"
                :key="index"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  :checked="item.completed"
                  @change="toggleChecklistItem(index)"
                  :disabled="selectedTask.status === 'completed'"
                  class="w-5 h-5 rounded"
                />
                <span :class="item.completed ? 'line-through text-gray-400' : ''">
                  {{ item.item }}
                </span>
              </label>
            </div>
          </div>

          <!-- 作業時間記録（進行中の場合） -->
          <div v-if="selectedTask.status === 'in_progress' || selectedTask.status === 'assigned'">
            <h4 class="font-semibold mb-3">作業時間</h4>
            <div class="flex gap-4">
              <button
                v-if="!selectedTask.startTime"
                @click="startTask"
                class="btn-primary"
              >
                作業開始
              </button>
              <button
                v-else-if="!selectedTask.endTime"
                @click="endTask"
                class="btn-primary bg-green-600 hover:bg-green-700"
              >
                作業完了
              </button>
              <div v-if="selectedTask.startTime" class="text-sm text-gray-600">
                開始: {{ formatDateTime(selectedTask.startTime) }}
              </div>
            </div>
          </div>

          <!-- 完了報告（作業完了後） -->
          <div v-if="selectedTask.status === 'completed'">
            <h4 class="font-semibold mb-3">作業報告</h4>
            <div class="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
              <div>
                <p class="text-sm text-gray-600">実際の作業時間</p>
                <p class="font-semibold">{{ selectedTask.actualDuration }}分</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">報酬</p>
                <p class="font-semibold text-green-600">
                  ¥{{ (selectedTask.compensation?.totalAmount || 0).toLocaleString() }}
                </p>
              </div>
            </div>
          </div>

          <!-- 備品使用記録 -->
          <div v-if="selectedTask.status !== 'completed'">
            <h4 class="font-semibold mb-3">備品使用記録</h4>
            <div class="space-y-2">
              <div
                v-for="(supply, index) in usedSupplies"
                :key="index"
                class="flex items-center gap-2"
              >
                <input
                  v-model="supply.name"
                  type="text"
                  placeholder="備品名"
                  class="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  v-model.number="supply.quantity"
                  type="number"
                  min="1"
                  placeholder="数量"
                  class="w-20 px-3 py-2 border rounded-lg"
                />
                <button
                  @click="removeSupply(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                @click="addSupply"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + 備品を追加
              </button>
            </div>
          </div>

          <!-- メモ -->
          <div>
            <h4 class="font-semibold mb-3">メモ</h4>
            <textarea
              v-model="taskNotes"
              :disabled="selectedTask.status === 'completed'"
              rows="3"
              placeholder="作業メモを入力..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- アクションボタン -->
          <div class="flex gap-3 pt-4 border-t">
            <button
              v-if="selectedTask.status !== 'completed'"
              @click="saveTaskProgress"
              class="btn-secondary flex-1"
            >
              保存
            </button>
            <NuxtLink
              :to="`/supporter/task/${selectedTask.id}`"
              class="btn-primary flex-1 text-center"
            >
              詳細ページへ
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { CleaningTask, CleaningTaskStatus } from '~/types'

const { appUser, loading, user, logout } = useAuth()
const { getTasksBySupporter, updateTask } = useCleaningTasks()
const router = useRouter()

definePageMeta({
  layout: false,
  middleware: 'supporter'
})

// タスクデータ
const tasks = ref<CleaningTask[]>([])
const isLoading = ref(false)
const selectedTask = ref<CleaningTask | null>(null)
const taskNotes = ref('')
const usedSupplies = ref<Array<{ name: string; quantity: number }>>([])

// タブ
const tabs = [
  { id: 'today', name: '本日' },
  { id: 'pending', name: '未完了' },
  { id: 'completed', name: '完了' },
  { id: 'earnings', name: '報酬' }
]
const currentTab = ref('today')

// タスクの読み込み
const loadTasks = async () => {
  if (!appUser.value?.id) return

  isLoading.value = true
  try {
    tasks.value = await getTasksBySupporter(appUser.value.id)
  } catch (error) {
    console.error('タスク読み込みエラー:', error)
  } finally {
    isLoading.value = false
  }
}

// 認証状態を監視してデータを読み込み
watch([loading, appUser], ([isLoading, currentUser]) => {
  if (!isLoading && currentUser) {
    loadTasks()
  }
}, { immediate: true })

// Timestamp型からDateに変換するヘルパー
const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date()
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate()
  }
  return new Date(timestamp)
}

// 本日のタスク
const todayTasks = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return tasks.value.filter(task => {
    if (!task.scheduledDate) return false
    const taskDate = toDate(task.scheduledDate)
    taskDate.setHours(0, 0, 0, 0)
    return taskDate.getTime() === today.getTime()
  })
})

// 未完了タスク
const pendingTasks = computed(() => {
  return tasks.value.filter(task =>
    task.status === 'assigned' || task.status === 'in_progress'
  )
})

// 完了タスク
const completedTasks = computed(() => {
  return tasks.value.filter(task => task.status === 'completed')
})

// 今月の完了数
const monthlyCompletedCount = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return completedTasks.value.filter(task => {
    if (!task.completedAt) return false
    const completedDate = toDate(task.completedAt)
    return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear
  }).length
})

// 今月の報酬
const monthlyEarnings = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return completedTasks.value
    .filter(task => {
      if (!task.completedAt) return false
      const completedDate = toDate(task.completedAt)
      return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear
    })
    .reduce((sum, task) => sum + (task.compensation?.totalAmount || 0), 0)
})

// 今月の稼働時間
const monthlyHours = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const totalMinutes = completedTasks.value
    .filter(task => {
      if (!task.completedAt) return false
      const completedDate = toDate(task.completedAt)
      return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear
    })
    .reduce((sum, task) => sum + (task.actualDuration || 0), 0)

  return (totalMinutes / 60).toFixed(1)
})

// 未払い金額
const unpaidAmount = computed(() => {
  return completedTasks.value
    .filter(task => !task.compensation?.isPaid)
    .reduce((sum, task) => sum + (task.compensation?.totalAmount || 0), 0)
})

// タスク詳細を表示
const viewTask = (task: CleaningTask) => {
  selectedTask.value = task
  taskNotes.value = task.notes || ''
  usedSupplies.value = task.suppliesUsed ? [...task.suppliesUsed] : []
}

// チェックリストの項目をトグル
const toggleChecklistItem = async (index: number) => {
  if (!selectedTask.value) return

  const newChecklist = [...selectedTask.value.checklist]
  newChecklist[index].completed = !newChecklist[index].completed

  try {
    await updateTask(selectedTask.value.id, { checklist: newChecklist })
    selectedTask.value.checklist = newChecklist
  } catch (error) {
    console.error('チェックリスト更新エラー:', error)
  }
}

// 作業開始
const startTask = async () => {
  if (!selectedTask.value) return

  try {
    const now = new Date()
    await updateTask(selectedTask.value.id, {
      status: 'in_progress',
      startTime: now as any
    })
    selectedTask.value.status = 'in_progress'
    selectedTask.value.startTime = { toDate: () => now } as any
    await loadTasks()
  } catch (error) {
    console.error('作業開始エラー:', error)
    alert('作業開始に失敗しました')
  }
}

// 作業完了
const endTask = async () => {
  if (!selectedTask.value || !selectedTask.value.startTime) return

  const startTime = toDate(selectedTask.value.startTime)
  const endTime = new Date()
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000) // 分単位

  // 報酬計算（仮の時給1300円、交通費600円）
  const hourlyRate = appUser.value?.hourlyRate || 1300
  const transportationFee = appUser.value?.transportationFee || 600
  const workAmount = Math.round((duration / 60) * hourlyRate)
  const totalAmount = workAmount + transportationFee

  try {
    await updateTask(selectedTask.value.id, {
      status: 'completed',
      endTime: endTime as any,
      actualDuration: duration,
      completedAt: endTime as any,
      notes: taskNotes.value,
      suppliesUsed: usedSupplies.value.filter(s => s.name),
      compensation: {
        hourlyRate,
        hoursWorked: duration / 60,
        transportationFee,
        totalAmount,
        isPaid: false
      }
    })

    alert('作業完了しました')
    selectedTask.value = null
    await loadTasks()
  } catch (error) {
    console.error('作業完了エラー:', error)
    alert('作業完了の記録に失敗しました')
  }
}

// 進捗保存
const saveTaskProgress = async () => {
  if (!selectedTask.value) return

  try {
    await updateTask(selectedTask.value.id, {
      notes: taskNotes.value,
      suppliesUsed: usedSupplies.value.filter(s => s.name)
    })
    alert('保存しました')
  } catch (error) {
    console.error('保存エラー:', error)
    alert('保存に失敗しました')
  }
}

// 備品追加/削除
const addSupply = () => {
  usedSupplies.value.push({ name: '', quantity: 1 })
}

const removeSupply = (index: number) => {
  usedSupplies.value.splice(index, 1)
}

// ログアウト
const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// フォーマット関数
function formatDate(timestamp: any) {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    if (isNaN(date.getTime())) return '-'
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  } catch {
    return '-'
  }
}

function formatDateTime(timestamp: any) {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    if (isNaN(date.getTime())) return '-'
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch {
    return '-'
  }
}

function getStatusLabel(status: CleaningTaskStatus) {
  const labels: Record<CleaningTaskStatus, string> = {
    pending: '未割当',
    assigned: '割当済',
    in_progress: '作業中',
    completed: '完了',
    cancelled: 'キャンセル'
  }
  return labels[status] || status
}

function getStatusColor(status: CleaningTaskStatus) {
  const colors: Record<CleaningTaskStatus, string> = {
    pending: 'bg-gray-100 text-gray-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
</script>
