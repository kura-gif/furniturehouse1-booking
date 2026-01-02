<template>
  <div class="card p-8">
    <div class="text-4xl mb-4">{{ icon }}</div>
    <h3 class="text-2xl font-semibold mb-4 text-brown-900">{{ title }}</h3>
    <p class="text-gray-600 leading-relaxed">
      <slot />
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  title: string
}>()
</script>
