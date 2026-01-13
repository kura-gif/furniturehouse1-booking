<script setup lang="ts">
// /site から / へリダイレクト
definePageMeta({
  layout: false
})

await navigateTo('/', { redirectCode: 301 })
</script>
