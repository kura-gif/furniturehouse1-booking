<template>
  <div>
    <!-- ヘッダー -->
    <section class="relative h-[25vh] min-h-[180px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200"
        alt="Mount Fuji Area"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center text-white">
          <span class="text-3xl mb-2 block">🗺️</span>
          <h1 class="text-2xl font-bold">{{ $t('guestGuide.area.title') }}</h1>
        </div>
      </div>
    </section>

    <div class="container-responsive py-6">
      <!-- カテゴリフィルター -->
      <div class="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors"
          :class="activeCategory === cat.id
            ? 'bg-primary-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ cat.icon }} {{ $t(cat.labelKey) }}
        </button>
      </div>

      <!-- スポットリスト -->
      <div class="space-y-4">
        <template v-for="spot in filteredSpots" :key="spot.id">
          <div class="guide-card overflow-hidden">
            <div class="flex">
              <div v-if="spot.image" class="w-24 h-24 shrink-0">
                <img :src="spot.image" :alt="$t(spot.nameKey)" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 p-3">
                <div class="flex items-start justify-between mb-1">
                  <h3 class="text-sm font-bold text-gray-900">{{ $t(spot.nameKey) }}</h3>
                  <span v-if="spot.recommended" class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5">
                    {{ $t('guestGuide.area.recommended') }}
                  </span>
                </div>
                <p class="text-xs text-gray-500 mb-2">{{ $t(spot.descKey) }}</p>
                <div class="flex items-center gap-3 text-xs text-gray-400">
                  <span class="flex items-center gap-1">
                    <span>🚗</span>
                    {{ spot.travelTime }}{{ $t('guestGuide.area.minutes') }}
                  </span>
                  <span>{{ spot.categoryIcon }} {{ $t(spot.categoryKey) }}</span>
                </div>
              </div>
            </div>
            <div class="border-t border-gray-100 px-3 py-2 flex gap-2">
              <a
                v-if="spot.mapUrl"
                :href="spot.mapUrl"
                target="_blank"
                class="flex-1 text-center py-2 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
              >
                📍 {{ $t('guestGuide.area.openMap') }}
              </a>
              <a
                v-if="spot.websiteUrl"
                :href="spot.websiteUrl"
                target="_blank"
                class="flex-1 text-center py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                🔗 {{ $t('guestGuide.area.website') }}
              </a>
            </div>
          </div>
        </template>
      </div>

      <!-- 空の状態 -->
      <div v-if="filteredSpots.length === 0" class="text-center py-12">
        <span class="text-4xl mb-4 block">🔍</span>
        <p class="text-gray-500">{{ $t('guestGuide.area.noSpots') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'guide'
})

const { t } = useI18n()
const activeCategory = ref('all')

const categories = [
  { id: 'all', icon: '📋', labelKey: 'guestGuide.area.cat.all' },
  { id: 'cafe', icon: '☕', labelKey: 'guestGuide.area.cat.cafe' },
  { id: 'restaurant', icon: '🍽️', labelKey: 'guestGuide.area.cat.restaurant' },
  { id: 'shopping', icon: '🛒', labelKey: 'guestGuide.area.cat.shopping' },
  { id: 'activity', icon: '🎿', labelKey: 'guestGuide.area.cat.activity' },
  { id: 'spa', icon: '♨️', labelKey: 'guestGuide.area.cat.spa' },
]

const spots = [
  {
    id: 1,
    nameKey: 'guestGuide.area.spots.papermoon',
    descKey: 'guestGuide.area.spots.papermoonDesc',
    category: 'cafe',
    categoryIcon: '☕',
    categoryKey: 'guestGuide.area.cat.cafe',
    travelTime: 17,
    recommended: true,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
    mapUrl: 'https://maps.google.com/?q=Paper+Moon+Yamanakako',
    websiteUrl: null,
  },
  {
    id: 2,
    nameKey: 'guestGuide.area.spots.fabcafe',
    descKey: 'guestGuide.area.spots.fabcafeDesc',
    category: 'cafe',
    categoryIcon: '☕',
    categoryKey: 'guestGuide.area.cat.cafe',
    travelTime: 24,
    recommended: true,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    mapUrl: 'https://maps.google.com/?q=FabCafe+Fuji',
    websiteUrl: null,
  },
  {
    id: 3,
    nameKey: 'guestGuide.area.spots.newmid',
    descKey: 'guestGuide.area.spots.newmidDesc',
    category: 'restaurant',
    categoryIcon: '🍽️',
    categoryKey: 'guestGuide.area.cat.restaurant',
    travelTime: 15,
    recommended: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    mapUrl: 'https://maps.google.com/?q=NEW+MID+Pizza',
    websiteUrl: null,
  },
  {
    id: 4,
    nameKey: 'guestGuide.area.spots.nagaike',
    descKey: 'guestGuide.area.spots.nagaikeDesc',
    category: 'shopping',
    categoryIcon: '🛒',
    categoryKey: 'guestGuide.area.cat.shopping',
    travelTime: 5,
    recommended: false,
    image: null,
    mapUrl: 'https://maps.google.com/?q=長池精肉店',
    websiteUrl: 'https://www.nagaiketoriya.jp/',
  },
  {
    id: 5,
    nameKey: 'guestGuide.area.spots.ogino',
    descKey: 'guestGuide.area.spots.oginoDesc',
    category: 'shopping',
    categoryIcon: '🛒',
    categoryKey: 'guestGuide.area.cat.shopping',
    travelTime: 10,
    recommended: false,
    image: null,
    mapUrl: 'https://maps.google.com/?q=OGINO+山中湖',
    websiteUrl: null,
  },
  {
    id: 6,
    nameKey: 'guestGuide.area.spots.benifuji',
    descKey: 'guestGuide.area.spots.benifujiDesc',
    category: 'spa',
    categoryIcon: '♨️',
    categoryKey: 'guestGuide.area.cat.spa',
    travelTime: 13,
    recommended: false,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
    mapUrl: 'https://maps.google.com/?q=紅富士の湯',
    websiteUrl: 'https://www.benifuji.co.jp/',
  },
  {
    id: 7,
    nameKey: 'guestGuide.area.spots.cycl',
    descKey: 'guestGuide.area.spots.cyclDesc',
    category: 'spa',
    categoryIcon: '♨️',
    categoryKey: 'guestGuide.area.cat.spa',
    travelTime: 15,
    recommended: true,
    image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400',
    mapUrl: 'https://maps.google.com/?q=CYCL+Sauna',
    websiteUrl: 'https://cycl.co.jp/',
  },
  {
    id: 8,
    nameKey: 'guestGuide.area.spots.fujiQ',
    descKey: 'guestGuide.area.spots.fujiQDesc',
    category: 'activity',
    categoryIcon: '🎿',
    categoryKey: 'guestGuide.area.cat.activity',
    travelTime: 22,
    recommended: false,
    image: 'https://images.unsplash.com/photo-1565942445612-c65bbcf52dc9?w=400',
    mapUrl: 'https://maps.google.com/?q=富士急ハイランド',
    websiteUrl: null,
  },
]

const filteredSpots = computed(() => {
  if (activeCategory.value === 'all') {
    return spots
  }
  return spots.filter(s => s.category === activeCategory.value)
})

useHead({
  title: t('guestGuide.area.meta.title'),
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
