<template>
  <div class="min-h-screen bg-gray-50">
    <AdminHeader />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">拡張版料金設定</h1>
        <p class="mt-2 text-sm text-gray-600">
          段階的に料金設定を行います。すべての設定はFirestoreに保存されます。
        </p>
      </div>

      <div class="space-y-6">
        <!-- 料金設定パネル -->
        <AdminEnhancedPricingSettings />

        <!-- 料金シミュレーター（画面下部） -->
        <AdminPricingSimulator />

        <!-- 料金表示カレンダー -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-4">料金カレンダー</h2>
          <p class="text-sm text-gray-600 mb-6">
            各日の料金を確認できます。カレンダーに表示される金額は大人2名の基準料金です。
          </p>
          <PricingCalendar :adults="2" :children="0" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})
</script>
