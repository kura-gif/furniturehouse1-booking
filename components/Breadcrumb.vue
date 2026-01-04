<template>
  <nav class="container-responsive py-3 text-sm" aria-label="パンくず">
    <ol class="flex items-center gap-2 text-gray-600">
      <li v-for="(item, index) in items" :key="index" class="flex items-center gap-2">
        <NuxtLink
          v-if="item.path && index !== items.length - 1"
          :to="item.path"
          class="hover:text-gray-900 transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else :class="{ 'text-gray-900 font-medium': index === items.length - 1 }">
          {{ item.label }}
        </span>
        <svg
          v-if="index < items.length - 1"
          class="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  path?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>
