<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="text-gray-600 hover:text-gray-900">
            ← ダッシュボード
          </NuxtLink>
          <h1 class="text-2xl font-bold">管理者招待</h1>
        </div>
        <div class="flex items-center gap-4">
          <span v-if="appUser" class="text-sm text-gray-600">
            {{ appUser.displayName }}さん
          </span>
          <button @click="handleLogout" class="btn-secondary text-sm">
            ログアウト
          </button>
        </div>
      </div>
    </header>

    <div class="container-responsive py-8 max-w-4xl mx-auto">
      <!-- 新規招待フォーム -->
      <div class="card mb-8">
        <h2 class="text-xl font-bold mb-6">新しい管理者を招待</h2>

        <form @submit.prevent="sendInvitation" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              v-model="invitationEmail"
              type="email"
              required
              placeholder="takako@chladni.co.jp"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
          >
            {{ errorMessage }}
          </div>

          <div
            v-if="successMessage"
            class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
          >
            {{ successMessage }}
          </div>

          <button type="submit" :disabled="sending" class="btn-primary w-full">
            {{ sending ? "送信中..." : "招待を送信" }}
          </button>
        </form>
      </div>

      <!-- 招待一覧 -->
      <div class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">招待一覧</h2>
          <button
            @click="loadInvitations"
            class="text-sm text-purple-600 hover:text-purple-800"
          >
            🔄 更新
          </button>
        </div>

        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-500">読み込み中...</p>
        </div>

        <div v-else-if="invitations.length === 0" class="text-center py-8">
          <p class="text-gray-500">招待はありません</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="invitation in invitations"
            :key="invitation.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <p class="font-semibold">{{ invitation.email }}</p>
                  <span
                    :class="[
                      'px-2 py-1 rounded text-xs font-medium',
                      getStatusClass(invitation.status),
                    ]"
                  >
                    {{ getStatusLabel(invitation.status) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  招待日: {{ formatDate(invitation.createdAt) }}
                </p>
                <p class="text-sm text-gray-600">
                  有効期限: {{ formatDate(invitation.expiresAt) }}
                </p>
                <p class="text-sm text-gray-500">
                  招待者: {{ invitation.invitedByName }}
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  v-if="invitation.status === 'pending'"
                  @click="resendInvitation(invitation.id)"
                  class="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded"
                >
                  再送信
                </button>
                <button
                  v-if="invitation.status === 'pending'"
                  @click="revokeInvitation(invitation.id)"
                  class="text-sm text-red-600 hover:text-red-800 px-3 py-1 border border-red-300 rounded"
                >
                  取り消し
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { Timestamp } from "firebase/firestore";
import type { AdminInvitation } from "~/types";

definePageMeta({
  middleware: "admin",
});

const router = useRouter();
const { user, appUser, logout } = useAuth();
const toast = useToast();
const confirmDialog = useConfirmDialog();

const invitationEmail = ref("");
const sending = ref(false);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const invitations = ref<AdminInvitation[]>([]);

const loadInvitations = async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const token = await user.value?.getIdToken();
    const response = await fetch("/api/admin/invitations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("招待一覧の取得に失敗しました");
    }

    const data = await response.json();
    invitations.value = data.invitations;
  } catch (error: unknown) {
    console.error("招待一覧取得エラー:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "招待一覧の取得に失敗しました";
  } finally {
    loading.value = false;
  }
};

const sendInvitation = async () => {
  sending.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const token = await user.value?.getIdToken();
    const response = await fetch("/api/admin/invite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: invitationEmail.value }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "招待の送信に失敗しました");
    }

    successMessage.value = `${invitationEmail.value} に招待を送信しました`;
    invitationEmail.value = "";

    // 招待一覧を更新
    await loadInvitations();
  } catch (error: unknown) {
    console.error("招待送信エラー:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "招待の送信に失敗しました";
  } finally {
    sending.value = false;
  }
};

const resendInvitation = async (invitationId: string) => {
  if (!(await confirmDialog.confirm("この招待を再送信しますか？"))) return;

  try {
    const token = await user.value?.getIdToken();
    const response = await fetch(
      `/api/admin/invitations/${invitationId}/resend`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("再送信に失敗しました");
    }

    successMessage.value = "招待を再送信しました";
    await loadInvitations();
  } catch (error: unknown) {
    console.error("再送信エラー:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "再送信に失敗しました";
  }
};

const revokeInvitation = async (invitationId: string) => {
  if (
    !(await confirmDialog.confirm({
      title: "確認",
      message: "この招待を取り消しますか？",
      type: "danger",
    }))
  )
    return;

  try {
    const token = await user.value?.getIdToken();
    const response = await fetch(
      `/api/admin/invitations/${invitationId}/revoke`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("取り消しに失敗しました");
    }

    successMessage.value = "招待を取り消しました";
    await loadInvitations();
  } catch (error: unknown) {
    console.error("取り消しエラー:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "取り消しに失敗しました";
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
      return "bg-green-100 text-green-800";
    case "expired":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "保留中";
    case "accepted":
      return "承認済み";
    case "expired":
      return "期限切れ";
    default:
      return status;
  }
};

const formatDate = (
  timestamp: Timestamp | Date | string | null | undefined,
) => {
  if (!timestamp) return "";
  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleLogout = async () => {
  await logout();
  router.push("/admin/login");
};

onMounted(() => {
  loadInvitations();
});
</script>
