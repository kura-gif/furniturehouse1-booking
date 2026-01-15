<template>
  <div>
    <!-- ヒーローセクション -->
    <section class="relative h-[50vh] min-h-[300px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200"
        alt="家具の家 no.1"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      <div class="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <p class="text-sm md:text-base font-medium mb-2 opacity-90">
          {{ $t('guestGuide.hero.welcome') }}
        </p>
        <h1 class="text-3xl md:text-5xl font-bold mb-4">
          {{ $t('guestGuide.hero.title') }}
        </h1>
        <p v-if="guestName" class="text-lg md:text-xl opacity-90">
          {{ $t('guestGuide.hero.greeting', { name: guestName }) }}
        </p>
      </div>
    </section>

    <!-- Wi-Fi情報 (認証済みの場合) -->
    <section v-if="isAuthenticated" class="bg-primary-50 border-b border-primary-100">
      <div class="container-responsive py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📶</span>
            <div>
              <p class="text-xs text-primary-600 font-medium">Wi-Fi</p>
              <p class="text-sm font-semibold text-gray-900">Furniture-a / Furniture-b</p>
            </div>
          </div>
          <button
            @click="copyWifiPassword"
            class="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            {{ copied ? $t('guestGuide.wifi.copied') : $t('guestGuide.wifi.copyPassword') }}
          </button>
        </div>
      </div>
    </section>

    <!-- クイックアクセス -->
    <section class="container-responsive py-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.to"
          :to="action.to"
          class="guide-card flex flex-col items-center p-5 text-center hover:shadow-lg transition-shadow"
        >
          <span class="text-3xl mb-2">{{ action.icon }}</span>
          <span class="text-sm font-medium text-gray-900">{{ $t(action.labelKey) }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- お出かけ前にお知らせしたいこと -->
    <section class="bg-amber-50 border-y border-amber-100">
      <div class="container-responsive py-6">
        <div class="flex items-start gap-3">
          <span class="text-2xl">📢</span>
          <div>
            <h2 class="text-base font-bold text-amber-900 mb-2">
              {{ $t('guestGuide.notice.title') }}
            </h2>
            <ul class="text-sm text-amber-800 space-y-1">
              <li>• {{ $t('guestGuide.notice.item1') }}</li>
              <li>• {{ $t('guestGuide.notice.item2') }}</li>
              <li>• {{ $t('guestGuide.notice.item3') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- セクション一覧 -->
    <section class="container-responsive py-8">
      <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('guestGuide.sections.title') }}</h2>
      <div class="space-y-3">
        <NuxtLink
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          class="guide-card flex items-center gap-4 p-4"
        >
          <span class="text-2xl">{{ section.icon }}</span>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t(section.titleKey) }}</h3>
            <p class="text-xs text-gray-500">{{ $t(section.descKey) }}</p>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </section>

    <!-- 緊急連絡先 -->
    <section class="container-responsive pb-8">
      <GuideEmergencyContact />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useGuideState } from '~/middleware/guest-guide'

definePageMeta({
  layout: 'guide',
  middleware: ['guest-guide']
})

const { t } = useI18n()

// ゲスト認証状態
const guideState = useGuideState()
const isAuthenticated = computed(() => guideState.value?.isAuthenticated ?? false)
const guestName = computed(() => guideState.value?.guestName ?? '')

// Wi-Fiパスワードコピー
const copied = ref(false)
const copyWifiPassword = async () => {
  try {
    await navigator.clipboard.writeText('House-01')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

// クイックアクション
const quickActions = [
  { to: '/guide/checkin', icon: '🔑', labelKey: 'guestGuide.quick.checkin' },
  { to: '/guide/wifi', icon: '📶', labelKey: 'guestGuide.quick.wifi' },
  { to: '/guide/amenities', icon: '🛋️', labelKey: 'guestGuide.quick.amenities' },
  { to: '/guide/area', icon: '🗺️', labelKey: 'guestGuide.quick.area' },
]

// セクション一覧
const sections = [
  { to: '/guide/about', icon: '🏛️', titleKey: 'guestGuide.sections.about', descKey: 'guestGuide.sections.aboutDesc' },
  { to: '/guide/access', icon: '🚗', titleKey: 'guestGuide.sections.access', descKey: 'guestGuide.sections.accessDesc' },
  { to: '/guide/checkin', icon: '🔑', titleKey: 'guestGuide.sections.checkin', descKey: 'guestGuide.sections.checkinDesc' },
  { to: '/guide/amenities', icon: '🛋️', titleKey: 'guestGuide.sections.amenities', descKey: 'guestGuide.sections.amenitiesDesc' },
  { to: '/guide/area', icon: '🗺️', titleKey: 'guestGuide.sections.area', descKey: 'guestGuide.sections.areaDesc' },
  { to: '/guide/rules', icon: '📋', titleKey: 'guestGuide.sections.rules', descKey: 'guestGuide.sections.rulesDesc' },
  { to: '/guide/faq', icon: '❓', titleKey: 'guestGuide.sections.faq', descKey: 'guestGuide.sections.faqDesc' },
]

// SEO
useHead({
  title: t('guestGuide.meta.title'),
  meta: [
    { name: 'description', content: t('guestGuide.meta.description') }
  ]
})
</script>

<style scoped>
.guide-card {
  @apply bg-white border border-gray-100 shadow-sm;
  transition: all 0.2s ease;
}

.guide-card:hover {
  @apply shadow-md border-gray-200;
}
</style>
