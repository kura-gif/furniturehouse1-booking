<template>
  <header class="fixed top-0 w-full glass z-50 shadow-sm">
    <nav class="container-responsive py-3 flex items-center justify-between">
      <!-- ブランドサイトへ戻るリンク -->
      <a
        href="https://furniturehouse1.com/"
        class="flex items-center gap-1 md:gap-2 text-brown-900 hover:opacity-70 transition-opacity text-xs md:text-sm"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="hidden sm:inline">家具の家 No.1 のサイトへ戻る</span>
        <span class="sm:hidden">サイトへ戻る</span>
      </a>

      <!-- メニュー（デスクトップ・モバイル共通） -->
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
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
const { user, loading: authLoading, logout } = useAuth()

// デバッグ用ログ
onMounted(() => {
  console.log('[AppHeader] Mounted. Auth loading:', authLoading.value, 'User:', user.value?.email || 'null')
})

watch(authLoading, (newVal) => {
  console.log('[AppHeader] Auth loading changed:', newVal)
})

watch(user, (newVal) => {
  console.log('[AppHeader] User changed:', newVal?.email || 'null')
})

const handleLogout = async () => {
  try {
    await logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>
