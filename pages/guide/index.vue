<template>
  <div class="guide-page">
    <!-- 背景画像 -->
    <div class="hero-bg"></div>

    <!-- タイトルエリア -->
    <header class="text-center pt-8 pb-6 px-6 relative z-10">
      <h1
        class="guide-title text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-md"
      >
        家具の家 No.1
      </h1>
      <p
        class="guide-subtitle text-base sm:text-lg mt-2 text-white/90 drop-shadow-sm"
      >
        — 滞在のしおり —
      </p>
      <!-- 認証済みゲスト情報 -->
      <div v-if="isAuthenticated && guestName" class="mt-4">
        <div
          class="bg-white/95 backdrop-blur-sm px-4 py-3 text-center mx-auto max-w-xs"
          style="border-radius: 0 !important"
        >
          <p class="text-organic-text text-sm font-medium">
            {{ guestName }} 様
          </p>
          <p v-if="stayInfoText" class="text-organic-text-light text-xs mt-0.5">
            {{ stayInfoText }}
          </p>
        </div>
      </div>
    </header>

    <!-- コンテンツエリア -->
    <div class="content-area relative z-10">
      <!-- メインメニューカード -->
      <section class="px-4 sm:px-6 md:px-8 py-6">
        <div
          class="bg-white max-w-md mx-auto shadow-sm"
          style="border-radius: 0 !important"
        >
          <!-- 周辺のおすすめ -->
          <NuxtLink to="/guide/area" class="menu-item border-b-0">
            <div class="menu-icon">
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="menu-title">周辺のおすすめ</p>
              <p class="menu-desc">観光スポットガイド</p>
            </div>
            <ChevronIcon />
          </NuxtLink>
        </div>

        <!-- Aboutリンク -->
        <div class="mt-5 max-w-md mx-auto">
          <NuxtLink
            to="/guide/about"
            class="block w-full py-4 text-center text-white text-sm font-medium tracking-wide"
            style="background-color: #5c5347; border-radius: 0 !important"
          >
            家具の家 no.1とは？
          </NuxtLink>
        </div>
      </section>

      <!-- 天気ウィジェット -->
      <WeatherWidget />

      <!-- Wi-Fi情報（認証済みの場合） -->
      <section v-if="isAuthenticated" class="px-4 sm:px-6 md:px-8 pb-4">
        <div
          class="bg-white max-w-md mx-auto p-4 shadow-sm"
          style="border-radius: 0 !important"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <svg
                class="w-5 h-5 text-organic-accent"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
                />
              </svg>
              <div>
                <p class="text-[10px] text-organic-text-light">Wi-Fi</p>
                <p class="text-sm font-medium text-organic-text">
                  Furniture-a / Furniture-b
                </p>
              </div>
            </div>
            <button
              @click="copyWifiPassword"
              class="px-3 py-1.5 text-xs border border-organic-button text-organic-button hover:bg-organic-button hover:text-white transition-colors"
              style="border-radius: 0 !important"
            >
              {{ copied ? "コピー済み" : "パスワードをコピー" }}
            </button>
          </div>
        </div>
      </section>

      <!-- お知らせ -->
      <section class="px-4 sm:px-6 md:px-8 pb-4">
        <div
          class="bg-white max-w-md mx-auto p-4 border-l-4 border-organic-accent shadow-sm"
          style="border-radius: 0 !important"
        >
          <h2 class="text-sm font-medium text-organic-text mb-2">
            {{ $t("guestGuide.notice.title") }}
          </h2>
          <ul class="text-xs text-organic-text-light space-y-1.5">
            <li>• {{ $t("guestGuide.notice.item1") }}</li>
            <li>• {{ $t("guestGuide.notice.item2") }}</li>
            <li>• {{ $t("guestGuide.notice.item3") }}</li>
          </ul>
        </div>
      </section>

      <!-- セクション一覧 -->
      <section class="px-4 sm:px-6 md:px-8 py-4">
        <h2 class="guide-title text-base text-center mb-4">
          {{ $t("guestGuide.sections.title") }}
        </h2>
        <div
          class="bg-white max-w-md mx-auto shadow-sm"
          style="border-radius: 0 !important"
        >
          <NuxtLink
            v-for="(section, index) in sections"
            :key="section.to"
            :to="section.to"
            class="menu-item"
            :class="{ 'border-b-0': index === sections.length - 1 }"
          >
            <div class="menu-icon" v-html="section.iconSvg"></div>
            <div class="flex-1 min-w-0">
              <p class="menu-title">{{ $t(section.titleKey) }}</p>
              <p class="menu-desc">{{ $t(section.descKey) }}</p>
            </div>
            <ChevronIcon />
          </NuxtLink>
        </div>
      </section>

      <!-- 緊急連絡先 -->
      <section class="px-4 sm:px-6 md:px-8 pb-8">
        <GuideEmergencyContact />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuideState } from "~/middleware/guest-guide";

// シェブロンアイコンコンポーネント
const ChevronIcon = {
  template: `<svg class="w-4 h-4 text-organic-text-light flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>`,
};

definePageMeta({
  layout: "guide",
  middleware: ["guest-guide"],
});

const { t } = useI18n();
const guideState = useGuideState();
const route = useRoute();

const showSample = computed(() => route.query.sample === "true");
const sampleData = {
  guestName: "佐藤",
  checkInDate: new Date(2025, 0, 20),
  checkOutDate: new Date(2025, 0, 22),
  adults: 2,
  children: 1,
  infants: 0,
};

const isAuthenticated = computed(
  () => showSample.value || (guideState.value?.isAuthenticated ?? false),
);
const guestName = computed(() =>
  showSample.value ? sampleData.guestName : (guideState.value?.guestName ?? ""),
);
const checkInDate = computed(() =>
  showSample.value
    ? sampleData.checkInDate
    : (guideState.value?.checkInDate ?? null),
);
const checkOutDate = computed(() =>
  showSample.value
    ? sampleData.checkOutDate
    : (guideState.value?.checkOutDate ?? null),
);
const tokenData = computed(() =>
  showSample.value ? sampleData : (guideState.value?.tokenData ?? null),
);

const guestCount = computed(() => {
  if (!tokenData.value) return null;
  const adults = tokenData.value.adults || 0;
  const children = tokenData.value.children || 0;
  const infants = tokenData.value.infants || 0;
  return { adults, children, infants, total: adults + children + infants };
});

const stayNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 0;
  const diffTime = checkOutDate.value.getTime() - checkInDate.value.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const stayInfoText = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return "";
  const formatDate = (date: Date) =>
    `${date.getMonth() + 1}月${date.getDate()}日`;
  let text = `${formatDate(checkInDate.value)} 〜 ${formatDate(checkOutDate.value)}（${stayNights.value}泊）`;
  if (guestCount.value && guestCount.value.total > 0) {
    const parts = [];
    if (guestCount.value.adults > 0)
      parts.push(`大人${guestCount.value.adults}名`);
    if (guestCount.value.children > 0)
      parts.push(`お子様${guestCount.value.children}名`);
    if (guestCount.value.infants > 0)
      parts.push(`乳幼児${guestCount.value.infants}名`);
    text += ` / ${parts.join("・")}`;
  }
  return text;
});

const copied = ref(false);
const copyWifiPassword = async () => {
  try {
    await navigator.clipboard.writeText("House-01");
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    console.error("Failed to copy:", e);
  }
};

const sections = [
  {
    to: "/guide/about",
    iconSvg:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>',
    titleKey: "guestGuide.sections.about",
    descKey: "guestGuide.sections.aboutDesc",
  },
  {
    to: "/guide/access",
    iconSvg:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>',
    titleKey: "guestGuide.sections.access",
    descKey: "guestGuide.sections.accessDesc",
  },
  {
    to: "/guide/checkin",
    iconSvg:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>',
    titleKey: "guestGuide.sections.checkin",
    descKey: "guestGuide.sections.checkinDesc",
  },
  {
    to: "/guide/wifi",
    iconSvg:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" /></svg>',
    titleKey: "guestGuide.sections.wifi",
    descKey: "guestGuide.sections.wifiDesc",
  },
  {
    to: "/guide/amenities",
    iconSvg:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>',
    titleKey: "guestGuide.sections.amenities",
    descKey: "guestGuide.sections.amenitiesDesc",
  },
  {
    to: "/guide/area",
    iconSvg:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>',
    titleKey: "guestGuide.sections.area",
    descKey: "guestGuide.sections.areaDesc",
  },
  {
    to: "/guide/rules",
    iconSvg:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>',
    titleKey: "guestGuide.sections.rules",
    descKey: "guestGuide.sections.rulesDesc",
  },
  {
    to: "/guide/faq",
    iconSvg:
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>',
    titleKey: "guestGuide.sections.faq",
    descKey: "guestGuide.sections.faqDesc",
  },
];

useHead({
  title: t("guestGuide.meta.title"),
  meta: [{ name: "description", content: t("guestGuide.meta.description") }],
});
</script>

<style scoped>
.guide-page {
  max-width: 100%;
  overflow-x: hidden;
  position: relative;
  min-height: 100vh;
  background: transparent;
}

.hero-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("/images/hero/07.webp");
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.hero-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.2) 0%,
    rgba(0, 0, 0, 0.3) 20%,
    transparent 50%
  );
}

.content-area {
  margin-top: 2rem;
}

.menu-item {
  @apply flex items-center gap-3 px-4 py-4 transition-colors;
  border-bottom: 1px solid #e8e2d9;
}
.menu-item:hover {
  background-color: rgba(245, 240, 230, 0.5);
}
.menu-item:active {
  background-color: rgba(245, 240, 230, 0.8);
}

.menu-icon {
  @apply w-8 h-8 flex items-center justify-center flex-shrink-0;
  color: #8b7355;
}

.menu-title {
  @apply text-sm font-medium truncate;
  color: #4a4a4a;
}

.menu-desc {
  @apply text-xs truncate mt-0.5;
  color: #7a7a7a;
}
</style>
