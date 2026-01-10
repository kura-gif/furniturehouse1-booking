<template>
  <div class="min-h-screen bg-gray-50">
    <AdminHeader />

    <div class="container-responsive py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">オプション管理</h1>
          <p class="text-sm text-gray-600 mt-1">予約時に追加できるオプションを管理します</p>
        </div>
        <button
          @click="openCreateModal"
          class="btn-primary flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新規オプション
        </button>
      </div>

      <!-- ローディング -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>

      <!-- オプション一覧 -->
      <div v-else-if="options.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="option in options"
          :key="option.id"
          class="bg-white rounded-lg shadow-sm border overflow-hidden"
        >
          <!-- 画像 -->
          <div class="aspect-video bg-gray-100 relative">
            <img
              v-if="option.imageUrl"
              :src="option.imageUrl"
              :alt="option.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <!-- ステータスバッジ -->
            <span
              :class="[
                'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium',
                option.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              ]"
            >
              {{ option.isActive ? '有効' : '無効' }}
            </span>
          </div>

          <!-- コンテンツ -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-1">{{ option.name }}</h3>
            <p class="text-sm text-gray-600 line-clamp-2 mb-3">{{ option.description || '説明なし' }}</p>

            <div class="flex items-center justify-between text-sm mb-4">
              <span class="text-purple-600 font-bold">¥{{ option.price.toLocaleString() }}</span>
              <span class="text-gray-500">1日{{ option.dailyLimit }}件まで</span>
            </div>

            <div class="flex gap-2">
              <button
                @click="openEditModal(option)"
                class="flex-1 btn-secondary text-sm"
              >
                編集
              </button>
              <button
                @click="toggleActive(option)"
                :class="[
                  'flex-1 text-sm py-2 px-3 rounded-lg transition-colors',
                  option.isActive
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                ]"
              >
                {{ option.isActive ? '無効化' : '有効化' }}
              </button>
              <button
                @click="confirmDelete(option)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状態 -->
      <div v-else class="bg-white rounded-lg shadow-sm p-12 text-center">
        <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">オプションがありません</h3>
        <p class="text-gray-500 mb-6">BBQ設備やレンタサイクルなど、予約時に追加できるオプションを作成しましょう</p>
        <button @click="openCreateModal" class="btn-primary">
          最初のオプションを作成
        </button>
      </div>
    </div>

    <!-- 作成/編集モーダル -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold text-gray-900">
            {{ editingOption ? 'オプションを編集' : '新規オプション' }}
          </h2>
        </div>

        <form @submit.prevent="saveOption" class="p-6 space-y-4">
          <!-- オプション名 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              オプション名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="例: BBQ設備セット"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <!-- 説明 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="オプションの詳細説明を入力..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          <!-- 画像アップロード -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">サムネイル画像</label>
            <div class="space-y-3">
              <!-- 現在の画像プレビュー -->
              <div v-if="form.imageUrl || imagePreview" class="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  :src="imagePreview || form.imageUrl"
                  alt="プレビュー"
                  class="w-full h-full object-cover"
                />
                <button
                  type="button"
                  @click="removeImage"
                  class="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- アップロードエリア -->
              <div
                v-else
                class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                @click="fileInput?.click()"
                @dragover.prevent
                @drop.prevent="handleDrop"
              >
                <svg class="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-sm text-gray-600">クリックまたはドラッグ＆ドロップ</p>
                <p class="text-xs text-gray-400 mt-1">PNG, JPG, WEBP（最大5MB）</p>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
            </div>
          </div>

          <!-- 料金 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              料金（税込） <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
              <input
                v-model.number="form.price"
                type="number"
                min="0"
                required
                class="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <!-- 1日あたりの予約可能数 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              1日あたりの予約可能数 <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.dailyLimit"
              type="number"
              min="1"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <p class="text-xs text-gray-500 mt-1">同じ日にこのオプションを予約できる最大件数</p>
          </div>

          <!-- 表示順 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">表示順</label>
            <input
              v-model.number="form.order"
              type="number"
              min="0"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <p class="text-xs text-gray-500 mt-1">小さい数字ほど先に表示されます</p>
          </div>

          <!-- 有効/無効 -->
          <div class="flex items-center gap-3">
            <input
              v-model="form.isActive"
              type="checkbox"
              id="isActive"
              class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label for="isActive" class="text-sm text-gray-700">有効にする</label>
          </div>

          <!-- ボタン -->
          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="flex-1 btn-secondary">
              キャンセル
            </button>
            <button type="submit" :disabled="isSaving" class="flex-1 btn-primary">
              <span v-if="isSaving">保存中...</span>
              <span v-else>{{ editingOption ? '更新' : '作成' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 削除確認モーダル -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-md p-6" @click.stop>
        <h3 class="text-lg font-bold text-gray-900 mb-2">オプションを削除</h3>
        <p class="text-gray-600 mb-6">
          「{{ deletingOption?.name }}」を削除しますか？<br />
          この操作は取り消せません。
        </p>
        <div class="flex gap-3">
          <button @click="showDeleteConfirm = false" class="flex-1 btn-secondary">
            キャンセル
          </button>
          <button @click="deleteOption" :disabled="isDeleting" class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
            {{ isDeleting ? '削除中...' : '削除する' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookingOption } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'admin'
})

// template refs
const fileInput = ref<HTMLInputElement | null>(null)

const options = ref<BookingOption[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const editingOption = ref<BookingOption | null>(null)
const isSaving = ref(false)
const showDeleteConfirm = ref(false)
const deletingOption = ref<BookingOption | null>(null)
const isDeleting = ref(false)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const form = reactive({
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  dailyLimit: 1,
  order: 0,
  isActive: true
})

// オプション一覧を取得
const loadOptions = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<{ success: boolean; options: BookingOption[] }>('/api/admin/options')
    if (response.success) {
      options.value = response.options
    }
  } catch (error) {
    console.error('オプション取得エラー:', error)
    alert('オプションの取得に失敗しました')
  } finally {
    isLoading.value = false
  }
}

// 新規作成モーダルを開く
const openCreateModal = () => {
  editingOption.value = null
  resetForm()
  showModal.value = true
}

// 編集モーダルを開く
const openEditModal = (option: BookingOption) => {
  editingOption.value = option
  form.name = option.name
  form.description = option.description
  form.price = option.price
  form.imageUrl = option.imageUrl || ''
  form.dailyLimit = option.dailyLimit
  form.order = option.order
  form.isActive = option.isActive
  imagePreview.value = null
  imageFile.value = null
  showModal.value = true
}

// モーダルを閉じる
const closeModal = () => {
  showModal.value = false
  resetForm()
}

// フォームをリセット
const resetForm = () => {
  form.name = ''
  form.description = ''
  form.price = 0
  form.imageUrl = ''
  form.dailyLimit = 1
  form.order = 0
  form.isActive = true
  imageFile.value = null
  imagePreview.value = null
}

// ファイル選択
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    processFile(input.files[0])
  }
}

// ドラッグ&ドロップ
const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0])
  }
}

// ファイル処理
const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('画像ファイルを選択してください')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    alert('ファイルサイズは5MB以下にしてください')
    return
  }

  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

// 画像を削除
const removeImage = () => {
  form.imageUrl = ''
  imageFile.value = null
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }
}

// 画像をBase64に変換
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 画像をBase64で取得
const getImageData = async (): Promise<string | null> => {
  if (!imageFile.value) return form.imageUrl || null

  try {
    // ファイルサイズチェック（1MB以下に制限）
    if (imageFile.value.size > 1 * 1024 * 1024) {
      throw new Error('画像サイズは1MB以下にしてください')
    }

    const base64 = await convertToBase64(imageFile.value)
    return base64
  } catch (error) {
    console.error('画像変換エラー:', error)
    throw error
  }
}

// オプションを保存
const saveOption = async () => {
  isSaving.value = true

  try {
    // 画像をBase64で取得
    const imageUrl = await getImageData()

    const optionData = {
      name: form.name,
      description: form.description,
      price: form.price,
      imageUrl,
      dailyLimit: form.dailyLimit,
      order: form.order,
      isActive: form.isActive
    }

    if (editingOption.value) {
      // 更新
      await $fetch(`/api/admin/options/${editingOption.value.id}`, {
        method: 'PUT',
        body: optionData
      })
      alert('オプションを更新しました')
    } else {
      // 新規作成
      await $fetch('/api/admin/options', {
        method: 'POST',
        body: optionData
      })
      alert('オプションを作成しました')
    }

    closeModal()
    await loadOptions()
  } catch (error: any) {
    console.error('オプション保存エラー:', error)
    alert(error.data?.message || 'オプションの保存に失敗しました')
  } finally {
    isSaving.value = false
  }
}

// 有効/無効を切り替え
const toggleActive = async (option: BookingOption) => {
  try {
    await $fetch(`/api/admin/options/${option.id}`, {
      method: 'PUT',
      body: { isActive: !option.isActive }
    })
    await loadOptions()
  } catch (error) {
    console.error('ステータス更新エラー:', error)
    alert('ステータスの更新に失敗しました')
  }
}

// 削除確認
const confirmDelete = (option: BookingOption) => {
  deletingOption.value = option
  showDeleteConfirm.value = true
}

// オプションを削除
const deleteOption = async () => {
  if (!deletingOption.value) return

  isDeleting.value = true
  try {
    await $fetch(`/api/admin/options/${deletingOption.value.id}`, {
      method: 'DELETE'
    })
    showDeleteConfirm.value = false
    deletingOption.value = null
    await loadOptions()
    alert('オプションを削除しました')
  } catch (error) {
    console.error('オプション削除エラー:', error)
    alert('オプションの削除に失敗しました')
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  loadOptions()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
