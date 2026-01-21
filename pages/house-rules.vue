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
          <span>ハウスルール</span>
        </p>
      </div>

      <!-- タイトル -->
      <h1
        class="text-4xl font-medium mb-8"
        style="color: #231815; font-weight: 500"
      >
        ハウスルール
      </h1>

      <!-- 本文 -->
      <div class="prose prose-gray max-w-none">
        <div class="mb-8 text-gray-700" style="line-height: 1.8">
          <p>
            家具の家
            No.1では、すべてのゲストに快適にお過ごしいただくため、以下のルールをお守りいただいております。
          </p>
        </div>

        <!-- チェックイン・チェックアウト -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            チェックイン・チェックアウト
          </h2>
          <div class="bg-indigo-50 rounded-lg p-6 space-y-4">
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900">
                  チェックイン: {{ settings.checkInTime }}〜
                </p>
                <p class="text-sm text-gray-600">
                  セルフチェックインとなります。鍵の受け取り方法は予約確認メールをご確認ください。
                </p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <div
                class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900">
                  チェックアウト: {{ settings.checkOutTime }}まで
                </p>
                <p class="text-sm text-gray-600">
                  チェックアウト時は鍵を元の場所にお戻しください。
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 宿泊人数 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            宿泊人数
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8" class="mb-4">
              最大宿泊人数は<strong>{{ settings.maxGuests }}名</strong
              >までとなっております。
            </p>
            <ul
              class="list-disc list-inside space-y-2 ml-4"
              style="line-height: 1.8"
            >
              <li>予約時に申告した人数を超えての宿泊はご遠慮ください</li>
              <li>宿泊者以外の方の入室はお断りしております</li>
              <li>人数変更がある場合は事前にご連絡ください</li>
            </ul>
          </div>
        </section>

        <!-- 禁止事項 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            禁止事項
          </h2>
          <div class="space-y-3">
            <div
              v-for="(item, index) in parseListItems(
                settings.houseRulesProhibited,
              )"
              :key="index"
              class="bg-red-50 border border-red-200 rounded-lg p-4"
            >
              <div class="flex items-center gap-3">
                <svg
                  class="w-6 h-6 text-red-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                  />
                </svg>
                <span class="text-red-700">{{ item }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 騒音について -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            騒音について
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8" class="mb-4">
              近隣への配慮をお願いいたします。
            </p>
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p class="font-semibold text-yellow-800 mb-2">
                静粛時間: {{ settings.houseRulesNoise }}
              </p>
              <p class="text-sm text-yellow-700">
                この時間帯は特に大きな声や音楽等の音量にご注意ください。
              </p>
            </div>
          </div>
        </section>

        <!-- ゴミの分別 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            ゴミの分別・処理
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8" class="mb-4">
              ゴミは分別の上、指定の場所にお捨てください。
            </p>
            <ul
              class="list-disc list-inside space-y-2 ml-4"
              style="line-height: 1.8"
            >
              <li
                v-for="(item, index) in parseListItems(
                  settings.houseRulesGarbage,
                )"
                :key="index"
              >
                {{ item }}
              </li>
            </ul>
          </div>
        </section>

        <!-- チェックアウト時のお願い -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            チェックアウト時のお願い
          </h2>
          <div class="text-gray-700">
            <ul
              class="list-disc list-inside space-y-2 ml-4"
              style="line-height: 1.8"
            >
              <li
                v-for="(item, index) in parseListItems(
                  settings.houseRulesCheckout,
                )"
                :key="index"
              >
                {{ item }}
              </li>
            </ul>
          </div>
        </section>

        <!-- 管理者設定のハウスルール -->
        <section v-if="settings.houseRules" class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            その他のルール
          </h2>
          <div class="bg-gray-50 rounded-lg p-6">
            <p
              class="text-gray-700 whitespace-pre-line"
              style="line-height: 1.8"
            >
              {{ settings.houseRules }}
            </p>
          </div>
        </section>

        <!-- 損害について -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            設備・備品の損害について
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              故意または過失により施設・設備・備品を破損・汚損された場合は、修繕費用を請求させていただく場合がございます。万が一破損等があった場合は、速やかにご連絡ください。
            </p>
          </div>
        </section>

        <!-- お問い合わせ -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-3">
              ハウスルールに関するお問い合わせ
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
            <p class="text-sm">
              <strong>株式会社クラドニ</strong><br />
              Email:
              <a
                href="mailto:furniturehouse1@chladni.co.jp"
                class="text-indigo-600 hover:underline"
              >
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
  layout: false,
});

// 設定データ
const settings = ref({
  checkInTime: "14:00",
  checkOutTime: "11:00",
  maxGuests: 6,
  houseRules: "",
  houseRulesProhibited:
    "- 建物内・敷地内全面禁煙（電子タバコ含む）\n- ペット同伴不可\n- パーティー・騒音を伴うイベント禁止\n- 商用目的の撮影は事前許可が必要",
  houseRulesNoise: "22:00〜翌8:00",
  houseRulesGarbage:
    "- 燃えるゴミ・燃えないゴミ・資源ゴミに分別\n- ペットボトル・缶は洗ってからお捨てください\n- 大量のゴミが出る場合は事前にご相談ください",
  houseRulesCheckout:
    "- 使用した食器類は軽く洗って元の場所にお戻しください\n- タオル・リネン類は脱衣所の所定の場所にまとめてください\n- エアコン・照明・水道の元栓を確認してください\n- 窓・ドアの施錠を確認してください\n- 鍵を所定の場所にお戻しください",
});

// リスト形式のテキストを配列に変換
const parseListItems = (text: string): string[] => {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[-・]\s*/, "").trim())
    .filter((line) => line.length > 0);
};

// 設定を読み込み
const loadSettings = async () => {
  try {
    const response = await fetch("/api/public/settings");
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.settings) {
        settings.value = { ...settings.value, ...data.settings };
      }
    }
  } catch (error) {
    console.error("設定の取得に失敗:", error);
  }
};

onMounted(() => {
  loadSettings();
});

// SEO設定
useHead({
  title: "ハウスルール | 家具の家 No.1",
  meta: [
    {
      name: "description",
      content:
        "家具の家 No.1のハウスルール。チェックイン・チェックアウト時間、禁止事項、騒音についてなどをご確認ください。",
    },
    { property: "og:title", content: "ハウスルール | 家具の家 No.1" },
    { property: "og:description", content: "家具の家 No.1のハウスルール" },
    { name: "robots", content: "index, follow" },
  ],
});
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
