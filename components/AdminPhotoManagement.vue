<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">写真ギャラリー管理</h2>
      <button
        @click="showUploadModal = true"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
      >
        + 写真を追加
      </button>
    </div>

    <!-- カテゴリータブ -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        @click="selectedCategory = 'all'"
        :class="[
          'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
          selectedCategory === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        すべて
      </button>
      <button
        v-for="(label, key) in photoCategories"
        :key="key"
        @click="selectedCategory = key"
        :class="[
          'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors',
          selectedCategory === key ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        {{ label }}
      </button>
    </div>

    <!-- 写真リスト -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">読み込み中...</p>
    </div>

    <div v-else-if="localPhotos.length === 0" class="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
      <p class="text-gray-600 mb-4">写真が登録されていません</p>
      <button
        @click="showUploadModal = true"
        class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        最初の写真をアップロード
      </button>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="photo in filteredPhotos"
        :key="photo.id"
        class="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transition-all"
      >
        <!-- 写真 -->
        <div class="aspect-square bg-gray-100">
          <img
            :src="photo.url"
            :alt="photo.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- オーバーレイ -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div class="flex gap-2">
            <button
              @click="editPhoto(photo)"
              class="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              title="編集"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="handleDeletePhoto(photo)"
              class="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="削除"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 情報バッジ -->
        <div class="absolute top-2 left-2 flex gap-2">
          <span class="px-2 py-1 bg-gray-900 bg-opacity-75 text-white text-xs rounded">
            {{ photoCategories[photo.category] }}
          </span>
          <button
            @click="toggleVisibility(photo.id, photo.isVisible)"
            :class="[
              'px-2 py-1 text-xs rounded',
              photo.isVisible ? 'bg-green-600 text-white' : 'bg-gray-600 text-white'
            ]"
          >
            {{ photo.isVisible ? '公開中' : '非公開' }}
          </button>
        </div>

        <!-- タイトル -->
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
          <p class="text-white text-sm font-medium truncate">{{ photo.title }}</p>
          <p class="text-gray-300 text-xs">順序: {{ photo.order }}</p>
        </div>
      </div>
    </div>

    <!-- アップロード/編集モーダル -->
    <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closeModal">
      <div @click.stop class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 class="text-xl font-medium">{{ editingPhoto ? '写真を編集' : '写真を追加' }}</h3>
          <button @click="closeModal" class="p-2 hover:bg-gray-100 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="savePhoto" class="p-6 space-y-4">
          <!-- 写真URL入力 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              写真のURL
              <span class="text-xs text-gray-500 ml-2">（Imgur、Cloudinary、Googleドライブなどの画像URLを入力）</span>
            </label>
            <input
              v-model="formData.url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
              required
            />
            <p class="mt-1 text-sm text-gray-500">
              無料画像ホスティング:
              <a href="https://imgur.com/upload" target="_blank" class="text-indigo-600 hover:underline">Imgur</a>、
              <a href="https://cloudinary.com/" target="_blank" class="text-indigo-600 hover:underline">Cloudinary</a>
            </p>

            <!-- プレビュー -->
            <div v-if="formData.url" class="mt-4">
              <img :src="formData.url" alt="プレビュー" class="w-full max-h-64 object-contain rounded-lg border border-gray-300" @error="handleImageError" />
            </div>
          </div>

          <!-- タイトル -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
            <input
              v-model="formData.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="例: リビングルームの眺め"
              required
            />
          </div>

          <!-- 説明 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">説明（任意）</label>
            <textarea
              v-model="formData.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="この写真の説明を入力してください"
            />
          </div>

          <!-- カテゴリ -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select
              v-model="formData.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option v-for="(label, key) in photoCategories" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>

          <!-- 表示順序 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">表示順序</label>
            <input
              v-model.number="formData.order"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
            <p class="mt-1 text-sm text-gray-500">数字が小さいほど前に表示されます</p>
          </div>

          <!-- クレジット -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">撮影者クレジット（任意）</label>
            <input
              v-model="formData.credit"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="例: Photo by 山田太郎"
            />
            <p class="mt-1 text-sm text-gray-500">入力すると写真に撮影者名が表示されます</p>
          </div>

          <!-- 公開設定 -->
          <div class="flex items-center gap-2">
            <input
              v-model="formData.isVisible"
              type="checkbox"
              id="isVisible"
              class="w-5 h-5 text-indigo-600 rounded"
            />
            <label for="isVisible" class="text-sm font-medium text-gray-700">
              この写真を公開する
            </label>
          </div>

          <!-- ボタン -->
          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {{ editingPhoto ? '更新' : '追加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { photoCategories, type Photo, type PhotoCategory } from '~/config/photos'

const {
  getAllPhotos,
  createPhoto,
  updatePhoto,
  deletePhoto,
  togglePhotoVisibility
} = usePhotos()

// 状態管理
const selectedCategory = ref<string | PhotoCategory>('all')
const showUploadModal = ref(false)
const editingPhoto = ref<Photo | null>(null)
const localPhotos = ref<Photo[]>([])
const isLoading = ref(false)

const formData = ref({
  url: '',
  title: '',
  description: '',
  category: 'exterior' as PhotoCategory,
  order: 0,
  isVisible: true,
  credit: ''
})

// 写真データを取得
const loadPhotos = async () => {
  isLoading.value = true
  try {
    localPhotos.value = await getAllPhotos()
  } catch (error) {
    console.error('写真取得エラー:', error)
    alert('写真の取得に失敗しました')
  } finally {
    isLoading.value = false
  }
}

// マウント時にデータを読み込み
onMounted(() => {
  loadPhotos()
})

// フィルタリング（orderでソート）
const filteredPhotos = computed(() => {
  const photos = selectedCategory.value === 'all'
    ? [...localPhotos.value]
    : localPhotos.value.filter(p => p.category === selectedCategory.value)

  return photos.sort((a, b) => a.order - b.order)
})

// 画像読み込みエラー処理
const handleImageError = () => {
  alert('画像のURLが無効です。正しいURLを入力してください。')
}

// 写真操作
const toggleVisibility = async (id: string, currentVisibility: boolean) => {
  const photo = localPhotos.value.find(p => p.id === id)
  if (photo) {
    const newVisibility = !currentVisibility
    try {
      await togglePhotoVisibility(id, newVisibility)
      photo.isVisible = newVisibility
    } catch (error) {
      console.error('公開状態の更新に失敗:', error)
      alert('公開状態の更新に失敗しました')
    }
  }
}

const editPhoto = (photo: Photo) => {
  editingPhoto.value = photo
  formData.value = {
    url: photo.url,
    title: photo.title,
    description: photo.description || '',
    category: photo.category,
    order: photo.order,
    isVisible: photo.isVisible,
    credit: photo.credit || ''
  }
  showUploadModal.value = true
}

const handleDeletePhoto = async (photo: Photo) => {
  if (confirm('この写真を削除してもよろしいですか？\n※画像ホスティングサービスの画像は削除されません')) {
    try {
      await deletePhoto(photo.id)
      localPhotos.value = localPhotos.value.filter(p => p.id !== photo.id)
    } catch (error) {
      console.error('写真の削除に失敗:', error)
      alert('写真の削除に失敗しました')
    }
  }
}

const savePhoto = async () => {
  // URLの検証
  if (!formData.value.url) {
    alert('写真のURLを入力してください')
    return
  }

  // 保存用データを作成（空のcreditは除外）
  const saveData = {
    url: formData.value.url,
    title: formData.value.title,
    description: formData.value.description,
    category: formData.value.category,
    order: formData.value.order,
    isVisible: formData.value.isVisible,
    ...(formData.value.credit ? { credit: formData.value.credit } : {})
  }

  try {
    if (editingPhoto.value) {
      // 編集
      await updatePhoto(editingPhoto.value.id, saveData)
      const index = localPhotos.value.findIndex(p => p.id === editingPhoto.value!.id)
      if (index !== -1) {
        localPhotos.value[index] = {
          ...localPhotos.value[index],
          ...saveData
        }
      }
    } else {
      // 新規追加
      const newPhotoId = await createPhoto(saveData)

      const newPhoto: Photo = {
        id: newPhotoId,
        ...saveData
      }
      localPhotos.value.push(newPhoto)
    }

    // orderでソート
    localPhotos.value.sort((a, b) => a.order - b.order)

    closeModal()
  } catch (error) {
    console.error('写真の保存に失敗:', error)
    alert('写真の保存に失敗しました')
  }
}

const closeModal = () => {
  showUploadModal.value = false
  editingPhoto.value = null
  formData.value = {
    url: '',
    title: '',
    description: '',
    category: 'exterior',
    order: 0,
    isVisible: true,
    credit: ''
  }
}
</script>
