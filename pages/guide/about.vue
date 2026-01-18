<template>
  <div>
    <!-- ヘッダー画像 -->
    <section class="relative h-[30vh] min-h-[200px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"
        alt="家具の家 no.1"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/40" />
      <div class="absolute inset-0 flex items-center justify-center">
        <h1 class="text-2xl md:text-4xl font-bold text-white">
          {{ $t('guestGuide.about.title') }}
        </h1>
      </div>
    </section>

    <div class="container-responsive py-8">
      <!-- 建築家 坂茂 -->
      <section class="mb-10">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">👨‍🎨</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.about.architect.title') }}</h2>
        </div>
        <div class="guide-card p-4 mb-4">
          <p class="text-sm text-gray-700 leading-relaxed">
            {{ $t('guestGuide.about.architect.desc') }}
          </p>
        </div>

        <!-- YouTube動画 -->
        <div class="space-y-4">
          <div class="aspect-video bg-gray-100">
            <iframe
              class="w-full h-full"
              src="https://www.youtube.com/embed/q43uXdOKPD8"
              title="坂茂 2013年プレゼンテーション"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p class="text-xs text-gray-500 text-center">{{ $t('guestGuide.about.video1') }}</p>

          <div class="aspect-video bg-gray-100">
            <iframe
              class="w-full h-full"
              src="https://www.youtube.com/embed/tBliJ1UNs1Q"
              title="下瀬美術館 家具の家no.1"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p class="text-xs text-gray-500 text-center">{{ $t('guestGuide.about.video2') }}</p>
        </div>
      </section>

      <!-- 修復・竣工記録 -->
      <section class="mb-10">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">📚</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.about.history.title') }}</h2>
        </div>
        <div class="space-y-3">
          <NuxtLink
            to="#"
            class="guide-card flex items-center gap-4 p-4"
          >
            <span class="text-xl">🔧</span>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('guestGuide.about.history.renovation') }}</h3>
              <p class="text-xs text-gray-500">2024</p>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="#"
            class="guide-card flex items-center gap-4 p-4"
          >
            <span class="text-xl">🏗️</span>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('guestGuide.about.history.construction') }}</h3>
              <p class="text-xs text-gray-500">1995</p>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </section>

      <!-- 周辺環境 -->
      <section class="mb-10">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🌲</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.about.environment.title') }}</h2>
        </div>
        <div class="guide-card p-4">
          <p class="text-sm text-gray-700 leading-relaxed">
            {{ $t('guestGuide.about.environment.desc') }}
          </p>
        </div>
      </section>

      <!-- 関連リンク -->
      <section>
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🔗</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.about.links.title') }}</h2>
        </div>
        <div class="space-y-3">
          <a
            href="https://furniturehouse1.com/"
            target="_blank"
            rel="noopener noreferrer"
            class="guide-card flex items-center gap-4 p-4"
          >
            <span class="text-xl">🏠</span>
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-gray-900">{{ $t('guestGuide.about.links.official') }}</h3>
            </div>
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
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
  title: t('guestGuide.about.meta.title'),
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
