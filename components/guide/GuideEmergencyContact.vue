<template>
  <div
    class="bg-red-50 border border-red-100 p-4 max-w-md mx-auto"
    style="border-radius: 0 !important"
  >
    <div class="flex items-center gap-3 mb-3">
      <svg
        class="w-5 h-5 text-red-600"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>
      <h3 class="text-sm font-bold text-red-900">
        {{ $t("guestGuide.emergency.title") }}
      </h3>
    </div>
    <div class="space-y-2">
      <a
        href="tel:09055293078"
        class="flex items-center justify-between p-3 bg-white border border-red-200 hover:bg-red-50 transition-colors"
        style="border-radius: 0 !important"
      >
        <div>
          <p class="text-xs text-red-600 font-medium">
            {{ $t("guestGuide.emergency.host") }}
          </p>
          <p class="text-sm font-semibold text-gray-900">090-5529-3078</p>
        </div>
        <div
          class="w-10 h-10 bg-red-600 flex items-center justify-center"
          style="border-radius: 0 !important"
        >
          <svg
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </div>
      </a>
    </div>
    <p class="mt-3 text-xs text-red-700">
      {{ $t("guestGuide.emergency.note") }}
    </p>
  </div>
</template>

<script setup lang="ts"></script>
