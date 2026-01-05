<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4">
        <div class="flex items-center gap-4">
          <NuxtLink to="/supporter" class="p-2 hover:bg-gray-100 rounded-lg transition-custom">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">タスク詳細</h1>
            <p class="text-sm text-gray-600">{{ taskTypeLabel }}</p>
          </div>
        </div>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- ローディング -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        <p class="mt-4 text-gray-600">読み込み中...</p>
      </div>

      <!-- タスクが見つからない -->
      <div v-else-if="!task" class="card text-center py-12">
        <p class="text-gray-500 mb-4">タスクが見つかりません</p>
        <NuxtLink to="/supporter" class="btn-primary">ダッシュボードへ戻る</NuxtLink>
      </div>

      <!-- タスク詳細 -->
      <div v-else class="space-y-6">
        <!-- ステータスバナー -->
        <div
          :class="[
            'p-4 rounded-xl flex items-center justify-between',
            statusBannerStyle
          ]"
        >
          <div>
            <p class="text-sm opacity-80">ステータス</p>
            <p class="text-xl font-bold">{{ statusLabel }}</p>
          </div>
          <div v-if="task.status === 'in_progress' && task.startTime" class="text-right">
            <p class="text-sm opacity-80">経過時間</p>
            <p class="text-xl font-bold">{{ elapsedTime }}</p>
          </div>
        </div>

        <!-- 基本情報 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">基本情報</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600">予定日</p>
              <p class="font-semibold">{{ formatDate(task.scheduledDate) }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">タスクタイプ</p>
              <p class="font-semibold">{{ taskTypeLabel }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">予定作業時間</p>
              <p class="font-semibold">{{ task.estimatedDuration }}分</p>
            </div>
            <div v-if="task.actualDuration">
              <p class="text-sm text-gray-600">実際の作業時間</p>
              <p class="font-semibold">{{ task.actualDuration }}分</p>
            </div>
          </div>
        </div>

        <!-- 作業コントロール -->
        <div v-if="task.status !== 'completed' && task.status !== 'cancelled'" class="card">
          <h2 class="text-xl font-semibold mb-4">作業管理</h2>

          <!-- 作業開始前 -->
          <div v-if="!task.startTime" class="text-center py-6">
            <p class="text-gray-600 mb-4">作業を開始する準備ができたらボタンを押してください</p>
            <button
              @click="startTask"
              :disabled="saving"
              class="btn-primary text-lg px-8 py-3"
            >
              作業開始
            </button>
          </div>

          <!-- 作業中 -->
          <div v-else-if="!task.endTime" class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-yellow-700">作業開始時刻</p>
                  <p class="font-semibold text-yellow-800">{{ formatDateTime(task.startTime) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-yellow-700">経過時間</p>
                  <p class="text-2xl font-bold text-yellow-800">{{ elapsedTime }}</p>
                </div>
              </div>
            </div>

            <div class="text-center">
              <button
                @click="showCompleteConfirm = true"
                :disabled="saving"
                class="btn-primary bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
              >
                作業完了
              </button>
            </div>
          </div>
        </div>

        <!-- チェックリスト -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">清掃チェックリスト</h2>
          <div v-if="!task.checklist || task.checklist.length === 0" class="text-center py-6 text-gray-500">
            チェックリストはありません
          </div>
          <div v-else class="space-y-3">
            <label
              v-for="(item, index) in task.checklist"
              :key="index"
              :class="[
                'flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all',
                item.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
              ]"
            >
              <input
                type="checkbox"
                :checked="item.completed"
                @change="toggleChecklistItem(index)"
                :disabled="task.status === 'completed' || saving"
                class="w-6 h-6 rounded"
              />
              <span
                :class="[
                  'flex-1',
                  item.completed ? 'line-through text-gray-400' : 'text-gray-900'
                ]"
              >
                {{ item.item }}
              </span>
              <span v-if="item.completed" class="text-green-600">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            </label>
          </div>
          <div class="mt-4 text-sm text-gray-600">
            完了: {{ completedChecklistCount }} / {{ task.checklist?.length || 0 }} 項目
          </div>
        </div>

        <!-- 備品使用記録 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">備品使用記録</h2>
          <div v-if="task.status !== 'completed'" class="space-y-3">
            <div
              v-for="(supply, index) in supplies"
              :key="index"
              class="flex items-center gap-3"
            >
              <input
                v-model="supply.name"
                type="text"
                placeholder="備品名（例：トイレットペーパー）"
                class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                v-model.number="supply.quantity"
                type="number"
                min="1"
                placeholder="数量"
                class="w-24 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                @click="removeSupply(index)"
                class="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <button
              @click="addSupply"
              class="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              備品を追加
            </button>
          </div>
          <div v-else>
            <div v-if="!task.suppliesUsed || task.suppliesUsed.length === 0" class="text-gray-500">
              備品の使用記録はありません
            </div>
            <ul v-else class="space-y-2">
              <li v-for="(supply, index) in task.suppliesUsed" :key="index" class="flex justify-between">
                <span>{{ supply.name }}</span>
                <span class="font-semibold">{{ supply.quantity }}個</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- メモ -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">作業メモ</h2>
          <textarea
            v-model="notes"
            :disabled="task.status === 'completed'"
            rows="4"
            placeholder="気づいた点や報告事項を記入してください..."
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        <!-- 写真アップロード（将来実装） -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">写真報告</h2>
          <div class="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>写真アップロード機能は準備中です</p>
          </div>
        </div>

        <!-- 報酬情報（完了時のみ） -->
        <div v-if="task.status === 'completed' && task.compensation" class="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
          <h2 class="text-xl font-semibold mb-4 text-green-800">報酬情報</h2>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-green-700">稼働時間</span>
              <span class="font-semibold">{{ task.compensation.hoursWorked?.toFixed(2) }}時間</span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-700">時給</span>
              <span class="font-semibold">¥{{ task.compensation.hourlyRate?.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-700">作業報酬</span>
              <span class="font-semibold">
                ¥{{ Math.round((task.compensation.hoursWorked || 0) * (task.compensation.hourlyRate || 0)).toLocaleString() }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-green-700">交通費</span>
              <span class="font-semibold">¥{{ task.compensation.transportationFee?.toLocaleString() }}</span>
            </div>
            <hr class="border-green-300">
            <div class="flex justify-between text-lg">
              <span class="font-semibold text-green-800">合計（税込）</span>
              <span class="font-bold text-green-600">¥{{ task.compensation.totalAmount?.toLocaleString() }}</span>
            </div>
            <div class="mt-4 pt-4 border-t border-green-300">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-semibold',
                  task.compensation.isPaid ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
                ]"
              >
                {{ task.compensation.isPaid ? '支払い済み' : '未払い' }}
              </span>
            </div>
          </div>
        </div>

        <!-- 保存ボタン -->
        <div v-if="task.status !== 'completed'" class="flex gap-4">
          <button
            @click="saveProgress"
            :disabled="saving"
            class="btn-secondary flex-1"
          >
            {{ saving ? '保存中...' : '進捗を保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 作業完了確認モーダル -->
    <div
      v-if="showCompleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showCompleteConfirm = false"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-md w-full mx-4"
        @click.stop
      >
        <h3 class="text-xl font-semibold mb-4">作業完了の確認</h3>
        <p class="text-gray-600 mb-6">
          作業を完了としてマークします。この操作は取り消せません。よろしいですか？
        </p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between mb-2">
            <span class="text-gray-600">経過時間</span>
            <span class="font-semibold">{{ elapsedTime }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">チェックリスト</span>
            <span class="font-semibold">{{ completedChecklistCount }} / {{ task?.checklist?.length || 0 }} 完了</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showCompleteConfirm = false"
            class="btn-secondary flex-1"
          >
            キャンセル
          </button>
          <button
            @click="completeTask"
            :disabled="saving"
            class="btn-primary bg-green-600 hover:bg-green-700 flex-1"
          >
            {{ saving ? '処理中...' : '完了する' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { CleaningTask, CleaningTaskStatus } from '~/types'

const route = useRoute()
const router = useRouter()
const { appUser, loading } = useAuth()
const { getTask, updateTask } = useCleaningTasks()

definePageMeta({
  layout: false,
  middleware: 'supporter'
})

// 状態
const task = ref<CleaningTask | null>(null)
const isLoading = ref(true)
const saving = ref(false)
const notes = ref('')
const supplies = ref<Array<{ name: string; quantity: number }>>([])
const showCompleteConfirm = ref(false)
const elapsedSeconds = ref(0)
let elapsedTimer: ReturnType<typeof setInterval> | null = null

// Timestamp型からDateに変換するヘルパー
const toDate = (timestamp: any): Date => {
  if (!timestamp) return new Date()
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate()
  }
  return new Date(timestamp)
}

// タスクの読み込み
const loadTask = async () => {
  const taskId = route.params.id as string
  if (!taskId) return

  isLoading.value = true
  try {
    task.value = await getTask(taskId)
    if (task.value) {
      notes.value = task.value.notes || ''
      supplies.value = task.value.suppliesUsed ? [...task.value.suppliesUsed] : []

      // 作業中の場合、経過時間タイマーを開始
      if (task.value.status === 'in_progress' && task.value.startTime) {
        startElapsedTimer()
      }
    }
  } catch (error) {
    console.error('タスク読み込みエラー:', error)
  } finally {
    isLoading.value = false
  }
}

// 認証状態を監視してデータを読み込み
watch([loading, appUser], ([isLoadingAuth, currentUser]) => {
  if (!isLoadingAuth && currentUser) {
    loadTask()
  }
}, { immediate: true })

// 経過時間タイマー
const startElapsedTimer = () => {
  if (elapsedTimer) clearInterval(elapsedTimer)

  const updateElapsed = () => {
    if (!task.value?.startTime) return
    const startTime = toDate(task.value.startTime)
    elapsedSeconds.value = Math.floor((Date.now() - startTime.getTime()) / 1000)
  }

  updateElapsed()
  elapsedTimer = setInterval(updateElapsed, 1000)
}

onUnmounted(() => {
  if (elapsedTimer) clearInterval(elapsedTimer)
})

// 経過時間の表示
const elapsedTime = computed(() => {
  const hours = Math.floor(elapsedSeconds.value / 3600)
  const minutes = Math.floor((elapsedSeconds.value % 3600) / 60)
  const seconds = elapsedSeconds.value % 60

  if (hours > 0) {
    return `${hours}時間${minutes}分${seconds}秒`
  }
  return `${minutes}分${seconds}秒`
})

// タスクタイプのラベル
const taskTypeLabel = computed(() => {
  return task.value?.taskType === 'pre_checkin'
    ? 'チェックイン前清掃'
    : 'チェックアウト後清掃'
})

// ステータスのラベル
const statusLabel = computed(() => {
  if (!task.value) return ''
  const labels: Record<CleaningTaskStatus, string> = {
    pending: '未割当',
    assigned: '割当済み',
    in_progress: '作業中',
    completed: '完了',
    cancelled: 'キャンセル'
  }
  return labels[task.value.status] || task.value.status
})

// ステータスバナーのスタイル
const statusBannerStyle = computed(() => {
  if (!task.value) return ''
  const styles: Record<CleaningTaskStatus, string> = {
    pending: 'bg-gray-100 text-gray-800',
    assigned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return styles[task.value.status] || 'bg-gray-100 text-gray-800'
})

// チェックリスト完了数
const completedChecklistCount = computed(() => {
  if (!task.value?.checklist) return 0
  return task.value.checklist.filter(item => item.completed).length
})

// チェックリストの項目をトグル
const toggleChecklistItem = async (index: number) => {
  if (!task.value) return

  const newChecklist = [...task.value.checklist]
  newChecklist[index].completed = !newChecklist[index].completed

  saving.value = true
  try {
    await updateTask(task.value.id, { checklist: newChecklist })
    task.value.checklist = newChecklist
  } catch (error) {
    console.error('チェックリスト更新エラー:', error)
    alert('更新に失敗しました')
  } finally {
    saving.value = false
  }
}

// 作業開始
const startTask = async () => {
  if (!task.value) return

  saving.value = true
  try {
    const startTime = new Date()
    await updateTask(task.value.id, {
      status: 'in_progress',
      startTime: startTime as any
    })
    task.value.status = 'in_progress'
    task.value.startTime = { toDate: () => startTime } as any
    startElapsedTimer()
  } catch (error) {
    console.error('作業開始エラー:', error)
    alert('作業開始に失敗しました')
  } finally {
    saving.value = false
  }
}

// 作業完了
const completeTask = async () => {
  if (!task.value || !task.value.startTime) return

  const startTime = toDate(task.value.startTime)
  const endTime = new Date()
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000) // 分単位

  // 報酬計算
  const hourlyRate = appUser.value?.hourlyRate || 1300
  const transportationFee = appUser.value?.transportationFee || 600
  const hoursWorked = duration / 60
  const workAmount = Math.round(hoursWorked * hourlyRate)
  const totalAmount = workAmount + transportationFee

  saving.value = true
  try {
    await updateTask(task.value.id, {
      status: 'completed',
      endTime: endTime as any,
      actualDuration: duration,
      completedAt: endTime as any,
      notes: notes.value,
      suppliesUsed: supplies.value.filter(s => s.name),
      compensation: {
        hourlyRate,
        hoursWorked,
        transportationFee,
        totalAmount,
        isPaid: false
      }
    })

    // タスクを更新
    task.value.status = 'completed'
    task.value.endTime = { toDate: () => endTime } as any
    task.value.actualDuration = duration
    task.value.compensation = {
      hourlyRate,
      hoursWorked,
      transportationFee,
      totalAmount,
      isPaid: false
    }

    showCompleteConfirm.value = false
    if (elapsedTimer) clearInterval(elapsedTimer)

    alert('作業完了しました！お疲れ様でした。')
  } catch (error) {
    console.error('作業完了エラー:', error)
    alert('作業完了の記録に失敗しました')
  } finally {
    saving.value = false
  }
}

// 進捗を保存
const saveProgress = async () => {
  if (!task.value) return

  saving.value = true
  try {
    await updateTask(task.value.id, {
      notes: notes.value,
      suppliesUsed: supplies.value.filter(s => s.name)
    })
    alert('保存しました')
  } catch (error) {
    console.error('保存エラー:', error)
    alert('保存に失敗しました')
  } finally {
    saving.value = false
  }
}

// 備品追加/削除
const addSupply = () => {
  supplies.value.push({ name: '', quantity: 1 })
}

const removeSupply = (index: number) => {
  supplies.value.splice(index, 1)
}

// フォーマット関数
function formatDate(timestamp: any) {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    if (isNaN(date.getTime())) return '-'
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
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
</script>
