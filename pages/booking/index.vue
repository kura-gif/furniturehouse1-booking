<template>
  <div></div>
</template>

<script setup lang="ts">
// /booking にアクセスした場合は /booking/request にリダイレクト
definePageMeta({
  middleware: (to) => {
    return navigateTo('/booking/request', {
      query: to.query,
      replace: true
    })
  }
})
</script>
