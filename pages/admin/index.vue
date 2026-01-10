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

      <!-- 与信期限アラート -->
      <div v-if="authAlerts.length > 0" class="mb-8">
        <div class="bg-white rounded-xl shadow-md overflow-hidden">
          <div class="bg-gradient-to-r from-red-600 to-orange-500 px-6 py-3">
            <h3 class="text-white font-bold flex items-center gap-2">
              <span>⚠️</span>
              与信期限アラート（{{ authAlerts.length }}件）
            </h3>
          </div>
          <div class="p-4 space-y-3">
            <div
              v-for="alert in authAlerts"
              :key="alert.bookingId"
              :class="[
                'border-l-4 rounded-r-lg p-4',
                getAlertColor(alert.urgencyLevel)
              ]"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-lg">{{ getAlertIcon(alert.urgencyLevel) }}</span>
                    <span class="font-bold">{{ alert.bookingReference }}</span>
                    <span class="text-sm">- {{ alert.guestName }}様</span>
                  </div>
                  <p class="text-sm mb-2">{{ alert.message }}</p>
                  <div class="text-xs opacity-80">
                    {{ alert.checkInDate }} 〜 {{ alert.checkOutDate }} / ¥{{ alert.totalAmount.toLocaleString() }}
                  </div>
                </div>
                <button
                  @click="viewBookingById(alert.bookingId)"
                  class="ml-4 px-4 py-2 bg-white rounded-lg shadow text-sm font-medium hover:bg-gray-50"
                >
                  対応する
                </button>
              </div>
            </div>
          </div>
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
        <!-- ローディング -->
        <div v-if="isLoadingInventory" class="card text-center py-8">
          <p class="text-gray-600">読み込み中...</p>
        </div>

        <template v-else>
          <!-- アメニティ在庫 -->
          <div class="card">
            <h2 class="text-2xl font-semibold mb-6">アメニティ在庫管理</h2>

            <div v-if="inventoryItems.length === 0" class="text-center py-8 text-gray-500">
              在庫アイテムがありません。「新しいアイテムを追加」ボタンから追加してください。
            </div>

            <div class="space-y-4">
              <!-- 在庫アイテム -->
              <div
                v-for="item in inventoryItems"
                :key="item.id"
                class="border rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h3 class="font-semibold">{{ item.name }}</h3>
                    <div class="mt-2 flex items-center gap-4">
                      <div>
                        <span class="text-sm text-gray-600">現在庫:</span>
                        <span class="font-semibold ml-2">{{ item.currentStock }}{{ item.unit }}</span>
                      </div>
                      <div>
                        <span class="text-sm text-gray-600">発注目安:</span>
                        <span class="text-sm ml-2">{{ item.reorderThreshold }}{{ item.unit }}以下</span>
                      </div>
                    </div>
                    <p v-if="item.notes" class="text-sm text-gray-500 mt-1">{{ item.notes }}</p>
                    <a
                      v-if="item.purchaseUrl"
                      :href="item.purchaseUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-purple-600 hover:text-purple-800 text-sm inline-flex items-center gap-1 mt-1"
                    >
                      購入リンク
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <div class="flex gap-2 items-center">
                    <button
                      @click="openEditInventoryModal(item)"
                      class="btn-secondary text-sm"
                    >
                      編集
                    </button>
                    <button
                      @click="handleDeleteInventory(item)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                    <span :class="['px-3 py-1 rounded-full text-sm font-semibold', getInventoryStatusColor(item)]">
                      {{ getInventoryStatusLabel(item) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button @click="openAddInventoryModal" class="btn-primary mt-6">新しいアイテムを追加</button>
          </div>

          <!-- 設備メンテナンス -->
          <div class="card">
            <h2 class="text-2xl font-semibold mb-6">設備メンテナンス履歴</h2>

            <div v-if="maintenanceRecords.length === 0" class="text-center py-8 text-gray-500">
              メンテナンス記録がありません。「メンテナンスを記録」ボタンから追加してください。
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">設備</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">前回メンテナンス</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">次回予定</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="record in maintenanceRecords" :key="record.id">
                    <td class="px-6 py-4 whitespace-nowrap font-medium">{{ record.equipmentName }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatTimestamp(record.lastMaintenanceDate) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatTimestamp(record.nextScheduledDate) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="['px-2 py-1 rounded-full text-xs', getMaintenanceStatusColor(record.status)]">
                        {{ getMaintenanceStatusLabel(record.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <button
                        @click="openEditMaintenanceModal(record)"
                        class="text-purple-600 hover:text-purple-800 text-sm mr-2"
                      >
                        編集
                      </button>
                      <button
                        @click="handleDeleteMaintenance(record)"
                        class="text-red-600 hover:text-red-800 text-sm"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button @click="openAddMaintenanceModal" class="btn-primary mt-6">メンテナンスを記録</button>
          </div>
        </template>
      </div>

      <!-- 在庫追加モーダル -->
      <div v-if="showAddInventoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-xl font-bold mb-4">新しい在庫アイテムを追加</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">アイテム名 *</label>
              <input
                v-model="inventoryForm.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="例: バスタオル"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">現在庫</label>
                <input
                  v-model.number="inventoryForm.currentStock"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">単位</label>
                <select
                  v-model="inventoryForm.unit"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="個">個</option>
                  <option value="枚">枚</option>
                  <option value="本">本</option>
                  <option value="ロール">ロール</option>
                  <option value="セット">セット</option>
                  <option value="パック">パック</option>
                  <option value="袋">袋</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">発注目安数量</label>
              <input
                v-model.number="inventoryForm.reorderThreshold"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p class="text-xs text-gray-500 mt-1">この数量以下になると「要発注」と表示されます</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">購入URL（Amazon等）</label>
              <input
                v-model="inventoryForm.purchaseUrl"
                type="url"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://www.amazon.co.jp/..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea
                v-model="inventoryForm.notes"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="発注先など"
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showAddInventoryModal = false"
              class="btn-secondary"
              :disabled="isAddingInventory"
            >
              キャンセル
            </button>
            <button
              @click="submitAddInventory"
              class="btn-primary"
              :disabled="isAddingInventory"
            >
              {{ isAddingInventory ? '追加中...' : '追加' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 在庫編集モーダル -->
      <div v-if="showEditInventoryModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-xl font-bold mb-4">在庫アイテムを編集</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">アイテム名 *</label>
              <input
                v-model="editInventoryForm.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">現在庫</label>
                <input
                  v-model.number="editInventoryForm.currentStock"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">単位</label>
                <select
                  v-model="editInventoryForm.unit"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="個">個</option>
                  <option value="枚">枚</option>
                  <option value="本">本</option>
                  <option value="ロール">ロール</option>
                  <option value="セット">セット</option>
                  <option value="パック">パック</option>
                  <option value="袋">袋</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">発注目安数量</label>
              <input
                v-model.number="editInventoryForm.reorderThreshold"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">購入URL（Amazon等）</label>
              <input
                v-model="editInventoryForm.purchaseUrl"
                type="url"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="https://www.amazon.co.jp/..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">メモ</label>
              <textarea
                v-model="editInventoryForm.notes"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showEditInventoryModal = false"
              class="btn-secondary"
              :disabled="isEditingInventory"
            >
              キャンセル
            </button>
            <button
              @click="submitEditInventory"
              class="btn-primary"
              :disabled="isEditingInventory"
            >
              {{ isEditingInventory ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>

      <!-- メンテナンス追加モーダル -->
      <div v-if="showAddMaintenanceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">メンテナンスを記録</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">設備名 *</label>
              <input
                v-model="maintenanceForm.equipmentName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="例: エアコン、給湯器"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">前回メンテナンス日</label>
                <input
                  v-model="maintenanceForm.lastMaintenanceDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">次回予定日</label>
                <input
                  v-model="maintenanceForm.nextScheduledDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                v-model="maintenanceForm.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="good">良好</option>
                <option value="needs_attention">要確認</option>
                <option value="under_maintenance">メンテナンス中</option>
                <option value="broken">故障</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">作業内容</label>
              <textarea
                v-model="maintenanceForm.description"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="実施した作業の詳細"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">作業者</label>
                <input
                  v-model="maintenanceForm.performedBy"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="業者名など"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">費用（円）</label>
                <input
                  v-model.number="maintenanceForm.cost"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showAddMaintenanceModal = false"
              class="btn-secondary"
              :disabled="isAddingMaintenance"
            >
              キャンセル
            </button>
            <button
              @click="submitAddMaintenance"
              class="btn-primary"
              :disabled="isAddingMaintenance"
            >
              {{ isAddingMaintenance ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>

      <!-- メンテナンス編集モーダル -->
      <div v-if="showEditMaintenanceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-bold mb-4">メンテナンス記録を編集</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">設備名 *</label>
              <input
                v-model="editMaintenanceForm.equipmentName"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">前回メンテナンス日</label>
                <input
                  v-model="editMaintenanceForm.lastMaintenanceDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">次回予定日</label>
                <input
                  v-model="editMaintenanceForm.nextScheduledDate"
                  type="date"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select
                v-model="editMaintenanceForm.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="good">良好</option>
                <option value="needs_attention">要確認</option>
                <option value="under_maintenance">メンテナンス中</option>
                <option value="broken">故障</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">作業内容</label>
              <textarea
                v-model="editMaintenanceForm.description"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">作業者</label>
                <input
                  v-model="editMaintenanceForm.performedBy"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">費用（円）</label>
                <input
                  v-model.number="editMaintenanceForm.cost"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="showEditMaintenanceModal = false"
              class="btn-secondary"
              :disabled="isEditingMaintenance"
            >
              キャンセル
            </button>
            <button
              @click="submitEditMaintenance"
              class="btn-primary"
              :disabled="isEditingMaintenance"
            >
              {{ isEditingMaintenance ? '保存中...' : '保存' }}
            </button>
          </div>
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

      <!-- オプション管理タブ -->
      <div v-if="currentTab === 'options'" class="card">
        <div class="text-center py-8">
          <svg class="w-16 h-16 text-purple-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">予約オプション管理</h3>
          <p class="text-gray-600 mb-6">BBQ設備、レンタサイクルなどのオプションを管理できます</p>
          <NuxtLink
            to="/admin/options"
            class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            オプション管理ページを開く
          </NuxtLink>
        </div>
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
        <!-- ローディング表示 -->
        <div v-if="isLoadingSettings" class="text-center py-8">
          <p class="text-gray-600">設定を読み込み中...</p>
        </div>

        <template v-else>
        <!-- チェックイン情報設定 -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">チェックイン情報</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                チェックイン時間
              </label>
              <input
                v-model="facilitySettings.checkInTime"
                type="time"
                class="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                チェックアウト時間
              </label>
              <input
                v-model="facilitySettings.checkOutTime"
                type="time"
                class="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                最大宿泊人数
              </label>
              <input
                v-model.number="facilitySettings.maxGuests"
                type="number"
                min="1"
                max="20"
                class="w-full md:w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <p class="text-sm text-gray-500 mt-1">トップページの「ハウスルール」に表示されます</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                鍵の場所・受け渡し方法
              </label>
              <textarea
                v-model="facilitySettings.keyInfo"
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
                v-model="facilitySettings.wifiPassword"
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
                v-model="facilitySettings.parkingInfo"
                rows="2"
                placeholder="駐車場の場所や注意事項"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <button
              type="button"
              @click="saveFacilitySettings"
              :disabled="isSavingSettings"
              class="btn-primary"
            >
              {{ isSavingSettings ? '保存中...' : '保存' }}
            </button>
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
                v-model="facilitySettings.ownerPhone"
                type="tel"
                placeholder="090-1234-5678"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                水道トラブル
              </label>
              <input
                v-model="facilitySettings.plumbingPhone"
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
                v-model="facilitySettings.electricPhone"
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
                v-model="facilitySettings.locksmithPhone"
                type="tel"
                placeholder="鍵屋の電話番号"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <button
            type="button"
            @click="saveFacilitySettings"
            :disabled="isSavingSettings"
            class="btn-primary mt-4"
          >
            {{ isSavingSettings ? '保存中...' : '保存' }}
          </button>
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
                v-model="facilitySettings.houseRules"
                rows="8"
                placeholder="例:&#10;- 禁煙です&#10;- ペット不可&#10;- 騒音は22時まで&#10;- ゴミは分別してください"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <button
              type="button"
              @click="saveFacilitySettings"
              :disabled="isSavingSettings"
              class="btn-primary"
            >
              {{ isSavingSettings ? '保存中...' : '保存' }}
            </button>
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
                v-model="facilitySettings.restaurants"
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
                v-model="facilitySettings.attractions"
                rows="3"
                placeholder="近くの観光スポット"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                コンビニ・スーパー等
              </label>
              <textarea
                v-model="facilitySettings.convenience"
                rows="3"
                placeholder="最寄りのコンビニやスーパーの情報"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                車でのアクセス
              </label>
              <textarea
                v-model="facilitySettings.accessByCar"
                rows="2"
                placeholder="駐車場情報やアクセス方法"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                公共交通機関でのアクセス
              </label>
              <textarea
                v-model="facilitySettings.accessByPublicTransport"
                rows="2"
                placeholder="電車・バスなどのアクセス方法"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                近隣の医療機関
              </label>
              <textarea
                v-model="facilitySettings.nearbyHospital"
                rows="2"
                placeholder="近くの病院やクリニック情報"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <button
              type="button"
              @click="saveFacilitySettings"
              :disabled="isSavingSettings"
              class="btn-primary"
            >
              {{ isSavingSettings ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>

        <!-- ハウスルール詳細設定 -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">ハウスルール詳細ページ設定</h2>
          <p class="text-sm text-gray-500 mb-4">「ハウスルール」詳細ページに表示される内容を編集できます</p>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                禁止事項（各行が1項目）
              </label>
              <textarea
                v-model="facilitySettings.houseRulesProhibited"
                rows="5"
                placeholder="- 禁煙&#10;- ペット不可&#10;- パーティー禁止"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                静粛時間
              </label>
              <input
                v-model="facilitySettings.houseRulesNoise"
                type="text"
                placeholder="22:00〜翌8:00"
                class="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ゴミの分別・処理（各行が1項目）
              </label>
              <textarea
                v-model="facilitySettings.houseRulesGarbage"
                rows="4"
                placeholder="- 燃えるゴミ・燃えないゴミに分別&#10;- ペットボトルは洗ってください"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                チェックアウト時のお願い（各行が1項目）
              </label>
              <textarea
                v-model="facilitySettings.houseRulesCheckout"
                rows="5"
                placeholder="- 食器を洗って戻す&#10;- エアコンを切る&#10;- 鍵を返却"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <button
              type="button"
              @click="saveFacilitySettings"
              :disabled="isSavingSettings"
              class="btn-primary"
            >
              {{ isSavingSettings ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>

        <!-- キャンセルポリシー詳細設定 -->
        <div class="card">
          <h2 class="text-2xl font-semibold mb-6">キャンセルポリシー詳細ページ設定</h2>
          <p class="text-sm text-gray-500 mb-4">「キャンセルポリシー」詳細ページに表示される内容を編集できます</p>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  無料キャンセル期間
                </label>
                <input
                  v-model="facilitySettings.cancelPolicyFree"
                  type="text"
                  placeholder="利用日の3日前まで"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  無料キャンセル - キャンセル料
                </label>
                <input
                  v-model="facilitySettings.cancelPolicyFreeDesc"
                  type="text"
                  placeholder="無料"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  有料キャンセル期間
                </label>
                <input
                  v-model="facilitySettings.cancelPolicyPartial"
                  type="text"
                  placeholder="利用日の2日前〜当日"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  有料キャンセル - キャンセル料
                </label>
                <input
                  v-model="facilitySettings.cancelPolicyPartialDesc"
                  type="text"
                  placeholder="利用料金の100%"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  無断キャンセル
                </label>
                <input
                  v-model="facilitySettings.cancelPolicyNoShow"
                  type="text"
                  placeholder="無断キャンセル（不泊）"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  無断キャンセル - キャンセル料
                </label>
                <input
                  v-model="facilitySettings.cancelPolicyNoShowDesc"
                  type="text"
                  placeholder="利用料金の100%"
                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                キャンセル手続き方法
              </label>
              <textarea
                v-model="facilitySettings.cancelPolicyProcedure"
                rows="3"
                placeholder="キャンセル手続きの方法を記載"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                例外事項（各行が1項目）
              </label>
              <textarea
                v-model="facilitySettings.cancelPolicyExceptions"
                rows="4"
                placeholder="- 自然災害の場合&#10;- 施設都合の場合"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                注意事項（各行が1項目）
              </label>
              <textarea
                v-model="facilitySettings.cancelPolicyNotes"
                rows="4"
                placeholder="- キャンセル料の計算基準&#10;- 返金処理について"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              ></textarea>
            </div>
            <button
              type="button"
              @click="saveFacilitySettings"
              :disabled="isSavingSettings"
              class="btn-primary"
            >
              {{ isSavingSettings ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
        </template>
      </div>

      <!-- システムタブ -->
      <div v-if="currentTab === 'system'" class="space-y-6">
        <div class="card">
          <h3 class="text-xl font-semibold mb-4">Stripe/Firestore 整合性チェック</h3>
          <p class="text-gray-600 mb-6">
            決済システム（Stripe）とデータベース（Firestore）の間のデータ整合性を確認します。
            ステータスの不一致や、与信期限切れが近い予約などを検出します。
          </p>

          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 class="font-medium mb-3">チェック設定</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm text-gray-600 mb-1">開始日</label>
                <input
                  type="date"
                  v-model="consistencyCheckDateFrom"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">終了日</label>
                <input
                  type="date"
                  v-model="consistencyCheckDateTo"
                  class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div class="flex items-end">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="consistencyAutoFix"
                    class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span class="text-sm">自動修復を有効にする</span>
                </label>
              </div>
            </div>
          </div>

          <button
            @click="runConsistencyCheck"
            :disabled="isRunningConsistencyCheck"
            class="btn-primary"
          >
            <span v-if="isRunningConsistencyCheck">チェック中...</span>
            <span v-else>整合性チェックを実行</span>
          </button>

          <!-- チェック結果 -->
          <div v-if="consistencyCheckResult" class="mt-6">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-semibold text-lg">チェック結果</h4>
              <span class="text-sm text-gray-500">
                レポートID: {{ consistencyCheckResult.reportId }}
              </span>
            </div>

            <!-- サマリー -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-blue-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-blue-600">{{ consistencyCheckResult.summary.totalChecked }}</p>
                <p class="text-sm text-gray-600">チェック件数</p>
              </div>
              <div :class="[
                'rounded-lg p-4 text-center',
                consistencyCheckResult.summary.inconsistenciesFound > 0 ? 'bg-red-50' : 'bg-green-50'
              ]">
                <p :class="[
                  'text-2xl font-bold',
                  consistencyCheckResult.summary.inconsistenciesFound > 0 ? 'text-red-600' : 'text-green-600'
                ]">
                  {{ consistencyCheckResult.summary.inconsistenciesFound }}
                </p>
                <p class="text-sm text-gray-600">不整合件数</p>
              </div>
              <div class="bg-purple-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-purple-600">{{ consistencyCheckResult.summary.autoFixed }}</p>
                <p class="text-sm text-gray-600">自動修復件数</p>
              </div>
            </div>

            <!-- 不整合リスト -->
            <div v-if="consistencyCheckResult.inconsistencies.length > 0">
              <h5 class="font-medium mb-3">検出された問題</h5>
              <div class="space-y-3">
                <div
                  v-for="(issue, index) in consistencyCheckResult.inconsistencies"
                  :key="index"
                  class="border rounded-lg p-4"
                  :class="{
                    'border-red-200 bg-red-50': issue.type === 'status_mismatch' || issue.type === 'missing_payment',
                    'border-yellow-200 bg-yellow-50': issue.type === 'stale_authorization',
                    'border-orange-200 bg-orange-50': issue.type === 'amount_mismatch'
                  }"
                >
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="font-mono text-sm text-gray-500">{{ issue.bookingReference }}</span>
                      <span class="ml-2 text-xs px-2 py-1 rounded-full" :class="{
                        'bg-red-200 text-red-800': issue.type === 'status_mismatch',
                        'bg-yellow-200 text-yellow-800': issue.type === 'stale_authorization',
                        'bg-orange-200 text-orange-800': issue.type === 'amount_mismatch',
                        'bg-gray-200 text-gray-800': issue.type === 'missing_payment'
                      }">
                        {{ getInconsistencyTypeLabel(issue.type) }}
                      </span>
                    </div>
                    <span v-if="issue.autoFixable" class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      自動修復可能
                    </span>
                  </div>
                  <p class="mt-2 text-sm">{{ issue.description }}</p>
                  <p class="mt-1 text-xs text-gray-600">
                    <strong>推奨アクション:</strong> {{ issue.suggestedAction }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-green-600">
              <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="font-semibold">すべて正常です</p>
              <p class="text-sm text-gray-500">不整合は検出されませんでした</p>
            </div>
          </div>
        </div>

        <!-- Webhookログ -->
        <div class="card">
          <h3 class="text-xl font-semibold mb-4">Webhookログ</h3>
          <p class="text-gray-600 mb-4">
            直近のStripe Webhookイベントの処理履歴を確認できます。
          </p>
          <button
            @click="loadWebhookLogs"
            :disabled="isLoadingWebhookLogs"
            class="btn-secondary mb-4"
          >
            {{ isLoadingWebhookLogs ? '読み込み中...' : 'ログを更新' }}
          </button>

          <div v-if="webhookLogs.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">イベント</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="log in webhookLogs" :key="log.id">
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDateTime(log.timestamp) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-mono">
                    {{ log.eventType }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs',
                        log.processed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      ]"
                    >
                      {{ log.processed ? '成功' : 'エラー' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-gray-500 text-center py-4">
            ログを読み込むには「ログを更新」をクリックしてください
          </p>
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
              v-if="['confirmed', 'pending_review'].includes(selectedBooking.status)"
              @click="openModifyModal"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              予約変更
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

    <!-- 予約変更モーダル -->
    <div v-if="showModifyModal && selectedBooking" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">予約変更</h3>

        <div class="space-y-4 mb-6">
          <!-- 現在の予約情報 -->
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">予約番号</p>
            <p class="font-medium">{{ selectedBooking.bookingReference }}</p>
            <p class="text-sm text-gray-600 mt-2">ゲスト</p>
            <p class="font-medium">{{ selectedBooking.guestName }}様</p>
          </div>

          <!-- 日程変更 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">チェックイン日</label>
            <input
              v-model="modifyForm.checkInDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">現在: {{ formatDate(selectedBooking.startDate) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">チェックアウト日</label>
            <input
              v-model="modifyForm.checkOutDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">現在: {{ formatDate(selectedBooking.endDate) }}</p>
          </div>

          <!-- 人数変更 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">宿泊人数</label>
            <select
              v-model="modifyForm.guestCount"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">変更しない</option>
              <option v-for="n in 6" :key="n" :value="n">{{ n }}名</option>
            </select>
            <p class="text-xs text-gray-500 mt-1">現在: {{ selectedBooking.guestCount }}名</p>
          </div>

          <!-- 変更理由 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">変更理由 <span class="text-red-500">*</span></label>
            <textarea
              v-model="modifyForm.reason"
              rows="3"
              placeholder="例: お客様からの日程変更依頼"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- 金額変更の警告 -->
          <div v-if="modifyForm.checkInDate || modifyForm.checkOutDate || modifyForm.guestCount" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">
              <strong>注意:</strong> 変更により金額が変わる場合、差額の返金または追加請求が発生します。
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showModifyModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            @click="submitModification"
            :disabled="isModifying || !modifyForm.reason"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ isModifying ? '処理中...' : '変更を実行' }}
          </button>
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
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import type { Booking, BookingStatus, PaymentStatus, GuestMessage, RejectionCategory, InventoryItem, MaintenanceRecord, InventoryStatus, MaintenanceStatus } from '~/types'
import { Timestamp } from 'firebase/firestore'

const { appUser, loading, user, logout, getIdToken } = useAuth()
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
const {
  getInventoryStatus,
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  updateStock,
  deleteInventoryItem
} = useInventory()
const {
  getAllMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord
} = useMaintenance()
const router = useRouter()

definePageMeta({
  layout: false,
  middleware: 'admin',
  ssr: false  // クライアントサイドのみでレンダリング（ハイドレーション問題回避）
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

// 施設設定データ
const facilitySettings = ref({
  // 基本設定
  checkInTime: '14:00',
  checkOutTime: '11:00',
  maxGuests: 6,
  keyInfo: '',
  wifiPassword: '',
  parkingInfo: '',
  ownerPhone: '',
  plumbingPhone: '',
  electricPhone: '',
  locksmithPhone: '',

  // ハウスルール詳細ページ用
  houseRules: '',
  houseRulesProhibited: '- 建物内・敷地内全面禁煙（電子タバコ含む）\n- ペット同伴不可\n- パーティー・騒音を伴うイベント禁止\n- 商用目的の撮影は事前許可が必要',
  houseRulesNoise: '22:00〜翌8:00',
  houseRulesGarbage: '- 燃えるゴミ・燃えないゴミ・資源ゴミに分別\n- ペットボトル・缶は洗ってからお捨てください\n- 大量のゴミが出る場合は事前にご相談ください',
  houseRulesCheckout: '- 使用した食器類は軽く洗って元の場所にお戻しください\n- タオル・リネン類は脱衣所の所定の場所にまとめてください\n- エアコン・照明・水道の元栓を確認してください\n- 窓・ドアの施錠を確認してください\n- 鍵を所定の場所にお戻しください',

  // キャンセルポリシー詳細ページ用
  cancelPolicyFree: '利用日の3日前まで',
  cancelPolicyFreeDesc: '無料',
  cancelPolicyPartial: '利用日の2日前〜当日',
  cancelPolicyPartialDesc: '利用料金の100%（清掃料等を含む）',
  cancelPolicyNoShow: '無断キャンセル（不泊）',
  cancelPolicyNoShowDesc: '利用料金の100%',
  cancelPolicyProcedure: '予約サイトからキャンセル\nご予約時にご利用いただいた予約サイトにログインし、「予約の管理」または「キャンセル」メニューからお手続きください。',
  cancelPolicyExceptions: '- 悪天候や自然災害等で当社が施設の利用が危険と判断した場合\n- 施設の設備故障等により利用が不可能となった場合\n- その他、やむを得ない事由により当社が利用不可と判断した場合',
  cancelPolicyNotes: '- キャンセル料の計算は、施設利用日を基準とします\n- キャンセル料には、基本利用料金および清掃料等の追加料金が含まれます\n- 返金処理には、決済方法により数日〜数週間かかる場合があります',

  // 周辺情報詳細ページ用
  restaurants: '',
  attractions: '',
  convenience: '',
  accessByCar: '駐車場をご利用いただけます。駐車場の詳細は予約確認メールをご確認ください。',
  accessByPublicTransport: '詳細なアクセス方法は予約確認メールでご案内いたします。',
  nearbyHospital: '急な体調不良の際は、お近くの病院・クリニックをご利用ください。'
})
const isLoadingSettings = ref(false)
const isSavingSettings = ref(false)

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

// 予約変更モーダル
const showModifyModal = ref(false)
const isModifying = ref(false)
const modifyForm = reactive({
  checkInDate: '',
  checkOutDate: '',
  guestCount: null as number | null,
  reason: ''
})

const openModifyModal = () => {
  // フォームをリセット
  modifyForm.checkInDate = ''
  modifyForm.checkOutDate = ''
  modifyForm.guestCount = null
  modifyForm.reason = ''
  showModifyModal.value = true
}

const submitModification = async () => {
  if (!selectedBooking.value || !modifyForm.reason) return

  // 少なくとも1つの変更があるか確認
  if (!modifyForm.checkInDate && !modifyForm.checkOutDate && modifyForm.guestCount === null) {
    alert('変更内容を指定してください')
    return
  }

  isModifying.value = true

  try {
    const { getIdToken } = useAuth()
    const token = await getIdToken()
    if (!token) throw new Error('認証が必要です')

    const body: any = {
      bookingId: selectedBooking.value.id,
      reason: modifyForm.reason
    }

    if (modifyForm.checkInDate) {
      body.newCheckInDate = modifyForm.checkInDate
    }
    if (modifyForm.checkOutDate) {
      body.newCheckOutDate = modifyForm.checkOutDate
    }
    if (modifyForm.guestCount !== null) {
      body.newGuestCount = modifyForm.guestCount
    }

    const response = await fetch('/api/bookings/modify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || '予約変更に失敗しました')
    }

    alert(result.message)
    showModifyModal.value = false
    selectedBooking.value = null

    // 予約一覧を再読み込み
    dataLoaded.value = false
    await loadData()

  } catch (error: any) {
    console.error('予約変更エラー:', error)
    alert(error.message || '予約変更に失敗しました')
  } finally {
    isModifying.value = false
  }
}

// 審査モーダル
const showRejectModal = ref(false)
const rejectCategory = ref('')
const rejectMessage = ref('')
const isApproving = ref(false)
const isRejecting = ref(false)

// 予約データを取得
const loadBookings = async () => {
  console.log('[Admin] loadBookings called')
  isLoading.value = true
  try {
    allBookings.value = await getAllBookings()
    console.log('[Admin] Bookings loaded:', allBookings.value.length)
  } catch (error) {
    console.error('[Admin] 予約データ取得エラー:', error)
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

// 与信期限アラート
interface AuthorizationAlert {
  bookingId: string
  bookingReference: string
  guestName: string
  guestEmail: string
  checkInDate: string
  checkOutDate: string
  totalAmount: number
  daysSinceAuth: number
  urgencyLevel: 'warning' | 'critical' | 'expired'
  message: string
}
const authAlerts = ref<AuthorizationAlert[]>([])
const authAlertsLoading = ref(false)

const loadAuthorizationAlerts = async () => {
  authAlertsLoading.value = true
  try {
    const { getIdToken } = useAuth()
    const token = await getIdToken()
    if (!token) return

    const response = await fetch('/api/admin/authorization-alerts', {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.ok) {
      const data = await response.json()
      authAlerts.value = data.alerts || []
    }
  } catch (error) {
    console.error('[Admin] 与信アラート取得エラー:', error)
  } finally {
    authAlertsLoading.value = false
  }
}

const getAlertColor = (level: string) => {
  switch (level) {
    case 'expired': return 'bg-red-100 border-red-500 text-red-800'
    case 'critical': return 'bg-orange-100 border-orange-500 text-orange-800'
    default: return 'bg-yellow-100 border-yellow-500 text-yellow-800'
  }
}

const getAlertIcon = (level: string) => {
  switch (level) {
    case 'expired': return '🚨'
    case 'critical': return '⚠️'
    default: return '⏰'
  }
}

const loadData = async () => {
  console.log('[Admin] loadData called, dataLoaded:', dataLoaded.value)
  if (dataLoaded.value) {
    console.log('[Admin] loadData skipped - already loaded')
    return
  }
  dataLoaded.value = true
  console.log('[Admin] Starting to load bookings and blocked dates')
  await Promise.all([
    loadBookings(),
    loadBlockedDates(),
    loadAuthorizationAlerts()
  ])
  console.log('[Admin] Data loading complete')
}

// 認証状態を監視してデータを読み込み
watch([loading, user], ([isLoading, currentUser]) => {
  console.log('[Admin] Auth state changed - loading:', isLoading, 'user:', currentUser?.email)
  if (!isLoading && currentUser) {
    console.log('[Admin] Auth ready, calling loadData')
    loadData()
  }
}, { immediate: true })

// マウント時にも確認（認証が既に完了している場合）
onMounted(() => {
  console.log('[Admin] onMounted - loading:', loading.value, 'user:', user.value?.email)
  if (!loading.value && user.value) {
    console.log('[Admin] onMounted - calling loadData')
    loadData()
  }
})

const tabs = [
  { id: 'bookings', name: '予約管理' },
  { id: 'pricing-enhanced', name: '料金設定' }, // 拡張版を「料金設定」に変更
  { id: 'options', name: 'オプション' },
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
  { id: 'settings', name: '設定' },
  { id: 'system', name: 'システム' }
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
// システム機能（整合性チェック）
// ========================================

const consistencyCheckDateFrom = ref('')
const consistencyCheckDateTo = ref('')
const consistencyAutoFix = ref(false)
const isRunningConsistencyCheck = ref(false)
const consistencyCheckResult = ref<{
  reportId: string
  summary: {
    totalChecked: number
    inconsistenciesFound: number
    autoFixed: number
  }
  inconsistencies: Array<{
    bookingId: string
    bookingReference: string
    type: string
    description: string
    suggestedAction: string
    autoFixable: boolean
  }>
} | null>(null)

const webhookLogs = ref<Array<{
  id: string
  eventType: string
  eventId?: string
  processed: boolean
  timestamp: any
  error?: string
}>>([])
const isLoadingWebhookLogs = ref(false)

// 整合性チェックを実行
const runConsistencyCheck = async () => {
  isRunningConsistencyCheck.value = true
  consistencyCheckResult.value = null

  try {
    const token = await getIdToken()
    if (!token) {
      throw new Error('認証が必要です。再ログインしてください。')
    }

    const response = await $fetch<any>('/api/admin/consistency-check', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        autoFix: consistencyAutoFix.value,
        dateFrom: consistencyCheckDateFrom.value || undefined,
        dateTo: consistencyCheckDateTo.value || undefined
      }
    })

    consistencyCheckResult.value = response
    console.log('整合性チェック完了:', response)
  } catch (error: any) {
    console.error('整合性チェックエラー:', error)
    alert(`エラー: ${error.message || '整合性チェックに失敗しました'}`)
  } finally {
    isRunningConsistencyCheck.value = false
  }
}

// Webhookログを取得
const loadWebhookLogs = async () => {
  isLoadingWebhookLogs.value = true

  try {
    const { $firestore } = useNuxtApp()
    const db = $firestore as ReturnType<typeof import('firebase/firestore').getFirestore>

    const logsSnapshot = await getDocs(
      query(
        collection(db, 'webhookLogs'),
        orderBy('timestamp', 'desc'),
        limit(50)
      )
    )

    webhookLogs.value = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any
  } catch (error: any) {
    console.error('Webhookログ取得エラー:', error)
    alert(`エラー: ${error.message || 'ログの取得に失敗しました'}`)
  } finally {
    isLoadingWebhookLogs.value = false
  }
}

// 不整合タイプのラベルを取得
const getInconsistencyTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'status_mismatch': 'ステータス不一致',
    'missing_payment': '決済情報なし',
    'orphan_payment': '孤立した決済',
    'amount_mismatch': '金額不一致',
    'stale_authorization': '与信期限切れ間近'
  }
  return labels[type] || type
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

function viewBookingById(bookingId: string) {
  const booking = allBookings.value.find(b => b.id === bookingId)
  if (booking) {
    selectedBooking.value = booking
  }
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
    const token = await getIdToken()
    if (!token) {
      throw new Error('認証が必要です。再ログインしてください。')
    }

    const response = await $fetch<{
      success: boolean
      bookingId: string
      status: string
      message: string
    }>('/api/bookings/approve', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
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
    const token = await getIdToken()
    if (!token) {
      throw new Error('認証が必要です。再ログインしてください。')
    }

    const response = await $fetch<{
      success: boolean
      bookingId: string
      status: string
      message: string
    }>('/api/bookings/reject', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
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

// 施設設定の読み込み
async function loadFacilitySettings() {
  if (!user.value) return

  isLoadingSettings.value = true
  try {
    const idToken = await user.value.getIdToken()
    const response = await fetch('/api/admin/settings', {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    })

    if (response.ok) {
      const data = await response.json()
      if (data.success && data.settings) {
        facilitySettings.value = { ...facilitySettings.value, ...data.settings }
      }
    }
  } catch (error) {
    console.error('設定の読み込みに失敗しました:', error)
  } finally {
    isLoadingSettings.value = false
  }
}

// 施設設定の保存
async function saveFacilitySettings() {
  console.log('[Settings] saveFacilitySettings called, user:', user.value?.email)
  if (!user.value) {
    console.error('[Settings] No user found')
    alert('ログインが必要です')
    return
  }

  isSavingSettings.value = true
  try {
    console.log('[Settings] Getting ID token...')
    const idToken = await user.value.getIdToken()
    console.log('[Settings] Got token, saving settings...')

    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(facilitySettings.value)
    })

    console.log('[Settings] Response status:', response.status)
    if (response.ok) {
      alert('設定を保存しました')
    } else {
      const error = await response.json()
      console.error('[Settings] Save error:', error)
      alert(`保存に失敗しました: ${error.message}`)
    }
  } catch (error) {
    console.error('[Settings] 設定の保存に失敗しました:', error)
    alert('設定の保存に失敗しました')
  } finally {
    isSavingSettings.value = false
  }
}

// 設定タブに切り替えた時に設定を読み込む
watch(currentTab, (newTab) => {
  if (newTab === 'settings' && user.value) {
    loadFacilitySettings()
  }
  if (newTab === 'inventory' && user.value) {
    loadInventoryAndMaintenance()
  }
})

// ============================================
// 在庫・メンテナンス管理
// ============================================

// 在庫アイテムデータ
const inventoryItems = ref<InventoryItem[]>([])
const maintenanceRecords = ref<MaintenanceRecord[]>([])
const isLoadingInventory = ref(false)

// 在庫追加モーダル
const showAddInventoryModal = ref(false)
const isAddingInventory = ref(false)
const inventoryForm = reactive({
  name: '',
  currentStock: 0,
  unit: '個',
  reorderThreshold: 10,
  purchaseUrl: '',
  notes: ''
})

// 在庫編集モーダル
const showEditInventoryModal = ref(false)
const isEditingInventory = ref(false)
const editingInventoryItem = ref<InventoryItem | null>(null)
const editInventoryForm = reactive({
  name: '',
  currentStock: 0,
  unit: '',
  reorderThreshold: 0,
  purchaseUrl: '',
  notes: ''
})

// メンテナンス記録モーダル
const showAddMaintenanceModal = ref(false)
const isAddingMaintenance = ref(false)
const maintenanceForm = reactive({
  equipmentName: '',
  lastMaintenanceDate: '',
  nextScheduledDate: '',
  status: 'good' as MaintenanceStatus,
  description: '',
  performedBy: '',
  cost: 0
})

// メンテナンス編集モーダル
const showEditMaintenanceModal = ref(false)
const isEditingMaintenance = ref(false)
const editingMaintenanceRecord = ref<MaintenanceRecord | null>(null)
const editMaintenanceForm = reactive({
  equipmentName: '',
  lastMaintenanceDate: '',
  nextScheduledDate: '',
  status: 'good' as MaintenanceStatus,
  description: '',
  performedBy: '',
  cost: 0
})

// 在庫・メンテナンスデータを読み込み
const loadInventoryAndMaintenance = async () => {
  isLoadingInventory.value = true
  try {
    const [items, records] = await Promise.all([
      getAllInventoryItems(),
      getAllMaintenanceRecords()
    ])
    inventoryItems.value = items
    maintenanceRecords.value = records
  } catch (error) {
    console.error('Load inventory/maintenance error:', error)
  } finally {
    isLoadingInventory.value = false
  }
}

// 在庫ステータスラベル
const getInventoryStatusLabel = (item: InventoryItem): string => {
  const status = getInventoryStatus(item)
  switch (status) {
    case 'sufficient': return '十分'
    case 'low': return '要発注'
    case 'out_of_stock': return '在庫切れ'
    default: return '不明'
  }
}

// 在庫ステータス色
const getInventoryStatusColor = (item: InventoryItem): string => {
  const status = getInventoryStatus(item)
  switch (status) {
    case 'sufficient': return 'bg-green-100 text-green-800'
    case 'low': return 'bg-yellow-100 text-yellow-800'
    case 'out_of_stock': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// メンテナンスステータスラベル
const getMaintenanceStatusLabel = (status: MaintenanceStatus): string => {
  switch (status) {
    case 'good': return '良好'
    case 'needs_attention': return '要確認'
    case 'under_maintenance': return 'メンテ中'
    case 'broken': return '故障'
    default: return '不明'
  }
}

// メンテナンスステータス色
const getMaintenanceStatusColor = (status: MaintenanceStatus): string => {
  switch (status) {
    case 'good': return 'bg-green-100 text-green-800'
    case 'needs_attention': return 'bg-yellow-100 text-yellow-800'
    case 'under_maintenance': return 'bg-blue-100 text-blue-800'
    case 'broken': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

// Timestampを日付文字列に変換
const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return '-'
  const date = timestamp.toDate()
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

// 在庫アイテム追加
const openAddInventoryModal = () => {
  inventoryForm.name = ''
  inventoryForm.currentStock = 0
  inventoryForm.unit = '個'
  inventoryForm.reorderThreshold = 10
  inventoryForm.purchaseUrl = ''
  inventoryForm.notes = ''
  showAddInventoryModal.value = true
}

const submitAddInventory = async () => {
  if (!inventoryForm.name.trim()) {
    alert('アイテム名を入力してください')
    return
  }
  isAddingInventory.value = true
  try {
    await createInventoryItem({
      name: inventoryForm.name,
      currentStock: inventoryForm.currentStock,
      unit: inventoryForm.unit,
      reorderThreshold: inventoryForm.reorderThreshold,
      purchaseUrl: inventoryForm.purchaseUrl || undefined,
      notes: inventoryForm.notes || undefined
    })
    showAddInventoryModal.value = false
    await loadInventoryAndMaintenance()
  } catch (error) {
    console.error('Add inventory error:', error)
    alert('在庫アイテムの追加に失敗しました')
  } finally {
    isAddingInventory.value = false
  }
}

// 在庫アイテム編集
const openEditInventoryModal = (item: InventoryItem) => {
  editingInventoryItem.value = item
  editInventoryForm.name = item.name
  editInventoryForm.currentStock = item.currentStock
  editInventoryForm.unit = item.unit
  editInventoryForm.reorderThreshold = item.reorderThreshold
  editInventoryForm.purchaseUrl = item.purchaseUrl || ''
  editInventoryForm.notes = item.notes || ''
  showEditInventoryModal.value = true
}

const submitEditInventory = async () => {
  if (!editingInventoryItem.value) return
  if (!editInventoryForm.name.trim()) {
    alert('アイテム名を入力してください')
    return
  }
  isEditingInventory.value = true
  try {
    await updateInventoryItem(editingInventoryItem.value.id, {
      name: editInventoryForm.name,
      currentStock: editInventoryForm.currentStock,
      unit: editInventoryForm.unit,
      reorderThreshold: editInventoryForm.reorderThreshold,
      purchaseUrl: editInventoryForm.purchaseUrl || undefined,
      notes: editInventoryForm.notes || undefined
    })
    showEditInventoryModal.value = false
    await loadInventoryAndMaintenance()
  } catch (error) {
    console.error('Edit inventory error:', error)
    alert('在庫アイテムの更新に失敗しました')
  } finally {
    isEditingInventory.value = false
  }
}

// 在庫アイテム削除
const handleDeleteInventory = async (item: InventoryItem) => {
  if (!confirm(`「${item.name}」を削除しますか？`)) return
  try {
    await deleteInventoryItem(item.id)
    await loadInventoryAndMaintenance()
  } catch (error) {
    console.error('Delete inventory error:', error)
    alert('在庫アイテムの削除に失敗しました')
  }
}

// メンテナンス記録追加
const openAddMaintenanceModal = () => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  maintenanceForm.equipmentName = ''
  maintenanceForm.lastMaintenanceDate = todayStr
  maintenanceForm.nextScheduledDate = ''
  maintenanceForm.status = 'good'
  maintenanceForm.description = ''
  maintenanceForm.performedBy = ''
  maintenanceForm.cost = 0
  showAddMaintenanceModal.value = true
}

const submitAddMaintenance = async () => {
  if (!maintenanceForm.equipmentName.trim()) {
    alert('設備名を入力してください')
    return
  }
  isAddingMaintenance.value = true
  try {
    await createMaintenanceRecord({
      equipmentName: maintenanceForm.equipmentName,
      lastMaintenanceDate: Timestamp.fromDate(new Date(maintenanceForm.lastMaintenanceDate)),
      nextScheduledDate: maintenanceForm.nextScheduledDate
        ? Timestamp.fromDate(new Date(maintenanceForm.nextScheduledDate))
        : undefined,
      status: maintenanceForm.status,
      description: maintenanceForm.description || undefined,
      performedBy: maintenanceForm.performedBy || undefined,
      cost: maintenanceForm.cost || undefined
    })
    showAddMaintenanceModal.value = false
    await loadInventoryAndMaintenance()
  } catch (error) {
    console.error('Add maintenance error:', error)
    alert('メンテナンス記録の追加に失敗しました')
  } finally {
    isAddingMaintenance.value = false
  }
}

// メンテナンス記録編集
const openEditMaintenanceModal = (record: MaintenanceRecord) => {
  editingMaintenanceRecord.value = record
  editMaintenanceForm.equipmentName = record.equipmentName
  editMaintenanceForm.lastMaintenanceDate = record.lastMaintenanceDate?.toDate().toISOString().split('T')[0] || ''
  editMaintenanceForm.nextScheduledDate = record.nextScheduledDate?.toDate().toISOString().split('T')[0] || ''
  editMaintenanceForm.status = record.status
  editMaintenanceForm.description = record.description || ''
  editMaintenanceForm.performedBy = record.performedBy || ''
  editMaintenanceForm.cost = record.cost || 0
  showEditMaintenanceModal.value = true
}

const submitEditMaintenance = async () => {
  if (!editingMaintenanceRecord.value) return
  if (!editMaintenanceForm.equipmentName.trim()) {
    alert('設備名を入力してください')
    return
  }
  isEditingMaintenance.value = true
  try {
    await updateMaintenanceRecord(editingMaintenanceRecord.value.id, {
      equipmentName: editMaintenanceForm.equipmentName,
      lastMaintenanceDate: Timestamp.fromDate(new Date(editMaintenanceForm.lastMaintenanceDate)),
      nextScheduledDate: editMaintenanceForm.nextScheduledDate
        ? Timestamp.fromDate(new Date(editMaintenanceForm.nextScheduledDate))
        : undefined,
      status: editMaintenanceForm.status,
      description: editMaintenanceForm.description || undefined,
      performedBy: editMaintenanceForm.performedBy || undefined,
      cost: editMaintenanceForm.cost || undefined
    })
    showEditMaintenanceModal.value = false
    await loadInventoryAndMaintenance()
  } catch (error) {
    console.error('Edit maintenance error:', error)
    alert('メンテナンス記録の更新に失敗しました')
  } finally {
    isEditingMaintenance.value = false
  }
}

// メンテナンス記録削除
const handleDeleteMaintenance = async (record: MaintenanceRecord) => {
  if (!confirm(`「${record.equipmentName}」の記録を削除しますか？`)) return
  try {
    await deleteMaintenanceRecord(record.id)
    await loadInventoryAndMaintenance()
  } catch (error) {
    console.error('Delete maintenance error:', error)
    alert('メンテナンス記録の削除に失敗しました')
  }
}
</script>
