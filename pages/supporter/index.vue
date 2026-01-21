<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <header class="bg-white shadow-sm">
      <div class="container-responsive py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            サポーターダッシュボード
          </h1>
          <p class="text-sm text-gray-600">清掃タスク管理</p>
        </div>
        <div class="flex items-center gap-4">
          <span v-if="appUser" class="text-sm text-gray-600">
            {{ appUser.displayName }}さん
          </span>
          <button @click="handleLogout" class="btn-secondary text-sm">
            ログアウト
          </button>
        </div>
      </div>
    </header>

    <div class="container-responsive py-8">
      <!-- サマリーカード -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          class="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200"
        >
          <h3 class="text-sm text-blue-700 mb-2">本日のタスク</h3>
          <p class="text-3xl font-bold text-blue-600">
            {{ todayTasks.length }}
          </p>
        </div>
        <div
          class="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200"
        >
          <h3 class="text-sm text-yellow-700 mb-2">未完了タスク</h3>
          <p class="text-3xl font-bold text-yellow-600">
            {{ pendingTasks.length }}
          </p>
        </div>
        <div
          class="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
        >
          <h3 class="text-sm text-green-700 mb-2">今月の完了</h3>
          <p class="text-3xl font-bold text-green-600">
            {{ monthlyCompletedCount }}
          </p>
        </div>
        <div
          class="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200"
        >
          <h3 class="text-sm text-purple-700 mb-2">今月の報酬（税込）</h3>
          <p class="text-2xl font-bold text-purple-600">
            ¥{{ monthlyEarnings.toLocaleString() }}
          </p>
        </div>
      </div>

      <!-- タブナビゲーション -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              type="button"
              @click="currentTab = tab.id"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm transition-custom',
                currentTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              {{ tab.name }}
              <span
                v-if="tab.id === 'pending' && pendingTasks.length > 0"
                class="ml-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full"
              >
                {{ pendingTasks.length }}
              </span>
            </button>
          </nav>
        </div>
      </div>

      <!-- 本日のタスクタブ -->
      <div v-if="currentTab === 'today'" class="space-y-4">
        <div v-if="todayTasks.length === 0" class="card text-center py-12">
          <p class="text-gray-500">本日のタスクはありません</p>
        </div>
        <div
          v-for="task in todayTasks"
          :key="task.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewTask(task)"
        >
          <TaskCard :task="task" />
        </div>
      </div>

      <!-- 未完了タスクタブ -->
      <div v-if="currentTab === 'pending'" class="space-y-4">
        <div v-if="pendingTasks.length === 0" class="card text-center py-12">
          <p class="text-gray-500">未完了のタスクはありません</p>
        </div>
        <div
          v-for="task in pendingTasks"
          :key="task.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewTask(task)"
        >
          <TaskCard :task="task" />
        </div>
      </div>

      <!-- 完了タスクタブ -->
      <div v-if="currentTab === 'completed'" class="space-y-4">
        <div v-if="completedTasks.length === 0" class="card text-center py-12">
          <p class="text-gray-500">完了したタスクはありません</p>
        </div>
        <div
          v-for="task in completedTasks"
          :key="task.id"
          class="card hover:shadow-lg transition-shadow cursor-pointer"
          @click="viewTask(task)"
        >
          <TaskCard :task="task" :showCompensation="true" />
        </div>
      </div>

      <!-- 備品管理タブ -->
      <div v-if="currentTab === 'inventory'" class="space-y-6">
        <!-- ローディング -->
        <div v-if="isLoadingInventory" class="card text-center py-8">
          <p class="text-gray-600">読み込み中...</p>
        </div>

        <template v-else>
          <!-- アメニティ在庫 -->
          <div class="card">
            <h2 class="text-xl font-semibold mb-4">アメニティ在庫管理</h2>

            <div
              v-if="inventoryItems.length === 0"
              class="text-center py-8 text-gray-500"
            >
              在庫アイテムがありません
            </div>

            <div class="space-y-3">
              <div
                v-for="item in inventoryItems"
                :key="item.id"
                class="border rounded-lg p-4"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold">{{ item.name }}</h3>
                      <a
                        v-if="item.purchaseUrl"
                        :href="item.purchaseUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800"
                        title="購入ページを開く"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                    <div class="mt-1 flex items-center gap-4 text-sm">
                      <span>
                        <span class="text-gray-600">現在庫:</span>
                        <span class="font-semibold ml-1"
                          >{{ item.currentStock }}{{ item.unit }}</span
                        >
                      </span>
                      <span class="text-gray-500">
                        発注目安: {{ item.reorderThreshold }}{{ item.unit }}以下
                      </span>
                    </div>
                    <p v-if="item.notes" class="text-sm text-gray-500 mt-1">
                      {{ item.notes }}
                    </p>
                  </div>
                  <div class="flex gap-2 items-center">
                    <button
                      @click="openEditInventoryModal(item)"
                      class="btn-secondary text-sm py-1 px-3"
                    >
                      編集
                    </button>
                    <button
                      @click="handleDeleteInventory(item)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      削除
                    </button>
                    <span
                      :class="[
                        'px-3 py-1 rounded-full text-sm font-semibold',
                        getInventoryStatusColor(item),
                      ]"
                    >
                      {{ getInventoryStatusLabel(item) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button @click="openAddInventoryModal" class="btn-primary mt-4">
              新しいアイテムを追加
            </button>
          </div>

          <!-- 設備メンテナンス -->
          <div class="card">
            <h2 class="text-xl font-semibold mb-4">設備メンテナンス履歴</h2>

            <div
              v-if="maintenanceRecords.length === 0"
              class="text-center py-8 text-gray-500"
            >
              メンテナンス記録がありません
            </div>

            <div v-else class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      設備
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      前回
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      次回
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      状態
                    </th>
                    <th
                      class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="record in maintenanceRecords" :key="record.id">
                    <td class="px-4 py-3 whitespace-nowrap font-medium">
                      {{ record.equipmentName }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                      {{ formatTimestamp(record.lastMaintenanceDate) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                      {{ formatTimestamp(record.nextScheduledDate) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs',
                          getMaintenanceStatusColor(record.status),
                        ]"
                      >
                        {{ getMaintenanceStatusLabel(record.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap">
                      <button
                        @click="openEditMaintenanceModal(record)"
                        class="text-blue-600 hover:text-blue-800 text-sm mr-2"
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

            <button @click="openAddMaintenanceModal" class="btn-primary mt-4">
              メンテナンスを記録
            </button>
          </div>
        </template>
      </div>

      <!-- 報酬履歴タブ -->
      <div v-if="currentTab === 'earnings'" class="space-y-6">
        <!-- 月別サマリー -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">報酬サマリー</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">今月の稼働時間</p>
              <p class="text-2xl font-bold">{{ monthlyHours }}時間</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">今月の報酬（税込）</p>
              <p class="text-2xl font-bold text-green-600">
                ¥{{ monthlyEarnings.toLocaleString() }}
              </p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-600">支払いステータス</p>
              <p class="text-lg font-semibold">
                <span v-if="unpaidAmount > 0" class="text-yellow-600">
                  未払い: ¥{{ unpaidAmount.toLocaleString() }}
                </span>
                <span v-else class="text-green-600">すべて支払い済み</span>
              </p>
            </div>
          </div>
        </div>

        <!-- 完了タスクと報酬一覧 -->
        <div class="card">
          <h2 class="text-xl font-semibold mb-4">報酬履歴</h2>
          <div
            v-if="completedTasks.length === 0"
            class="text-center py-8 text-gray-500"
          >
            報酬履歴はありません
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    日付
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    タスク
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    稼働時間
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    報酬
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="task in completedTasks" :key="task.id">
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ formatDate(task.scheduledDate) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{
                      task.taskType === "pre_checkin"
                        ? "チェックイン前清掃"
                        : "チェックアウト後清掃"
                    }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{
                      task.actualDuration
                        ? (task.actualDuration / 60).toFixed(1)
                        : "-"
                    }}時間
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                    ¥{{
                      (task.compensation?.totalAmount || 0).toLocaleString()
                    }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs',
                        task.compensation?.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800',
                      ]"
                    >
                      {{ task.compensation?.isPaid ? "支払い済み" : "未払い" }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- タスク詳細モーダル -->
    <div
      v-if="selectedTask"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="selectedTask = null"
    >
      <div
        class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        @click.stop
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-2xl font-semibold">タスク詳細</h3>
          <button
            @click="selectedTask = null"
            class="p-2 hover:bg-gray-100 rounded-lg transition-custom"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="space-y-6">
          <!-- タスク基本情報 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-600">タスクタイプ</p>
              <p class="font-semibold">
                {{
                  selectedTask.taskType === "pre_checkin"
                    ? "チェックイン前清掃"
                    : "チェックアウト後清掃"
                }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">予定日</p>
              <p class="font-semibold">
                {{ formatDate(selectedTask.scheduledDate) }}
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">予定時間</p>
              <p class="font-semibold">
                {{ selectedTask.estimatedDuration }}分
              </p>
            </div>
            <div>
              <p class="text-sm text-gray-600">ステータス</p>
              <span
                :class="[
                  'px-2 py-1 rounded-full text-xs font-semibold',
                  getStatusColor(selectedTask.status),
                ]"
              >
                {{ getStatusLabel(selectedTask.status) }}
              </span>
            </div>
          </div>

          <!-- チェックリスト -->
          <div>
            <h4 class="font-semibold mb-3">清掃チェックリスト</h4>
            <div class="space-y-2">
              <label
                v-for="(item, index) in selectedTask.checklist"
                :key="index"
                class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  :checked="item.completed"
                  @change="toggleChecklistItem(index)"
                  :disabled="selectedTask.status === 'completed'"
                  class="w-5 h-5 rounded"
                />
                <span
                  :class="item.completed ? 'line-through text-gray-400' : ''"
                >
                  {{ item.item }}
                </span>
              </label>
            </div>
          </div>

          <!-- 作業時間記録（進行中の場合） -->
          <div
            v-if="
              selectedTask.status === 'in_progress' ||
              selectedTask.status === 'assigned'
            "
          >
            <h4 class="font-semibold mb-3">作業時間</h4>
            <div class="flex gap-4">
              <button
                v-if="!selectedTask.startTime"
                @click="startTask"
                class="btn-primary"
              >
                作業開始
              </button>
              <button
                v-else-if="!selectedTask.endTime"
                @click="endTask"
                class="btn-primary bg-green-600 hover:bg-green-700"
              >
                作業完了
              </button>
              <div v-if="selectedTask.startTime" class="text-sm text-gray-600">
                開始: {{ formatDateTime(selectedTask.startTime) }}
              </div>
            </div>
          </div>

          <!-- 完了報告（作業完了後） -->
          <div v-if="selectedTask.status === 'completed'">
            <h4 class="font-semibold mb-3">作業報告</h4>
            <div class="grid grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg">
              <div>
                <p class="text-sm text-gray-600">実際の作業時間</p>
                <p class="font-semibold">{{ selectedTask.actualDuration }}分</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">報酬</p>
                <p class="font-semibold text-green-600">
                  ¥{{
                    (
                      selectedTask.compensation?.totalAmount || 0
                    ).toLocaleString()
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- 備品使用記録 -->
          <div v-if="selectedTask.status !== 'completed'">
            <h4 class="font-semibold mb-3">備品使用記録</h4>
            <div class="space-y-2">
              <div
                v-for="(supply, index) in usedSupplies"
                :key="index"
                class="flex items-center gap-2"
              >
                <input
                  v-model="supply.name"
                  type="text"
                  placeholder="備品名"
                  class="flex-1 px-3 py-2 border rounded-lg"
                />
                <input
                  v-model.number="supply.quantity"
                  type="number"
                  min="1"
                  placeholder="数量"
                  class="w-20 px-3 py-2 border rounded-lg"
                />
                <button
                  @click="removeSupply(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <button
                @click="addSupply"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                + 備品を追加
              </button>
            </div>
          </div>

          <!-- メモ -->
          <div>
            <h4 class="font-semibold mb-3">メモ</h4>
            <textarea
              v-model="taskNotes"
              :disabled="selectedTask.status === 'completed'"
              rows="3"
              placeholder="作業メモを入力..."
              class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <!-- アクションボタン -->
          <div class="flex gap-3 pt-4 border-t">
            <button
              v-if="selectedTask.status !== 'completed'"
              @click="saveTaskProgress"
              class="btn-secondary flex-1"
            >
              保存
            </button>
            <NuxtLink
              :to="`/supporter/task/${selectedTask.id}`"
              class="btn-primary flex-1 text-center"
            >
              詳細ページへ
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 在庫追加モーダル -->
    <div
      v-if="showAddInventoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 class="text-xl font-bold mb-4">新しい在庫アイテムを追加</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >アイテム名 *</label
            >
            <input
              v-model="inventoryForm.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="例: バスタオル"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >現在庫</label
              >
              <input
                v-model.number="inventoryForm.currentStock"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >単位</label
              >
              <select
                v-model="inventoryForm.unit"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >発注目安数量</label
            >
            <input
              v-model.number="inventoryForm.reorderThreshold"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p class="text-xs text-gray-500 mt-1">
              この数量以下になると「要発注」と表示されます
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >購入URL（Amazon等）</label
            >
            <input
              v-model="inventoryForm.purchaseUrl"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.amazon.co.jp/..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >メモ</label
            >
            <textarea
              v-model="inventoryForm.notes"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            {{ isAddingInventory ? "追加中..." : "追加" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 在庫編集モーダル -->
    <div
      v-if="showEditInventoryModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 class="text-xl font-bold mb-4">在庫アイテムを編集</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >アイテム名 *</label
            >
            <input
              v-model="editInventoryForm.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >現在庫</label
              >
              <input
                v-model.number="editInventoryForm.currentStock"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >単位</label
              >
              <select
                v-model="editInventoryForm.unit"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >発注目安数量</label
            >
            <input
              v-model.number="editInventoryForm.reorderThreshold"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >購入URL（Amazon等）</label
            >
            <input
              v-model="editInventoryForm.purchaseUrl"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.amazon.co.jp/..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >メモ</label
            >
            <textarea
              v-model="editInventoryForm.notes"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            {{ isEditingInventory ? "保存中..." : "保存" }}
          </button>
        </div>
      </div>
    </div>

    <!-- メンテナンス追加モーダル -->
    <div
      v-if="showAddMaintenanceModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 class="text-xl font-bold mb-4">メンテナンスを記録</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >設備名 *</label
            >
            <input
              v-model="maintenanceForm.equipmentName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="例: エアコン、給湯器"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >メンテナンス日</label
              >
              <input
                v-model="maintenanceForm.lastMaintenanceDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >次回予定日</label
              >
              <input
                v-model="maintenanceForm.nextScheduledDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >ステータス</label
            >
            <select
              v-model="maintenanceForm.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="good">良好</option>
              <option value="needs_attention">要確認</option>
              <option value="under_maintenance">メンテナンス中</option>
              <option value="broken">故障</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >作業内容</label
            >
            <textarea
              v-model="maintenanceForm.description"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="実施した作業の詳細"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >作業者</label
              >
              <input
                v-model="maintenanceForm.performedBy"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >費用（円）</label
              >
              <input
                v-model.number="maintenanceForm.cost"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            {{ isAddingMaintenance ? "保存中..." : "保存" }}
          </button>
        </div>
      </div>
    </div>

    <!-- メンテナンス編集モーダル -->
    <div
      v-if="showEditMaintenanceModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <h3 class="text-xl font-bold mb-4">メンテナンス記録を編集</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >設備名 *</label
            >
            <input
              v-model="editMaintenanceForm.equipmentName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >メンテナンス日</label
              >
              <input
                v-model="editMaintenanceForm.lastMaintenanceDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >次回予定日</label
              >
              <input
                v-model="editMaintenanceForm.nextScheduledDate"
                type="date"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >ステータス</label
            >
            <select
              v-model="editMaintenanceForm.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="good">良好</option>
              <option value="needs_attention">要確認</option>
              <option value="under_maintenance">メンテナンス中</option>
              <option value="broken">故障</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >作業内容</label
            >
            <textarea
              v-model="editMaintenanceForm.description"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >作業者</label
              >
              <input
                v-model="editMaintenanceForm.performedBy"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >費用（円）</label
              >
              <input
                v-model.number="editMaintenanceForm.cost"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            {{ isEditingMaintenance ? "保存中..." : "保存" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from "vue";
import type {
  CleaningTask,
  CleaningTaskStatus,
  InventoryItem,
  MaintenanceRecord,
  MaintenanceStatus,
} from "~/types";
import { Timestamp } from "firebase/firestore";
import { formatSlashDate } from "~/composables/useDateFormatting";

const { appUser, loading, user, logout } = useAuth();
const { getTasksBySupporter, updateTask } = useCleaningTasks();
const {
  getInventoryStatus,
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} = useInventory();
const {
  getAllMaintenanceRecords,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} = useMaintenance();
const router = useRouter();

definePageMeta({
  layout: false,
  middleware: "supporter",
});

// タスクデータ
const tasks = ref<CleaningTask[]>([]);
const isLoading = ref(false);
const selectedTask = ref<CleaningTask | null>(null);
const taskNotes = ref("");
const usedSupplies = ref<Array<{ name: string; quantity: number }>>([]);

// タブ
const tabs = [
  { id: "today", name: "本日" },
  { id: "pending", name: "未完了" },
  { id: "completed", name: "完了" },
  { id: "earnings", name: "報酬" },
  { id: "inventory", name: "備品管理" },
];
const currentTab = ref("today");

// タスクの読み込み
const loadTasks = async () => {
  if (!appUser.value?.id) return;

  isLoading.value = true;
  try {
    tasks.value = await getTasksBySupporter(appUser.value.id);
  } catch (error) {
    console.error("タスク読み込みエラー:", error);
  } finally {
    isLoading.value = false;
  }
};

// 認証状態を監視してデータを読み込み
watch(
  [loading, appUser],
  ([isLoading, currentUser]) => {
    if (!isLoading && currentUser) {
      loadTasks();
    }
  },
  { immediate: true },
);

// Timestamp型を受け入れる柔軟な型定義
type TimestampLike =
  | {
      toDate: () => Date;
    }
  | Date
  | string
  | number
  | null
  | undefined;

// Timestamp型からDateに変換するヘルパー
const toDate = (timestamp: TimestampLike): Date => {
  if (!timestamp) return new Date();
  if (
    typeof timestamp === "object" &&
    "toDate" in timestamp &&
    typeof timestamp.toDate === "function"
  ) {
    return timestamp.toDate();
  }
  return new Date(timestamp as string | number | Date);
};

// 本日のタスク
const todayTasks = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return tasks.value.filter((task) => {
    if (!task.scheduledDate) return false;
    const taskDate = toDate(task.scheduledDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime();
  });
});

// 未完了タスク
const pendingTasks = computed(() => {
  return tasks.value.filter(
    (task) => task.status === "assigned" || task.status === "in_progress",
  );
});

// 完了タスク
const completedTasks = computed(() => {
  return tasks.value.filter((task) => task.status === "completed");
});

// 今月の完了数
const monthlyCompletedCount = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return completedTasks.value.filter((task) => {
    if (!task.completedAt) return false;
    const completedDate = toDate(task.completedAt);
    return (
      completedDate.getMonth() === currentMonth &&
      completedDate.getFullYear() === currentYear
    );
  }).length;
});

// 今月の報酬
const monthlyEarnings = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return completedTasks.value
    .filter((task) => {
      if (!task.completedAt) return false;
      const completedDate = toDate(task.completedAt);
      return (
        completedDate.getMonth() === currentMonth &&
        completedDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, task) => sum + (task.compensation?.totalAmount || 0), 0);
});

// 今月の稼働時間
const monthlyHours = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalMinutes = completedTasks.value
    .filter((task) => {
      if (!task.completedAt) return false;
      const completedDate = toDate(task.completedAt);
      return (
        completedDate.getMonth() === currentMonth &&
        completedDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, task) => sum + (task.actualDuration || 0), 0);

  return (totalMinutes / 60).toFixed(1);
});

// 未払い金額
const unpaidAmount = computed(() => {
  return completedTasks.value
    .filter((task) => !task.compensation?.isPaid)
    .reduce((sum, task) => sum + (task.compensation?.totalAmount || 0), 0);
});

// タスク詳細を表示
const viewTask = (task: CleaningTask) => {
  selectedTask.value = task;
  taskNotes.value = task.notes || "";
  usedSupplies.value = task.suppliesUsed ? [...task.suppliesUsed] : [];
};

// チェックリストの項目をトグル
const toggleChecklistItem = async (index: number) => {
  if (!selectedTask.value) return;

  const newChecklist = [...selectedTask.value.checklist];
  newChecklist[index].completed = !newChecklist[index].completed;

  try {
    await updateTask(selectedTask.value.id, { checklist: newChecklist });
    selectedTask.value.checklist = newChecklist;
  } catch (error) {
    console.error("チェックリスト更新エラー:", error);
  }
};

// 作業開始
const startTask = async () => {
  if (!selectedTask.value) return;

  try {
    const now = new Date();
    await updateTask(selectedTask.value.id, {
      status: "in_progress",
      startTime: Timestamp.fromDate(now),
    });
    selectedTask.value.status = "in_progress";
    selectedTask.value.startTime = Timestamp.fromDate(now);
    await loadTasks();
  } catch (error) {
    console.error("作業開始エラー:", error);
    alert("作業開始に失敗しました");
  }
};

// 作業完了
const endTask = async () => {
  if (!selectedTask.value || !selectedTask.value.startTime) return;

  const startTime = toDate(selectedTask.value.startTime);
  const endTime = new Date();
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / 60000,
  ); // 分単位

  // 報酬計算（仮の時給1300円、交通費600円）
  const hourlyRate = appUser.value?.hourlyRate || 1300;
  const transportationFee = appUser.value?.transportationFee || 600;
  const workAmount = Math.round((duration / 60) * hourlyRate);
  const totalAmount = workAmount + transportationFee;

  try {
    await updateTask(selectedTask.value.id, {
      status: "completed",
      endTime: Timestamp.fromDate(endTime),
      actualDuration: duration,
      completedAt: Timestamp.fromDate(endTime),
      notes: taskNotes.value,
      suppliesUsed: usedSupplies.value.filter((s) => s.name),
      compensation: {
        hourlyRate,
        hoursWorked: duration / 60,
        transportationFee,
        totalAmount,
        isPaid: false,
      },
    });

    alert("作業完了しました");
    selectedTask.value = null;
    await loadTasks();
  } catch (error) {
    console.error("作業完了エラー:", error);
    alert("作業完了の記録に失敗しました");
  }
};

// 進捗保存
const saveTaskProgress = async () => {
  if (!selectedTask.value) return;

  try {
    await updateTask(selectedTask.value.id, {
      notes: taskNotes.value,
      suppliesUsed: usedSupplies.value.filter((s) => s.name),
    });
    alert("保存しました");
  } catch (error) {
    console.error("保存エラー:", error);
    alert("保存に失敗しました");
  }
};

// 備品追加/削除
const addSupply = () => {
  usedSupplies.value.push({ name: "", quantity: 1 });
};

const removeSupply = (index: number) => {
  usedSupplies.value.splice(index, 1);
};

// ログアウト
const handleLogout = async () => {
  try {
    await logout();
    router.push("/");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// formatDate は composables/useDateFormatting から import
const formatDate = formatSlashDate;

// formatDateTime はローカル実装を維持（年なしの M/D HH:mm 形式）
function formatDateTime(timestamp: TimestampLike): string {
  if (!timestamp) return "-";
  try {
    const date =
      typeof timestamp === "object" && "toDate" in timestamp
        ? timestamp.toDate()
        : new Date(timestamp as string | number | Date);
    if (isNaN(date.getTime())) return "-";
    return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  } catch {
    return "-";
  }
}

function getStatusLabel(status: CleaningTaskStatus) {
  const labels: Record<CleaningTaskStatus, string> = {
    pending: "未割当",
    assigned: "割当済",
    in_progress: "作業中",
    completed: "完了",
    cancelled: "キャンセル",
  };
  return labels[status] || status;
}

function getStatusColor(status: CleaningTaskStatus) {
  const colors: Record<CleaningTaskStatus, string> = {
    pending: "bg-gray-100 text-gray-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

// ============================================
// 備品・メンテナンス管理
// ============================================

// 在庫アイテムデータ
const inventoryItems = ref<InventoryItem[]>([]);
const maintenanceRecords = ref<MaintenanceRecord[]>([]);
const isLoadingInventory = ref(false);

// 在庫追加モーダル
const showAddInventoryModal = ref(false);
const isAddingInventory = ref(false);
const inventoryForm = reactive({
  name: "",
  currentStock: 0,
  unit: "個",
  reorderThreshold: 10,
  purchaseUrl: "",
  notes: "",
});

// 在庫編集モーダル
const showEditInventoryModal = ref(false);
const isEditingInventory = ref(false);
const editingInventoryItem = ref<InventoryItem | null>(null);
const editInventoryForm = reactive({
  name: "",
  currentStock: 0,
  unit: "",
  reorderThreshold: 0,
  purchaseUrl: "",
  notes: "",
});

// メンテナンス追加モーダル
const showAddMaintenanceModal = ref(false);
const isAddingMaintenance = ref(false);
const maintenanceForm = reactive({
  equipmentName: "",
  lastMaintenanceDate: "",
  nextScheduledDate: "",
  status: "good" as MaintenanceStatus,
  description: "",
  performedBy: "",
  cost: 0,
});

// メンテナンス編集モーダル
const showEditMaintenanceModal = ref(false);
const isEditingMaintenance = ref(false);
const editingMaintenanceRecord = ref<MaintenanceRecord | null>(null);
const editMaintenanceForm = reactive({
  equipmentName: "",
  lastMaintenanceDate: "",
  nextScheduledDate: "",
  status: "good" as MaintenanceStatus,
  description: "",
  performedBy: "",
  cost: 0,
});

// 在庫・メンテナンスデータを読み込み
const loadInventoryAndMaintenance = async () => {
  isLoadingInventory.value = true;
  try {
    const [items, records] = await Promise.all([
      getAllInventoryItems(),
      getAllMaintenanceRecords(),
    ]);
    inventoryItems.value = items;
    maintenanceRecords.value = records;
  } catch (error) {
    console.error("Load inventory/maintenance error:", error);
  } finally {
    isLoadingInventory.value = false;
  }
};

// タブが変わったら備品データを読み込み
watch(currentTab, (newTab) => {
  if (newTab === "inventory") {
    loadInventoryAndMaintenance();
  }
});

// 在庫ステータスラベル
const getInventoryStatusLabel = (item: InventoryItem): string => {
  const status = getInventoryStatus(item);
  switch (status) {
    case "sufficient":
      return "十分";
    case "low":
      return "要発注";
    case "out_of_stock":
      return "在庫切れ";
    default:
      return "不明";
  }
};

// 在庫ステータス色
const getInventoryStatusColor = (item: InventoryItem): string => {
  const status = getInventoryStatus(item);
  switch (status) {
    case "sufficient":
      return "bg-green-100 text-green-800";
    case "low":
      return "bg-yellow-100 text-yellow-800";
    case "out_of_stock":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// メンテナンスステータスラベル
const getMaintenanceStatusLabel = (status: MaintenanceStatus): string => {
  switch (status) {
    case "good":
      return "良好";
    case "needs_attention":
      return "要確認";
    case "under_maintenance":
      return "メンテ中";
    case "broken":
      return "故障";
    default:
      return "不明";
  }
};

// メンテナンスステータス色
const getMaintenanceStatusColor = (status: MaintenanceStatus): string => {
  switch (status) {
    case "good":
      return "bg-green-100 text-green-800";
    case "needs_attention":
      return "bg-yellow-100 text-yellow-800";
    case "under_maintenance":
      return "bg-blue-100 text-blue-800";
    case "broken":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Timestampを日付文字列に変換
const formatTimestamp = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return "-";
  const date = timestamp.toDate();
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
};

// 在庫アイテム追加
const openAddInventoryModal = () => {
  inventoryForm.name = "";
  inventoryForm.currentStock = 0;
  inventoryForm.unit = "個";
  inventoryForm.reorderThreshold = 10;
  inventoryForm.purchaseUrl = "";
  inventoryForm.notes = "";
  showAddInventoryModal.value = true;
};

const submitAddInventory = async () => {
  if (!inventoryForm.name.trim()) {
    alert("アイテム名を入力してください");
    return;
  }
  isAddingInventory.value = true;
  try {
    await createInventoryItem({
      name: inventoryForm.name,
      currentStock: inventoryForm.currentStock,
      unit: inventoryForm.unit,
      reorderThreshold: inventoryForm.reorderThreshold,
      purchaseUrl: inventoryForm.purchaseUrl || undefined,
      notes: inventoryForm.notes || undefined,
    });
    showAddInventoryModal.value = false;
    await loadInventoryAndMaintenance();

    // 在庫が少ない場合は通知を送信
    if (inventoryForm.currentStock <= inventoryForm.reorderThreshold) {
      await sendLowStockNotification(
        inventoryForm.name,
        inventoryForm.currentStock,
        inventoryForm.unit,
        inventoryForm.reorderThreshold,
      );
    }
  } catch (error) {
    console.error("Add inventory error:", error);
    alert("在庫アイテムの追加に失敗しました");
  } finally {
    isAddingInventory.value = false;
  }
};

// 在庫アイテム編集
const openEditInventoryModal = (item: InventoryItem) => {
  editingInventoryItem.value = item;
  editInventoryForm.name = item.name;
  editInventoryForm.currentStock = item.currentStock;
  editInventoryForm.unit = item.unit;
  editInventoryForm.reorderThreshold = item.reorderThreshold;
  editInventoryForm.purchaseUrl = item.purchaseUrl || "";
  editInventoryForm.notes = item.notes || "";
  showEditInventoryModal.value = true;
};

const submitEditInventory = async () => {
  if (!editingInventoryItem.value) return;
  if (!editInventoryForm.name.trim()) {
    alert("アイテム名を入力してください");
    return;
  }

  const previousStock = editingInventoryItem.value.currentStock;

  isEditingInventory.value = true;
  try {
    await updateInventoryItem(editingInventoryItem.value.id, {
      name: editInventoryForm.name,
      currentStock: editInventoryForm.currentStock,
      unit: editInventoryForm.unit,
      reorderThreshold: editInventoryForm.reorderThreshold,
      purchaseUrl: editInventoryForm.purchaseUrl || undefined,
      notes: editInventoryForm.notes || undefined,
    });
    showEditInventoryModal.value = false;
    await loadInventoryAndMaintenance();

    // 在庫が閾値を下回った場合に通知
    if (
      previousStock > editInventoryForm.reorderThreshold &&
      editInventoryForm.currentStock <= editInventoryForm.reorderThreshold
    ) {
      await sendLowStockNotification(
        editInventoryForm.name,
        editInventoryForm.currentStock,
        editInventoryForm.unit,
        editInventoryForm.reorderThreshold,
      );
    }
  } catch (error) {
    console.error("Edit inventory error:", error);
    alert("在庫アイテムの更新に失敗しました");
  } finally {
    isEditingInventory.value = false;
  }
};

// 在庫アイテム削除
const handleDeleteInventory = async (item: InventoryItem) => {
  if (!confirm(`「${item.name}」を削除しますか？`)) return;
  try {
    await deleteInventoryItem(item.id);
    await loadInventoryAndMaintenance();
  } catch (error) {
    console.error("Delete inventory error:", error);
    alert("在庫アイテムの削除に失敗しました");
  }
};

// メンテナンス記録追加
const openAddMaintenanceModal = () => {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  maintenanceForm.equipmentName = "";
  maintenanceForm.lastMaintenanceDate = todayStr;
  maintenanceForm.nextScheduledDate = "";
  maintenanceForm.status = "good";
  maintenanceForm.description = "";
  maintenanceForm.performedBy = "";
  maintenanceForm.cost = 0;
  showAddMaintenanceModal.value = true;
};

const submitAddMaintenance = async () => {
  if (!maintenanceForm.equipmentName.trim()) {
    alert("設備名を入力してください");
    return;
  }
  isAddingMaintenance.value = true;
  try {
    await createMaintenanceRecord({
      equipmentName: maintenanceForm.equipmentName,
      lastMaintenanceDate: Timestamp.fromDate(
        new Date(maintenanceForm.lastMaintenanceDate),
      ),
      nextScheduledDate: maintenanceForm.nextScheduledDate
        ? Timestamp.fromDate(new Date(maintenanceForm.nextScheduledDate))
        : undefined,
      status: maintenanceForm.status,
      description: maintenanceForm.description || undefined,
      performedBy: maintenanceForm.performedBy || undefined,
      cost: maintenanceForm.cost || undefined,
    });
    showAddMaintenanceModal.value = false;
    await loadInventoryAndMaintenance();
  } catch (error) {
    console.error("Add maintenance error:", error);
    alert("メンテナンス記録の追加に失敗しました");
  } finally {
    isAddingMaintenance.value = false;
  }
};

// メンテナンス記録編集
const openEditMaintenanceModal = (record: MaintenanceRecord) => {
  editingMaintenanceRecord.value = record;
  editMaintenanceForm.equipmentName = record.equipmentName;
  editMaintenanceForm.lastMaintenanceDate =
    record.lastMaintenanceDate?.toDate().toISOString().split("T")[0] || "";
  editMaintenanceForm.nextScheduledDate =
    record.nextScheduledDate?.toDate().toISOString().split("T")[0] || "";
  editMaintenanceForm.status = record.status;
  editMaintenanceForm.description = record.description || "";
  editMaintenanceForm.performedBy = record.performedBy || "";
  editMaintenanceForm.cost = record.cost || 0;
  showEditMaintenanceModal.value = true;
};

const submitEditMaintenance = async () => {
  if (!editingMaintenanceRecord.value) return;
  if (!editMaintenanceForm.equipmentName.trim()) {
    alert("設備名を入力してください");
    return;
  }
  isEditingMaintenance.value = true;
  try {
    await updateMaintenanceRecord(editingMaintenanceRecord.value.id, {
      equipmentName: editMaintenanceForm.equipmentName,
      lastMaintenanceDate: Timestamp.fromDate(
        new Date(editMaintenanceForm.lastMaintenanceDate),
      ),
      nextScheduledDate: editMaintenanceForm.nextScheduledDate
        ? Timestamp.fromDate(new Date(editMaintenanceForm.nextScheduledDate))
        : undefined,
      status: editMaintenanceForm.status,
      description: editMaintenanceForm.description || undefined,
      performedBy: editMaintenanceForm.performedBy || undefined,
      cost: editMaintenanceForm.cost || undefined,
    });
    showEditMaintenanceModal.value = false;
    await loadInventoryAndMaintenance();
  } catch (error) {
    console.error("Edit maintenance error:", error);
    alert("メンテナンス記録の更新に失敗しました");
  } finally {
    isEditingMaintenance.value = false;
  }
};

// メンテナンス記録削除
const handleDeleteMaintenance = async (record: MaintenanceRecord) => {
  if (!confirm(`「${record.equipmentName}」の記録を削除しますか？`)) return;
  try {
    await deleteMaintenanceRecord(record.id);
    await loadInventoryAndMaintenance();
  } catch (error) {
    console.error("Delete maintenance error:", error);
    alert("メンテナンス記録の削除に失敗しました");
  }
};

// 在庫不足通知を送信
const sendLowStockNotification = async (
  itemName: string,
  currentStock: number,
  unit: string,
  threshold: number,
) => {
  try {
    await $fetch("/api/inventory/low-stock-notification", {
      method: "POST",
      body: {
        itemName,
        currentStock,
        unit,
        threshold,
      },
    });
  } catch (error) {
    console.error("Low stock notification error:", error);
    // 通知失敗はユーザーに表示しない（メイン処理に影響させない）
  }
};
</script>
