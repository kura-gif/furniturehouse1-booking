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
          <span>アクセス</span>
        </p>
      </div>

      <!-- タイトル -->
      <h1 class="text-4xl font-medium mb-8" style="color: #231815; font-weight: 500;">
        アクセス
      </h1>

      <!-- 本文 -->
      <div class="prose prose-gray max-w-none">
        <!-- ナビゲーション -->
        <nav class="mb-12 flex flex-wrap gap-2 not-prose">
          <a
            v-for="nav in navItems"
            :key="nav.id"
            :href="`#${nav.id}`"
            :class="[
              'px-4 py-2 text-sm border rounded-full transition-colors no-underline',
              activeSection === nav.id
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-800 hover:text-gray-900'
            ]"
            @click="setActiveSection(nav.id)"
          >
            {{ nav.label }}
          </a>
        </nav>

        <!-- 車｜中央道ルート -->
        <section id="car-chuo" class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            1. 車で行く｜中央自動車道ルート
          </h2>

          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 class="font-semibold text-gray-900">調布IC → 河口湖IC → 山中湖IC</h3>
              <span class="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">河口湖経由</span>
            </div>

            <div class="route-visual">
              <div class="route-step start">
                <div class="step-main">
                  <span class="step-place">中央道 調布IC</span>
                </div>
                <span class="step-transport">中央自動車道 約60分</span>
              </div>
              <div class="route-step">
                <div class="step-main">
                  <span class="step-place">河口湖IC</span>
                </div>
                <span class="step-transport">東富士五湖道路 約20分</span>
              </div>
              <div class="route-step">
                <div class="step-main">
                  <span class="step-place">山中湖IC</span>
                </div>
                <span class="step-transport">一般道 約10分</span>
              </div>
              <div class="route-step end">
                <div class="step-main">
                  <span class="step-place">家具の家</span>
                  <span class="step-time">計 約1時間30分</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
            <p class="text-sm text-amber-800">
              <strong>ご注意：</strong>高井戸ICには上り方面（山梨方面）の入口がありません。永福ICから首都高経由、または調布ICからご利用ください。
            </p>
          </div>

          <div class="space-y-4 text-gray-700">
            <h4 class="font-semibold text-gray-900">このルートで寄れるスポット</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl mb-2 block">🏔</span>
                <p class="text-sm font-medium">河口湖</p>
                <p class="text-xs text-gray-500">河口湖ICから約5分</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl mb-2 block">🎢</span>
                <p class="text-sm font-medium">富士急ハイランド</p>
                <p class="text-xs text-gray-500">河口湖IC最寄</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl mb-2 block">🗻</span>
                <p class="text-sm font-medium">忍野八海</p>
                <p class="text-xs text-gray-500">山中湖ICから約10分</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl mb-2 block">🌊</span>
                <p class="text-sm font-medium">山中湖</p>
                <p class="text-xs text-gray-500">山中湖ICすぐ</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 車｜東名ルート -->
        <section id="car-tomei" class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            2. 車で行く｜東名高速ルート
          </h2>

          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 class="font-semibold text-gray-900">用賀IC → 御殿場IC → 山中湖IC</h3>
              <span class="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">御殿場経由</span>
            </div>

            <div class="route-visual">
              <div class="route-step start">
                <div class="step-main">
                  <span class="step-place">東名高速 用賀IC</span>
                </div>
                <span class="step-transport">東名高速道路 約60分</span>
              </div>
              <div class="route-step">
                <div class="step-main">
                  <span class="step-place">御殿場IC</span>
                </div>
                <span class="step-transport">国道138号→須走IC→東富士五湖道路 約30分</span>
              </div>
              <div class="route-step">
                <div class="step-main">
                  <span class="step-place">山中湖IC</span>
                </div>
                <span class="step-transport">一般道 約10分</span>
              </div>
              <div class="route-step end">
                <div class="step-main">
                  <span class="step-place">家具の家</span>
                  <span class="step-time">計 約1時間40分</span>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4 text-gray-700">
            <h4 class="font-semibold text-gray-900">このルートで寄れるスポット</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl mb-2 block">🛍️</span>
                <p class="text-sm font-medium">御殿場プレミアム・アウトレット</p>
                <p class="text-xs text-gray-500">御殿場ICから約5分</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl mb-2 block">♨️</span>
                <p class="text-sm font-medium">木の花の湯</p>
                <p class="text-xs text-gray-500">アウトレット隣接</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl mb-2 block">🗻</span>
                <p class="text-sm font-medium">忍野八海</p>
                <p class="text-xs text-gray-500">山中湖ICから約10分</p>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <span class="text-2xl mb-2 block">🌊</span>
                <p class="text-sm font-medium">山中湖</p>
                <p class="text-xs text-gray-500">山中湖ICすぐ</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 高速バス＋レンタカー・タクシー -->
        <section id="bus" class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            3. 高速バス＋レンタカー・タクシー
          </h2>

          <div class="space-y-6">
            <!-- 高速バス＋タクシー -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 class="font-semibold text-gray-900">新宿から高速バス＋タクシー</h3>
                <span class="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">乗換1回</span>
              </div>

              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">バスタ新宿</span>
                  </div>
                  <span class="step-transport">富士五湖線（富士急・京王バス）約2時間20分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖旭日丘</span>
                  </div>
                  <span class="step-transport">タクシー 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約2時間30分</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 p-3 bg-white rounded border border-gray-200">
                <p class="text-sm text-gray-600">
                  <strong>高速バス情報：</strong>1日約40便運行、事前予約推奨
                </p>
              </div>
            </div>

            <!-- 高速バス＋レンタカー（おすすめ） -->
            <div class="bg-gray-50 rounded-lg p-6 border-2 border-gray-900">
              <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                <h3 class="font-semibold text-gray-900">新宿から高速バス＋レンタカー</h3>
                <span class="text-xs text-white bg-gray-900 px-3 py-1 rounded-full">おすすめ</span>
              </div>
              <p class="text-sm text-gray-600 mb-4">
                高速バスで山中湖まで来て、現地でレンタカーを借りる方法。運転は最小限で、到着後は自由に動けます。
              </p>

              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">バスタ新宿</span>
                  </div>
                  <span class="step-transport">高速バス 約2時間20分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖旭日丘</span>
                  </div>
                  <span class="step-transport">レンタカー 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約2時間30分</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 p-3 bg-white rounded border border-gray-200">
                <p class="text-sm text-gray-600">
                  <strong>山中湖のレンタカー：</strong>トヨタレンタカー山中湖店
                </p>
              </div>
            </div>

            <!-- タクシー情報 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="font-semibold text-gray-900 mb-3">タクシー情報</h3>
              <p class="text-sm text-gray-600 mb-3">
                山中湖旭日丘バス停から家具の家まで、タクシーで約10分です。
              </p>
              <p class="text-sm text-gray-600">
                <strong>タクシー会社：</strong>
                <a href="https://kyowa-taxi.jp/" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">
                  共和タクシー（山中湖）
                </a>
              </p>
            </div>
          </div>
        </section>

        <!-- 電車＋バス・タクシー・レンタカー -->
        <section id="train" class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            4. 電車＋バス・タクシー・レンタカー
          </h2>

          <div class="space-y-6">
            <!-- 新宿から御殿場経由 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 class="font-semibold text-gray-900">新宿から御殿場経由</h3>
                <span class="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">小田急ふじさん号</span>
              </div>

              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">小田急 新宿駅</span>
                  </div>
                  <span class="step-transport">特急ふじさん号 約1時間40分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">御殿場駅</span>
                  </div>
                  <span class="step-transport">富士急バス 約40分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖エリア</span>
                  </div>
                  <span class="step-transport">タクシー 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約2時間40分</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 space-y-2">
                <div class="p-3 bg-white rounded border border-gray-200">
                  <p class="text-sm text-gray-600">
                    <strong>乗換情報：</strong>特急ふじさん号は要予約、御殿場駅から路線バス利用
                  </p>
                </div>
                <div class="p-3 bg-white rounded border border-gray-200">
                  <p class="text-sm text-gray-600">
                    <strong>御殿場駅でレンタカーも可：</strong>トヨタレンタカー御殿場駅前店（駅徒歩1分）、日産レンタカー御殿場駅前（駅徒歩2分）
                  </p>
                </div>
              </div>

              <div class="mt-4">
                <h4 class="font-semibold text-gray-900 text-sm mb-3">このルートで寄れるスポット</h4>
                <div class="grid grid-cols-2 gap-3">
                  <div class="text-center p-3 bg-white rounded border border-gray-200">
                    <span class="text-xl mb-1 block">🛍️</span>
                    <p class="text-xs font-medium">御殿場プレミアム・アウトレット</p>
                    <p class="text-xs text-gray-500">御殿場駅からバス約15分</p>
                  </div>
                  <div class="text-center p-3 bg-white rounded border border-gray-200">
                    <span class="text-xl mb-1 block">♨️</span>
                    <p class="text-xs font-medium">木の花の湯</p>
                    <p class="text-xs text-gray-500">アウトレット隣接の日帰り温泉</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 品川・東京から御殿場経由 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 class="font-semibold text-gray-900">品川・東京から御殿場経由</h3>
                <span class="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">JR御殿場線</span>
              </div>

              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">品川駅 / 東京駅</span>
                  </div>
                  <span class="step-transport">東海道本線→国府津で乗換→御殿場線 約2時間</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">御殿場駅</span>
                  </div>
                  <span class="step-transport">富士急バス 約40分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖エリア</span>
                  </div>
                  <span class="step-transport">タクシー 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約3時間</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 space-y-2">
                <div class="p-3 bg-white rounded border border-gray-200">
                  <p class="text-sm text-gray-600">
                    <strong>ルート情報：</strong>国府津駅でJR御殿場線に乗換、のんびり車窓を楽しみたい方に
                  </p>
                </div>
                <div class="p-3 bg-white rounded border border-gray-200">
                  <p class="text-sm text-gray-600">
                    <strong>御殿場駅でレンタカーも可：</strong>御殿場駅から家具の家まで車で約40分
                  </p>
                </div>
              </div>
            </div>

            <!-- 新宿から河口湖経由 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 class="font-semibold text-gray-900">新宿から河口湖経由</h3>
                <span class="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">特急富士回遊</span>
              </div>

              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">JR新宿駅</span>
                  </div>
                  <span class="step-transport">特急富士回遊 約1時間50分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">河口湖駅</span>
                  </div>
                  <span class="step-transport">レンタカー 約30分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約2時間20分</span>
                  </div>
                </div>
              </div>

              <div class="mt-4 p-3 bg-white rounded border border-gray-200">
                <p class="text-sm text-gray-600">
                  <strong>乗換情報：</strong>特急富士回遊は要予約、河口湖駅前にレンタカー各社あり
                </p>
              </div>
            </div>

            <!-- タクシー情報 -->
            <div class="bg-gray-50 rounded-lg p-6">
              <h3 class="font-semibold text-gray-900 mb-3">タクシー情報</h3>
              <p class="text-sm text-gray-600 mb-3">
                山中湖エリアから家具の家まで、タクシーで約10分です。
              </p>
              <p class="text-sm text-gray-600">
                <strong>タクシー会社：</strong>
                <a href="https://kyowa-taxi.jp/" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">
                  共和タクシー（山中湖）
                </a>
              </p>
            </div>
          </div>
        </section>

        <!-- 所在地 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            所在地
          </h2>
          <div class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-xs text-gray-500 tracking-widest mb-2">LOCATION</p>
            <p class="text-xl font-medium text-gray-900 mb-2">山中湖エリア</p>
            <p class="text-sm text-gray-500">詳細な住所は予約確定後にお知らせします</p>
          </div>
        </section>

        <!-- 注意事項 -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            バス時刻・料金は変更になる場合があります。お出かけ前に各交通機関の公式サイトをご確認ください。
          </p>
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

const activeSection = ref('car-chuo')

const navItems = [
  { id: 'car-chuo', label: '車｜中央道' },
  { id: 'car-tomei', label: '車｜東名' },
  { id: 'bus', label: '高速バス' },
  { id: 'train', label: '電車' },
]

const setActiveSection = (id: string) => {
  activeSection.value = id
}

onMounted(() => {
  const sections = document.querySelectorAll('section[id]')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
          if (id) {
            activeSection.value = id
          }
        }
      })
    },
    { rootMargin: '-20% 0px -80% 0px' }
  )

  sections.forEach((section) => observer.observe(section))
})

useHead({
  title: 'アクセス | 家具の家 No.1',
  meta: [
    { name: 'description', content: '家具の家 No.1へのアクセス方法。車、高速バス、電車でのルートをご案内します。' },
    { property: 'og:title', content: 'アクセス | 家具の家 No.1' },
    { property: 'og:description', content: '家具の家 No.1へのアクセス方法' },
    { name: 'robots', content: 'index, follow' }
  ],
})
</script>

<style scoped>
/* プロースタイル調整 */
.prose {
  max-width: none;
}

.prose h2 {
  color: #231815;
  font-weight: 500;
}

.prose a {
  color: #4f46e5;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

/* Route Visual */
.route-visual {
  position: relative;
  padding-left: 24px;
  border-left: 2px solid #d1d5db;
  margin-left: 8px;
}

.route-step {
  position: relative;
  padding: 12px 0;
}

.route-step::before {
  content: '';
  position: absolute;
  left: -29px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 2px solid #9ca3af;
  border-radius: 50%;
}

.route-step.start::before {
  background: #1f2937;
  border-color: #1f2937;
}

.route-step.end::before {
  background: #6b7280;
  border-color: #6b7280;
}

.step-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.step-place {
  font-weight: 500;
  font-size: 0.95rem;
  color: #1f2937;
}

.step-time {
  font-size: 0.8rem;
  color: #6b7280;
}

.step-transport {
  display: block;
  margin-top: 6px;
  padding: 6px 10px;
  background: #ffffff;
  font-size: 0.8rem;
  color: #6b7280;
  border-left: 2px solid #d1d5db;
  border-radius: 0 4px 4px 0;
}
</style>
