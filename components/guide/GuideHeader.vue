<template>
  <header class="guide-header fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
    <div class="h-14 px-4 flex items-center justify-between">
      <!-- 左: ロゴ/タイトル -->
      <NuxtLink to="/guide" class="flex items-center gap-2">
        <div class="w-8 h-8 bg-gradient-primary flex items-center justify-center">
          <span class="text-white text-xs font-bold">FH</span>
        </div>
        <span class="text-sm font-semibold text-brown-900">
          {{ $t('guestGuide.title') }}
        </span>
      </NuxtLink>

      <!-- 右: 言語切替 & メニュー -->
      <div class="flex items-center gap-3">
        <!-- 言語切替 -->
        <button
          @click="toggleLocale"
          class="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 hover:border-gray-300"
        >
          {{ locale === 'ja' ? 'EN' : 'JA' }}
        </button>

        <!-- メニューボタン (デスクトップ) -->
        <button
          @click="toggleMenu"
          class="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>{{ $t('guestGuide.menu') }}</span>
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': isMenuOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ドロップダウンメニュー (デスクトップ) -->
    <Transition name="slide-down">
      <div
        v-if="isMenuOpen"
        class="hidden md:block absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-lg"
      >
        <nav class="max-w-4xl mx-auto py-4 px-6">
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
              @click="isMenuOpen = false"
            >
              <span class="text-2xl">{{ item.icon }}</span>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ $t(item.labelKey) }}</div>
                <div class="text-xs text-gray-500">{{ $t(item.descKey) }}</div>
              </div>
            </NuxtLink>
          </div>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { locale, setLocale } = useI18n()
const isMenuOpen = ref(false)

const menuItems = [
  { to: '/guide', icon: '🏠', labelKey: 'guestGuide.nav.home', descKey: 'guestGuide.nav.homeDesc' },
  { to: '/guide/about', icon: '🏛️', labelKey: 'guestGuide.nav.about', descKey: 'guestGuide.nav.aboutDesc' },
  { to: '/guide/checkin', icon: '🔑', labelKey: 'guestGuide.nav.checkin', descKey: 'guestGuide.nav.checkinDesc' },
  { to: '/guide/amenities', icon: '🛋️', labelKey: 'guestGuide.nav.amenities', descKey: 'guestGuide.nav.amenitiesDesc' },
  { to: '/guide/area', icon: '🗺️', labelKey: 'guestGuide.nav.area', descKey: 'guestGuide.nav.areaDesc' },
  { to: '/guide/faq', icon: '❓', labelKey: 'guestGuide.nav.faq', descKey: 'guestGuide.nav.faqDesc' },
]

const toggleLocale = () => {
  setLocale(locale.value === 'ja' ? 'en' : 'ja')
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// クリック外で閉じる
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.guide-header')) {
    isMenuOpen.value = false
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
