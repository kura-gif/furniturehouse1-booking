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
        <h2 class="text-2xl font-semibold mb-6">ゲストメッセージ</h2>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- ゲスト一覧 -->
          <div class="md:col-span-1 border-r pr-4">
            <h3 class="text-lg font-semibold mb-4">予約一覧</h3>
            <div class="space-y-2">
              <div
                v-for="booking in allBookings.filter(b => b.status !== 'cancelled')"
                :key="booking.id"
                @click="selectedBooking = booking"
                :class="[
                  'p-3 rounded-lg cursor-pointer transition-custom',
                  selectedBooking?.id === booking.id
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                ]"
              >
                <div class="font-semibold">{{ booking.guestName }}</div>
                <div class="text-sm text-gray-600">
                  {{ formatDate(booking.startDate) }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ booking.type === 'stay' ? '宿泊' : 'ワークショップ' }}
                </div>
              </div>
            </div>
          </div>

          <!-- メッセージエリア -->
          <div class="md:col-span-2">
            <div v-if="selectedBooking">
              <div class="mb-4 pb-4 border-b">
                <h3 class="font-semibold text-lg">{{ selectedBooking.guestName }}様</h3>
                <p class="text-sm text-gray-600">{{ selectedBooking.guestEmail }}</p>
              </div>

              <!-- メッセージ履歴 -->
              <div
                ref="messagesContainer"
                class="bg-gray-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto"
              >
                <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
                  まだメッセージがありません
                </div>
                <div v-else class="space-y-4">
                  <div
                    v-for="msg in messages"
                    :key="msg.id"
                    :class="[
                      'flex',
                      msg.senderType === 'admin' ? 'justify-end' : 'justify-start'
                    ]"
                  >
                    <div
                      :class="[
                        'rounded-lg p-3 max-w-md',
                        msg.senderType === 'admin'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white shadow'
                      ]"
                    >
                      <p class="text-sm">{{ msg.message }}</p>
                      <p
                        :class="[
                          'text-xs mt-2',
                          msg.senderType === 'admin' ? 'opacity-75' : 'text-gray-500'
                        ]"
                      >
                        {{ formatDateTime(msg.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- メッセージ送信フォーム -->
              <form @submit.prevent="handleSendMessage" class="flex gap-2">
                <input
                  v-model="newMessage"
                  type="text"
                  placeholder="メッセージを入力..."
                  class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  :disabled="isSendingMessage"
                />
                <button
                  type="submit"
                  class="btn-primary"
                  :disabled="!newMessage.trim() || isSendingMessage"
                >
                  {{ isSendingMessage ? '送信中...' : '送信' }}
                </button>
              </form>

              <!-- クイック返信テンプレート -->
              <div class="mt-4">
                <p class="text-sm text-gray-600 mb-2">クイック返信</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(reply, index) in quickReplies"
                    :key="index"
                    type="button"
                    @click="useQuickReply(reply)"
                    class="text-sm px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
                  >
                    {{ reply.substring(0, 20) }}...
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center text-gray-500 py-12">
              左側から予約を選択してください
            </div>
          </div>
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
      <div v-if="currentTab === 'support'" class="space-y-6">
        <!-- サブタブ -->
        <div class="card">
          <div class="flex gap-4 border-b">
            <button
              @click="supportSubTab = 'schedule'"
              :class="[
                'px-4 py-2 font-medium transition-colors',
                supportSubTab === 'schedule'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              スケジュール
            </button>
            <button
              @click="supportSubTab = 'supporters'"
              :class="[
                'px-4 py-2 font-medium transition-colors',
                supportSubTab === 'supporters'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              サポーター管理
            </button>
            <button
              @click="supportSubTab = 'availability'"
              :class="[
                'px-4 py-2 font-medium transition-colors',
                supportSubTab === 'availability'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              利用可能状況
            </button>
          </div>
        </div>

        <!-- スケジュールタブ -->
        <div v-if="supportSubTab === 'schedule'" class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold">施設サポートスケジュール</h2>
            <button @click="showCreateTaskModal = true" class="btn-primary text-sm">
              + 新規タスク作成
            </button>
          </div>

          <!-- サポートタスク一覧 -->
          <div class="space-y-4">
            <div
              v-for="booking in allBookings.filter(b => b.status === 'confirmed').slice(0, 5)"
              :key="booking.id"
              class="border rounded-lg p-4 hover:shadow-md transition-custom"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="bg-purple-100 text-purple-700 rounded-lg px-3 py-1 text-sm font-semibold">
                      {{ formatDate(booking.endDate) }} チェックアウト後
                    </div>
                    <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                      未割当
                    </span>
                  </div>

                  <div class="text-sm text-gray-600">
                    <p>ゲスト: {{ booking.guestName }}様（{{ booking.guestCount }}名）</p>
                    <p class="mt-1">予定時間: <span class="font-semibold">3時間</span></p>
                    <p class="mt-1">想定コスト: ¥4,500（時給 ¥1,300 × 3h + 交通費 ¥600）</p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button class="btn-secondary text-sm">サポーター割当</button>
                  <button class="btn-secondary text-sm">詳細</button>
                </div>
              </div>

              <!-- チェックリスト -->
              <div class="mt-4 pt-4 border-t">
                <p class="text-sm font-semibold mb-2">サポートチェックリスト</p>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded" disabled />
                    <span class="text-gray-400">リネン交換</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded" disabled />
                    <span class="text-gray-400">バスルーム清掃</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded" disabled />
                    <span class="text-gray-400">キッチン清掃</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded" disabled />
                    <span class="text-gray-400">ゴミ回収</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded" disabled />
                    <span class="text-gray-400">床清掃</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded" disabled />
                    <span class="text-gray-400">窓清掃</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- 空の状態 -->
          <div v-if="allBookings.filter(b => b.status === 'confirmed').length === 0" class="text-center py-12">
            <p class="text-gray-500">サポートタスクはありません</p>
          </div>
        </div>

        <!-- サポーター管理タブ -->
        <div v-if="supportSubTab === 'supporters'" class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold">施設サポーター管理</h2>
            <button @click="openCreateSupporterModal" class="btn-primary text-sm">
              + サポーター追加
            </button>
          </div>

          <!-- サポーター一覧 -->
          <div v-if="allSupporters.length === 0" class="text-center py-12 text-gray-500">
            <p class="mb-4">サポーターが登録されていません</p>
            <button @click="openCreateSupporterModal" class="btn-primary">
              最初のサポーターを追加
            </button>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="supporter in allSupporters"
              :key="supporter.id"
              class="border rounded-lg p-4 hover:shadow-md transition-custom"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <h3 class="font-semibold text-lg">{{ supporter.name }}</h3>
                    <span
                      :class="supporter.isActive
                        ? 'px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold'
                        : 'px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold'"
                    >
                      {{ supporter.isActive ? 'アクティブ' : '非アクティブ' }}
                    </span>
                  </div>

                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <p class="text-xs text-gray-500">メール</p>
                      <p class="font-medium">{{ supporter.email }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">電話</p>
                      <p class="font-medium">{{ supporter.phone || '未設定' }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">時給</p>
                      <p class="font-medium">¥{{ supporter.hourlyRate.toLocaleString() }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">交通費（往復）</p>
                      <p class="font-medium">¥{{ supporter.transportationFee.toLocaleString() }}</p>
                    </div>
                  </div>

                  <div class="mt-3 text-sm">
                    <p class="text-gray-600">今月の稼働: <span class="font-semibold">計算中...</span></p>
                    <p class="text-gray-600">今月の報酬: <span class="font-semibold">計算中...</span></p>
                  </div>
                </div>

                <div class="flex gap-2">
                  <button @click="editSupporter(supporter)" class="btn-secondary text-sm">編集</button>
                  <button class="btn-secondary text-sm">スケジュール</button>
                  <button class="btn-secondary text-sm">チャット</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 利用可能状況タブ -->
        <div v-if="supportSubTab === 'availability'" class="card">
          <h2 class="text-2xl font-semibold mb-6">サポーター利用可能状況</h2>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">サポーター選択</label>
            <select class="w-full md:w-64 px-4 py-2 border rounded-lg">
              <option>田中 花子</option>
              <option>佐藤 太郎</option>
            </select>
          </div>

          <!-- カレンダー表示（簡易版） -->
          <div class="border rounded-lg p-6">
            <div class="text-center mb-4">
              <h3 class="text-lg font-semibold">2025年1月</h3>
            </div>

            <div class="grid grid-cols-7 gap-2">
              <!-- 曜日ヘッダー -->
              <div v-for="day in ['日', '月', '火', '水', '木', '金', '土']" :key="day" class="text-center text-sm font-medium text-gray-600 py-2">
                {{ day }}
              </div>

              <!-- 日付（モック） -->
              <div v-for="date in 31" :key="date" class="aspect-square">
                <div
                  :class="[
                    'w-full h-full flex items-center justify-center rounded-lg text-sm cursor-pointer transition-colors',
                    date % 5 === 0 ? 'bg-green-100 text-green-800 font-semibold' :
                    date % 7 === 0 ? 'bg-red-100 text-red-800' :
                    'hover:bg-gray-100'
                  ]"
                >
                  {{ date }}
                </div>
              </div>
            </div>

            <div class="mt-6 flex gap-6 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-100 rounded"></div>
                <span>利用可能（OK日）</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-red-100 rounded"></div>
                <span>利用不可（NG日）</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gray-100 rounded"></div>
                <span>未設定</span>
              </div>
            </div>
          </div>

          <p class="mt-4 text-sm text-gray-600">
            ※ サポーターが直接カレンダーに入力できるよう、専用ページを提供予定です
          </p>
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

          <!-- アクションボタン -->
          <div class="flex flex-wrap gap-3 pt-4 border-t">
            <button
              v-if="selectedBooking.status === 'pending'"
              @click="confirmBooking(selectedBooking.id)"
              class="btn-primary flex-1"
            >
              予約を確定
            </button>
            <button
              v-if="selectedBooking.status !== 'cancelled'"
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

    <!-- サポーター作成/編集モーダル -->
    <div
      v-if="showCreateSupporterModal || selectedSupporter"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="closeSupporterModal"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-semibold">
            {{ selectedSupporter ? 'サポーター編集' : '新規サポーター追加' }}
          </h3>
          <button
            @click="closeSupporterModal"
            class="p-2 hover:bg-gray-100 rounded-lg transition-custom"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSaveSupporter" class="space-y-4">
          <!-- 名前 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              名前 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="supporterForm.name"
              type="text"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例: 田中 花子"
            />
          </div>

          <!-- メールアドレス -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス <span class="text-red-500">*</span>
            </label>
            <input
              v-model="supporterForm.email"
              type="email"
              required
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例: tanaka@example.com"
            />
            <p class="text-xs text-gray-500 mt-1">通知メールが送信されます</p>
          </div>

          <!-- 電話番号 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              電話番号
            </label>
            <input
              v-model="supporterForm.phone"
              type="tel"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例: 090-1234-5678"
            />
          </div>

          <!-- 時給 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              時給（円） <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="supporterForm.hourlyRate"
              type="number"
              required
              min="0"
              step="50"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例: 1300"
            />
            <p class="text-xs text-gray-500 mt-1">個別に設定できます</p>
          </div>

          <!-- 交通費 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              交通費（往復・円） <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="supporterForm.transportationFee"
              type="number"
              required
              min="0"
              step="50"
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例: 600"
            />
            <p class="text-xs text-gray-500 mt-1">距離に応じたガソリン代</p>
          </div>

          <!-- アクティブステータス -->
          <div class="flex items-center gap-2">
            <input
              v-model="supporterForm.isActive"
              type="checkbox"
              id="isActive"
              class="rounded"
            />
            <label for="isActive" class="text-sm font-medium text-gray-700">
              アクティブ（タスク割当可能）
            </label>
          </div>

          <!-- ボタン -->
          <div class="flex gap-2 pt-4">
            <button
              type="button"
              @click="closeSupporterModal"
              class="btn-secondary flex-1"
            >
              キャンセル
            </button>
            <button
              type="submit"
              :disabled="isSavingSupporter"
              class="btn-primary flex-1"
            >
              {{ isSavingSupporter ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive, watch, nextTick } from 'vue'
import type { Booking, BookingStatus, PaymentStatus, Supporter, SupportTask, GuestMessage } from '~/types'

const { appUser, logout } = useAuth()
const { getAllBookings, confirmBooking: confirmBookingAPI, cancelBooking: cancelBookingAPI } = useBookings()
const {
  getAllSupporters,
  getActiveSupporters,
  createSupporter,
  updateSupporter,
  getAllSupportTasks,
  createSupportTask,
  updateSupportTask,
  assignSupporter
} = useSupport()
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

// マウント時に予約データを読み込み
onMounted(() => {
  loadBookings()
  loadSupporters()
  loadSupportTasks()
  loadBlockedDates()
})

const tabs = [
  { id: 'bookings', name: '予約管理' },
  { id: 'pricing-enhanced', name: '料金設定' }, // 拡張版を「料金設定」に変更
  { id: 'calendar', name: 'カレンダー' },
  { id: 'messages', name: 'メッセージ' },
  { id: 'reports', name: 'レポート' },
  { id: 'support', name: '施設サポート' },
  { id: 'inventory', name: '備品管理' },
  { id: 'amenities', name: 'アメニティ管理' },
  { id: 'photos', name: '写真ギャラリー' },
  { id: 'reviews', name: 'レビュー' },
  // { id: 'pricing', name: '料金設定' }, // 旧料金設定は非表示化
  { id: 'coupons', name: 'クーポン' },
  { id: 'settings', name: '設定' }
]

const currentTab = ref('bookings')
const bookingFilter = ref('all')

// 施設サポート関連の状態
const supportSubTab = ref('schedule')
const showCreateTaskModal = ref(false)
const showCreateSupporterModal = ref(false)

// サポーター管理
const allSupporters = ref<Supporter[]>([])
const allSupportTasks = ref<SupportTask[]>([])
const selectedSupporter = ref<Supporter | null>(null)
const isSavingSupporter = ref(false)
const supporterForm = reactive({
  name: '',
  email: '',
  phone: '',
  hourlyRate: 1300,
  transportationFee: 600,
  isActive: true
})

// サポーターデータを取得
const loadSupporters = async () => {
  try {
    allSupporters.value = await getAllSupporters()
  } catch (error) {
    console.error('サポーターデータ取得エラー:', error)
    alert('サポーターデータの取得に失敗しました')
  }
}

// サポートタスクデータを取得
const loadSupportTasks = async () => {
  try {
    allSupportTasks.value = await getAllSupportTasks()
  } catch (error) {
    console.error('サポートタスクデータ取得エラー:', error)
    alert('サポートタスクデータの取得に失敗しました')
  }
}

// サポーターモーダルを開く
const openCreateSupporterModal = () => {
  selectedSupporter.value = null
  supporterForm.name = ''
  supporterForm.email = ''
  supporterForm.phone = ''
  supporterForm.hourlyRate = 1300
  supporterForm.transportationFee = 600
  supporterForm.isActive = true
  showCreateSupporterModal.value = true
}

// サポーター編集モーダルを開く
const editSupporter = (supporter: Supporter) => {
  selectedSupporter.value = supporter
  supporterForm.name = supporter.name
  supporterForm.email = supporter.email
  supporterForm.phone = supporter.phone || ''
  supporterForm.hourlyRate = supporter.hourlyRate
  supporterForm.transportationFee = supporter.transportationFee
  supporterForm.isActive = supporter.isActive
  showCreateSupporterModal.value = true
}

// サポーターモーダルを閉じる
const closeSupporterModal = () => {
  showCreateSupporterModal.value = false
  selectedSupporter.value = null
}

// サポーターを保存
const handleSaveSupporter = async () => {
  isSavingSupporter.value = true
  try {
    if (selectedSupporter.value) {
      // 更新
      await updateSupporter(selectedSupporter.value.id, {
        name: supporterForm.name,
        email: supporterForm.email,
        phone: supporterForm.phone,
        hourlyRate: supporterForm.hourlyRate,
        transportationFee: supporterForm.transportationFee,
        isActive: supporterForm.isActive
      })
      alert('サポーター情報を更新しました')
    } else {
      // 新規作成
      await createSupporter({
        name: supporterForm.name,
        email: supporterForm.email,
        phone: supporterForm.phone,
        hourlyRate: supporterForm.hourlyRate,
        transportationFee: supporterForm.transportationFee,
        isActive: supporterForm.isActive
      })
      alert('サポーターを登録しました')
    }
    closeSupporterModal()
    await loadSupporters()
  } catch (error) {
    console.error('サポーター保存エラー:', error)
    alert('サポーターの保存に失敗しました')
  } finally {
    isSavingSupporter.value = false
  }
}

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
  const labels = {
    pending: '保留中',
    confirmed: '確定',
    cancelled: 'キャンセル',
    completed: '完了'
  }
  return labels[status] || status
}

function getStatusColor(status: BookingStatus) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-gray-100 text-gray-800'
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
