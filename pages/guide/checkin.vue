<template>
  <div class="guide-page guide-organic-bg">
    <!-- ヘッダー -->
    <section class="bg-organic-button text-white py-8 px-4">
      <div class="max-w-md mx-auto">
        <div class="flex items-center gap-3 mb-2">
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
            />
          </svg>
          <h1 class="guide-title text-2xl text-white">
            {{ $t("guestGuide.checkin.title") }}
          </h1>
        </div>
        <p class="text-sm opacity-90">
          {{ $t("guestGuide.checkin.subtitle") }}
        </p>
      </div>
    </section>

    <div class="max-w-md mx-auto px-4 py-6">
      <!-- 駐車場 -->
      <section class="mb-8">
        <div class="bg-white p-4 shadow-sm" style="border-radius: 0 !important">
          <div class="flex items-center gap-3 mb-2">
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
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
            <h2 class="guide-title text-base">
              {{ $t("guestGuide.checkin.parking.title") }}
            </h2>
          </div>
          <p class="text-sm text-organic-text">
            {{ $t("guestGuide.checkin.parking.desc") }}
          </p>
        </div>
      </section>

      <!-- ゲストキー -->
      <section class="mb-8">
        <div class="flex items-center gap-3 mb-4">
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
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
            />
          </svg>
          <h2 class="guide-title text-base">
            {{ $t("guestGuide.checkin.key.title") }}
          </h2>
        </div>
        <div class="bg-white p-4 shadow-sm" style="border-radius: 0 !important">
          <p class="text-sm text-organic-text mb-4">
            {{ $t("guestGuide.checkin.key.desc") }}
          </p>
          <div
            class="bg-organic-cream border border-organic-border p-3"
            style="border-radius: 0 !important"
          >
            <p class="text-xs text-organic-text-light font-medium">
              {{ $t("guestGuide.checkin.key.app") }}
            </p>
            <p class="text-lg font-medium text-organic-text">Qrio Lock</p>
          </div>
        </div>
      </section>

      <!-- チェックイン手順 -->
      <section class="mb-8">
        <div class="flex items-center gap-3 mb-4">
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
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 class="guide-title text-base">
            {{ $t("guestGuide.checkin.steps.title") }}
          </h2>
        </div>
        <div class="space-y-3">
          <div
            class="bg-white p-4 shadow-sm"
            style="border-radius: 0 !important"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-7 h-7 bg-organic-button text-white flex items-center justify-center text-sm shrink-0"
                style="border-radius: 0 !important"
              >
                1
              </div>
              <div>
                <h3 class="text-sm font-medium text-organic-text mb-1">
                  {{ $t("guestGuide.checkin.step1.title") }}
                </h3>
                <p class="text-sm text-organic-text-light">
                  {{ $t("guestGuide.checkin.step1.desc") }}
                </p>
              </div>
            </div>
          </div>
          <div
            class="bg-white p-4 shadow-sm"
            style="border-radius: 0 !important"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-7 h-7 bg-organic-button text-white flex items-center justify-center text-sm shrink-0"
                style="border-radius: 0 !important"
              >
                2
              </div>
              <div>
                <h3 class="text-sm font-medium text-organic-text mb-1">
                  {{ $t("guestGuide.checkin.step2.title") }}
                </h3>
                <p class="text-sm text-organic-text-light">
                  {{ $t("guestGuide.checkin.step2.desc") }}
                </p>
              </div>
            </div>
          </div>
          <div
            class="bg-white p-4 shadow-sm"
            style="border-radius: 0 !important"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-7 h-7 bg-organic-button text-white flex items-center justify-center text-sm shrink-0"
                style="border-radius: 0 !important"
              >
                3
              </div>
              <div>
                <h3 class="text-sm font-medium text-organic-text mb-1">
                  {{ $t("guestGuide.checkin.step3.title") }}
                </h3>
                <p class="text-sm text-organic-text-light">
                  {{ $t("guestGuide.checkin.step3.desc") }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 万が一、解錠できない場合 -->
      <section class="mb-8">
        <div
          class="bg-amber-50 border border-amber-200 p-4"
          style="border-radius: 0 !important"
        >
          <div class="flex items-center gap-3 mb-3">
            <svg
              class="w-5 h-5 text-amber-600"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <h2 class="text-sm font-medium text-amber-900">
              {{ $t("guestGuide.checkin.trouble.title") }}
            </h2>
          </div>
          <ul class="text-sm text-amber-800 space-y-2">
            <li>• {{ $t("guestGuide.checkin.trouble.item1") }}</li>
            <li>• {{ $t("guestGuide.checkin.trouble.item2") }}</li>
            <li>• {{ $t("guestGuide.checkin.trouble.item3") }}</li>
          </ul>
        </div>
      </section>

      <!-- チェックアウト -->
      <section class="mb-8">
        <div class="flex items-center gap-3 mb-4">
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
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
          <h2 class="guide-title text-base">
            {{ $t("guestGuide.checkout.title") }}
          </h2>
        </div>
        <div class="bg-white p-4 shadow-sm" style="border-radius: 0 !important">
          <ul class="text-sm text-organic-text space-y-3">
            <li class="flex items-start gap-3">
              <svg
                class="w-4 h-4 text-organic-accent mt-0.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{{ $t("guestGuide.checkout.time") }}</span>
            </li>
            <li class="flex items-start gap-3">
              <svg
                class="w-4 h-4 text-organic-accent mt-0.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              <span>{{ $t("guestGuide.checkout.trash") }}</span>
            </li>
            <li class="flex items-start gap-3">
              <svg
                class="w-4 h-4 text-organic-accent mt-0.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
              <span>{{ $t("guestGuide.checkout.card") }}</span>
            </li>
            <li class="flex items-start gap-3">
              <svg
                class="w-4 h-4 text-organic-accent mt-0.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              <span>{{ $t("guestGuide.checkout.lock") }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- 忘れ物チェックリスト -->
      <section class="mb-8">
        <NuxtLink
          to="/guide/checkout"
          class="bg-white flex items-center gap-4 p-4 shadow-sm hover:bg-organic-cream transition-colors"
          style="border-radius: 0 !important"
        >
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
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div class="flex-1">
            <h3 class="text-sm font-medium text-organic-text">
              {{ $t("guestGuide.checkout.checklist.title") }}
            </h3>
            <p class="text-xs text-organic-text-light">
              {{ $t("guestGuide.checkout.checklist.desc") }}
            </p>
          </div>
          <svg
            class="w-4 h-4 text-organic-text-light"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </NuxtLink>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "guide",
});

const { t } = useI18n();

useHead({
  title: t("guestGuide.checkin.meta.title"),
});
</script>

<style scoped>
.guide-page {
  max-width: 100%;
  overflow-x: hidden;
}
</style>
