<script setup lang="ts">
/**
 * スキップリンクコンポーネント
 * キーボードユーザーがナビゲーションをスキップしてメインコンテンツに直接移動できる
 * WCAG 2.4.1 - Bypass Blocks準拠
 */

interface Props {
  targetId?: string
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  targetId: 'main-content',
  label: 'メインコンテンツへスキップ'
})

const skipToContent = () => {
  const target = document.getElementById(props.targetId)
  if (target) {
    target.focus()
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <a
    :href="`#${targetId}`"
    @click.prevent="skipToContent"
    class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
  >
    {{ label }}
  </a>
</template>

<style scoped>
/* スクリーンリーダー専用クラス（フォーカス時は表示） */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: fixed;
  width: auto;
  height: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
</style>
