<template>
  <header class="fixed top-0 w-full glass z-50 shadow-sm">
    <nav class="container-responsive py-3 flex items-center justify-between">
      <!-- 左: 予約サイトホームリンク -->
      <NuxtLink
        to="/"
        class="text-brown-900 hover:opacity-70 transition-opacity text-sm md:text-base font-medium"
      >
        家具の家 No.1 予約サイト
      </NuxtLink>

      <!-- 右: メニュー -->
      <div class="flex gap-3 md:gap-6 items-center">
        <!-- 認証状態に応じたボタン -->
        <template v-if="!authLoading">
          <template v-if="user">
            <NuxtLink
              to="/mypage"
              class="text-gray-700 hover:text-gray-900 transition-colors text-xs md:text-sm font-medium"
            >
              マイページ
            </NuxtLink>
            <button
              @click="handleLogout"
              class="text-gray-600 hover:text-gray-800 transition-colors text-xs md:text-sm"
            >
              ログアウト
            </button>
          </template>
          <NuxtLink
            v-else
            to="/login"
            class="text-gray-600 hover:text-gray-800 transition-colors text-xs md:text-sm"
          >
            ログイン
          </NuxtLink>
        </template>

        <!-- 紹介サイトリンク -->
        <a
          href="https://furniturehouse1.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="text-gray-700 hover:text-gray-900 transition-colors text-xs md:text-sm font-medium flex items-center gap-1"
        >
          <span class="hidden sm:inline">家具の家 No.1紹介サイト</span>
          <span class="sm:hidden">紹介</span>
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { user, loading: authLoading, logout } = useAuth();

// デバッグ用ログ
onMounted(() => {
  console.log(
    "[AppHeader] Mounted. Auth loading:",
    authLoading.value,
    "User:",
    user.value?.email || "null",
  );
});

watch(authLoading, (newVal) => {
  console.log("[AppHeader] Auth loading changed:", newVal);
});

watch(user, (newVal) => {
  console.log("[AppHeader] User changed:", newVal?.email || "null");
});

const handleLogout = async () => {
  try {
    await logout();
  } catch (error) {
    console.error("Logout error:", error);
  }
};
</script>
