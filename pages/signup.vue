<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="max-w-md mx-auto px-4 py-16 mt-16">
      <div class="bg-white rounded-xl shadow-md p-8">
        <h1 class="text-2xl font-semibold text-gray-900 mb-6 text-center">アカウントを作成</h1>

        <!-- 予約完了からの遷移の場合 -->
        <div v-if="bookingId" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p class="text-sm text-gray-700">
            <strong>予約が完了しました！</strong><br>
            アカウントを作成すると、予約の管理やホストとのメッセージができます。
          </p>
        </div>

        <form @submit.prevent="handleSignup" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span class="text-red-500">*</span>
            </label>
            <input
              v-model="email"
              type="email"
              required
              :readonly="!!prefilledEmail"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              :class="{ 'bg-gray-50': !!prefilledEmail }"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              パスワード <span class="text-red-500">*</span>
            </label>
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              placeholder="6文字以上"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              お名前 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="displayName"
              type="text"
              required
              placeholder="山田 太郎"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            {{ isLoading ? 'アカウント作成中...' : 'アカウントを作成' }}
          </button>
        </form>

        <p class="text-sm text-gray-600 text-center mt-6">
          すでにアカウントをお持ちの方は
          <NuxtLink to="/login" class="text-purple-600 hover:underline">ログイン</NuxtLink>
        </p>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const { $auth, $db } = useNuxtApp()

// クエリパラメータから取得
const prefilledEmail = ref(route.query.email as string || '')
const bookingId = ref(route.query.booking_id as string || '')
const redirectPath = ref(route.query.redirect as string || '/')

// フォームデータ
const email = ref(prefilledEmail.value)
const password = ref('')
const displayName = ref('')
const isLoading = ref(false)

const handleSignup = async () => {
  if (!$auth || !$db) {
    alert('認証サービスが初期化されていません')
    return
  }

  isLoading.value = true

  try {
    // Firebase Authenticationでユーザー作成
    const userCredential = await createUserWithEmailAndPassword($auth, email.value, password.value)
    const user = userCredential.user

    // プロフィール更新
    await updateProfile(user, {
      displayName: displayName.value
    })

    // Firestoreにユーザー情報を保存
    const { doc, setDoc, Timestamp } = await import('firebase/firestore')
    await setDoc(doc($db, 'users', user.uid), {
      email: email.value,
      displayName: displayName.value,
      role: 'user',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    // 予約がある場合、予約にuserIdを紐付ける
    if (bookingId.value) {
      const { updateDoc } = await import('firebase/firestore')
      await updateDoc(doc($db, 'bookings', bookingId.value), {
        userId: user.uid,
        updatedAt: Timestamp.now()
      })
    }

    // リダイレクト
    router.push(redirectPath.value)
  } catch (error: any) {
    console.error('アカウント作成エラー:', error)
    if (error.code === 'auth/email-already-in-use') {
      alert('このメールアドレスは既に使用されています')
    } else if (error.code === 'auth/weak-password') {
      alert('パスワードは6文字以上にしてください')
    } else {
      alert('アカウント作成に失敗しました: ' + error.message)
    }
    isLoading.value = false
  }
}

// SEO設定
useHead({
  title: 'アカウント作成 | 家具の家 No.1',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>
