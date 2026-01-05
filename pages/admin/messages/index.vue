<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <h1 class="text-2xl font-bold">メッセージ管理</h1>
        </div>
        <button @click="handleLogout" class="btn-secondary text-sm">ログアウト</button>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- タブ -->
      <div class="mb-6 border-b border-gray-200">
        <div class="flex gap-4">
          <button
            @click="activeTab = 'open'"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'open' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            進行中 ({{ openConversations.length }})
          </button>
          <button
            @click="activeTab = 'closed'"
            :class="[
              'px-4 py-2 font-medium border-b-2 transition-colors',
              activeTab === 'closed' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            ]"
          >
            完了 ({{ closedConversations.length }})
          </button>
        </div>
      </div>

      <!-- ローディング -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-gray-600 mt-4">読み込み中...</p>
      </div>

      <!-- 会話一覧 -->
      <div v-else class="space-y-4">
        <div v-if="displayedConversations.length === 0" class="card text-center py-8 text-gray-500">
          {{ activeTab === 'open' ? '進行中のメッセージはありません' : '完了したメッセージはありません' }}
        </div>

        <NuxtLink
          v-for="conversation in displayedConversations"
          :key="conversation.id"
          :to="`/admin/messages/${conversation.id}`"
          class="card block hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-lg text-gray-900 truncate">
                  {{ conversation.guestName }}
                </h3>
                <span v-if="conversation.unreadByAdmin > 0" class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {{ conversation.unreadByAdmin }}
                </span>
              </div>
              <p v-if="conversation.bookingReference" class="text-sm text-purple-600 mb-1">
                予約番号: {{ conversation.bookingReference }}
              </p>
              <p v-if="conversation.subject" class="text-sm text-gray-600 mb-1">
                件名: {{ conversation.subject }}
              </p>
              <p class="text-sm text-gray-500 truncate">
                {{ conversation.lastMessagePreview || 'メッセージなし' }}
              </p>
            </div>
            <div class="text-right ml-4 flex-shrink-0">
              <p class="text-xs text-gray-500">
                {{ formatDate(conversation.lastMessageAt) }}
              </p>
              <span
                :class="[
                  'inline-block mt-2 text-xs px-2 py-1 rounded',
                  conversation.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                ]"
              >
                {{ conversation.status === 'open' ? '進行中' : '完了' }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~/types'

definePageMeta({
  middleware: 'admin'
})

const { getAllConversations } = useConversations()
const { logout } = useAuth()
const router = useRouter()

const conversations = ref<Conversation[]>([])
const activeTab = ref<'open' | 'closed'>('open')
const isLoading = ref(true)

// 会話をステータスでフィルタリング
const openConversations = computed(() => conversations.value.filter(c => c.status === 'open'))
const closedConversations = computed(() => conversations.value.filter(c => c.status === 'closed'))
const displayedConversations = computed(() =>
  activeTab.value === 'open' ? openConversations.value : closedConversations.value
)

// 会話を読み込み
const loadConversations = async () => {
  isLoading.value = true
  try {
    conversations.value = await getAllConversations()
  } catch (error) {
    console.error('会話の取得に失敗:', error)
    alert('会話の取得に失敗しました')
  } finally {
    isLoading.value = false
  }
}

// 日付フォーマット
const formatDate = (timestamp: any): string => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  } else if (days === 1) {
    return '昨日'
  } else if (days < 7) {
    return `${days}日前`
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}

// ログアウト
const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
  } catch (error) {
    console.error('ログアウトエラー:', error)
  }
}

onMounted(() => {
  loadConversations()
})

useHead({
  title: 'メッセージ管理 | 管理ダッシュボード',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.container-responsive {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
</style>
