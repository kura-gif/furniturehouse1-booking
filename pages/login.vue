<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- ロゴ・タイトル -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">家具の家 No.1</h1>
        <p class="text-gray-600">{{ isSignup ? 'アカウント作成' : 'ログイン' }}</p>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- フォーム -->
      <div class="bg-white rounded-xl shadow-md p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 名前（サインアップ時のみ） -->
          <div v-if="isSignup">
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              お名前
            </label>
            <input
              id="displayName"
              v-model="form.displayName"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="山田太郎"
            />
          </div>

          <!-- メールアドレス -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          <!-- パスワード -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="6文字以上"
            />
          </div>

          <!-- 送信ボタン -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? '処理中...' : (isSignup ? 'アカウント作成' : 'ログイン') }}
          </button>
        </form>

        <!-- 区切り線 -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">または</span>
          </div>
        </div>

        <!-- Googleログインボタン -->
        <button
          @click="handleGoogleLogin"
          :disabled="isLoading"
          type="button"
          class="w-full px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Googleでログイン
        </button>

        <!-- 切り替えリンク -->
        <div class="mt-6 text-center">
          <button
            @click="toggleMode"
            class="text-sm text-purple-600 hover:text-purple-800"
          >
            {{ isSignup ? 'すでにアカウントをお持ちの方はこちら' : '新規登録はこちら' }}
          </button>
        </div>

        <!-- ホームに戻る -->
        <div class="mt-4 text-center">
          <NuxtLink
            to="/"
            class="text-sm text-gray-600 hover:text-gray-800"
          >
            ← ホームに戻る
          </NuxtLink>
        </div>
      </div>

      <!-- 開発モード用の注意書き -->
      <div v-if="!$auth" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-sm text-yellow-800">
          <strong>開発モード:</strong> Firebaseが設定されていません。<br>
          .envファイルにFirebase設定を追加してください。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

const { $auth, $db } = useNuxtApp()
const { login, signup } = useAuth()
const router = useRouter()
const route = useRoute()

definePageMeta({
  layout: false
})

const isSignup = ref(false)
const isLoading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: '',
  displayName: ''
})

const toggleMode = () => {
  isSignup.value = !isSignup.value
  error.value = ''
}

const handleSubmit = async () => {
  if (!$auth) {
    error.value = 'Firebaseが設定されていません'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    if (isSignup.value) {
      await signup(form.email, form.password, form.displayName)
    } else {
      await login(form.email, form.password)
    }

    // ログイン成功後、リダイレクトURLまたはトップページへ
    const redirectUrl = (route.query.redirect as string) || '/'
    router.push(redirectUrl)
  } catch (e: any) {
    error.value = e.message || 'エラーが発生しました'
  } finally {
    isLoading.value = false
  }
}

// Googleアカウントでログイン
const handleGoogleLogin = async () => {
  if (!$auth || !$db) {
    error.value = '認証サービスが初期化されていません'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup($auth, provider)
    const user = result.user

    // Firestoreにユーザー情報を保存（既存ユーザーの場合はスキップ）
    const { doc, setDoc, getDoc, Timestamp } = await import('firebase/firestore')

    const userDoc = await getDoc(doc($db, 'users', user.uid))

    if (!userDoc.exists()) {
      // 新規ユーザーの場合
      await setDoc(doc($db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: 'user',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
    }

    // ログイン成功後、リダイレクトURLまたはトップページへ
    const redirectUrl = (route.query.redirect as string) || '/'
    router.push(redirectUrl)
  } catch (e: any) {
    console.error('Googleログインエラー:', e)
    if (e.code === 'auth/popup-closed-by-user') {
      // ユーザーがポップアップを閉じた場合は何もしない
    } else {
      error.value = 'Googleログインに失敗しました: ' + e.message
    }
    isLoading.value = false
  }
}
</script>
