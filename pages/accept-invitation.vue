<template>
  <div
    class="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4"
  >
    <div class="max-w-md w-full">
      <!-- ロゴ/ヘッダー -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">家具の家 No.1</h1>
        <p class="text-gray-600">管理者アカウント作成</p>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-8">
        <!-- ローディング -->
        <div v-if="loading" class="text-center py-8">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
          ></div>
          <p class="mt-4 text-gray-600">招待を確認しています...</p>
        </div>

        <!-- エラー -->
        <div v-else-if="error" class="text-center py-8">
          <div class="text-red-600 text-5xl mb-4">❌</div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">招待が無効です</h2>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <NuxtLink to="/" class="btn-primary"> トップページへ </NuxtLink>
        </div>

        <!-- 招待情報表示 & アカウント作成フォーム -->
        <div v-else-if="invitation">
          <div
            class="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg"
          >
            <p class="text-sm text-gray-700">
              <span class="font-semibold">{{ invitation.invitedByName }}</span>
              様より招待されました
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

            <div
              v-if="errorMessage"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {{ errorMessage }}
            </div>

            <button
              type="submit"
              :disabled="creating"
              class="btn-primary w-full"
            >
              {{ creating ? "アカウント作成中..." : "アカウントを作成" }}
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const loading = ref(true);
const creating = ref(false);
const error = ref("");
const errorMessage = ref("");

// 招待情報の型定義
interface InvitationData {
  email: string;
  invitedByName: string;
  token: string;
}

const invitation = ref<InvitationData | null>(null);
const displayName = ref("");
const password = ref("");
const passwordConfirm = ref("");

const loadInvitation = async () => {
  const token = route.query.token as string;

  if (!token) {
    error.value = "招待トークンが見つかりません";
    loading.value = false;
    return;
  }

  try {
    // サーバーサイドで招待を検証
    const response = await fetch("/api/public/verify-invitation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok || !data.valid) {
      error.value = data.error || "招待の確認に失敗しました";
      loading.value = false;
      return;
    }

    // 招待情報を保存
    invitation.value = {
      ...data.invitation,
      token,
    } as InvitationData;

    loading.value = false;
  } catch (err: unknown) {
    console.error("招待取得エラー:", err);
    const message = err instanceof Error ? err.message : "不明なエラー";
    error.value = `招待の確認中にエラーが発生しました: ${message}`;
    loading.value = false;
  }
};

const createAccount = async () => {
  errorMessage.value = "";

  // バリデーション
  if (!displayName.value.trim()) {
    errorMessage.value = "表示名を入力してください";
    return;
  }

  if (password.value.length < 8) {
    errorMessage.value = "パスワードは8文字以上で入力してください";
    return;
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = "パスワードが一致しません";
    return;
  }

  if (!invitation.value) {
    errorMessage.value = "招待情報が見つかりません";
    return;
  }

  creating.value = true;

  try {
    // サーバーサイドでアカウント作成
    const response = await fetch("/api/public/accept-invitation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: invitation.value.token,
        displayName: displayName.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "アカウント作成に失敗しました");
    }

    // 成功メッセージ表示後、ログインページへリダイレクト
    toast.success(`アカウントを作成しました！（${data.email}）`);
    router.push("/admin/login");
  } catch (err: unknown) {
    console.error("アカウント作成エラー:", err);
    errorMessage.value =
      err instanceof Error ? err.message : "アカウント作成に失敗しました";
  } finally {
    creating.value = false;
  }
};

onMounted(() => {
  loadInvitation();
});
</script>
