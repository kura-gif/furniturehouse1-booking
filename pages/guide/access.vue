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
              d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
            />
          </svg>
          <h1 class="guide-title text-2xl text-white">
            {{ $t("guestGuide.access.title") }}
          </h1>
        </div>
        <p class="text-sm opacity-90">{{ $t("guestGuide.access.subtitle") }}</p>
      </div>
    </section>

    <div class="max-w-md mx-auto px-4 py-6">
      <!-- 住所 -->
      <section class="mb-8">
        <div class="bg-white p-4 shadow-sm" style="border-radius: 0 !important">
          <div class="flex items-center gap-2 mb-2">
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
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <h2 class="guide-title text-base">
              {{ $t("guestGuide.access.address.title") }}
            </h2>
          </div>
          <p class="text-sm text-organic-text mb-3">
            {{ $t("guestGuide.access.address.value") }}
          </p>
          <a
            href="https://maps.google.com/?q=山梨県南都留郡山中湖村平野"
            target="_blank"
            class="inline-flex items-center gap-1 text-sm text-organic-accent font-medium hover:text-organic-button"
          >
            {{ $t("guestGuide.access.openMap") }}
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
              />
            </svg>
          </a>
        </div>
      </section>

      <!-- 東京からのアクセス -->
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
              d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
            />
          </svg>
          <h2 class="guide-title text-base">
            {{ $t("guestGuide.access.fromTokyo.title") }}
          </h2>
        </div>
        <div class="space-y-4">
          <div
            class="bg-white p-4 shadow-sm"
            style="border-radius: 0 !important"
          >
            <h3 class="text-sm font-medium text-organic-text mb-2">
              {{ $t("guestGuide.access.fromTokyo.car.title") }}
            </h3>
            <ul class="text-sm text-organic-text-light space-y-2">
              <li class="flex items-start gap-2">
                <span class="text-organic-accent">•</span>
                <span>{{ $t("guestGuide.access.fromTokyo.car.step1") }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-organic-accent">•</span>
                <span>{{ $t("guestGuide.access.fromTokyo.car.step2") }}</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-organic-accent">•</span>
                <span>{{ $t("guestGuide.access.fromTokyo.car.step3") }}</span>
              </li>
            </ul>
            <p class="mt-3 text-xs text-organic-text-light">
              {{ $t("guestGuide.access.fromTokyo.car.time") }}
            </p>
          </div>
        </div>
      </section>

      <!-- 別荘地入口（重要） -->
      <section class="mb-8">
        <div
          class="bg-amber-50 border border-amber-200 p-4"
          style="border-radius: 0 !important"
        >
          <div class="flex items-center gap-2 mb-3">
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
              {{ $t("guestGuide.access.gate.title") }}
            </h2>
          </div>
          <div class="space-y-3">
            <p class="text-sm text-amber-800">
              {{ $t("guestGuide.access.gate.desc") }}
            </p>
            <div
              class="bg-white border border-amber-300 p-3"
              style="border-radius: 0 !important"
            >
              <p class="text-xs text-amber-700 font-medium">
                {{ $t("guestGuide.access.gate.tellLabel") }}
              </p>
              <p class="text-base font-medium text-amber-900">
                {{ $t("guestGuide.access.gate.tellValue") }}
              </p>
            </div>
            <p class="text-sm text-amber-800">
              {{ $t("guestGuide.access.gate.time") }}
            </p>
          </div>
        </div>
      </section>

      <!-- ゲートから現地までの道順（動画） -->
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
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
            />
          </svg>
          <h2 class="guide-title text-base">ゲートから現地までの道順</h2>
        </div>
        <div
          class="bg-white shadow-sm overflow-hidden"
          style="border-radius: 0 !important"
        >
          <div class="aspect-video">
            <iframe
              class="w-full h-full"
              src="https://www.youtube.com/embed/H20Sqd7OYZA?si=G4sTLo7WTtBmx9ZD"
              title="ゲートから家具の家 no.1 までの道順"
              frameborder="0"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                web-share;
              "
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>
          </div>
          <div class="p-4">
            <p class="text-sm text-organic-text-light">
              ゲートを通過後、家具の家 no.1
              までの道順を動画でご確認いただけます。
            </p>
          </div>
        </div>
      </section>

      <!-- 別荘地地図 -->
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
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
            />
          </svg>
          <h2 class="guide-title text-base">
            {{ $t("guestGuide.access.map.title") }}
          </h2>
        </div>
        <div
          class="bg-white shadow-sm overflow-hidden"
          style="border-radius: 0 !important"
        >
          <div
            class="aspect-video bg-organic-cream flex items-center justify-center"
          >
            <p class="text-sm text-organic-text-light">
              {{ $t("guestGuide.access.map.placeholder") }}
            </p>
          </div>
          <div class="p-4">
            <p class="text-sm text-organic-text-light">
              {{ $t("guestGuide.access.map.desc") }}
            </p>
          </div>
        </div>
      </section>

      <!-- 注意事項 -->
      <section>
        <div class="bg-white p-4 shadow-sm" style="border-radius: 0 !important">
          <div class="flex items-center gap-2 mb-3">
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <h2 class="guide-title text-base">
              {{ $t("guestGuide.access.notes.title") }}
            </h2>
          </div>
          <ul class="text-sm text-organic-text-light space-y-2">
            <li class="flex items-start gap-2">
              <svg
                class="w-4 h-4 text-organic-accent mt-0.5 shrink-0"
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
              <span>{{ $t("guestGuide.access.notes.note1") }}</span>
            </li>
            <li class="flex items-start gap-2">
              <svg
                class="w-4 h-4 text-organic-accent mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
                />
              </svg>
              <span>{{ $t("guestGuide.access.notes.note2") }}</span>
            </li>
            <li class="flex items-start gap-2">
              <svg
                class="w-4 h-4 text-organic-accent mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                />
              </svg>
              <span>{{ $t("guestGuide.access.notes.note3") }}</span>
            </li>
          </ul>
        </div>
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
  title: t("guestGuide.access.meta.title"),
});
</script>

<style scoped>
.guide-page {
  max-width: 100%;
  overflow-x: hidden;
}
</style>
