<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">
            ← 管理ダッシュボード
          </NuxtLink>
          <h1 class="text-2xl font-bold">清掃タスク管理</h1>
        </div>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- サマリーカード -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">総タスク数</h3>
          <p class="text-3xl font-bold text-blue-600">{{ tasks.length }}</p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">未割当</h3>
          <p class="text-3xl font-bold text-yellow-600">
            {{ tasks.filter(t => t.status === 'pending').length }}
          </p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">割当済</h3>
          <p class="text-3xl font-bold text-purple-600">
            {{ tasks.filter(t => t.status === 'assigned').length }}
          </p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">完了</h3>
          <p class="text-3xl font-bold text-green-600">
            {{ tasks.filter(t => t.status === 'completed').length }}
          </p>
        </div>
      </div>

      <!-- フィルタ -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
            <select v-model="filters.status" class="input-field">
              <option value="">すべて</option>
              <option value="pending">未割当</option>
              <option value="assigned">割当済</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">タスクタイプ</label>
            <select v-model="filters.type" class="input-field">
              <option value="">すべて</option>
              <option value="pre_checkin">チェックイン前</option>
              <option value="post_checkout">チェックアウト後</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">サポーター</label>
            <select v-model="filters.supporterId" class="input-field">
              <option value="">すべて</option>
              <option v-for="supporter in supporters" :key="supporter.id" :value="supporter.id">
                {{ supporter.displayName }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="applyFilters" class="btn-primary w-full">
              フィルタ適用
            </button>
          </div>
        </div>
      </div>

      <!-- タスク一覧 -->
      <div class="card">
        <h2 class="text-2xl font-semibold mb-6">タスク一覧</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="spinner w-12 h-12 mx-auto"></div>
          <p class="text-gray-600 mt-4">読み込み中...</p>
        </div>

        <div v-else-if="tasks.length === 0" class="text-center text-gray-500 py-12">
          タスクがありません
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  予約ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  タイプ
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  予定日
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ゲスト人数
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  担当者
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ステータス
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  操作
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="task in tasks" :key="task.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  {{ task.bookingReference }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs',
                      (task.taskType || task.type) === 'pre_checkin'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-orange-100 text-orange-800'
                    ]"
                  >
                    {{ (task.taskType || task.type) === 'pre_checkin' ? 'チェックイン前' : 'チェックアウト後' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ formatDate(task.scheduledDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ task.guestCount }}名
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ task.assignedToName || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs',
                      getStatusColor(task.status)
                    ]"
                  >
                    {{ getStatusLabel(task.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    v-if="task.status === 'pending'"
                    @click="openAssignModal(task)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    割り当て
                  </button>
                  <button
                    v-if="task.status === 'assigned' && task.assignedTo"
                    @click="openAssignModal(task)"
                    class="text-orange-600 hover:text-orange-900"
                  >
                    変更
                  </button>
                  <button
                    v-if="task.status === 'assigned' && task.assignedTo"
                    @click="removeAssignment(task)"
                    class="text-red-600 hover:text-red-900"
                  >
                    解除
                  </button>
                  <button
                    @click="viewTaskDetail(task)"
                    class="text-purple-600 hover:text-purple-900"
                  >
                    詳細
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- サポーター割り当てモーダル -->
    <div
      v-if="assigningTask"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeAssignModal"
    >
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-2xl font-semibold mb-6">
          {{ assigningTask.assignedTo ? 'サポーター変更' : 'サポーター割り当て' }}
        </h3>

        <form @submit.prevent="submitAssignment" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              タスク情報
            </label>
            <div class="bg-gray-50 p-3 rounded-lg text-sm">
              <p><strong>予約ID:</strong> {{ assigningTask.bookingReference }}</p>
              <p><strong>タイプ:</strong> {{ (assigningTask.taskType || assigningTask.type) === 'pre_checkin' ? 'チェックイン前' : 'チェックアウト後' }}</p>
              <p><strong>予定日:</strong> {{ formatDate(assigningTask.scheduledDate) }}</p>
              <p v-if="assigningTask.assignedToName" class="text-orange-600">
                <strong>現在の担当:</strong> {{ assigningTask.assignedToName }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ assigningTask.assignedTo ? '新しいサポーター' : 'サポーター' }} <span class="text-red-500">*</span>
            </label>
            <select v-model="selectedSupporterId" required class="input-field">
              <option value="">選択してください</option>
              <option
                v-for="supporter in activeSupporters"
                :key="supporter.id"
                :value="supporter.id"
              >
                {{ supporter.displayName }} (時給: ¥{{ supporter.hourlyRate?.toLocaleString() || 0 }})
              </option>
            </select>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="submit" :disabled="!selectedSupporterId || assigning" class="btn-primary flex-1">
              {{ assigning ? '処理中...' : (assigningTask.assignedTo ? '変更する' : '割り当て') }}
            </button>
            <button type="button" @click="closeAssignModal" class="btn-secondary flex-1">
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- タスク詳細モーダル -->
    <div
      v-if="viewingTask"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      @click="closeDetailModal"
    >
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 my-8" @click.stop>
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-semibold">タスク詳細</h3>
          <button @click="closeDetailModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- 基本情報 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">予約ID</label>
              <p class="font-semibold">{{ viewingTask.bookingReference }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">タイプ</label>
              <p class="font-semibold">
                {{ (viewingTask.taskType || viewingTask.type) === 'pre_checkin' ? 'チェックイン前' : 'チェックアウト後' }}
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">予定日</label>
              <p class="font-semibold">{{ formatDate(viewingTask.scheduledDate) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">ゲスト人数</label>
              <p class="font-semibold">{{ viewingTask.guestCount }}名</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">担当者</label>
              <p class="font-semibold">{{ viewingTask.assignedToName || '未割当' }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">ステータス</label>
              <p>
                <span :class="['px-2 py-1 rounded-full text-xs', getStatusColor(viewingTask.status)]">
                  {{ getStatusLabel(viewingTask.status) }}
                </span>
              </p>
            </div>
          </div>

          <!-- 作業時間と報酬 -->
          <div v-if="viewingTask.startedAt || viewingTask.completedAt" class="bg-blue-50 p-4 rounded-lg">
            <h4 class="font-semibold mb-2">作業時間・報酬</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label class="text-gray-600">開始時刻</label>
                <p>{{ viewingTask.startedAt ? formatDateTime(viewingTask.startedAt) : '-' }}</p>
              </div>
              <div>
                <label class="text-gray-600">完了時刻</label>
                <p>{{ viewingTask.completedAt ? formatDateTime(viewingTask.completedAt) : '-' }}</p>
              </div>
              <div>
                <label class="text-gray-600">作業時間</label>
                <p>{{ viewingTask.actualHours ? viewingTask.actualHours.toFixed(2) + '時間' : '-' }}</p>
              </div>
              <div>
                <label class="text-gray-600">報酬額</label>
                <p class="font-semibold text-lg">
                  ¥{{ viewingTask.compensation?.calculatedAmount?.toLocaleString() || 0 }}
                </p>
              </div>
              <div>
                <label class="text-gray-600">支払い状態</label>
                <p>
                  <span :class="[
                    'px-2 py-1 rounded-full text-xs',
                    viewingTask.compensation?.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ viewingTask.compensation?.isPaid ? '支払い済み' : '未払い' }}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <!-- チェックリスト -->
          <div v-if="viewingTask.checklist?.length > 0">
            <h4 class="font-semibold mb-2">清掃チェックリスト</h4>
            <div class="bg-gray-50 p-4 rounded-lg space-y-2">
              <div v-for="(item, index) in viewingTask.checklist" :key="index" class="flex items-center gap-2">
                <input type="checkbox" :checked="item.completed" disabled class="rounded" />
                <span :class="{ 'line-through text-gray-400': item.completed }">
                  {{ item.item || item.label }}
                </span>
                <span v-if="item.isCustom" class="text-xs text-purple-600">(カスタム)</span>
              </div>
            </div>
          </div>

          <!-- 写真 -->
          <div v-if="viewingTask.photos?.length > 0">
            <h4 class="font-semibold mb-2">清掃完了写真</h4>
            <div class="grid grid-cols-3 gap-2">
              <img
                v-for="photo in viewingTask.photos"
                :key="photo.id"
                :src="photo.url"
                :alt="'清掃写真'"
                class="rounded-lg w-full h-32 object-cover cursor-pointer hover:opacity-80"
                @click="openPhotoModal(photo.url)"
              />
            </div>
          </div>

          <!-- 使用備品 -->
          <div v-if="viewingTask.suppliesUsed?.length > 0">
            <h4 class="font-semibold mb-2">使用備品</h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div v-for="supply in viewingTask.suppliesUsed" :key="supply.name" class="text-sm">
                {{ supply.name }}: {{ supply.quantity }}個
              </div>
            </div>
          </div>

          <!-- ノート -->
          <div v-if="viewingTask.notes">
            <h4 class="font-semibold mb-2">サポーターメモ</h4>
            <p class="bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap">{{ viewingTask.notes }}</p>
          </div>

          <div v-if="viewingTask.adminNotes">
            <h4 class="font-semibold mb-2">管理者メモ</h4>
            <p class="bg-yellow-50 p-3 rounded-lg text-sm whitespace-pre-wrap">{{ viewingTask.adminNotes }}</p>
          </div>

          <!-- アクションボタン -->
          <div class="flex gap-3 pt-4 border-t">
            <button
              v-if="viewingTask.status === 'completed' && !viewingTask.compensation?.isPaid"
              @click="markTaskAsPaid(viewingTask.id)"
              class="btn-primary flex-1"
            >
              支払い済みにする
            </button>
            <button @click="closeDetailModal" class="btn-secondary flex-1">
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import type { CleaningTask, User } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { $db } = useNuxtApp()
const { assignTask, unassignTask, markAsPaid } = useCleaningTasks()
const { csrf } = useCsrf()

const tasks = ref<CleaningTask[]>([])
const supporters = ref<User[]>([])
const loading = ref(false)
const assigningTask = ref<CleaningTask | null>(null)
const viewingTask = ref<CleaningTask | null>(null)
const selectedSupporterId = ref('')
const assigning = ref(false)

const filters = ref({
  status: '',
  type: '',
  supporterId: ''
})

// アクティブなサポーターのみ
const activeSupporters = computed(() => supporters.value.filter(s => s.isActive !== false))

// タスク一覧を読み込み
const loadAllTasks = async () => {
  loading.value = true
  try {
    const tasksRef = collection($db, 'cleaningTasks')
    const q = query(tasksRef, orderBy('scheduledDate', 'desc'))
    const snapshot = await getDocs(q)
    tasks.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CleaningTask[]
  } catch (error) {
    console.error('❌ タスク読み込みエラー:', error)
    alert('タスクの読み込みに失敗しました')
  } finally {
    loading.value = false
  }
}

// サポーター一覧を読み込み（supportersコレクションから）
const loadSupporters = async () => {
  try {
    const supportersRef = collection($db, 'supporters')
    const snapshot = await getDocs(supportersRef)
    supporters.value = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        uid: data.uid,
        email: data.email,
        displayName: data.name || data.displayName,
        phone: data.phone,
        hourlyRate: data.hourlyRate,
        transportationFee: data.transportationFee,
        isActive: data.isActive,
        role: 'supporter'
      }
    }) as User[]
  } catch (error) {
    console.error('❌ サポーター読み込みエラー:', error)
  }
}

// フィルタ適用
const applyFilters = async () => {
  loading.value = true
  try {
    const tasksRef = collection($db, 'cleaningTasks')
    const constraints: any[] = [orderBy('scheduledDate', 'desc')]

    if (filters.value.status) {
      constraints.push(where('status', '==', filters.value.status))
    }
    if (filters.value.type) {
      constraints.push(where('type', '==', filters.value.type))
    }
    if (filters.value.supporterId) {
      constraints.push(where('assignedTo', '==', filters.value.supporterId))
    }

    const q = query(tasksRef, ...constraints)
    const snapshot = await getDocs(q)
    tasks.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CleaningTask[]
  } catch (error) {
    console.error('❌ フィルタ適用エラー:', error)
    alert('フィルタの適用に失敗しました')
  } finally {
    loading.value = false
  }
}

// サポーター割り当てモーダルを開く
const openAssignModal = (task: CleaningTask) => {
  assigningTask.value = task
  selectedSupporterId.value = ''
}

// サポーター割り当てモーダルを閉じる
const closeAssignModal = () => {
  assigningTask.value = null
  selectedSupporterId.value = ''
}

// サポーター割り当て実行
const submitAssignment = async () => {
  if (!assigningTask.value || !selectedSupporterId.value) return

  assigning.value = true
  try {
    const supporter = supporters.value.find(s => s.id === selectedSupporterId.value)
    if (!supporter) throw new Error('サポーターが見つかりません')

    await assignTask(assigningTask.value.id, supporter.id, supporter.displayName)

    // 割り当て通知メールを送信
    try {
      await $fetch('/api/emails/send-task-assignment', {
        method: 'POST',
        headers: {
          'csrf-token': csrf
        },
        body: {
          to: supporter.email,
          supporterName: supporter.displayName,
          taskType: assigningTask.value.taskType || assigningTask.value.type,
          scheduledDate: formatDate(assigningTask.value.scheduledDate),
          bookingReference: assigningTask.value.bookingReference,
          estimatedDuration: assigningTask.value.estimatedDuration
        }
      })
      console.log('✅ 割り当て通知メール送信完了')
    } catch (emailError) {
      console.error('❌ 通知メール送信エラー:', emailError)
      // メール送信エラーは致命的ではないので続行
    }

    alert('サポーターを割り当てました（通知メールを送信しました）')
    closeAssignModal()
    await loadAllTasks()
  } catch (error) {
    console.error('❌ 割り当てエラー:', error)
    alert('サポーターの割り当てに失敗しました')
  } finally {
    assigning.value = false
  }
}

// タスク割り当て解除
const removeAssignment = async (task: CleaningTask) => {
  if (!confirm(`${task.assignedToName} さんの割り当てを解除しますか？\nタスクは「未割当」状態に戻ります。`)) {
    return
  }

  try {
    await unassignTask(task.id)
    alert('割り当てを解除しました')
    await loadAllTasks()
  } catch (error) {
    console.error('❌ 割り当て解除エラー:', error)
    alert('割り当ての解除に失敗しました')
  }
}

// タスク詳細を表示
const viewTaskDetail = (task: CleaningTask) => {
  viewingTask.value = task
}

// タスク詳細モーダルを閉じる
const closeDetailModal = () => {
  viewingTask.value = null
}

// タスクを支払い済みにする
const markTaskAsPaid = async (taskId: string) => {
  if (!confirm('このタスクを支払い済みにしますか？')) return

  try {
    await markAsPaid(taskId)
    alert('支払い済みにしました')
    await loadAllTasks()
    closeDetailModal()
  } catch (error) {
    console.error('❌ 支払い記録エラー:', error)
    alert('支払い記録に失敗しました')
  }
}

// 写真モーダルを開く
const openPhotoModal = (url: string) => {
  window.open(url, '_blank')
}

// 日付フォーマット
const formatDate = (timestamp: any) => {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  } catch {
    return '-'
  }
}

// 日時フォーマット
const formatDateTime = (timestamp: any) => {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch {
    return '-'
  }
}

// ステータスラベル
const getStatusLabel = (status: string) => {
  const labels: any = {
    pending: '未割当',
    assigned: '割当済',
    completed: '完了',
    cancelled: 'キャンセル'
  }
  return labels[status] || status
}

// ステータスカラー
const getStatusColor = (status: string) => {
  const colors: any = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  loadAllTasks()
  loadSupporters()
})
</script>
