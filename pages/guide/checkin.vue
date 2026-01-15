<template>
  <div>
    <!-- ヘッダー -->
    <section class="bg-gradient-primary text-white py-8 px-4">
      <div class="container-responsive">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">🔑</span>
          <h1 class="text-2xl font-bold">{{ $t('guestGuide.checkin.title') }}</h1>
        </div>
        <p class="text-sm opacity-90">{{ $t('guestGuide.checkin.subtitle') }}</p>
      </div>
    </section>

    <div class="container-responsive py-6">
      <!-- 駐車場 -->
      <section class="mb-8">
        <div class="guide-card p-4">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">🚗</span>
            <h2 class="text-base font-bold text-gray-900">{{ $t('guestGuide.checkin.parking.title') }}</h2>
          </div>
          <p class="text-sm text-gray-700">{{ $t('guestGuide.checkin.parking.desc') }}</p>
        </div>
      </section>

      <!-- ゲストキー -->
      <section class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">🔐</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.checkin.key.title') }}</h2>
        </div>
        <div class="guide-card p-4">
          <p class="text-sm text-gray-700 mb-4">{{ $t('guestGuide.checkin.key.desc') }}</p>
          <div class="bg-blue-50 border border-blue-200 p-3">
            <p class="text-xs text-blue-800 font-medium">{{ $t('guestGuide.checkin.key.app') }}</p>
            <p class="text-lg font-bold text-blue-900">Qrio Lock</p>
          </div>
        </div>
      </section>

      <!-- チェックイン手順 -->
      <section class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">📥</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.checkin.steps.title') }}</h2>
        </div>
        <div class="space-y-4">
          <div class="guide-card p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900 mb-1">{{ $t('guestGuide.checkin.step1.title') }}</h3>
                <p class="text-sm text-gray-600">{{ $t('guestGuide.checkin.step1.desc') }}</p>
              </div>
            </div>
          </div>
          <div class="guide-card p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900 mb-1">{{ $t('guestGuide.checkin.step2.title') }}</h3>
                <p class="text-sm text-gray-600">{{ $t('guestGuide.checkin.step2.desc') }}</p>
              </div>
            </div>
          </div>
          <div class="guide-card p-4">
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 bg-primary-600 text-white flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div>
                <h3 class="text-sm font-semibold text-gray-900 mb-1">{{ $t('guestGuide.checkin.step3.title') }}</h3>
                <p class="text-sm text-gray-600">{{ $t('guestGuide.checkin.step3.desc') }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 万が一、解錠できない場合 -->
      <section class="mb-8">
        <div class="bg-amber-50 border border-amber-200 p-4">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-xl">⚠️</span>
            <h2 class="text-base font-bold text-amber-900">{{ $t('guestGuide.checkin.trouble.title') }}</h2>
          </div>
          <ul class="text-sm text-amber-800 space-y-2">
            <li>• {{ $t('guestGuide.checkin.trouble.item1') }}</li>
            <li>• {{ $t('guestGuide.checkin.trouble.item2') }}</li>
            <li>• {{ $t('guestGuide.checkin.trouble.item3') }}</li>
          </ul>
        </div>
      </section>

      <!-- チェックアウト -->
      <section class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-2xl">📤</span>
          <h2 class="text-lg font-bold text-gray-900">{{ $t('guestGuide.checkout.title') }}</h2>
        </div>
        <div class="guide-card p-4">
          <ul class="text-sm text-gray-700 space-y-3">
            <li class="flex items-start gap-2">
              <span>⏰</span>
              <span>{{ $t('guestGuide.checkout.time') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span>🗑️</span>
              <span>{{ $t('guestGuide.checkout.trash') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span>💳</span>
              <span>{{ $t('guestGuide.checkout.card') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span>🔒</span>
              <span>{{ $t('guestGuide.checkout.lock') }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- 忘れ物チェックリスト -->
      <section>
        <NuxtLink
          to="/guide/checkout"
          class="guide-card flex items-center gap-4 p-4"
        >
          <span class="text-2xl">✅</span>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('guestGuide.checkout.checklist.title') }}</h3>
            <p class="text-xs text-gray-500">{{ $t('guestGuide.checkout.checklist.desc') }}</p>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
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
  title: t('guestGuide.checkin.meta.title'),
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
