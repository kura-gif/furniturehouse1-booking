<template>
  <div>
    <!-- ヘッダー -->
    <section class="bg-blue-600 text-white py-8 px-4">
      <div class="container-responsive">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">📶</span>
          <h1 class="text-2xl font-bold">{{ $t('guestGuide.wifiPage.title') }}</h1>
        </div>
        <p class="text-sm opacity-90">{{ $t('guestGuide.wifiPage.subtitle') }}</p>
      </div>
    </section>

    <div class="container-responsive py-6">
      <!-- メインWi-Fi情報 -->
      <div class="bg-white border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('guestGuide.wifiPage.mainTitle') }}</h2>

        <!-- ネットワーク1 -->
        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">{{ $t('guestGuide.wifiPage.networkName') }}</span>
            <button
              @click="copyToClipboard('Furniture-a')"
              class="text-xs text-blue-600 hover:text-blue-700"
            >
              {{ $t('guestGuide.wifi.copyPassword') }}
            </button>
          </div>
          <p class="text-lg font-bold text-gray-900">Furniture-a</p>
        </div>

        <!-- ネットワーク2 -->
        <div class="mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-600">{{ $t('guestGuide.wifiPage.networkName') }}</span>
            <button
              @click="copyToClipboard('Furniture-b')"
              class="text-xs text-blue-600 hover:text-blue-700"
            >
              {{ $t('guestGuide.wifi.copyPassword') }}
            </button>
          </div>
          <p class="text-lg font-bold text-gray-900">Furniture-b</p>
        </div>

        <!-- パスワード -->
        <div class="p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-blue-600">{{ $t('guestGuide.wifiPage.password') }}</span>
            <button
              @click="copyPassword"
              class="px-3 py-1 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {{ copied ? $t('guestGuide.wifi.copied') : $t('guestGuide.wifi.copyPassword') }}
            </button>
          </div>
          <p class="text-lg font-bold text-blue-900">House-01</p>
        </div>
      </div>

      <!-- 接続方法 -->
      <div class="bg-white border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('guestGuide.wifiPage.howToConnect') }}</h2>
        <ol class="space-y-3">
          <li v-for="(step, index) in steps" :key="index" class="flex items-start gap-3">
            <span class="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {{ index + 1 }}
            </span>
            <span class="text-sm text-gray-700">{{ $t(step) }}</span>
          </li>
        </ol>
      </div>

      <!-- 注意事項 -->
      <div class="bg-amber-50 border border-amber-200 p-4">
        <div class="flex items-start gap-3">
          <span class="text-xl">💡</span>
          <div>
            <h3 class="text-sm font-bold text-amber-900 mb-2">{{ $t('guestGuide.wifiPage.notesTitle') }}</h3>
            <ul class="text-sm text-amber-800 space-y-1">
              <li>• {{ $t('guestGuide.wifiPage.note1') }}</li>
              <li>• {{ $t('guestGuide.wifiPage.note2') }}</li>
              <li>• {{ $t('guestGuide.wifiPage.note3') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'guide',
  middleware: ['guest-guide']
})

const { t } = useI18n()

const copied = ref(false)

const steps = [
  'guestGuide.wifiPage.step1',
  'guestGuide.wifiPage.step2',
  'guestGuide.wifiPage.step3',
  'guestGuide.wifiPage.step4'
]

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText('House-01')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

useHead({
  title: t('guestGuide.wifiPage.meta.title'),
})
</script>
