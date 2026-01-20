<template>
  <div class="guide-page guide-organic-bg">
    <!-- ヘッダー画像 -->
    <section class="relative h-[30vh] min-h-[200px] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200"
        alt="家具の家 no.1"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-black/40" />
      <div class="absolute inset-0 flex items-center justify-center">
        <h1 class="guide-title text-2xl md:text-4xl text-white drop-shadow-md">
          {{ $t('guestGuide.about.title') }}
        </h1>
      </div>
    </section>

    <div class="max-w-md mx-auto px-4 py-8">
      <!-- 建築家 坂茂 -->
      <section class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-5 h-5 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <h2 class="guide-title text-base">{{ $t('guestGuide.about.architect.title') }}</h2>
        </div>
        <div class="bg-white p-4 mb-4 shadow-sm" style="border-radius: 0 !important;">
          <p class="text-sm text-organic-text leading-relaxed">
            {{ $t('guestGuide.about.architect.desc') }}
          </p>
        </div>

        <!-- YouTube動画 -->
        <div class="space-y-4">
          <div class="aspect-video bg-organic-border" style="border-radius: 0 !important;">
            <iframe
              class="w-full h-full"
              src="https://www.youtube.com/embed/q43uXdOKPD8"
              title="坂茂 2013年プレゼンテーション"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p class="text-xs text-organic-text-light text-center">{{ $t('guestGuide.about.video1') }}</p>

          <div class="aspect-video bg-organic-border" style="border-radius: 0 !important;">
            <iframe
              class="w-full h-full"
              src="https://www.youtube.com/embed/tBliJ1UNs1Q"
              title="下瀬美術館 家具の家no.1"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p class="text-xs text-organic-text-light text-center">{{ $t('guestGuide.about.video2') }}</p>
        </div>
      </section>

      <!-- 修復・竣工記録 -->
      <section class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-5 h-5 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          <h2 class="guide-title text-base">{{ $t('guestGuide.about.history.title') }}</h2>
        </div>
        <div class="bg-white shadow-sm" style="border-radius: 0 !important;">
          <div class="flex items-center gap-4 p-4 border-b border-organic-border">
            <svg class="w-5 h-5 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-organic-text">{{ $t('guestGuide.about.history.renovation') }}</h3>
              <p class="text-xs text-organic-text-light">2024</p>
            </div>
          </div>
          <div class="flex items-center gap-4 p-4">
            <svg class="w-5 h-5 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-organic-text">{{ $t('guestGuide.about.history.construction') }}</h3>
              <p class="text-xs text-organic-text-light">1995</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 周辺環境 -->
      <section class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-5 h-5 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <h2 class="guide-title text-base">{{ $t('guestGuide.about.environment.title') }}</h2>
        </div>
        <div class="bg-white p-4 shadow-sm" style="border-radius: 0 !important;">
          <p class="text-sm text-organic-text leading-relaxed">
            {{ $t('guestGuide.about.environment.desc') }}
          </p>
        </div>
      </section>

      <!-- 関連リンク -->
      <section class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-5 h-5 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          <h2 class="guide-title text-base">{{ $t('guestGuide.about.links.title') }}</h2>
        </div>
        <a
          href="https://furniturehouse1.com/"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-white flex items-center gap-4 p-4 shadow-sm hover:bg-organic-cream transition-colors"
          style="border-radius: 0 !important;"
        >
          <svg class="w-5 h-5 text-organic-accent" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <div class="flex-1">
            <h3 class="text-sm font-medium text-organic-text">{{ $t('guestGuide.about.links.official') }}</h3>
          </div>
          <svg class="w-4 h-4 text-organic-text-light" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
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
.guide-page {
  max-width: 100%;
  overflow-x: hidden;
}
</style>
