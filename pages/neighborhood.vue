<template>
  <div class="min-h-screen bg-white">
    <!-- ヘッダー -->
    <AppHeader />

    <!-- メインコンテンツ -->
    <div class="max-w-4xl mx-auto px-6 md:px-12 py-12">
      <!-- パンくず -->
      <div class="mb-8">
        <p class="text-sm text-gray-600">
          <NuxtLink to="/" class="hover:underline">ホーム</NuxtLink>
          <span class="mx-2">›</span>
          <span>周辺情報・おすすめスポット</span>
        </p>
      </div>

      <!-- タイトル -->
      <h1 class="text-4xl font-medium mb-8" style="color: #231815; font-weight: 500;">
        周辺情報・おすすめスポット
      </h1>

      <!-- 本文 -->
      <div class="prose prose-gray max-w-none">
        <div class="mb-8 text-gray-700" style="line-height: 1.8;">
          <p>
            家具の家 No.1周辺のおすすめスポットをご紹介します。観光やお食事の参考にしてください。
          </p>
        </div>

        <!-- レストラン・飲食店 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200 flex items-center gap-3" style="color: #231815;">
            <svg class="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            レストラン・飲食店
          </h2>
          <div v-if="settings.restaurants" class="bg-orange-50 rounded-lg p-6">
            <p class="text-gray-700 whitespace-pre-line" style="line-height: 1.8;">{{ settings.restaurants }}</p>
          </div>
          <div v-else class="bg-gray-50 rounded-lg p-6 text-gray-500">
            <p>現在、レストラン情報は準備中です。</p>
          </div>
        </section>

        <!-- 観光スポット -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200 flex items-center gap-3" style="color: #231815;">
            <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            観光スポット
          </h2>
          <div v-if="settings.attractions" class="bg-blue-50 rounded-lg p-6">
            <p class="text-gray-700 whitespace-pre-line" style="line-height: 1.8;">{{ settings.attractions }}</p>
          </div>
          <div v-else class="bg-gray-50 rounded-lg p-6 text-gray-500">
            <p>現在、観光スポット情報は準備中です。</p>
          </div>
        </section>

        <!-- コンビニ・スーパー等 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200 flex items-center gap-3" style="color: #231815;">
            <svg class="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            コンビニ・スーパー等
          </h2>
          <div v-if="settings.convenience" class="bg-green-50 rounded-lg p-6">
            <p class="text-gray-700 whitespace-pre-line" style="line-height: 1.8;">{{ settings.convenience }}</p>
          </div>
          <div v-else class="bg-gray-50 rounded-lg p-6 text-gray-500">
            <p>現在、コンビニ・スーパー情報は準備中です。</p>
          </div>
        </section>

        <!-- アクセス情報 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200 flex items-center gap-3" style="color: #231815;">
            <svg class="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            アクセス
          </h2>
          <div class="space-y-4">
            <div class="bg-purple-50 rounded-lg p-6">
              <h3 class="font-semibold text-gray-900 mb-3">車でお越しの場合</h3>
              <p class="text-gray-700 whitespace-pre-line" style="line-height: 1.8;">{{ settings.accessByCar }}</p>
            </div>
            <div class="bg-purple-50 rounded-lg p-6">
              <h3 class="font-semibold text-gray-900 mb-3">公共交通機関でお越しの場合</h3>
              <p class="text-gray-700 whitespace-pre-line" style="line-height: 1.8;">{{ settings.accessByPublicTransport }}</p>
            </div>
          </div>
        </section>

        <!-- 便利な情報 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200 flex items-center gap-3" style="color: #231815;">
            <svg class="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            便利な情報
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">緊急時の連絡先</h3>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>警察: 110</li>
                <li>消防・救急: 119</li>
              </ul>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-900 mb-2">近隣の医療機関</h3>
              <p class="text-sm text-gray-600 whitespace-pre-line">{{ settings.nearbyHospital }}</p>
            </div>
          </div>
        </section>

        <!-- お問い合わせ -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-3">周辺情報に関するお問い合わせ</h3>
            <p class="text-sm text-gray-600 mb-4">
              おすすめのお店や観光スポットについてのご質問は、お気軽にお問い合わせください。
            </p>
            <p class="text-sm">
              <strong>株式会社クラドニ</strong><br />
              Email: <a href="mailto:furniturehouse1@chladni.co.jp" class="text-indigo-600 hover:underline">
                furniturehouse1@chladni.co.jp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- フッター -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

// 設定データ
const settings = ref({
  restaurants: '',
  attractions: '',
  convenience: '',
  accessByCar: '駐車場をご利用いただけます。駐車場の詳細は予約確認メールをご確認ください。',
  accessByPublicTransport: '詳細なアクセス方法は予約確認メールでご案内いたします。',
  nearbyHospital: '急な体調不良の際は、お近くの病院・クリニックをご利用ください。'
})

// 設定を読み込み
const loadSettings = async () => {
  try {
    const response = await fetch('/api/public/settings')
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.settings) {
        settings.value = { ...settings.value, ...data.settings }
      }
    }
  } catch (error) {
    console.error('設定の取得に失敗:', error)
  }
}

onMounted(() => {
  loadSettings()
})

// SEO設定
useHead({
  title: '周辺情報・おすすめスポット | 家具の家 No.1',
  meta: [
    { name: 'description', content: '家具の家 No.1周辺のおすすめスポット。レストラン、観光地、コンビニなどの情報をご紹介します。' },
    { property: 'og:title', content: '周辺情報・おすすめスポット | 家具の家 No.1' },
    { property: 'og:description', content: '家具の家 No.1周辺のおすすめスポット情報' },
    { name: 'robots', content: 'index, follow' }
  ]
})
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose h2 {
  color: #231815;
  font-weight: 500;
}

.prose h3 {
  color: #231815;
}

.prose a {
  color: #4f46e5;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}
</style>
