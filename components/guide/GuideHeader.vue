<template>
  <header class="guide-header fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-organic-border">
    <div class="h-14 px-4 flex items-center justify-between">
      <!-- 左: ロゴ -->
      <NuxtLink to="/guide" class="flex items-center">
        <svg class="w-5 h-5 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      </NuxtLink>

      <!-- 右: 言語切替 & メニュー -->
      <div class="flex items-center gap-3">
        <!-- 言語切替 -->
        <button
          @click="toggleLocale"
          class="px-2 py-1 text-xs font-medium text-organic-text-light hover:text-organic-text transition-colors border border-organic-border hover:border-organic-accent"
          style="border-radius: 0 !important;"
        >
          {{ locale === 'ja' ? 'EN' : 'JA' }}
        </button>

        <!-- メニューボタン (デスクトップ) -->
        <button
          @click="toggleMenu"
          class="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm text-organic-text-light hover:text-organic-text transition-colors"
        >
          <span>{{ $t('guestGuide.menu') }}</span>
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': isMenuOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- ドロップダウンメニュー (デスクトップ) -->
    <Transition name="slide-down">
      <div
        v-if="isMenuOpen"
        class="hidden md:block absolute top-full left-0 right-0 bg-white border-b border-organic-border shadow-lg"
        style="border-radius: 0 !important;"
      >
        <nav class="max-w-4xl mx-auto py-4 px-6">
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 p-3 hover:bg-organic-cream transition-colors"
              @click="isMenuOpen = false"
            >
              <div class="w-6 h-6 flex items-center justify-center text-organic-accent" v-html="item.iconSvg"></div>
              <div>
                <div class="text-sm font-medium text-organic-text">{{ $t(item.labelKey) }}</div>
                <div class="text-xs text-organic-text-light">{{ $t(item.descKey) }}</div>
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
  { to: '/guide', iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>', labelKey: 'guestGuide.nav.home', descKey: 'guestGuide.nav.homeDesc' },
  { to: '/guide/about', iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>', labelKey: 'guestGuide.nav.about', descKey: 'guestGuide.nav.aboutDesc' },
  { to: '/guide/checkin', iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>', labelKey: 'guestGuide.nav.checkin', descKey: 'guestGuide.nav.checkinDesc' },
  { to: '/guide/amenities', iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>', labelKey: 'guestGuide.nav.amenities', descKey: 'guestGuide.nav.amenitiesDesc' },
  { to: '/guide/area', iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>', labelKey: 'guestGuide.nav.area', descKey: 'guestGuide.nav.areaDesc' },
  { to: '/guide/faq', iconSvg: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>', labelKey: 'guestGuide.nav.faq', descKey: 'guestGuide.nav.faqDesc' },
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
