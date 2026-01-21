<template>
  <nav class="container-responsive py-3 text-sm" aria-label="パンくず">
    <ol class="flex items-center gap-2 text-gray-600">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex items-center gap-2"
      >
        <!-- 最初の項目（ホーム）はアイコンで表示 -->
        <NuxtLink
          v-if="item.path && index !== items.length - 1 && index === 0"
          :to="item.path"
          class="hover:text-gray-900 transition-colors flex items-center"
          :title="item.label"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </NuxtLink>
        <!-- その他の項目はテキストで表示 -->
        <NuxtLink
          v-else-if="item.path && index !== items.length - 1"
          :to="item.path"
          class="hover:text-gray-900 transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
        <span
          v-else
          :class="{ 'text-gray-900 font-medium': index === items.length - 1 }"
        >
          {{ item.label }}
        </span>
        <svg
          v-if="index < items.length - 1"
          class="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string;
  path?: string;
}

defineProps<{
  items: BreadcrumbItem[];
}>();
</script>
