<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- ロゴ/ヘッダー -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">家具の家 No.1</h1>
        <p class="text-gray-600">管理者アカウント作成</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- ローディング -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p class="mt-4 text-gray-600">招待を確認しています...</p>
        </div>

        <!-- エラー -->
        <div v-else-if="error" class="text-center py-8">
          <div class="text-red-600 text-5xl mb-4">❌</div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">招待が無効です</h2>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <NuxtLink to="/" class="btn-primary">
            トップページへ
          </NuxtLink>
        </div>

        <!-- 招待情報表示 & アカウント作成フォーム -->
        <div v-else-if="invitation">
          <div class="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p class="text-sm text-gray-700">
              <span class="font-semibold">{{ invitation.invitedByName }}</span> 様より招待されました
            </p>
            <p class="text-sm text-gray-600 mt-1">
              招待先: <span class="font-medium">{{ invitation.email }}</span>
            </p>
          </div>

          <form @submit.prevent="createAccount" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                表示名
              </label>
              <input
                v-model="displayName"
                type="text"
                required
                placeholder="山田 太郎"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                v-model="password"
                type="password"
                required
                minlength="8"
                placeholder="8文字以上"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                パスワード確認
              </label>
              <input
                v-model="passwordConfirm"
                type="password"
                required
                minlength="8"
                placeholder="もう一度入力してください"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              :disabled="creating"
              class="btn-primary w-full"
            >
              {{ creating ? 'アカウント作成中...' : 'アカウントを作成' }}
            </button>
          </form>
        </div>
      </div>

      <p class="text-center text-sm text-gray-600 mt-6">
        &copy; 2025 家具の家 No.1. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc, updateDoc, Timestamp, collection, query, where, limit, getDocs } from 'firebase/firestore'
import type { AdminInvitation } from '~/types'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const creating = ref(false)
const error = ref('')
const errorMessage = ref('')

const invitation = ref<AdminInvitation | null>(null)
const displayName = ref('')
const password = ref('')
const passwordConfirm = ref('')

const loadInvitation = async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = '招待トークンが見つかりません'
    loading.value = false
    return
  }

  try {
    const { $db } = useNuxtApp()
    if (!$db) {
      throw new Error('Firebase が初期化されていません')
    }

    const invitationsRef = collection($db, 'adminInvitations')
    const q = query(invitationsRef, where('token', '==', token), where('status', '==', 'pending'), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      error.value = '招待が見つからないか、既に使用されています'
      loading.value = false
      return
    }

    const invitationDoc = snapshot.docs[0]
    const invitationData = invitationDoc.data() as AdminInvitation
    invitation.value = { ...invitationData, id: invitationDoc.id }

    // 有効期限チェック
    const expiresAt = invitationData.expiresAt as any
    const expiryDate = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt)
    if (expiryDate < new Date()) {
      error.value = '招待の有効期限が切れています'
      // ステータスを期限切れに更新
      await updateDoc(doc($db, 'adminInvitations', invitationDoc.id), {
        status: 'expired'
      })
      loading.value = false
      return
    }

    loading.value = false
  } catch (err: any) {
    console.error('招待取得エラー:', err)
    error.value = `招待の確認中にエラーが発生しました: ${err.message}`
    loading.value = false
  }
}

const createAccount = async () => {
  errorMessage.value = ''

  // バリデーション
  if (!displayName.value.trim()) {
    errorMessage.value = '表示名を入力してください'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'パスワードは8文字以上で入力してください'
    return
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'パスワードが一致しません'
    return
  }

  if (!invitation.value) {
    errorMessage.value = '招待情報が見つかりません'
    return
  }

  creating.value = true

  try {
    const { $auth, $db } = useNuxtApp()
    if (!$auth || !$db) {
      throw new Error('Firebase が初期化されていません')
    }

    // Firebase Authでアカウント作成
    const userCredential = await createUserWithEmailAndPassword(
      $auth,
      invitation.value.email,
      password.value
    )

    const user = userCredential.user

    // プロフィール更新
    await updateProfile(user, {
      displayName: displayName.value
    })

    // Firestoreにユーザードキュメント作成
    await setDoc(doc($db, 'users', user.uid), {
      id: user.uid,
      uid: user.uid,
      email: invitation.value.email,
      displayName: displayName.value,
      role: 'admin',
      invitedBy: invitation.value.invitedBy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now()
    })

    // 招待ステータスを承認済みに更新
    await updateDoc(doc($db, 'adminInvitations', invitation.value.id), {
      status: 'accepted',
      acceptedAt: Timestamp.now()
    })

    // 成功メッセージ表示後、管理画面へリダイレクト
    alert('アカウントを作成しました。管理画面にログインします。')
    router.push('/admin')
  } catch (err: any) {
    console.error('アカウント作成エラー:', err)

    // Firebase エラーメッセージを日本語化
    switch (err.code) {
      case 'auth/email-already-in-use':
        errorMessage.value = 'このメールアドレスは既に使用されています'
        break
      case 'auth/invalid-email':
        errorMessage.value = '無効なメールアドレスです'
        break
      case 'auth/weak-password':
        errorMessage.value = 'パスワードが弱すぎます'
        break
      default:
        errorMessage.value = `アカウント作成に失敗しました: ${err.message}`
    }
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadInvitation()
})
</script>
