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
              <a href="#about" class="hover:text-white transition-colors">施設について</a>
            </li>
            <li>
              <a href="#gallery" class="hover:text-white transition-colors">ギャラリー</a>
            </li>
            <li>
              <a href="#amenities" class="hover:text-white transition-colors">設備・アメニティ</a>
            </li>
            <li>
              <a href="#access" class="hover:text-white transition-colors">アクセス</a>
            </li>
            <li>
              <NuxtLink to="/booking/request" class="hover:text-white transition-colors">宿泊予約</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/workshop" class="hover:text-white transition-colors">ワークショップ予約</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="font-semibold mb-4">管理者</h4>
          <ul class="space-y-2 text-sm text-gray-400">
            <li>
              <a href="/admin" class="hover:text-white transition-colors">管理ダッシュボード</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
        <p>&copy; {{ currentYear }} 家具の家 No.1. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>
