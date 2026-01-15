<template>
  <div class="bg-red-50 border border-red-100 p-4">
    <div class="flex items-center gap-3 mb-3">
      <span class="text-xl">🆘</span>
      <h3 class="text-sm font-bold text-red-900">{{ $t('guestGuide.emergency.title') }}</h3>
    </div>
    <div class="space-y-2">
      <a
        href="tel:09055293078"
        class="flex items-center justify-between p-3 bg-white border border-red-200 hover:bg-red-50 transition-colors"
      >
        <div>
          <p class="text-xs text-red-600 font-medium">{{ $t('guestGuide.emergency.host') }}</p>
          <p class="text-sm font-semibold text-gray-900">090-5529-3078</p>
        </div>
        <div class="w-10 h-10 bg-red-600 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </div>
      </a>
    </div>
    <p class="mt-3 text-xs text-red-700">
      {{ $t('guestGuide.emergency.note') }}
    </p>
  </div>
</template>

<script setup lang="ts">
</script>
