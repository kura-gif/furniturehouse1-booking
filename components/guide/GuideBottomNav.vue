<template>
  <nav class="guide-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
    <div class="h-16 grid grid-cols-5">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center justify-center gap-1 transition-colors"
        :class="isActive(item.to) ? 'text-primary-600' : 'text-gray-500'"
      >
        <span class="text-xl">{{ item.icon }}</span>
        <span class="text-[10px] font-medium">{{ $t(item.labelKey) }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()

const navItems = [
  { to: '/guide', icon: '🏠', labelKey: 'guestGuide.nav.homeShort' },
  { to: '/guide/checkin', icon: '🔑', labelKey: 'guestGuide.nav.checkinShort' },
  { to: '/guide/amenities', icon: '🛋️', labelKey: 'guestGuide.nav.amenitiesShort' },
  { to: '/guide/area', icon: '🗺️', labelKey: 'guestGuide.nav.areaShort' },
  { to: '/guide/faq', icon: '❓', labelKey: 'guestGuide.nav.faqShort' },
]

const isActive = (path: string) => {
  if (path === '/guide') {
    return route.path === '/guide'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
