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

        <!-- Google ログインボタン -->
        <div class="mb-6">
          <button
            type="button"
            @click="handleGoogleSignup"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="text-gray-700 font-medium">Googleで登録</span>
          </button>
        </div>

        <!-- 区切り線 -->
        <div class="relative mb-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">または</span>
          </div>
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
const { loginWithGoogle } = useAuth()

// クエリパラメータから取得
const prefilledEmail = ref(route.query.email as string || '')
const bookingId = ref(route.query.booking_id as string || '')
const redirectPath = ref(route.query.redirect as string || '/')

// フォームデータ
const email = ref(prefilledEmail.value)
const password = ref('')
const displayName = ref('')
const isLoading = ref(false)

const handleGoogleSignup = async () => {
  if (!$auth) {
    alert('認証サービスが初期化されていません')
    return
  }

  isLoading.value = true

  try {
    const user = await loginWithGoogle()

    if (bookingId.value && user && $db) {
      const { doc, updateDoc, Timestamp } = await import('firebase/firestore')
      await updateDoc(doc($db, 'bookings', bookingId.value), {
        userId: user.uid,
        updatedAt: Timestamp.now()
      })
    }

    // リダイレクト
    router.push(redirectPath.value)
  } catch (error: any) {
    console.error('Googleログインエラー:', error)
    alert(error.message || 'Googleログインに失敗しました')
    isLoading.value = false
  }
}

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
