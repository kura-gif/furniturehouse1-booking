<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <AppHeader />

    <div class="container mx-auto px-4 py-8">
      <div v-if="!booking" class="text-center py-12">
        <p class="text-gray-500">予約情報を読み込んでいます...</p>
      </div>

      <div v-else class="max-w-4xl mx-auto">
        <!-- 予約情報ヘッダー -->
        <div class="card mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold mb-2">予約に関するメッセージ</h1>
              <p class="text-gray-600">
                {{ formatDate(booking.startDate) }} - {{ formatDate(booking.endDate) }}
              </p>
              <p class="text-sm text-gray-500">
                {{ booking.type === 'stay' ? '宿泊予約' : 'ワークショップ' }}
              </p>
            </div>
            <button @click="$router.back()" class="btn-secondary">
              戻る
            </button>
          </div>
        </div>

        <!-- チャットエリア -->
        <div class="card">
          <!-- メッセージ履歴 -->
          <div
            ref="messagesContainer"
            class="bg-gray-50 rounded-lg p-4 mb-4 h-[500px] overflow-y-auto"
          >
            <div v-if="messages.length === 0" class="text-center text-gray-500 py-12">
              <p class="mb-2">まだメッセージがありません</p>
              <p class="text-sm">ご不明な点がございましたら、お気軽にメッセージをお送りください。</p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="msg in messages"
                :key="msg.id"
                :class="[
                  'flex',
                  msg.senderType === 'guest' ? 'justify-end' : 'justify-start'
                ]"
              >
                <div
                  :class="[
                    'rounded-lg p-3 max-w-md',
                    msg.senderType === 'guest'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white shadow border border-gray-200'
                  ]"
                >
                  <div v-if="msg.senderType === 'admin'" class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-semibold text-purple-600">管理者</span>
                  </div>
                  <p class="text-sm">{{ msg.message }}</p>
                  <p
                    :class="[
                      'text-xs mt-2',
                      msg.senderType === 'guest' ? 'opacity-75' : 'text-gray-500'
                    ]"
                  >
                    {{ formatDateTime(msg.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- メッセージ送信フォーム -->
          <form @submit.prevent="handleSendMessage" class="flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="メッセージを入力..."
              class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              :disabled="isSendingMessage"
            />
            <button
              type="submit"
              class="btn-primary"
              :disabled="!newMessage.trim() || isSendingMessage"
            >
              {{ isSendingMessage ? '送信中...' : '送信' }}
            </button>
          </form>

          <!-- ヒント -->
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">
              💡 チェックイン情報、鍵の受け渡し方法など、ご不明な点がございましたらお気軽にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { Booking, GuestMessage } from '~/types'

const route = useRoute()
const router = useRouter()
const { appUser } = useAuth()
const { getBooking } = useBookings()
const {
  subscribeToMessages,
  sendMessage,
  markAllMessagesAsRead
} = useMessaging()

definePageMeta({
  middleware: 'auth'
})

const bookingId = route.params.id as string
const booking = ref<Booking | null>(null)
const messages = ref<GuestMessage[]>([])
const newMessage = ref('')
const isSendingMessage = ref(false)
const messageUnsubscribe = ref<(() => void) | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

// 予約情報を取得
onMounted(async () => {
  try {
    const bookingData = await getBooking(bookingId)
    if (!bookingData) {
      alert('予約が見つかりませんでした')
      router.push('/mypage')
      return
    }

    // 自分の予約かチェック
    if (bookingData.userId !== appUser.value?.id) {
      alert('アクセス権限がありません')
      router.push('/mypage')
      return
    }

    booking.value = bookingData

    // メッセージをリアルタイムで監視
    messageUnsubscribe.value = subscribeToMessages(bookingId, (newMessages) => {
      messages.value = newMessages

      // 既読処理（管理者からのメッセージを既読にする）
      if (appUser.value?.id) {
        markAllMessagesAsRead(bookingId, appUser.value.id)
      }

      // 最新メッセージまでスクロール
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    })
  } catch (error) {
    console.error('予約データ取得エラー:', error)
    alert('予約データの取得に失敗しました')
    router.push('/mypage')
  }
})

// コンポーネント破棄時に監視を解除
onUnmounted(() => {
  if (messageUnsubscribe.value) {
    messageUnsubscribe.value()
  }
})

// メッセージ送信
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !booking.value || !appUser.value) return

  isSendingMessage.value = true
  try {
    await sendMessage(
      booking.value.id,
      appUser.value.id,
      'guest',
      appUser.value.displayName || booking.value.guestName,
      newMessage.value.trim()
    )
    newMessage.value = ''
  } catch (error) {
    console.error('メッセージ送信エラー:', error)
    alert('メッセージの送信に失敗しました')
  } finally {
    isSendingMessage.value = false
  }
}

function formatDate(timestamp: any) {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function formatDateTime(timestamp: any) {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>
