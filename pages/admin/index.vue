<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4 flex items-center justify-between">
        <h1 class="text-2xl font-bold">管理ダッシュボード</h1>
        <div class="flex items-center gap-4">
          <span v-if="appUser" class="text-sm text-gray-600">
            {{ appUser.displayName }}さん
            <span class="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
              role: {{ appUser.role }}
            </span>
          </span>
          <button @click="handleLogout" class="btn-secondary text-sm">ログアウト</button>
        </div>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- 本日のチェックイン/チェックアウト -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- 本日のチェックイン -->
        <div class="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-blue-900">本日のチェックイン</h3>
            <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {{ todayCheckIns.length }}件
            </span>
          </div>
          <div v-if="todayCheckIns.length > 0" class="space-y-2">
            <div
              v-for="booking in todayCheckIns"
              :key="booking.id"
              class="bg-white rounded-lg p-3 shadow-sm"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold">{{ booking.guestName }}様</p>
                  <p class="text-sm text-gray-600">{{ booking.guestCount }}名 / {{ formatDate(booking.startDate) }}</p>
                </div>
                <button
                  @click="viewBooking(booking)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  詳細
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-600 text-center py-4">本日のチェックインはありません</p>
        </div>

        <!-- 本日のチェックアウト -->
        <div class="card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-orange-900">本日のチェックアウト</h3>
            <span class="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              {{ todayCheckOuts.length }}件
            </span>
          </div>
          <div v-if="todayCheckOuts.length > 0" class="space-y-2">
            <div
              v-for="booking in todayCheckOuts"
              :key="booking.id"
              class="bg-white rounded-lg p-3 shadow-sm"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold">{{ booking.guestName }}様</p>
                  <p class="text-sm text-gray-600">{{ booking.guestCount }}名 / {{ formatDate(booking.endDate) }}</p>
                </div>
                <button
                  @click="viewBooking(booking)"
                  class="text-orange-600 hover:text-orange-800 text-sm font-medium"
                >
                  詳細
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-600 text-center py-4">本日のチェックアウトはありません</p>
        </div>
      </div>

      <!-- 統計カード -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">今月の予約</h3>
          <p class="text-3xl font-bold text-purple-600">{{ stats.monthlyBookings }}</p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">今月の売上</h3>
          <p class="text-3xl font-bold text-purple-600">
            ¥{{ stats.monthlyRevenue.toLocaleString() }}
          </p>
        </div>
        <div class="card">
          <h3 class="text-sm text-gray-600 mb-2">保留中の予約</h3>
          <p class="text-3xl font-bold text-orange-600">{{ stats.pendingBookings }}</p>
        </div>
        <NuxtLink to="/admin/reviews" class="card cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
          <h3 class="text-sm text-gray-600 mb-2">承認待ちレビュー</h3>
          <p class="text-3xl font-bold text-yellow-600">→</p>
          <p class="text-xs text-gray-600 mt-2">レビュー管理へ</p>
        </NuxtLink>
      </div>

      <!-- タブナビゲーション -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-custom',
                currentTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>

      <!-- 予約管理タブ -->
      <div v-if="currentTab === 'bookings'" class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold">予約一覧</h2>
          <div class="flex gap-2">
            <select
              v-model="bookingFilter"
              class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">すべて</option>
              <option value="pending">保留中</option>
              <option value="confirmed">確定</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
        </div>

        <!-- 予約リスト -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">予約ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ゲスト名</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイプ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">日程</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金額</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="booking in filteredBookings" :key="booking.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">
                  {{ booking.id.substring(0, 8) }}...
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {{ booking.guestName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs',
                      booking.type === 'stay' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    ]"
                  >
                    {{ booking.type === 'stay' ? '宿泊' : 'ワークショップ' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  {{ formatDate(booking.startDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  ¥{{ (booking.totalAmount || 0).toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs',
                      getStatusColor(booking.status)
                    ]"
                  >
                    {{ getStatusLabel(booking.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    @click="viewBooking(booking)"
                    class="text-purple-600 hover:text-purple-900"
                  >
                    詳細
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 料金設定（拡張版）タブ -->
      <div v-if="currentTab === 'pricing-enhanced'" class="space-y-6">
        <!-- 料金設定パネル -->
        <AdminEnhancedPricingSettings />

        <!-- 料金シミュレーター -->
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

      <!-- カレンダー管理タブ -->
      <div v-if="currentTab === 'calendar'" class="space-y-6">
        <!-- ブロック期間追加フォーム -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">ブロック期間を追加</h3>
          <form @submit.prevent="handleAddBlockedDate" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  開始日 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="blockForm.startDate"
                  type="date"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  終了日 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="blockForm.endDate"
                  type="date"
                  required
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  理由 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="blockForm.reason"
                  type="text"
                  required
                  placeholder="例: メンテナンス"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <button
              type="submit"
              :disabled="isAddingBlock"
              class="btn-primary"
            >
              {{ isAddingBlock ? '追加中...' : 'ブロック期間を追加' }}
            </button>
          </form>
        </div>

        <!-- ブロック期間一覧 -->
        <div class="card">
          <h3 class="text-lg font-semibold mb-4">登録済みブロック期間</h3>
          <div v-if="blockedDates.length === 0" class="text-center text-gray-500 py-8">
            ブロック期間は登録されていません
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="blocked in blockedDates"
              :key="blocked.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-semibold">{{ blocked.reason }}</p>
                <p class="text-sm text-gray-600">
                  {{ formatDate(blocked.startDate) }} 〜 {{ formatDate(blocked.endDate) }}
                </p>
              </div>
              <button
                @click="handleDeleteBlockedDate(blocked.id!)"
                class="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                削除
              </button>
            </div>
          </div>
        </div>

        <!-- カレンダー表示 -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">カレンダー</h2>

          <!-- カレンダー凡例 -->
          <div class="mb-6 flex flex-wrap gap-4 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded bg-green-100 border border-green-300"></span>
              <span>空室</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded bg-purple-500"></span>
              <span>予約済み（宿泊）</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded bg-blue-500"></span>
              <span>予約済み（WS）</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded bg-gray-300"></span>
              <span>ブロック</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-4 h-4 rounded border-2 border-red-500 text-red-600 flex items-center justify-center text-xs font-bold">祝</span>
              <span>祝日</span>
            </div>
          </div>

          <!-- カレンダー表示 -->
          <AdminCalendarView :bookings="allBookings" />
        </div>
      </div>

      <!-- メッセージタブ -->
      <div v-if="currentTab === 'messages'" class="card">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-semibold">ゲストメッセージ</h2>
          <NuxtLink
            to="/admin/messages"
            class="btn-primary flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            メッセージ管理を開く
          </NuxtLink>
        </div>

        <div class="text-center py-12">
          <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">新しいメッセージ管理画面</h3>
          <p class="text-gray-600 mb-6">
            ゲストとのメッセージのやり取りは専用の管理画面で行えます。<br>
            リアルタイムでメッセージを送受信できます。
          </p>
          <NuxtLink
            to="/admin/messages"
            class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            メッセージ管理を開く
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </NuxtLink>
        </div>
      </div>

      <!-- レポートタブ -->
      <div v-if="currentTab === 'reports'" class="space-y-6">
        <!-- 月次レポート -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">売上・稼働率レポート</h2>

          <!-- 期間選択 -->
          <div class="mb-6 flex gap-4">
            <select class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500">
              <option>2025年1月</option>
              <option>2024年12月</option>
              <option>2024年11月</option>
            </select>
          </div>

          <!-- サマリーカード -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
              <h3 class="text-sm opacity-90 mb-2">月間売上</h3>
              <p class="text-3xl font-bold">¥480,000</p>
              <p class="text-sm mt-2 opacity-75">前月比 +12%</p>
            </div>
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
              <h3 class="text-sm opacity-90 mb-2">稼働率</h3>
              <p class="text-3xl font-bold">73%</p>
              <p class="text-sm mt-2 opacity-75">22日 / 30日</p>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
              <h3 class="text-sm opacity-90 mb-2">平均単価</h3>
              <p class="text-3xl font-bold">¥40,000</p>
              <p class="text-sm mt-2 opacity-75">1予約あたり</p>
            </div>
          </div>

          <!-- 詳細データ -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">予約タイプ</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">件数</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">売上</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">平均単価</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">宿泊</td>
                  <td class="px-6 py-4 whitespace-nowrap">10件</td>
                  <td class="px-6 py-4 whitespace-nowrap font-semibold">¥420,000</td>
                  <td class="px-6 py-4 whitespace-nowrap">¥42,000</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">ワークショップ</td>
                  <td class="px-6 py-4 whitespace-nowrap">2件</td>
                  <td class="px-6 py-4 whitespace-nowrap font-semibold">¥60,000</td>
                  <td class="px-6 py-4 whitespace-nowrap">¥30,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 施設サポート管理タブ -->
      <div v-if="currentTab === 'facility-support'" class="space-y-6">
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">施設サポート管理</h2>
          <p class="text-gray-600 mb-6">
            清掃スタッフ（サポーター）の管理と清掃タスクの割り当てを行います。
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- サポーター管理 -->
            <NuxtLink
              to="/admin/supporters"
              class="block p-6 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-white"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">サポーター管理</h3>
                  <p class="text-sm text-gray-600">スタッフの登録・編集・報酬設定</p>
                </div>
              </div>
              <p class="text-purple-600 text-sm font-medium">管理画面を開く →</p>
            </NuxtLink>

            <!-- 清掃タスク管理 -->
            <NuxtLink
              to="/admin/cleaning-tasks"
              class="block p-6 border-2 border-blue-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-white"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">清掃タスク管理</h3>
                  <p class="text-sm text-gray-600">タスク一覧・割り当て・完了確認</p>
                </div>
              </div>
              <p class="text-blue-600 text-sm font-medium">管理画面を開く →</p>
            </NuxtLink>

            <!-- 報酬計算・月次レポート -->
            <NuxtLink
              to="/admin/compensation-report"
              class="block p-6 border-2 border-green-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-white"
            >
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">報酬計算・月次レポート</h3>
                  <p class="text-sm text-gray-600">報酬計算・支払い管理・CSV出力</p>
                </div>
              </div>
              <p class="text-green-600 text-sm font-medium">管理画面を開く →</p>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 備品・在庫管理タブ -->
      <div v-if="currentTab === 'inventory'" class="space-y-6">
        <!-- アメニティ在庫 -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">アメニティ在庫管理</h2>

          <div class="space-y-4">
            <!-- 在庫アイテム -->
            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold">バスタオル</h3>
                  <div class="mt-2 flex items-center gap-4">
                    <div>
                      <span class="text-sm text-gray-600">現在庫:</span>
                      <span class="font-semibold ml-2">15枚</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600">発注目安:</span>
                      <span class="text-sm ml-2">10枚以下</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button class="btn-secondary text-sm">在庫更新</button>
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    十分
                  </span>
                </div>
              </div>
            </div>

            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold">シャンプー</h3>
                  <div class="mt-2 flex items-center gap-4">
                    <div>
                      <span class="text-sm text-gray-600">現在庫:</span>
                      <span class="font-semibold ml-2">8本</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600">発注目安:</span>
                      <span class="text-sm ml-2">10本以下</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button class="btn-secondary text-sm">在庫更新</button>
                  <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                    要発注
                  </span>
                </div>
              </div>
            </div>

            <div class="border rounded-lg p-4">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold">トイレットペーパー</h3>
                  <div class="mt-2 flex items-center gap-4">
                    <div>
                      <span class="text-sm text-gray-600">現在庫:</span>
                      <span class="font-semibold ml-2">24ロール</span>
                    </div>
                    <div>
                      <span class="text-sm text-gray-600">発注目安:</span>
                      <span class="text-sm ml-2">12ロール以下</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button class="btn-secondary text-sm">在庫更新</button>
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    十分
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button class="btn-primary mt-6">新しいアイテムを追加</button>
        </div>

        <!-- 設備メンテナンス -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">設備メンテナンス履歴</h2>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">設備</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">前回メンテナンス</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">次回予定</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap font-medium">エアコン</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">2024/12/15</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">2025/06/15</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      良好
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap font-medium">給湯器</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">2024/11/20</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">2025/05/20</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      良好
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap font-medium">冷蔵庫</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">2024/10/10</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">2025/04/10</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      要確認
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button class="btn-primary mt-6">メンテナンスを記録</button>
        </div>
      </div>

      <!-- アメニティ管理タブ -->
      <div v-if="currentTab === 'amenities'">
        <AdminAmenityManagement />
      </div>

      <!-- 写真ギャラリー管理タブ -->
      <div v-if="currentTab === 'photos'">
        <AdminPhotoManagement />
      </div>

      <!-- レビュー管理タブ -->
      <div v-if="currentTab === 'reviews'" class="card">
        <h2 class="text-2xl font-semibold mb-6">ゲストレビュー</h2>

        <!-- レビュー統計 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-1">総合評価</p>
            <p class="text-4xl font-bold text-purple-600">4.8</p>
            <div class="flex items-center justify-center gap-1 mt-2">
              <span class="text-yellow-400">★★★★★</span>
            </div>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-1">レビュー数</p>
            <p class="text-4xl font-bold text-gray-700">127</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-1">返信率</p>
            <p class="text-4xl font-bold text-green-600">98%</p>
          </div>
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-1">未返信</p>
            <p class="text-4xl font-bold text-orange-600">2</p>
          </div>
        </div>

        <!-- レビュー一覧 -->
        <div class="space-y-4">
          <div class="border rounded-lg p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-3">
                  <h3 class="font-semibold">山田太郎</h3>
                  <span class="text-yellow-400">★★★★★</span>
                  <span class="text-sm text-gray-500">5.0</span>
                </div>
                <p class="text-sm text-gray-600 mt-1">2025年1月20日</p>
              </div>
              <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                未返信
              </span>
            </div>
            <p class="text-gray-700 mb-3">
              とても素敵な宿でした！家具も素敵で、快適に過ごせました。また利用したいです。
            </p>
            <div class="flex gap-2">
              <button class="btn-primary text-sm">返信する</button>
            </div>
          </div>

          <div class="border rounded-lg p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="flex items-center gap-3">
                  <h3 class="font-semibold">田中花子</h3>
                  <span class="text-yellow-400">★★★★☆</span>
                  <span class="text-sm text-gray-500">4.0</span>
                </div>
                <p class="text-sm text-gray-600 mt-1">2025年1月15日</p>
              </div>
              <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                返信済み
              </span>
            </div>
            <p class="text-gray-700 mb-3">
              清潔で快適でした。アクセスも良く便利な立地です。
            </p>
            <div class="bg-gray-50 p-3 rounded-lg mt-3">
              <p class="text-sm text-gray-600 mb-1">オーナーからの返信</p>
              <p class="text-sm">ご利用ありがとうございました。またのお越しをお待ちしております。</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 料金設定タブ -->
      <div v-if="currentTab === 'pricing'">
        <AdminPricingSettings />
      </div>

      <!-- クーポン管理タブ -->
      <div v-if="currentTab === 'coupons'">
        <AdminCouponManagement />
      </div>

      <!-- キャンセルポリシー管理タブ -->
      <div v-if="currentTab === 'cancellation'">
        <AdminCancellationPolicySettings />
      </div>

      <!-- 設定タブ -->
      <div v-if="currentTab === 'settings'" class="space-y-6">
        <!-- チェックイン情報設定 -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">チェックイン情報</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                チェックイン時間
              </label>
              <input
                type="time"
                value="15:00"
                class="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                チェックアウト時間
              </label>
              <input
                type="time"
                value="11:00"
                class="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                鍵の場所・受け渡し方法
              </label>
              <textarea
                rows="3"
                placeholder="例: 玄関横のキーボックス（暗証番号: 1234）"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Wi-Fiパスワード
              </label>
              <input
                type="text"
                placeholder="Wi-Fiパスワード"
                class="w-full md:w-96 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                駐車場の案内
              </label>
              <textarea
                rows="2"
                placeholder="駐車場の場所や注意事項"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <button class="btn-primary">保存</button>
          </div>
        </div>

        <!-- 緊急連絡先 -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">緊急連絡先</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                オーナー連絡先
              </label>
              <input
                type="tel"
                value="090-1234-5678"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                水道トラブル
              </label>
              <input
                type="tel"
                placeholder="水道業者の電話番号"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                電気トラブル
              </label>
              <input
                type="tel"
                placeholder="電気業者の電話番号"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                鍵紛失時
              </label>
              <input
                type="tel"
                placeholder="鍵屋の電話番号"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button class="btn-primary mt-4">保存</button>
        </div>

        <!-- ハウスルール -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">ハウスルール</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ルール内容
              </label>
              <textarea
                rows="8"
                placeholder="例:&#10;- 禁煙です&#10;- ペット不可&#10;- 騒音は22時まで&#10;- ゴミは分別してください"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <button class="btn-primary">保存</button>
          </div>
        </div>

        <!-- 周辺情報 -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">周辺情報・おすすめスポット</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                おすすめレストラン
              </label>
              <textarea
                rows="3"
                placeholder="近くのおすすめレストラン情報"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                観光スポット
              </label>
              <textarea
                rows="3"
                placeholder="近くの観光スポット"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                交通アクセス
              </label>
              <textarea
                rows="3"
                placeholder="最寄り駅、バス停など"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ゴミ出しルール
              </label>
              <textarea
                rows="2"
                placeholder="ゴミ出しの曜日や場所"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <button class="btn-primary">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 予約詳細モーダル -->
    <div
      v-if="selectedBooking && currentTab !== 'messages'"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="selectedBooking = null"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-semibold">予約詳細</h3>
          <button
            @click="selectedBooking = null"
            class="p-2 hover:bg-gray-100 rounded-lg transition-custom"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- 予約ID -->
          <div>
            <label class="text-sm text-gray-600">予約ID</label>
            <p class="font-mono text-sm">{{ selectedBooking.id }}</p>
          </div>

          <!-- ゲスト情報 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">ゲスト名</label>
              <p class="font-semibold">{{ selectedBooking.guestName }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">人数</label>
              <p class="font-semibold">{{ selectedBooking.guestCount }}名</p>
            </div>
          </div>

          <!-- 連絡先 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">メールアドレス</label>
              <p class="text-sm break-all">
                <a :href="`mailto:${selectedBooking.guestEmail}`" class="text-purple-600 hover:underline">
                  {{ selectedBooking.guestEmail }}
                </a>
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">電話番号</label>
              <p class="text-sm">
                <a :href="`tel:${selectedBooking.guestPhone}`" class="text-purple-600 hover:underline">
                  {{ selectedBooking.guestPhone }}
                </a>
              </p>
            </div>
          </div>

          <!-- 日程 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">チェックイン</label>
              <p class="font-semibold">{{ formatDate(selectedBooking.startDate) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">チェックアウト</label>
              <p class="font-semibold">{{ formatDate(selectedBooking.endDate) }}</p>
            </div>
          </div>

          <!-- 料金 -->
          <div class="bg-purple-50 p-4 rounded-lg">
            <div class="grid grid-cols-2 gap-2 text-sm mb-2">
              <span class="text-gray-600">基本料金</span>
              <span class="text-right">¥{{ (selectedBooking.baseAmount || 0).toLocaleString() }}</span>
              <span class="text-gray-600">割引額</span>
              <span class="text-right text-red-600">-¥{{ (selectedBooking.discountAmount || 0).toLocaleString() }}</span>
            </div>
            <div class="border-t pt-2 flex justify-between items-center">
              <span class="font-semibold">合計金額</span>
              <span class="text-2xl font-bold text-purple-600">
                ¥{{ (selectedBooking.totalAmount || 0).toLocaleString() }}
              </span>
            </div>
          </div>

          <!-- ステータス -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">予約ステータス</label>
              <p class="mt-1">
                <span :class="['px-3 py-1 rounded-full text-sm', getStatusColor(selectedBooking.status)]">
                  {{ getStatusLabel(selectedBooking.status) }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">支払いステータス</label>
              <p class="mt-1">
                <span :class="['px-3 py-1 rounded-full text-sm', getPaymentStatusColor(selectedBooking.paymentStatus)]">
                  {{ getPaymentStatusLabel(selectedBooking.paymentStatus) }}
                </span>
              </p>
            </div>
          </div>

          <!-- 備考 -->
          <div v-if="selectedBooking.notes">
            <label class="text-sm text-gray-600">備考</label>
            <p class="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-lg mt-1">{{ selectedBooking.notes }}</p>
          </div>

          <!-- 審査待ちの場合の表示 -->
          <div v-if="selectedBooking.reviewStatus === 'pending_review'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="font-semibold text-yellow-800">審査待ち</span>
            </div>
            <p class="text-sm text-yellow-700 mb-1">与信確保済み（まだ請求されていません）</p>
            <p class="text-xs text-yellow-600">
              審査期限: {{ selectedBooking.reviewDeadline ? formatDateTime(selectedBooking.reviewDeadline) : '48時間以内' }}
            </p>
          </div>

          <!-- アクションボタン -->
          <div class="flex flex-wrap gap-3 pt-4 border-t">
            <!-- 審査承認/却下ボタン（審査待ちの場合のみ） -->
            <button
              v-if="selectedBooking.reviewStatus === 'pending_review'"
              @click="approveBooking(selectedBooking.id)"
              :disabled="isApproving"
              class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {{ isApproving ? '処理中...' : '✓ 承認する' }}
            </button>
            <button
              v-if="selectedBooking.reviewStatus === 'pending_review'"
              @click="showRejectModal = true"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ✕ 却下する
            </button>
            <button
              v-if="selectedBooking.status === 'pending' && selectedBooking.reviewStatus !== 'pending_review'"
              @click="confirmBooking(selectedBooking.id)"
              class="btn-primary flex-1"
            >
              予約を確定
            </button>
            <button
              v-if="selectedBooking.paymentStatus === 'paid' && selectedBooking.status !== 'refunded'"
              @click="openRefundModal"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              返金処理
            </button>
            <button
              v-if="selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'refunded' && selectedBooking.status !== 'rejected'"
              @click="cancelBooking(selectedBooking.id)"
              class="btn-secondary flex-1"
            >
              キャンセル
            </button>
            <button
              @click="openMessage(selectedBooking)"
              class="btn-secondary flex-1"
            >
              メッセージ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 返金モーダル -->
    <div v-if="showRefundModal && selectedBooking" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">返金処理</h3>

        <div class="space-y-4 mb-6">
          <!-- 予約情報 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">予約番号</p>
            <p class="font-medium">{{ selectedBooking.bookingReference }}</p>
            <p class="text-sm text-gray-600 mt-2">ゲスト</p>
            <p class="font-medium">{{ selectedBooking.guestName }}様</p>
            <p class="text-sm text-gray-600 mt-2">決済額</p>
            <p class="font-medium text-lg">¥{{ selectedBooking.totalAmount?.toLocaleString() }}</p>
          </div>

          <!-- 自動計算結果 -->
          <div v-if="refundCalculation" class="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 class="font-medium text-purple-900 mb-2">キャンセルポリシーに基づく計算</h4>
            <div class="text-sm space-y-1">
              <p class="text-purple-700">
                チェックイン{{ refundCalculation.daysBeforeCheckIn }}日前
                <span class="text-purple-500">（{{ refundCalculation.policyName }}）</span>
              </p>
              <p class="text-purple-700">
                返金率: <span class="font-semibold">{{ refundCalculation.refundPercentage }}%</span>
              </p>
              <p class="text-purple-900 font-semibold text-lg">
                計算上の返金額: ¥{{ refundCalculation.refundAmount?.toLocaleString() }}
              </p>
            </div>
            <button
              type="button"
              @click="applyCalculatedRefund"
              class="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              この金額を適用 →
            </button>
          </div>
          <div v-else-if="isCalculatingRefund" class="text-center py-4">
            <div class="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-sm text-gray-600 mt-2">計算中...</p>
          </div>

          <!-- 返金額 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              返金額（空欄で全額返金）
            </label>
            <input
              v-model.number="refundAmount"
              type="number"
              :max="selectedBooking.totalAmount"
              :placeholder="`全額: ¥${selectedBooking.totalAmount?.toLocaleString()}`"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <!-- 返金理由 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">返金理由</label>
            <select
              v-model="refundReason"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="requested_by_customer">お客様からのリクエスト</option>
              <option value="duplicate">重複決済</option>
              <option value="host_cancellation">ホスト都合によるキャンセル</option>
              <option value="other">その他</option>
            </select>
          </div>

          <!-- 警告 -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-sm text-yellow-800">
              <strong>注意:</strong> 返金処理は取り消しできません。返金額はゲストのカードに3〜10営業日で反映されます。
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeRefundModal"
            :disabled="isRefunding"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            @click="processRefund"
            :disabled="isRefunding || !refundReason"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isRefunding ? '処理中...' : '返金を実行' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 審査却下モーダル -->
    <div v-if="showRejectModal && selectedBooking" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">予約を却下</h3>

        <div class="space-y-4 mb-6">
          <!-- 予約情報 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">予約番号</p>
            <p class="font-medium">{{ selectedBooking.bookingReference }}</p>
            <p class="text-sm text-gray-600 mt-2">ゲスト</p>
            <p class="font-medium">{{ selectedBooking.guestName }}様</p>
          </div>

          <!-- 却下理由カテゴリ -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">却下理由</label>
            <select
              v-model="rejectCategory"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="schedule_conflict">日程の都合が合わない</option>
              <option value="capacity_exceeded">人数制限を超えている</option>
              <option value="maintenance">施設メンテナンス中</option>
              <option value="other">その他</option>
            </select>
          </div>

          <!-- 却下メッセージ -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ゲストへのメッセージ <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="rejectMessage"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="誠に恐れ入りますが、ご希望の日程は既に予約が入っており..."
            ></textarea>
          </div>

          <!-- 警告 -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p class="text-sm text-yellow-800">
              <strong>注意:</strong> 却下すると与信が解放され、ゲストに通知メールが送信されます。この操作は取り消しできません。
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeRejectModal"
            :disabled="isRejecting"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            @click="rejectBooking"
            :disabled="isRejecting || !rejectMessage || !rejectCategory"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isRejecting ? '処理中...' : '却下を確定' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive, watch, nextTick } from 'vue'
import type { Booking, BookingStatus, PaymentStatus, GuestMessage, RejectionCategory } from '~/types'

const { appUser, loading, user, logout } = useAuth()
const { getAllBookings, confirmBooking: confirmBookingAPI, cancelBooking: cancelBookingAPI } = useBookings()
const {
  subscribeToMessages,
  sendMessage,
  markAllMessagesAsRead
} = useMessaging()
const {
  blockedDates,
  loadBlockedDates,
  addBlockedDate,
  deleteBlockedDate
} = useBlockedDates()
const router = useRouter()

definePageMeta({
  layout: false,
  middleware: 'admin'
})

// ログアウト処理
const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Firebaseから取得した予約データ
const allBookings = ref<Booking[]>([])
const isLoading = ref(false)

// 返金モーダル
const showRefundModal = ref(false)
const refundReason = ref('')
const refundAmount = ref<number | null>(null)
const isRefunding = ref(false)
const refundCalculation = ref<{
  daysBeforeCheckIn: number
  refundPercentage: number
  refundAmount: number
  policyName: string
} | null>(null)
const isCalculatingRefund = ref(false)

// 審査モーダル
const showRejectModal = ref(false)
const rejectCategory = ref('')
const rejectMessage = ref('')
const isApproving = ref(false)
const isRejecting = ref(false)

// 予約データを取得
const loadBookings = async () => {
  isLoading.value = true
  try {
    allBookings.value = await getAllBookings()
  } catch (error) {
    console.error('予約データ取得エラー:', error)
    alert('予約データの取得に失敗しました')
  } finally {
    isLoading.value = false
  }
}

// 統計データ（リアルタイム計算）
const stats = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthlyBookings = allBookings.value.filter(b => {
    if (!b.createdAt) return false
    try {
      const bookingDate = b.createdAt.toDate()
      return bookingDate.getMonth() === currentMonth &&
             bookingDate.getFullYear() === currentYear
    } catch (error) {
      console.error('統計データ日付エラー:', error)
      return false
    }
  })

  const monthlyRevenue = monthlyBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

  const pendingBookings = allBookings.value.filter(
    b => b.status === 'pending'
  ).length

  return {
    monthlyBookings: monthlyBookings.length,
    monthlyRevenue,
    pendingBookings,
    totalBookings: allBookings.value.length
  }
})

// 認証状態が確定してからデータを読み込み
const dataLoaded = ref(false)

const loadData = async () => {
  if (dataLoaded.value) return
  dataLoaded.value = true
  await Promise.all([
    loadBookings(),
    loadBlockedDates()
  ])
}

// 認証状態を監視してデータを読み込み
watch([loading, user], ([isLoading, currentUser]) => {
  if (!isLoading && currentUser) {
    loadData()
  }
}, { immediate: true })

// マウント時にも確認（認証が既に完了している場合）
onMounted(() => {
  if (!loading.value && user.value) {
    loadData()
  }
})

const tabs = [
  { id: 'bookings', name: '予約管理' },
  { id: 'pricing-enhanced', name: '料金設定' }, // 拡張版を「料金設定」に変更
  { id: 'calendar', name: 'カレンダー' },
  { id: 'messages', name: 'メッセージ' },
  { id: 'reports', name: 'レポート' },
  { id: 'facility-support', name: '施設サポート' },
  { id: 'inventory', name: '備品管理' },
  { id: 'amenities', name: 'アメニティ管理' },
  { id: 'photos', name: '写真ギャラリー' },
  { id: 'reviews', name: 'レビュー' },
  // { id: 'pricing', name: '料金設定' }, // 旧料金設定は非表示化
  { id: 'coupons', name: 'クーポン' },
  { id: 'cancellation', name: 'キャンセルポリシー' },
  { id: 'settings', name: '設定' }
]

const currentTab = ref('bookings')
const bookingFilter = ref('all')

const filteredBookings = computed(() => {
  if (bookingFilter.value === 'all') {
    return allBookings.value
  }
  return allBookings.value.filter(b => b.status === bookingFilter.value)
})

// 本日のチェックイン/チェックアウト
const todayCheckIns = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return allBookings.value.filter(b => {
    if (!b.startDate || !b.status) return false
    try {
      const checkInDate = b.startDate.toDate()
      checkInDate.setHours(0, 0, 0, 0)
      return checkInDate.getTime() === today.getTime() && b.status === 'confirmed'
    } catch (error) {
      console.error('チェックイン日付エラー:', error)
      return false
    }
  })
})

const todayCheckOuts = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return allBookings.value.filter(b => {
    if (!b.endDate || !b.status) return false
    try {
      const checkOutDate = b.endDate.toDate()
      checkOutDate.setHours(0, 0, 0, 0)
      return checkOutDate.getTime() === today.getTime() && b.status === 'confirmed'
    } catch (error) {
      console.error('チェックアウト日付エラー:', error)
      return false
    }
  })
})

function formatDate(timestamp: any) {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    if (isNaN(date.getTime())) return '-'
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
  } catch (error) {
    console.error('日付フォーマットエラー:', error)
    return '-'
  }
}

function formatDateTime(timestamp: any) {
  if (!timestamp) return '-'
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    if (isNaN(date.getTime())) return '-'
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  } catch (error) {
    console.error('日時フォーマットエラー:', error)
    return '-'
  }
}

// ========================================
// メッセージ機能
// ========================================

const selectedBooking = ref<Booking | null>(null)
const messages = ref<GuestMessage[]>([])
const newMessage = ref('')
const isSendingMessage = ref(false)
const messageUnsubscribe = ref<(() => void) | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

// 選択された予約のメッセージを監視
watch(() => selectedBooking.value?.id, async (newBookingId, oldBookingId) => {
  // 既存の監視を解除
  if (messageUnsubscribe.value) {
    messageUnsubscribe.value()
    messageUnsubscribe.value = null
  }

  messages.value = []

  // メッセージタブにいる場合のみリスナーを設定
  if (newBookingId && appUser.value?.id && currentTab.value === 'messages') {
    // 新しい予約のメッセージを監視
    messageUnsubscribe.value = subscribeToMessages(newBookingId, (newMessages) => {
      messages.value = newMessages

      // 既読処理
      if (appUser.value?.id) {
        markAllMessagesAsRead(newBookingId, appUser.value.id)
      }

      // 最新メッセージまでスクロール
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    })
  }
})

// タブ切り替え時にメッセージリスナーを制御
watch(() => currentTab.value, (newTab, oldTab) => {
  if (oldTab === 'messages' && newTab !== 'messages') {
    // メッセージタブから離れる時はリスナーを解除
    if (messageUnsubscribe.value) {
      messageUnsubscribe.value()
      messageUnsubscribe.value = null
    }
    messages.value = []
  } else if (newTab === 'messages' && selectedBooking.value && appUser.value?.id) {
    // メッセージタブに切り替えた時、予約が選択されていればリスナーを再設定
    messageUnsubscribe.value = subscribeToMessages(selectedBooking.value.id, (newMessages) => {
      messages.value = newMessages
      if (appUser.value?.id && selectedBooking.value) {
        markAllMessagesAsRead(selectedBooking.value.id, appUser.value.id)
      }
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    })
  }
})

// コンポーネント破棄時に監視を解除
onUnmounted(() => {
  if (messageUnsubscribe.value) {
    messageUnsubscribe.value()
  }
})

// メッセージ送信
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !selectedBooking.value || !appUser.value) return

  isSendingMessage.value = true
  try {
    await sendMessage(
      selectedBooking.value.id,
      appUser.value.id,
      'admin',
      appUser.value.displayName || '管理者',
      newMessage.value.trim()
    )
    newMessage.value = ''
  } catch (error) {
    console.error('メッセージ送信エラー:', error)
    alert('メッセージの送信に失敗しました')
  } finally {
    isSendingMessage.value = false
  }
}

// クイック返信テンプレート
const quickReplies = [
  'ご予約ありがとうございます。チェックインは15時からとなります。',
  '鍵はキーボックスにて受け渡しとなります。暗証番号は前日にご連絡いたします。',
  'チェックアウトは10時までにお願いいたします。',
  'ご不明な点がございましたら、お気軽にお問い合わせください。'
]

const useQuickReply = (template: string) => {
  newMessage.value = template
}

function getStatusLabel(status: BookingStatus) {
  const labels: Record<string, string> = {
    pending: '保留中',
    pending_review: '審査中',
    confirmed: '確定',
    cancelled: 'キャンセル',
    completed: '完了',
    payment_failed: '決済失敗',
    refunded: '返金済み',
    rejected: '却下',
    expired: '期限切れ'
  }
  return labels[status] || status
}

function getStatusColor(status: BookingStatus) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    pending_review: 'bg-orange-100 text-orange-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800',
    payment_failed: 'bg-red-100 text-red-800',
    refunded: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function viewBooking(booking: Booking) {
  selectedBooking.value = booking
}

function getPaymentStatusLabel(status: PaymentStatus) {
  const labels = {
    pending: '支払い待ち',
    paid: '支払い済み',
    refunded: '返金済み',
    failed: '失敗'
  }
  return labels[status] || status
}

function getPaymentStatusColor(status: PaymentStatus) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    refunded: 'bg-blue-100 text-blue-800',
    failed: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

async function confirmBooking(bookingId: string) {
  try {
    await confirmBookingAPI(bookingId)
    alert('予約を確定しました')
    selectedBooking.value = null
    await loadBookings() // 予約データを再読み込み
  } catch (error) {
    console.error('予約確定エラー:', error)
    alert('予約の確定に失敗しました')
  }
}

async function cancelBooking(bookingId: string) {
  if (confirm('この予約をキャンセルしますか？')) {
    try {
      await cancelBookingAPI(bookingId)
      alert('予約をキャンセルしました')
      selectedBooking.value = null
      await loadBookings() // 予約データを再読み込み
    } catch (error) {
      console.error('予約キャンセルエラー:', error)
      alert('予約のキャンセルに失敗しました')
    }
  }
}

function openMessage(booking: Booking) {
  // メッセージタブに移動
  currentTab.value = 'messages'
  selectedBooking.value = booking
}

// 返金処理
function closeRefundModal() {
  showRefundModal.value = false
  refundReason.value = ''
  refundAmount.value = null
  refundCalculation.value = null
  isCalculatingRefund.value = false
}

// 返金モーダルを開く（自動計算付き）
async function openRefundModal() {
  if (!selectedBooking.value) return

  showRefundModal.value = true
  refundCalculation.value = null
  isCalculatingRefund.value = true

  try {
    const response = await $fetch<{
      success: boolean
      calculation: {
        daysBeforeCheckIn: number
        refundPercentage: number
        refundAmount: number
        policyName: string
      }
    }>('/api/bookings/calculate-refund', {
      method: 'POST',
      body: {
        bookingId: selectedBooking.value.id
      }
    })

    if (response.success) {
      refundCalculation.value = response.calculation
    }
  } catch (error: any) {
    console.error('返金計算エラー:', error)
    // エラーでも手動入力は可能
  } finally {
    isCalculatingRefund.value = false
  }
}

// 計算結果を返金額に適用
function applyCalculatedRefund() {
  if (refundCalculation.value) {
    refundAmount.value = refundCalculation.value.refundAmount
  }
}

async function processRefund() {
  if (!selectedBooking.value || !refundReason.value) return

  isRefunding.value = true
  try {
    const response = await $fetch<{
      success: boolean
      refundId: string
      amount: number
      status: string
      isFullRefund: boolean
    }>('/api/stripe/create-refund', {
      method: 'POST',
      body: {
        bookingId: selectedBooking.value.id,
        reason: refundReason.value,
        amount: refundAmount.value || undefined
      }
    })

    if (response.success) {
      const amountStr = response.amount?.toLocaleString() || ''
      alert(`返金が完了しました（¥${amountStr}）`)
      closeRefundModal()
      selectedBooking.value = null
      await loadBookings()
    }
  } catch (error: any) {
    console.error('返金エラー:', error)
    alert(error.data?.message || error.message || '返金処理に失敗しました')
  } finally {
    isRefunding.value = false
  }
}

// 審査承認処理
async function approveBooking(bookingId: string) {
  if (!confirm('この予約を承認しますか？決済が確定されます。')) return

  isApproving.value = true
  try {
    const response = await $fetch<{
      success: boolean
      bookingId: string
      status: string
      message: string
    }>('/api/bookings/approve', {
      method: 'POST',
      body: { bookingId }
    })

    if (response.success) {
      alert('予約を承認しました。決済が確定され、ゲストに通知メールが送信されました。')
      selectedBooking.value = null
      await loadBookings()
    }
  } catch (error: any) {
    console.error('承認エラー:', error)
    alert(error.data?.message || error.message || '予約の承認に失敗しました')
  } finally {
    isApproving.value = false
  }
}

// 審査却下モーダル
function closeRejectModal() {
  showRejectModal.value = false
  rejectCategory.value = ''
  rejectMessage.value = ''
}

async function rejectBooking() {
  if (!selectedBooking.value || !rejectMessage.value || !rejectCategory.value) return

  isRejecting.value = true
  try {
    const response = await $fetch<{
      success: boolean
      bookingId: string
      status: string
      message: string
    }>('/api/bookings/reject', {
      method: 'POST',
      body: {
        bookingId: selectedBooking.value.id,
        reason: rejectMessage.value,
        category: rejectCategory.value
      }
    })

    if (response.success) {
      alert('予約を却下しました。与信が解放され、ゲストに通知メールが送信されました。')
      closeRejectModal()
      selectedBooking.value = null
      await loadBookings()
    }
  } catch (error: any) {
    console.error('却下エラー:', error)
    alert(error.data?.message || error.message || '予約の却下に失敗しました')
  } finally {
    isRejecting.value = false
  }
}

// ブロック期間管理
const blockForm = reactive({
  startDate: '',
  endDate: '',
  reason: ''
})
const isAddingBlock = ref(false)

async function handleAddBlockedDate() {
  if (!blockForm.startDate || !blockForm.endDate || !blockForm.reason) {
    alert('すべての項目を入力してください')
    return
  }

  const startDate = new Date(blockForm.startDate)
  const endDate = new Date(blockForm.endDate)

  if (startDate > endDate) {
    alert('終了日は開始日以降の日付を指定してください')
    return
  }

  isAddingBlock.value = true
  try {
    await addBlockedDate({
      startDate,
      endDate,
      reason: blockForm.reason
    })
    alert('ブロック期間を追加しました')
    // フォームをリセット
    blockForm.startDate = ''
    blockForm.endDate = ''
    blockForm.reason = ''
  } catch (error) {
    console.error('ブロック期間追加エラー:', error)
    alert('ブロック期間の追加に失敗しました')
  } finally {
    isAddingBlock.value = false
  }
}

async function handleDeleteBlockedDate(id: string) {
  if (!confirm('このブロック期間を削除しますか？')) {
    return
  }

  try {
    await deleteBlockedDate(id)
    alert('ブロック期間を削除しました')
  } catch (error) {
    console.error('ブロック期間削除エラー:', error)
    alert('ブロック期間の削除に失敗しました')
  }
}
</script>
