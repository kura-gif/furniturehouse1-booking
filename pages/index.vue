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
const SitePage = defineAsyncComponent(() => import('~/components/pages/SiteIndexPage.vue'))

const pageType = ref<'booking' | 'chladni' | 'site'>('booking')

// サーバーサイドでホストを取得
if (import.meta.server) {
  const headers = useRequestHeaders()
  const host = headers['host'] || ''

  if (host === 'chladni.co.jp' || host === 'www.chladni.co.jp') {
    pageType.value = 'chladni'
  } else if (host === 'furniturehouse1.com' || host === 'www.furniturehouse1.com') {
    pageType.value = 'site'
  } else {
    // booking.furniturehouse1.com または localhost など
    pageType.value = 'booking'
  }
}

// クライアントサイドでホストを取得
if (import.meta.client) {
  const host = window.location.host

  if (host === 'chladni.co.jp' || host === 'www.chladni.co.jp') {
    pageType.value = 'chladni'
  } else if (host === 'furniturehouse1.com' || host === 'www.furniturehouse1.com') {
    pageType.value = 'site'
  } else {
    // booking.furniturehouse1.com または localhost など
    pageType.value = 'booking'
  }
}

const currentPage = computed(() => {
  if (pageType.value === 'chladni') return ChladniPage
  if (pageType.value === 'site') return SitePage
  return BookingPage
})
</script>
