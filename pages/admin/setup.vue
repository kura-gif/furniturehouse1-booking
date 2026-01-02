<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <!-- ロゴ・タイトル -->
      <div class="text-center mb-8">
        <div class="mb-4">
          <svg class="mx-auto h-12 w-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">管理者アカウント設定</h1>
        <p class="text-gray-600">初回管理者アカウントを作成します</p>
      </div>

      <!-- 既に管理者が存在する場合 -->
      <div v-if="adminExists" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div class="flex items-start">
          <svg class="h-5 w-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-yellow-800">管理者は既に存在します</h3>
            <p class="mt-1 text-sm text-yellow-700">
              既に管理者アカウントが作成されています。ログインページからログインしてください。
            </p>
            <div class="mt-4">
              <NuxtLink to="/login" class="text-sm font-medium text-purple-600 hover:text-purple-800">
                ログインページへ →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>

      <!-- 成功メッセージ -->
      <div v-if="success" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <p class="text-sm text-green-800">{{ success }}</p>
      </div>

      <!-- フォーム -->
      <div v-if="!adminExists && !success" class="bg-white rounded-xl shadow-md p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 名前 -->
          <div>
            <label for="displayName" class="block text-sm font-medium text-gray-700 mb-2">
              管理者名 <span class="text-red-500">*</span>
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
              メールアドレス <span class="text-red-500">*</span>
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="admin@example.com"
            />
          </div>

          <!-- パスワード -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              パスワード <span class="text-red-500">*</span>
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="8文字以上の安全なパスワード"
            />
            <p class="mt-1 text-xs text-gray-500">8文字以上で、英数字を組み合わせてください</p>
          </div>

          <!-- パスワード確認 -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              パスワード（確認） <span class="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="パスワードを再入力"
            />
          </div>

          <!-- 注意事項 -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-start">
              <svg class="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <div>
                <h3 class="text-sm font-medium text-blue-800">重要な注意事項</h3>
                <ul class="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                  <li>このアカウントは全ての管理機能にアクセスできます</li>
                  <li>メールアドレスとパスワードは安全に保管してください</li>
                  <li>このページは初回設定専用です</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 送信ボタン -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? '作成中...' : '管理者アカウントを作成' }}
          </button>
        </form>

        <!-- ホームに戻る -->
        <div class="mt-6 text-center">
          <NuxtLink
            to="/"
            class="text-sm text-gray-600 hover:text-gray-800"
          >
            ← ホームに戻る
          </NuxtLink>
        </div>
      </div>

      <!-- 成功後のアクション -->
      <div v-if="success" class="bg-white rounded-xl shadow-md p-8">
        <div class="text-center space-y-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">管理者アカウントが作成されました！</h3>
            <p class="mt-2 text-sm text-gray-600">
              ログインして管理画面にアクセスできます。
            </p>
          </div>
          <div class="flex flex-col gap-3">
            <NuxtLink
              to="/admin"
              class="btn-primary text-center"
            >
              管理画面へ
            </NuxtLink>
            <NuxtLink
              to="/"
              class="btn-secondary text-center"
            >
              ホームへ戻る
            </NuxtLink>
          </div>
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
import { collection, query, where, getDocs } from 'firebase/firestore'

const { $auth, $db } = useNuxtApp()
const { signup, login } = useAuth()
const router = useRouter()

definePageMeta({
  layout: false
})

const isLoading = ref(false)
const error = ref('')
const success = ref('')
const adminExists = ref(false)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  displayName: ''
})

// 既に管理者が存在するかチェック
const checkAdminExists = async () => {
  if (!$db) return

  try {
    const usersRef = collection($db, 'users')
    const adminQuery = query(usersRef, where('role', '==', 'admin'))
    const querySnapshot = await getDocs(adminQuery)

    adminExists.value = !querySnapshot.empty
  } catch (e) {
    console.error('管理者チェックエラー:', e)
  }
}

// ページマウント時にチェック
onMounted(() => {
  checkAdminExists()
})

const handleSubmit = async () => {
  if (!$auth || !$db) {
    error.value = 'Firebaseが設定されていません'
    return
  }

  // バリデーション
  if (form.password !== form.confirmPassword) {
    error.value = 'パスワードが一致しません'
    return
  }

  if (form.password.length < 8) {
    error.value = 'パスワードは8文字以上で設定してください'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // 再度管理者が存在しないか確認
    await checkAdminExists()
    if (adminExists.value) {
      error.value = '既に管理者アカウントが存在します'
      isLoading.value = false
      return
    }

    // 管理者アカウントを作成（roleにadminを指定）
    await signup(form.email, form.password, form.displayName, 'admin')

    success.value = '管理者アカウントを作成しました！'

    // 3秒後に管理画面へリダイレクト
    setTimeout(() => {
      router.push('/admin')
    }, 2000)
  } catch (e: any) {
    error.value = e.message || '管理者アカウントの作成に失敗しました'
  } finally {
    isLoading.value = false
  }
}
</script>
