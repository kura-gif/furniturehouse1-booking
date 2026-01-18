<template>
  <div class="guide-layout min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <GuideHeader />

    <!-- メインコンテンツ -->
    <main class="pb-20 md:pb-8">
      <slot />
    </main>

    <!-- ボトムナビゲーション (モバイル) -->
    <GuideBottomNav class="md:hidden" />
  </div>
</template>

<script setup lang="ts">
// ガイドブック用レイアウト
</script>

<style scoped>
.guide-layout {
  --guide-header-height: 56px;
  --guide-bottom-nav-height: 64px;
}

main {
  padding-top: var(--guide-header-height);
}

@media (max-width: 767px) {
  main {
    padding-bottom: var(--guide-bottom-nav-height);
  }
}
</style>
