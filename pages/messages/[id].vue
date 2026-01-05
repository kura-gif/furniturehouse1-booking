<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="pt-20">
      <!-- ローディング -->
      <div v-if="isLoading" class="flex items-center justify-center h-64">
        <div class="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>

      <!-- エラー -->
      <div v-else-if="error" class="max-w-2xl mx-auto px-4 py-8">
        <div class="bg-white rounded-xl shadow-md p-8 text-center">
          <p class="text-red-600 mb-4">{{ error }}</p>
          <NuxtLink to="/mypage" class="btn-primary">マイページに戻る</NuxtLink>
        </div>
      </div>

      <!-- チャットエリア -->
      <div v-else class="max-w-3xl mx-auto">
        <!-- ヘッダー -->
        <div class="bg-white border-b border-gray-200 px-4 py-4">
          <div class="flex items-center gap-4">
            <NuxtLink to="/mypage" class="text-gray-600 hover:text-gray-900">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </NuxtLink>
            <div>
              <h1 class="text-lg font-bold">ホストとのメッセージ</h1>
              <p v-if="conversation?.bookingReference" class="text-sm text-purple-600">
                予約番号: {{ conversation.bookingReference }}
              </p>
            </div>
          </div>
        </div>

        <!-- メッセージ一覧 -->
        <div ref="messagesContainer" class="h-[calc(100vh-280px)] overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
            <p class="mb-2">メッセージはまだありません</p>
            <p class="text-sm">ホストに質問やリクエストがあればお気軽にメッセージを送ってください</p>
          </div>

          <div
            v-for="message in messages"
            :key="message.id"
            :class="[
              'flex',
              message.senderType === 'guest' ? 'justify-end' : 'justify-start'
            ]"
          >
            <div
              :class="[
                'max-w-[70%] rounded-lg px-4 py-2',
                message.senderType === 'guest'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              ]"
            >
              <p class="text-xs opacity-70 mb-1">
                {{ message.senderType === 'guest' ? 'あなた' : 'ホスト' }}
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
            この会話は終了しています
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

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import type { Conversation, Message } from '~/types'

definePageMeta({
  layout: false,
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()
const bookingId = route.params.id as string
const { user } = useAuth()

const {
  getOrCreateConversation,
  getConversationByBookingId,
  subscribeToMessages,
  sendMessage,
  markAsReadByGuest
} = useConversations()

const { getBooking } = useBookings()

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

// 会話を読み込み
const loadConversation = async () => {
  isLoading.value = true
  error.value = null

  try {
    // 予約情報を取得
    const booking = await getBooking(bookingId)
    if (!booking) {
      error.value = '予約が見つかりません'
      return
    }

    // ユーザーが予約の所有者か確認
    if (booking.userId !== user.value?.uid && booking.guestEmail !== user.value?.email) {
      error.value = 'この予約へのアクセス権がありません'
      return
    }

    // 既存の会話を取得または作成
    let existingConversation = await getConversationByBookingId(bookingId)

    if (!existingConversation) {
      existingConversation = await getOrCreateConversation(
        bookingId,
        booking.bookingReference,
        booking.guestName,
        booking.guestEmail,
        user.value?.uid
      )
    }

    conversation.value = existingConversation

    // 既読にする
    await markAsReadByGuest(existingConversation.id)

    // メッセージをリアルタイム監視
    unsubscribe = subscribeToMessages(existingConversation.id, (newMessages) => {
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
  if (!newMessage.value.trim() || isSending.value || !conversation.value) return

  isSending.value = true
  const content = newMessage.value.trim()
  newMessage.value = ''

  try {
    await sendMessage(
      conversation.value.id,
      content,
      'guest',
      user.value?.displayName || 'ゲスト',
      user.value?.uid
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

onMounted(() => {
  loadConversation()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})

useHead({
  title: 'メッセージ | 家具の家 No.1',
  meta: [{ name: 'robots', content: 'noindex' }]
})
</script>

<style scoped>
.btn-primary {
  @apply bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
