<template>
  <footer class="py-12 bg-brown-900 text-white">
    <div class="container-responsive">
      <div class="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 class="text-xl font-bold mb-4">家具の家 No.1</h3>
          <p class="text-gray-400 text-sm leading-relaxed">
            坂茂の1995年作品<br />
            1日1組限定 完全貸切保養所
          </p>
        </div>

        <div>
          <h4 class="font-semibold mb-4">サイトマップ</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>
              <a href="https://furniturehouse1.com/" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">施設について</a>
            </li>
            <li>
              <NuxtLink to="/access" class="hover:text-white transition-colors">アクセス</NuxtLink>
            </li>
            <li>
              <a href="https://booking.furniturehouse1.com/booking" class="hover:text-white transition-colors">宿泊予約</a>
            </li>
          </ul>
        </div>

        <div v-if="isAdmin || isSupporter">
          <h4 class="font-semibold mb-4">管理</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li v-if="isAdmin">
              <NuxtLink to="/admin" class="hover:text-white transition-colors">管理ダッシュボード</NuxtLink>
            </li>
            <li v-if="isSupporter">
              <NuxtLink to="/supporter" class="hover:text-white transition-colors">施設サポーター</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
        <p class="mb-2">連絡：<a href="mailto:info@furniturehouse1.com" class="underline hover:text-white transition-colors">info@furniturehouse1.com</a></p>
        <p class="mb-4">運営：家具の家 No.1 運営委員会 ＋ <a href="https://chladni.co.jp/" target="_blank" rel="noopener noreferrer" class="underline hover:text-white transition-colors">株式会社クラドニ</a></p>
        <p>&copy; {{ currentYear }} 家具の家 No.1. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { isAdmin, isSupporter } = useAuth()
const currentYear = new Date().getFullYear()
</script>
