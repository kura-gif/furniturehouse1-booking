<template>
  <div>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// アプリケーションのルートコンポーネント
const { initAuth } = useAuth()

// 認証状態の監視を開始
onMounted(() => {
  initAuth()
})

useHead({
  htmlAttrs: {
    lang: 'ja'
  },
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com'
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: ''
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap'
    }
  ]
})
</script>

<style>
* {
  font-family: 'Noto Sans JP', 'Tsukushi Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
}
</style>
