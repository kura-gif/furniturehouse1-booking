<template>
  <component :is="currentPage" />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

definePageMeta({
  layout: false
})

// ドメインに基づいて表示するページを決定
const BookingPage = defineAsyncComponent(() => import('~/components/pages/BookingIndexPage.vue'))
const ChladniPage = defineAsyncComponent(() => import('~/components/pages/ChladniIndexPage.vue'))

const isChladniDomain = ref(false)

// サーバーサイドでホストを取得
if (import.meta.server) {
  const headers = useRequestHeaders()
  const host = headers['host'] || ''
  isChladniDomain.value = host === 'chladni.co.jp' || host === 'www.chladni.co.jp'
}

// クライアントサイドでホストを取得
if (import.meta.client) {
  isChladniDomain.value = window.location.host === 'chladni.co.jp' || window.location.host === 'www.chladni.co.jp'
}

const currentPage = computed(() => {
  return isChladniDomain.value ? ChladniPage : BookingPage
})
</script>
