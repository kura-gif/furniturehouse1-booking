<template>
  <div>
    <!-- ヘッダー -->
    <section class="bg-brown-900 text-white py-8 px-4">
      <div class="container-responsive">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">🛋️</span>
          <h1 class="text-2xl font-bold">{{ $t('guestGuide.amenities.title') }}</h1>
        </div>
        <p class="text-sm opacity-90">{{ $t('guestGuide.amenities.subtitle') }}</p>
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
            ? 'bg-brown-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
        >
          {{ cat.icon }} {{ $t(cat.labelKey) }}
        </button>
      </div>

      <!-- アメニティリスト -->
      <div class="space-y-6">
        <!-- IHコンロ (注意事項あり) -->
        <section v-if="activeCategory === 'all' || activeCategory === 'kitchen'" class="guide-card overflow-hidden">
          <div class="bg-amber-50 border-b border-amber-200 px-4 py-2">
            <p class="text-xs text-amber-800 font-medium flex items-center gap-1">
              <span>⚠️</span>
              {{ $t('guestGuide.amenities.ih.warning') }}
            </p>
          </div>
          <div class="p-4">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">🔥</span>
              <h3 class="text-base font-bold text-gray-900">{{ $t('guestGuide.amenities.ih.title') }}</h3>
            </div>
            <div class="aspect-video bg-gray-100 mb-3">
              <img
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"
                alt="IH Cooktop"
                class="w-full h-full object-cover"
              />
            </div>
            <NuxtLink
              to="/guide/amenities/ih"
              class="inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700"
            >
              {{ $t('guestGuide.amenities.viewDetail') }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>
        </section>

        <!-- 調理家電 -->
        <section v-if="activeCategory === 'all' || activeCategory === 'kitchen'">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🍳</span>
            {{ $t('guestGuide.amenities.cooking.title') }}
          </h2>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="item in cookingItems" :key="item.key" class="guide-card p-3">
              <span class="text-xl">{{ item.icon }}</span>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ $t(item.key) }}</p>
            </div>
          </div>
        </section>

        <!-- バス・トイレ -->
        <section v-if="activeCategory === 'all' || activeCategory === 'bath'">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🛁</span>
            {{ $t('guestGuide.amenities.bath.title') }}
          </h2>
          <div class="guide-card p-4 mb-4">
            <div class="flex items-center gap-3 mb-3">
              <img
                src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400"
                alt="Bathroom"
                class="w-20 h-20 object-cover"
              />
              <div>
                <h3 class="text-sm font-bold text-gray-900 mb-1">{{ $t('guestGuide.amenities.bath.shampoo') }}</h3>
                <p class="text-xs text-gray-500">SOMEWHERE</p>
                <a
                  href="https://somewherebeauty.com/"
                  target="_blank"
                  class="text-xs text-primary-600 hover:underline"
                >
                  {{ $t('guestGuide.amenities.viewBrand') }}
                </a>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="item in bathItems" :key="item.key" class="guide-card p-3">
              <span class="text-xl">{{ item.icon }}</span>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ $t(item.key) }}</p>
            </div>
          </div>
        </section>

        <!-- アメニティ -->
        <section v-if="activeCategory === 'all' || activeCategory === 'amenity'">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🧴</span>
            {{ $t('guestGuide.amenities.amenity.title') }}
          </h2>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="item in amenityItems" :key="item.key" class="guide-card p-3">
              <span class="text-xl">{{ item.icon }}</span>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ $t(item.key) }}</p>
            </div>
          </div>
        </section>

        <!-- 家電 -->
        <section v-if="activeCategory === 'all' || activeCategory === 'appliance'">
          <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📺</span>
            {{ $t('guestGuide.amenities.appliance.title') }}
          </h2>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="item in applianceItems" :key="item.key" class="guide-card p-3">
              <span class="text-xl">{{ item.icon }}</span>
              <p class="text-sm font-medium text-gray-900 mt-1">{{ $t(item.key) }}</p>
            </div>
          </div>
        </section>
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
  { id: 'all', icon: '📋', labelKey: 'guestGuide.amenities.cat.all' },
  { id: 'kitchen', icon: '🍳', labelKey: 'guestGuide.amenities.cat.kitchen' },
  { id: 'bath', icon: '🛁', labelKey: 'guestGuide.amenities.cat.bath' },
  { id: 'amenity', icon: '🧴', labelKey: 'guestGuide.amenities.cat.amenity' },
  { id: 'appliance', icon: '📺', labelKey: 'guestGuide.amenities.cat.appliance' },
]

const cookingItems = [
  { icon: '🍚', key: 'guestGuide.amenities.item.riceCooker' },
  { icon: '☕', key: 'guestGuide.amenities.item.coffeeMaker' },
  { icon: '🫖', key: 'guestGuide.amenities.item.kettle' },
  { icon: '🍞', key: 'guestGuide.amenities.item.toaster' },
  { icon: '🔥', key: 'guestGuide.amenities.item.cassette' },
  { icon: '🥘', key: 'guestGuide.amenities.item.pot' },
  { icon: '🍳', key: 'guestGuide.amenities.item.frypan' },
]

const bathItems = [
  { icon: '🧴', key: 'guestGuide.amenities.item.shampoo' },
  { icon: '🧼', key: 'guestGuide.amenities.item.bodySoap' },
  { icon: '🛁', key: 'guestGuide.amenities.item.bathSalt' },
  { icon: '🚿', key: 'guestGuide.amenities.item.bathMat' },
]

const amenityItems = [
  { icon: '🪥', key: 'guestGuide.amenities.item.toothbrush' },
  { icon: '🧻', key: 'guestGuide.amenities.item.tissue' },
  { icon: '🧴', key: 'guestGuide.amenities.item.medicine' },
  { icon: '🪭', key: 'guestGuide.amenities.item.towel' },
  { icon: '🦟', key: 'guestGuide.amenities.item.bugSpray' },
  { icon: '🩴', key: 'guestGuide.amenities.item.slippers' },
]

const applianceItems = [
  { icon: '💨', key: 'guestGuide.amenities.item.dryer' },
  { icon: '🔊', key: 'guestGuide.amenities.item.speaker' },
  { icon: '🌀', key: 'guestGuide.amenities.item.fan' },
  { icon: '👕', key: 'guestGuide.amenities.item.washer' },
  { icon: '🌡️', key: 'guestGuide.amenities.item.heater' },
]

useHead({
  title: t('guestGuide.amenities.meta.title'),
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
