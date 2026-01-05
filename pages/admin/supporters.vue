<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">
            ← 管理ダッシュボード
          </NuxtLink>
          <h1 class="text-2xl font-bold">サポーター管理</h1>
        </div>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- サマリーカード -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">登録サポーター数</h3>
          <p class="text-3xl font-bold text-blue-600">{{ supporters.length }}</p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">アクティブサポーター</h3>
          <p class="text-3xl font-bold text-green-600">
            {{ supporters.filter(s => s.isActive !== false).length }}
          </p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">平均時給</h3>
          <p class="text-3xl font-bold text-purple-600">
            ¥{{ averageHourlyRate.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- サポーター追加ボタン -->
      <div class="mb-6">
        <button @click="showAddModal = true" class="btn-primary">
          + サポーターを追加
        </button>
      </div>

      <!-- サポーター一覧 -->
      <div class="card">
        <h2 class="text-2xl font-semibold mb-6">サポーター一覧</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="spinner w-12 h-12 mx-auto"></div>
          <p class="text-gray-600 mt-4">読み込み中...</p>
        </div>

        <div v-else-if="supporters.length === 0" class="text-center text-gray-500 py-12">
          まだサポーターが登録されていません
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  氏名
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  メール
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  電話番号
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  時給
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  交通費
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
              <tr v-for="supporter in supporters" :key="supporter.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="font-semibold">{{ supporter.displayName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ supporter.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ supporter.phone || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  ¥{{ (supporter.hourlyRate || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  ¥{{ (supporter.transportationFee || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs',
                      supporter.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ supporter.isActive ? 'アクティブ' : '非アクティブ' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    @click="editSupporter(supporter)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    編集
                  </button>
                  <button
                    @click="toggleSupporterStatus(supporter)"
                    class="text-purple-600 hover:text-purple-900"
                  >
                    {{ supporter.isActive ? '無効化' : '有効化' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- サポーター追加/編集モーダル -->
    <div
      v-if="showAddModal || editingSupporter"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
        @click.stop
      >
        <h3 class="text-2xl font-semibold mb-6">
          {{ editingSupporter ? 'サポーター編集' : 'サポーター追加' }}
        </h3>

        <form @submit.prevent="submitSupporter" class="space-y-4">
          <!-- 氏名 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              氏名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="supporterForm.displayName"
              type="text"
              required
              class="input-field"
              placeholder="山田太郎"
            />
          </div>

          <!-- メールアドレス -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span class="text-red-500">*</span>
            </label>
            <input
              v-model="supporterForm.email"
              type="email"
              required
              :disabled="!!editingSupporter"
              class="input-field"
              placeholder="supporter@example.com"
            />
            <p v-if="editingSupporter" class="text-xs text-gray-500 mt-1">
              メールアドレスは編集できません
            </p>
          </div>

          <!-- パスワード（新規追加時のみ） -->
          <div v-if="!editingSupporter">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              パスワード <span class="text-red-500">*</span>
            </label>
            <input
              v-model="supporterForm.password"
              type="password"
              required
              minlength="6"
              class="input-field"
              placeholder="6文字以上"
            />
          </div>

          <!-- 電話番号 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              電話番号
            </label>
            <input
              v-model="supporterForm.phone"
              type="tel"
              class="input-field"
              placeholder="090-1234-5678"
            />
          </div>

          <!-- 時給 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              時給 <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <span class="text-gray-600">¥</span>
              <input
                v-model.number="supporterForm.hourlyRate"
                type="number"
                required
                min="0"
                class="input-field"
                placeholder="1500"
              />
            </div>
          </div>

          <!-- 交通費 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              交通費 <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <span class="text-gray-600">¥</span>
              <input
                v-model.number="supporterForm.transportationFee"
                type="number"
                required
                min="0"
                class="input-field"
                placeholder="500"
              />
            </div>
          </div>

          <!-- アクティブ状態 -->
          <div>
            <label class="flex items-center gap-2">
              <input
                v-model="supporterForm.isActive"
                type="checkbox"
                class="rounded"
              />
              <span class="text-sm font-medium text-gray-700">アクティブ</span>
            </label>
          </div>

          <!-- ボタン -->
          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="btn-primary flex-1"
            >
              {{ submitting ? '処理中...' : editingSupporter ? '更新' : '追加' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="btn-secondary flex-1"
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
import { ref, computed, onMounted, watch } from 'vue'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'
import type { User } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

const { $db } = useNuxtApp()
const { loading: authLoading, user } = useAuth()
const { csrf } = useCsrf()

const supporters = ref<User[]>([])
const loading = ref(false)
const showAddModal = ref(false)
const editingSupporter = ref<User | null>(null)
const submitting = ref(false)
const dataLoaded = ref(false)

const supporterForm = ref({
  displayName: '',
  email: '',
  password: '',
  phone: '',
  hourlyRate: 1500,
  transportationFee: 500,
  isActive: true
})

// 平均時給を計算
const averageHourlyRate = computed(() => {
  if (supporters.value.length === 0) return 0
  const total = supporters.value.reduce((sum, s) => sum + (s.hourlyRate || 0), 0)
  return Math.round(total / supporters.value.length)
})

// サポーター一覧を読み込み（supportersコレクションから）
const loadSupporters = async () => {
  loading.value = true
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

    console.log('✅ サポーター読み込み完了:', supporters.value.length, '人')
  } catch (error: any) {
    console.error('❌ サポーター読み込みエラー:', error)
    alert('サポーター情報の読み込みに失敗しました')
  } finally {
    loading.value = false
  }
}

// サポーター編集
const editSupporter = (supporter: User) => {
  editingSupporter.value = supporter
  supporterForm.value = {
    displayName: supporter.displayName,
    email: supporter.email,
    password: '',
    phone: supporter.phone || '',
    hourlyRate: supporter.hourlyRate || 1500,
    transportationFee: supporter.transportationFee || 500,
    isActive: supporter.isActive !== false
  }
}

// モーダルを閉じる
const closeModal = () => {
  showAddModal.value = false
  editingSupporter.value = null
  supporterForm.value = {
    displayName: '',
    email: '',
    password: '',
    phone: '',
    hourlyRate: 1500,
    transportationFee: 500,
    isActive: true
  }
}

// サポーター追加/更新
const submitSupporter = async () => {
  submitting.value = true
  try {
    if (editingSupporter.value) {
      // 更新（supportersコレクション）
      const supporterRef = doc($db, 'supporters', editingSupporter.value.id)
      await updateDoc(supporterRef, {
        name: supporterForm.value.displayName,
        phone: supporterForm.value.phone,
        hourlyRate: supporterForm.value.hourlyRate,
        transportationFee: supporterForm.value.transportationFee,
        isActive: supporterForm.value.isActive,
        updatedAt: new Date()
      })
      alert('サポーター情報を更新しました')
    } else {
      // 新規追加 - サーバー側APIを使用（現在の管理者セッションに影響しない）
      const response = await $fetch('/api/admin/create-supporter', {
        method: 'POST',
        headers: {
          'csrf-token': csrf
        },
        body: {
          email: supporterForm.value.email,
          password: supporterForm.value.password,
          displayName: supporterForm.value.displayName,
          phone: supporterForm.value.phone,
          hourlyRate: supporterForm.value.hourlyRate,
          transportationFee: supporterForm.value.transportationFee,
          isActive: supporterForm.value.isActive
        }
      })

      console.log('✅ サポーター作成完了:', response)
      alert('サポーターを追加しました')
    }

    closeModal()
    await loadSupporters()
  } catch (error: any) {
    console.error('❌ サポーター登録/更新エラー:', error)
    const message = error.data?.statusMessage || error.message || 'エラーが発生しました'
    alert('サポーターの登録/更新に失敗しました: ' + message)
  } finally {
    submitting.value = false
  }
}

// サポーターのアクティブ状態を切り替え
const toggleSupporterStatus = async (supporter: User) => {
  const newStatus = !supporter.isActive
  const action = newStatus ? '有効化' : '無効化'

  if (!confirm(`${supporter.displayName}さんを${action}しますか？`)) {
    return
  }

  try {
    const supporterRef = doc($db, 'supporters', supporter.id)
    await updateDoc(supporterRef, {
      isActive: newStatus,
      updatedAt: new Date()
    })

    alert(`${supporter.displayName}さんを${action}しました`)
    await loadSupporters()
  } catch (error) {
    console.error('❌ ステータス更新エラー:', error)
    alert('ステータスの更新に失敗しました')
  }
}

// 認証状態を監視してデータを読み込み
watch([authLoading, user], ([isLoading, currentUser]) => {
  if (!isLoading && currentUser && !dataLoaded.value) {
    dataLoaded.value = true
    loadSupporters()
  }
}, { immediate: true })
</script>
