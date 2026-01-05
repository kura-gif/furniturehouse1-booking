<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container-responsive py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin/messages" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <div>
            <h1 class="text-xl font-bold">{{ conversation?.guestName || 'メッセージ' }}</h1>
            <p v-if="conversation?.bookingReference" class="text-sm text-purple-600">
              予約番号: {{ conversation.bookingReference }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="conversation?.status === 'open'"
            @click="handleCloseConversation"
            class="btn-secondary text-sm"
          >
            完了にする
          </button>
          <button
            v-else-if="conversation?.status === 'closed'"
            @click="handleReopenConversation"
            class="btn-secondary text-sm"
          >
            再開する
          </button>
        </div>
      </div>
    </header>

    <!-- ローディング -->
    <div v-if="isLoading" class="flex items-center justify-center h-64">
      <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
    </div>

    <!-- エラー -->
    <div v-else-if="error" class="container-responsive py-8">
      <div class="card text-center py-8">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <NuxtLink to="/admin/messages" class="btn-primary">一覧に戻る</NuxtLink>
      </div>
    </div>

    <!-- チャットエリア -->
    <div v-else class="flex flex-col h-[calc(100vh-80px)]">
      <!-- メッセージ一覧 -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
          メッセージはまだありません
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex',
            message.senderType === 'admin' ? 'justify-end' : 'justify-start'
          ]"
        >
          <div
            :class="[
              'max-w-[70%] rounded-lg px-4 py-2',
              message.senderType === 'admin'
                ? 'bg-purple-600 text-white'
                : 'bg-white border border-gray-200 text-gray-900'
            ]"
          >
            <p class="text-xs opacity-70 mb-1">
              {{ message.senderName }}
            </p>
            <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
            <p class="text-xs opacity-70 mt-1 text-right">
              {{ formatMessageTime(message.createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- 入力エリア -->
      <div class="bg-white border-t border-gray-200 p-4">
        <div v-if="conversation?.status === 'closed'" class="text-center text-gray-500">
          この会話は完了しています。再開するには上部の「再開する」ボタンをクリックしてください。
        </div>
        <form v-else @submit.prevent="handleSendMessage" class="flex gap-2">
          <textarea
            v-model="newMessage"
            @keydown.enter.exact.prevent="handleSendMessage"
            placeholder="メッセージを入力..."
            rows="2"
            class="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            :disabled="isSending"
          ></textarea>
          <button
            type="submit"
            :disabled="!newMessage.trim() || isSending"
            class="btn-primary px-6 self-end"
          >
            <span v-if="isSending">送信中...</span>
            <span v-else>送信</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation, Message } from '~/types'

definePageMeta({
  middleware: 'admin'
})

const route = useRoute()
const conversationId = route.params.id as string

const {
  getConversation,
  subscribeToMessages,
  sendMessage,
  markAsReadByAdmin,
  closeConversation,
  reopenConversation
} = useConversations()

const conversation = ref<Conversation | null>(null)
const messages = ref<Message[]>([])
const newMessage = ref('')
const isLoading = ref(true)
const isSending = ref(false)
const error = ref<string | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

let unsubscribe: (() => void) | null = null

// メッセージ時刻フォーマット
const formatMessageTime = (timestamp: any): string => {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`

  if (isToday) {
    return time
  }

  return `${date.getMonth() + 1}/${date.getDate()} ${time}`
}

// 最下部へスクロール
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 会話とメッセージを読み込み
const loadConversation = async () => {
  isLoading.value = true
  error.value = null

  try {
    conversation.value = await getConversation(conversationId)

    if (!conversation.value) {
      error.value = '会話が見つかりません'
      return
    }

    // 既読にする
    await markAsReadByAdmin(conversationId)

    // メッセージをリアルタイム監視
    unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
      messages.value = newMessages
      scrollToBottom()
    })
  } catch (err) {
    console.error('会話の取得に失敗:', err)
    error.value = '会話の取得に失敗しました'
  } finally {
    isLoading.value = false
  }
}

// メッセージ送信
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return

  isSending.value = true
  const content = newMessage.value.trim()
  newMessage.value = ''

  try {
    await sendMessage(
      conversationId,
      content,
      'admin',
      '管理者'
    )
    scrollToBottom()
  } catch (err) {
    console.error('メッセージ送信に失敗:', err)
    alert('メッセージの送信に失敗しました')
    newMessage.value = content // 復元
  } finally {
    isSending.value = false
  }
}

// 会話を完了
const handleCloseConversation = async () => {
  if (!confirm('この会話を完了にしますか？')) return

  try {
    await closeConversation(conversationId)
    if (conversation.value) {
      conversation.value.status = 'closed'
    }
  } catch (err) {
    console.error('会話のクローズに失敗:', err)
    alert('操作に失敗しました')
  }
}

// 会話を再開
const handleReopenConversation = async () => {
  try {
    await reopenConversation(conversationId)
    if (conversation.value) {
      conversation.value.status = 'open'
    }
  } catch (err) {
    console.error('会話の再開に失敗:', err)
    alert('操作に失敗しました')
  }
}

onMounted(() => {
  loadConversation()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

useHead({
  title: 'メッセージ詳細 | 管理ダッシュボード',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<style scoped>
.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-200;
}

.btn-primary {
  @apply bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.container-responsive {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
}
</style>
