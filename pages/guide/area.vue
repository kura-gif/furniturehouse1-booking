<template>
  <div class="guide-page guide-organic-bg">
    <!-- ヘッダー -->
    <section class="relative h-[25vh] min-h-[180px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1200"
        alt="Mount Fuji Area"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/40" />
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center text-white">
          <svg
            class="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
            />
          </svg>
          <h1 class="guide-title text-2xl text-white">
            {{ $t("guestGuide.area.title") }}
          </h1>
        </div>
      </div>
    </section>

    <div class="max-w-md mx-auto px-4 py-6">
      <!-- カテゴリフィルター -->
      <div class="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-4 px-4">
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = cat.id"
          class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2"
          :class="
            activeCategory === cat.id
              ? 'bg-organic-button text-white'
              : 'bg-white text-organic-text hover:bg-organic-cream border border-organic-border'
          "
          style="border-radius: 0 !important"
        >
          <span v-html="sanitizeSvg(cat.iconSvg)" class="w-4 h-4"></span>
          {{ $t(cat.labelKey) }}
        </button>
      </div>

      <!-- スポットリスト -->
      <div class="space-y-4">
        <template v-for="spot in filteredSpots" :key="spot.id">
          <div
            class="bg-white shadow-sm overflow-hidden"
            style="border-radius: 0 !important"
          >
            <div class="flex">
              <div v-if="spot.image" class="w-24 h-24 shrink-0">
                <img
                  :src="spot.image"
                  :alt="$t(spot.nameKey)"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 p-3">
                <div class="flex items-start justify-between mb-1">
                  <h3 class="text-sm font-medium text-organic-text">
                    {{ $t(spot.nameKey) }}
                  </h3>
                  <span
                    v-if="spot.recommended"
                    class="text-xs bg-amber-100 text-amber-800 px-2 py-0.5"
                    style="border-radius: 0 !important"
                  >
                    {{ $t("guestGuide.area.recommended") }}
                  </span>
                </div>
                <p class="text-xs text-organic-text-light mb-2">
                  {{ $t(spot.descKey) }}
                </p>
                <div
                  class="flex items-center gap-3 text-xs text-organic-text-light"
                >
                  <span class="flex items-center gap-1">
                    <svg
                      class="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                    {{ spot.travelTime }}{{ $t("guestGuide.area.minutes") }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span v-html="sanitizeSvg(spot.categoryIconSvg)" class="w-3 h-3"></span>
                    {{ $t(spot.categoryKey) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="border-t border-organic-border px-3 py-2 flex gap-2">
              <a
                v-if="spot.mapUrl"
                :href="spot.mapUrl"
                target="_blank"
                class="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-organic-accent hover:bg-organic-cream transition-colors"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
                {{ $t("guestGuide.area.openMap") }}
              </a>
              <a
                v-if="spot.websiteUrl"
                :href="spot.websiteUrl"
                target="_blank"
                class="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium text-organic-text-light hover:bg-organic-cream transition-colors"
              >
                <svg
                  class="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                  />
                </svg>
                {{ $t("guestGuide.area.website") }}
              </a>
            </div>
          </div>
        </template>
      </div>

      <!-- 空の状態 -->
      <div v-if="filteredSpots.length === 0" class="text-center py-12">
        <svg
          class="w-10 h-10 mx-auto mb-4 text-organic-text-light"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <p class="text-organic-text-light">
          {{ $t("guestGuide.area.noSpots") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "guide",
});

const { t } = useI18n();
const { sanitizeSvg } = useSanitize();
const activeCategory = ref("all");

const categories = [
  {
    id: "all",
    iconSvg:
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>',
    labelKey: "guestGuide.area.cat.all",
  },
  {
    id: "cafe",
    iconSvg:
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>',
    labelKey: "guestGuide.area.cat.cafe",
  },
  {
    id: "restaurant",
    iconSvg:
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5" /></svg>',
    labelKey: "guestGuide.area.cat.restaurant",
  },
  {
    id: "shopping",
    iconSvg:
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>',
    labelKey: "guestGuide.area.cat.shopping",
  },
  {
    id: "activity",
    iconSvg:
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" /></svg>',
    labelKey: "guestGuide.area.cat.activity",
  },
  {
    id: "spa",
    iconSvg:
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>',
    labelKey: "guestGuide.area.cat.spa",
  },
];

const spots = [
  {
    id: 1,
    nameKey: "guestGuide.area.spots.papermoon",
    descKey: "guestGuide.area.spots.papermoonDesc",
    category: "cafe",
    categoryIconSvg:
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>',
    categoryKey: "guestGuide.area.cat.cafe",
    travelTime: 17,
    recommended: true,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
    mapUrl: "https://maps.google.com/?q=Paper+Moon+Yamanakako",
    websiteUrl: null,
  },
  {
    id: 2,
    nameKey: "guestGuide.area.spots.fabcafe",
    descKey: "guestGuide.area.spots.fabcafeDesc",
    category: "cafe",
    categoryIconSvg:
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>',
    categoryKey: "guestGuide.area.cat.cafe",
    travelTime: 24,
    recommended: true,
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
    mapUrl: "https://maps.google.com/?q=FabCafe+Fuji",
    websiteUrl: null,
  },
  {
    id: 3,
    nameKey: "guestGuide.area.spots.newmid",
    descKey: "guestGuide.area.spots.newmidDesc",
    category: "restaurant",
    categoryIconSvg:
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513M3 16.5l1.5-.75" /></svg>',
    categoryKey: "guestGuide.area.cat.restaurant",
    travelTime: 15,
    recommended: true,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    mapUrl: "https://maps.google.com/?q=NEW+MID+Pizza",
    websiteUrl: null,
  },
  {
    id: 4,
    nameKey: "guestGuide.area.spots.nagaike",
    descKey: "guestGuide.area.spots.nagaikeDesc",
    category: "shopping",
    categoryIconSvg:
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>',
    categoryKey: "guestGuide.area.cat.shopping",
    travelTime: 5,
    recommended: false,
    image: null,
    mapUrl: "https://maps.google.com/?q=長池精肉店",
    websiteUrl: "https://www.nagaiketoriya.jp/",
  },
  {
    id: 5,
    nameKey: "guestGuide.area.spots.ogino",
    descKey: "guestGuide.area.spots.oginoDesc",
    category: "shopping",
    categoryIconSvg:
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>',
    categoryKey: "guestGuide.area.cat.shopping",
    travelTime: 10,
    recommended: false,
    image: null,
    mapUrl: "https://maps.google.com/?q=OGINO+山中湖",
    websiteUrl: null,
  },
  {
    id: 6,
    nameKey: "guestGuide.area.spots.benifuji",
    descKey: "guestGuide.area.spots.benifujiDesc",
    category: "spa",
    categoryIconSvg:
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>',
    categoryKey: "guestGuide.area.cat.spa",
    travelTime: 13,
    recommended: false,
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
    mapUrl: "https://maps.google.com/?q=紅富士の湯",
    websiteUrl: "https://www.benifuji.co.jp/",
  },
  {
    id: 7,
    nameKey: "guestGuide.area.spots.cycl",
    descKey: "guestGuide.area.spots.cyclDesc",
    category: "spa",
    categoryIconSvg:
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /></svg>',
    categoryKey: "guestGuide.area.cat.spa",
    travelTime: 15,
    recommended: true,
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=400",
    mapUrl: "https://maps.google.com/?q=CYCL+Sauna",
    websiteUrl: "https://cycl.co.jp/",
  },
  {
    id: 8,
    nameKey: "guestGuide.area.spots.fujiQ",
    descKey: "guestGuide.area.spots.fujiQDesc",
    category: "activity",
    categoryIconSvg:
      '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497" /></svg>',
    categoryKey: "guestGuide.area.cat.activity",
    travelTime: 22,
    recommended: false,
    image: "https://images.unsplash.com/photo-1565942445612-c65bbcf52dc9?w=400",
    mapUrl: "https://maps.google.com/?q=富士急ハイランド",
    websiteUrl: null,
  },
];

const filteredSpots = computed(() => {
  if (activeCategory.value === "all") {
    return spots;
  }
  return spots.filter((s) => s.category === activeCategory.value);
});

useHead({
  title: t("guestGuide.area.meta.title"),
});
</script>

<style scoped>
.guide-page {
  max-width: 100%;
  overflow-x: hidden;
}
</style>
