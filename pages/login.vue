<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- ロゴ・タイトル -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">家具の家 No.1</h1>
        <p class="text-gray-600">{{ isSignup ? 'アカウント作成' : 'ログイン' }}</p>
      </div>

      <!-- 予約フローからのリダイレクト時のメッセージ -->
      <div v-if="isBookingRedirect" class="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p class="text-sm text-purple-800">
          予約を続けるには、ログインまたはアカウント作成が必要です。
        </p>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- 成功メッセージ -->
      <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-800">{{ successMessage }}</p>
      </div>

      <!-- パスワードリセットフォーム -->
      <div v-if="showResetPassword" class="bg-white rounded-xl shadow-md p-8">
        <div v-if="!resetEmailSent">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">パスワードをリセット</h2>
          <p class="text-sm text-gray-600 mb-6">
            登録したメールアドレスを入力してください。パスワードリセット用のメールを送信します。
          </p>
          <form @submit.prevent="handleResetPassword" class="space-y-6">
            <div>
              <label for="resetEmail" class="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="resetEmail"
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? '送信中...' : 'リセットメールを送信' }}
            </button>
          </form>
        </div>
        <div v-else class="text-center">
          <div class="text-green-500 text-5xl mb-4">✉️</div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">メールを送信しました</h2>
          <p class="text-sm text-gray-600 mb-6">
            {{ form.email }} にパスワードリセット用のメールを送信しました。<br>
            メールに記載されたリンクからパスワードを再設定してください。
          </p>
        </div>
        <div class="mt-6 text-center">
          <button
            @click="backToLogin"
            class="text-sm text-purple-600 hover:text-purple-800"
          >
            ← ログインに戻る
          </button>
        </div>
      </div>

      <!-- ログイン/サインアップフォーム -->
      <div v-else class="bg-white rounded-xl shadow-md p-8">
        <!-- Google ログインボタン -->
        <div class="mb-6">
          <button
            type="button"
            @click="handleGoogleLogin"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="text-gray-700 font-medium">Googleで{{ isSignup ? '登録' : 'ログイン' }}</span>
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

        <!-- パスワードを忘れた方（ログイン時のみ） -->
        <div v-if="!isSignup" class="mt-4 text-center">
          <button
            @click="showResetForm"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            パスワードを忘れた方はこちら
          </button>
        </div>

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
const { $auth } = useNuxtApp()
const { login, loginWithGoogle, signup, resetPassword } = useAuth()
const router = useRouter()
const route = useRoute()

definePageMeta({
  layout: false
})

const isSignup = ref(false)
const isLoading = ref(false)
const showResetPassword = ref(false)
const resetEmailSent = ref(false)
const error = ref('')
const successMessage = ref('')

// 予約フローからのリダイレクトかどうか
const isBookingRedirect = computed(() => {
  const redirect = route.query.redirect as string
  return redirect?.startsWith('/booking/')
})

const form = reactive({
  email: '',
  password: '',
  displayName: ''
})

const toggleMode = () => {
  isSignup.value = !isSignup.value
  showResetPassword.value = false
  error.value = ''
  successMessage.value = ''
}

const showResetForm = () => {
  showResetPassword.value = true
  resetEmailSent.value = false
  error.value = ''
  successMessage.value = ''
}

const backToLogin = () => {
  showResetPassword.value = false
  resetEmailSent.value = false
  error.value = ''
  successMessage.value = ''
}

const handleResetPassword = async () => {
  if (!$auth) {
    error.value = 'Firebaseが設定されていません'
    return
  }

  if (!form.email) {
    error.value = 'メールアドレスを入力してください'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await resetPassword(form.email)
    resetEmailSent.value = true
    successMessage.value = 'パスワードリセットメールを送信しました。メールをご確認ください。'
  } catch (e: any) {
    error.value = e.message || 'エラーが発生しました'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  if (!$auth) {
    error.value = 'Firebaseが設定されていません'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    console.log('[Login] Starting Google login...')
    await loginWithGoogle()
    console.log('[Login] Google login successful')
    // ログイン成功後、リダイレクトURLまたはトップページへ
    const redirectUrl = (route.query.redirect as string) || '/'
    router.push(redirectUrl)
  } catch (e: any) {
    console.error('[Login] Google login error:', e)
    console.error('[Login] Error code:', e.code)
    console.error('[Login] Error message:', e.message)
    console.error('[Login] Full error:', JSON.stringify(e, Object.getOwnPropertyNames(e)))
    error.value = e.message || 'エラーが発生しました'
  } finally {
    isLoading.value = false
  }
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
</script>
