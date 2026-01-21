<template>
  <BookingIndexPage />
</template>

<script setup lang="ts">
import BookingIndexPage from "~/components/pages/BookingIndexPage.vue";

definePageMeta({
  layout: false,
});

// SEO設定
const { setBasicMeta, setLodgingBusinessSchema } = useSeo();

setBasicMeta({
  title: "家具の家 No.1 | 坂茂の初期作品に宿泊する",
  description:
    "家具が家を支える「体験する建築」。風が通り、光が移ろい、音が吸い込まれる。静かな時間の中で、構造体としての家具に囲まれる不思議な感覚を味わう宿泊体験。1日1組限定。",
  type: "website",
});

setLodgingBusinessSchema();
</script>
