<template>
  <div>
    <!-- ヘッダー -->
    <section class="bg-blue-600 text-white py-8 px-4">
      <div class="container-responsive">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">🚗</span>
          <h1 class="text-2xl font-bold">{{ $t('guestGuide.access.title') }}</h1>
        </div>
        <p class="text-sm opacity-90">{{ $t('guestGuide.access.subtitle') }}</p>
      </div>
    </section>

    <div class="container-responsive py-6">
      <!-- 住所 -->
      <section class="mb-8">
        <div class="guide-card p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">📍</span>
            <h2 class="text-base font-bold text-gray-900">{{ $t('guestGuide.access.address.title') }}</h2>
          </div>
          <p class="text-sm text-gray-700 mb-3">{{ $t('guestGuide.access.address.value') }}</p>
          <a
            href="https://maps.google.com/?q=山梨県南都留郡山中湖村平野"
            target="_blank"
            class="inline-flex items-center gap-1 text-sm text-primary-600 font-medium hover:text-primary-700"
          >
            {{ $t('guestGuide.access.openMap') }}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      <!-- 東京からのアクセス -->
      <section class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🚙</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.access.fromTokyo.title') }}</h2>
        </div>
        <div class="space-y-4">
          <div class="guide-card p-4">
            <h3 class="text-sm font-bold text-gray-900 mb-2">{{ $t('guestGuide.access.fromTokyo.car.title') }}</h3>
            <ul class="text-sm text-gray-600 space-y-2">
              <li>• {{ $t('guestGuide.access.fromTokyo.car.step1') }}</li>
              <li>• {{ $t('guestGuide.access.fromTokyo.car.step2') }}</li>
              <li>• {{ $t('guestGuide.access.fromTokyo.car.step3') }}</li>
            </ul>
            <p class="mt-3 text-xs text-gray-500">{{ $t('guestGuide.access.fromTokyo.car.time') }}</p>
          </div>
        </div>
      </section>

      <!-- 別荘地入口（重要） -->
      <section class="mb-8">
        <div class="bg-amber-50 border border-amber-200 p-4">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">🚧</span>
            <h2 class="text-base font-bold text-amber-900">{{ $t('guestGuide.access.gate.title') }}</h2>
          </div>
          <div class="space-y-3">
            <p class="text-sm text-amber-800">{{ $t('guestGuide.access.gate.desc') }}</p>
            <div class="bg-white border border-amber-300 p-3">
              <p class="text-xs text-amber-700 font-medium">{{ $t('guestGuide.access.gate.tellLabel') }}</p>
              <p class="text-base font-bold text-amber-900">{{ $t('guestGuide.access.gate.tellValue') }}</p>
            </div>
            <p class="text-sm text-amber-800">{{ $t('guestGuide.access.gate.time') }}</p>
          </div>
        </div>
      </section>

      <!-- ゲートから現地までの道順（動画） -->
      <section class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🎥</span>
          <h2 class="text-lg font-bold text-gray-900">ゲートから現地までの道順</h2>
        </div>
        <div class="guide-card overflow-hidden">
          <div class="aspect-video">
            <iframe
              class="w-full h-full"
              src="https://www.youtube.com/embed/H20Sqd7OYZA?si=G4sTLo7WTtBmx9ZD"
              title="ゲートから家具の家 no.1 までの道順"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
          <div class="p-4">
            <p class="text-sm text-gray-700">ゲートを通過後、家具の家 no.1 までの道順を動画でご確認いただけます。</p>
          </div>
        </div>
      </section>

      <!-- 別荘地地図 -->
      <section class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🗺️</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.access.map.title') }}</h2>
        </div>
        <div class="guide-card overflow-hidden">
          <div class="aspect-video bg-gray-100 flex items-center justify-center">
            <p class="text-sm text-gray-500">{{ $t('guestGuide.access.map.placeholder') }}</p>
          </div>
          <div class="p-4">
            <p class="text-sm text-gray-700">{{ $t('guestGuide.access.map.desc') }}</p>
          </div>
        </div>
      </section>

      <!-- 注意事項 -->
      <section>
        <div class="guide-card p-4">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">⚠️</span>
            <h2 class="text-base font-bold text-gray-900">{{ $t('guestGuide.access.notes.title') }}</h2>
          </div>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start gap-2">
              <span>🚗</span>
              <span>{{ $t('guestGuide.access.notes.note1') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span>🌙</span>
              <span>{{ $t('guestGuide.access.notes.note2') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span>📱</span>
              <span>{{ $t('guestGuide.access.notes.note3') }}</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'guide'
})

const { t } = useI18n()

useHead({
  title: t('guestGuide.access.meta.title'),
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
