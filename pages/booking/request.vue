<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <!-- パンくずリスト -->
    <div class="bg-white border-b border-gray-200 mt-16">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="max-w-4xl mx-auto px-6 py-12">
      <!-- ヘッダー -->
      <div class="mb-8">
        <h1 class="text-3xl font-semibold mb-6" style="color: #231815;">予約をリクエスト</h1>

        <!-- ステップインジケータ -->
        <div class="flex items-center justify-center">
          <div class="flex items-center w-full max-w-2xl">
            <!-- ステップ1 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <span class="ml-2 text-sm font-medium text-gray-900 hidden sm:inline">予約内容</span>
              </div>
            </div>
            <div class="flex-1 h-0.5 bg-purple-600 mx-2"></div>

            <!-- ステップ2 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <span class="ml-2 text-sm font-medium text-gray-900 hidden sm:inline">お客様情報</span>
              </div>
            </div>
            <div class="flex-1 h-0.5 bg-gray-200 mx-2"></div>

            <!-- ステップ3 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <span class="ml-2 text-sm font-medium text-gray-400 hidden sm:inline">お支払い</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左側: フォーム -->
        <div class="lg:col-span-2 space-y-8">
          <!-- オプション選択セクション -->
          <div v-if="availableOptions.length > 0" class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 class="text-xl font-semibold mb-4" style="color: #231815;">
              オプションを追加
            </h2>
            <p class="text-sm text-gray-600 mb-4">ご滞在をより快適にするオプションをお選びください</p>

            <!-- オプション一覧 -->
            <div class="space-y-4">
              <div
                v-for="option in availableOptions"
                :key="option.id"
                class="border rounded-lg p-4 transition-all"
                :class="{
                  'border-purple-500 bg-purple-50': isOptionSelected(option.id),
                  'border-gray-200 hover:border-gray-300': !isOptionSelected(option.id),
                  'opacity-50': !optionAvailability[option.id]?.available
                }"
              >
                <div class="flex gap-4">
                  <!-- サムネイル画像 -->
                  <div class="flex-shrink-0">
                    <img
                      v-if="option.imageUrl"
                      :src="option.imageUrl"
                      :alt="option.name"
                      class="w-20 h-20 object-cover rounded-lg"
                    />
                    <div
                      v-else
                      class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>

                  <!-- オプション情報 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="font-semibold text-gray-900">{{ option.name }}</h3>
                        <p class="text-sm text-gray-600 mt-1">{{ option.description }}</p>
                      </div>
                      <span class="text-lg font-semibold text-purple-600 whitespace-nowrap ml-4">
                        ¥{{ option.price.toLocaleString() }}
                      </span>
                    </div>

                    <!-- 空き状況と選択ボタン -->
                    <div class="flex items-center justify-between mt-3">
                      <div class="text-sm">
                        <span v-if="optionAvailability[option.id]?.available" class="text-green-600">
                          残り{{ optionAvailability[option.id]?.remaining }}件
                        </span>
                        <span v-else class="text-red-500">
                          予約済み
                        </span>
                      </div>

                      <button
                        v-if="optionAvailability[option.id]?.available"
                        @click="toggleOption(option)"
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        :class="{
                          'bg-purple-600 text-white hover:bg-purple-700': isOptionSelected(option.id),
                          'bg-gray-100 text-gray-700 hover:bg-gray-200': !isOptionSelected(option.id)
                        }"
                      >
                        {{ isOptionSelected(option.id) ? '選択済み' : '追加する' }}
                      </button>
                      <span v-else class="text-sm text-gray-400">選択不可</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 選択中のオプション合計 -->
            <div v-if="selectedOptions.length > 0" class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">選択中のオプション ({{ selectedOptions.length }}件)</span>
                <span class="font-semibold text-purple-600">+¥{{ optionsTotalPrice.toLocaleString() }}</span>
              </div>
            </div>
          </div>

          <!-- オプション読み込み中 -->
          <div v-else-if="loadingOptions" class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div class="flex items-center justify-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
              <span class="text-gray-600">オプションを読み込み中...</span>
            </div>
          </div>

          <!-- ステップ1: 予約内容の確認 -->
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold" style="color: #231815;">
                1. 予約内容をご確認ください
              </h2>
              <button
                @click="showEditForm = !showEditForm"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {{ showEditForm ? '閉じる' : '変更する' }}
              </button>
            </div>

            <div class="space-y-4">
              <!-- 編集フォーム -->
              <div v-if="showEditForm" class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">チェックイン</label>
                  <input
                    type="date"
                    v-model="checkInDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">チェックアウト</label>
                  <input
                    type="date"
                    v-model="checkOutDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">大人（16歳以上）</label>
                  <select
                    v-model.number="adults"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option :value="1">1人</option>
                    <option :value="2">2人</option>
                    <option :value="3">3人</option>
                    <option :value="4">4人</option>
                    <option :value="5">5人</option>
                    <option :value="6">6人</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">子ども（7〜15歳・50%）</label>
                  <select
                    v-model.number="children"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option :value="0">0人</option>
                    <option :value="1">1人</option>
                    <option :value="2">2人</option>
                    <option :value="3">3人</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">乳幼児（0〜6歳・無料）</label>
                  <select
                    v-model.number="infants"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option :value="0">0人</option>
                    <option :value="1">1人</option>
                    <option :value="2">2人</option>
                    <option :value="3">3人</option>
                  </select>
                </div>
                <button
                  @click="showEditForm = false"
                  class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  確定
                </button>
              </div>

              <!-- 予約内容表示 -->
              <div class="border-b border-gray-200 pb-4">
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">チェックイン</span>
                    <span class="text-gray-900">{{ formatDisplayDate(checkInDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">チェックアウト</span>
                    <span class="text-gray-900">{{ formatDisplayDate(checkOutDate) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">宿泊人数</span>
                    <span class="text-gray-900">
                      大人{{ adults }}人
                      <span v-if="children > 0">、子ども{{ children }}人</span>
                      <span v-if="infants > 0">、乳幼児{{ infants }}人</span>
                    </span>
                  </div>
                </div>
              </div>

              <!-- 料金詳細 -->
              <div v-if="priceCalculation && priceCalculation.nightlyBreakdown" class="space-y-3 text-sm">
                <!-- 基本情報 -->
                <div class="flex justify-between text-xs text-gray-500">
                  <span>大人{{ adults }}人 × {{ numberOfNights }}泊</span>
                  <span>{{ adults <= 2 ? '基本料金' : '人数別料金適用' }}</span>
                </div>

                <!-- 泊別内訳 -->
                <div v-for="(night, index) in priceCalculation.nightlyBreakdown" :key="index" class="border-l-2 border-purple-200 pl-3 py-1">
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-medium text-gray-700">{{ index + 1 }}泊目 ({{ formatShortDate(night.date) }})</div>
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{ night.seasonType === 'high' ? 'ハイ' : night.seasonType === 'off' ? 'オフ' : '通常' }}シーズン
                        ・{{ night.dayType === 'weekend' ? '休日前日' : '平日' }}
                      </div>
                    </div>
                    <span class="text-gray-900 ml-2">¥{{ night.nightTotal.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- 小計（宿泊料金） -->
                <div class="flex justify-between pt-2 border-t border-gray-200">
                  <span class="text-gray-600">宿泊料金</span>
                  <span class="text-gray-900">¥{{ subtotal.toLocaleString() }}</span>
                </div>

                <!-- 清掃料金 -->
                <div class="flex justify-between">
                  <span class="text-gray-600">清掃料金</span>
                  <span class="text-gray-900">¥{{ cleaningFee.toLocaleString() }}</span>
                </div>

                <!-- オプション料金 -->
                <div v-if="selectedOptions.length > 0" class="space-y-1">
                  <div v-for="opt in selectedOptions" :key="opt.optionId" class="flex justify-between text-sm">
                    <span class="text-gray-600">{{ opt.name }}</span>
                    <span class="text-gray-900">¥{{ opt.price.toLocaleString() }}</span>
                  </div>
                </div>

                <!-- 税抜合計 -->
                <div class="flex justify-between text-xs text-gray-500">
                  <span>小計（税抜）</span>
                  <span>¥{{ subtotalBeforeTaxWithOptions.toLocaleString() }}</span>
                </div>

                <!-- 消費税 -->
                <div class="flex justify-between">
                  <span class="text-gray-600">消費税 ({{ taxRatePercent }}%)</span>
                  <span class="text-gray-900">¥{{ taxWithOptions.toLocaleString() }}</span>
                </div>

                <!-- 合計（税込） -->
                <div class="flex justify-between pt-2 border-t-2 border-gray-300 font-semibold text-base">
                  <span>合計（税込）</span>
                  <span>¥{{ totalAmountWithOptions.toLocaleString() }}</span>
                </div>

                <!-- 料金サマリー -->
                <div v-if="priceCalculation.summary" class="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <div class="flex justify-between">
                    <span>1人1泊あたり平均</span>
                    <span>¥{{ Math.floor(totalAmount / (adults + children + infants) / numberOfNights).toLocaleString() }}</span>
                  </div>
                </div>
              </div>

              <!-- 読み込み中 -->
              <div v-else class="space-y-2 text-sm text-gray-500 text-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                <p>料金を計算しています...</p>
              </div>

              <!-- キャンセルポリシー -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <h3 class="font-medium text-gray-900">キャンセルポリシー</h3>
                </div>
                <div v-if="cancellationPolicyDescription" class="text-sm text-gray-700 space-y-1">
                  <p v-for="(line, index) in cancellationPolicyDescription.split('\n')" :key="index">
                    {{ line }}
                  </p>
                </div>
                <div v-else class="text-sm text-gray-700">
                  <p>{{ cancellationDeadline }}までにキャンセルすれば、全額が返金されます。</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ステップ2: ゲスト情報の入力 -->
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 class="text-xl font-semibold mb-4" style="color: #231815;">
              2. ゲスト情報を入力してください
            </h2>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  お名前 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="guestName"
                  type="text"
                  placeholder="山田 太郎"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="guestEmail"
                  type="email"
                  placeholder="example@email.com"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  電話番号 <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="guestPhone"
                  type="tel"
                  placeholder="090-1234-5678"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <h3 class="text-lg font-semibold mb-4" style="color: #231815;">
              お支払い情報
            </h3>

            <!-- Stripe Card Element -->
            <div v-if="paymentReady" class="space-y-4">
              <div id="card-element" class="p-4 border border-gray-200 rounded-lg bg-white"></div>
              <p class="text-xs text-gray-500">
                お支払い情報は安全に暗号化されて処理されます
              </p>
            </div>

            <!-- ローディング状態 -->
            <div v-else class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
              <p class="text-sm text-gray-600">決済フォームを準備中...</p>
            </div>
          </div>

          <!-- 同意事項 -->
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                v-model="agreedToTerms"
                class="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
              />
              <span class="text-sm text-gray-700">
                <strong>ハウスルール</strong>、<strong>キャンセルポリシー</strong>、および
                <strong>ゲストへの返金ポリシー</strong>に同意します。また、家具の家が
                <strong>支払いに関する規約</strong>に従って料金の請求を行うことに同意します。
              </span>
            </label>
          </div>

          <!-- 送信ボタン -->
          <div class="flex gap-4">
            <button
              type="button"
              @click="$router.back()"
              class="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              @click="handleSubmit"
              :disabled="!isFormValid || isSubmitting"
              class="flex-1 px-6 py-4 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
            >
              {{ isSubmitting ? '処理中...' : 'リクエストを送信' }}
            </button>
          </div>
        </div>

        <!-- 右側: 予約サマリーカード -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200 sticky top-24">
            <!-- 物件情報 -->
            <div class="flex gap-4 mb-6 pb-6 border-b border-gray-200">
              <img
                src="https://storage.googleapis.com/production-os-assets/assets/ee624b9f-8615-4f77-a680-72fbc0876d71"
                alt="家具の家 No.1"
                class="w-24 h-24 rounded-lg object-cover"
              />
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">家具の家 No.1</h3>
                <p class="text-sm text-gray-600">家具の家 No.1に滞在する</p>
              </div>
            </div>

            <!-- 日程 -->
            <div class="mb-6 pb-6 border-b border-gray-200">
              <h4 class="font-semibold text-gray-900 mb-3">日程</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">チェックイン</span>
                  <span class="text-gray-900">{{ formatDisplayDate(checkInDate) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">チェックアウト</span>
                  <span class="text-gray-900">{{ formatDisplayDate(checkOutDate) }}</span>
                </div>
              </div>
            </div>

            <!-- ゲスト -->
            <div class="mb-6 pb-6 border-b border-gray-200">
              <h4 class="font-semibold text-gray-900 mb-3">ゲスト</h4>
              <p class="text-sm text-gray-900">
                大人{{ adults }}人
                <span v-if="children > 0">、子ども{{ children }}人</span>
                <span v-if="infants > 0">、乳幼児{{ infants }}人</span>
              </p>
            </div>

            <!-- 選択中オプション -->
            <div v-if="selectedOptions.length > 0" class="mb-6 pb-6 border-b border-gray-200">
              <h4 class="font-semibold text-gray-900 mb-3">オプション</h4>
              <div class="space-y-2">
                <div v-for="opt in selectedOptions" :key="opt.optionId" class="flex items-center gap-2 text-sm">
                  <img
                    v-if="opt.imageUrl"
                    :src="opt.imageUrl"
                    :alt="opt.name"
                    class="w-8 h-8 object-cover rounded"
                  />
                  <span class="text-gray-900">{{ opt.name }}</span>
                </div>
              </div>
            </div>

            <!-- 料金の詳細 -->
            <div class="space-y-3 text-sm mb-6">
              <div class="flex justify-between">
                <span class="text-gray-600 underline">¥{{ pricePerNight.toLocaleString() }} x {{ numberOfNights }}泊</span>
                <span class="text-gray-900">¥{{ subtotal.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 underline">清掃料金</span>
                <span class="text-gray-900">¥{{ cleaningFee.toLocaleString() }}</span>
              </div>
              <div v-if="selectedOptions.length > 0" class="flex justify-between">
                <span class="text-gray-600 underline">オプション</span>
                <span class="text-gray-900">¥{{ optionsTotalPrice.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">税金</span>
                <span class="text-gray-900">¥{{ taxWithOptions.toLocaleString() }}</span>
              </div>
            </div>

            <!-- 合計 -->
            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-900">合計額 JPY</span>
                <span class="font-semibold text-gray-900 text-xl">¥{{ totalAmountWithOptions.toLocaleString() }}</span>
              </div>
              <button type="button" class="text-sm underline text-gray-600 hover:text-gray-900 mt-2">
                料金内訳
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />

    <!-- 決済前確認モーダル -->
    <div v-if="showConfirmation" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">予約内容の最終確認</h3>

        <div class="space-y-3 mb-6">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">チェックイン</span>
            <span class="font-medium text-gray-900">{{ formatDisplayDate(checkInDate) }} 15:00以降</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">チェックアウト</span>
            <span class="font-medium text-gray-900">{{ formatDisplayDate(checkOutDate) }} 11:00まで</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">宿泊人数</span>
            <span class="font-medium text-gray-900">
              大人{{ adults }}名
              <span v-if="children > 0">、子ども{{ children }}名</span>
              <span v-if="infants > 0">、乳幼児{{ infants }}名</span>
            </span>
          </div>
          <div v-if="selectedOptions.length > 0" class="flex justify-between text-sm">
            <span class="text-gray-600">オプション</span>
            <span class="font-medium text-gray-900">{{ selectedOptions.map(o => o.name).join('、') }}</span>
          </div>
          <div class="border-t pt-3 flex justify-between">
            <span class="font-semibold text-gray-900">合計金額</span>
            <span class="font-semibold text-lg text-gray-900">¥{{ totalAmountWithOptions.toLocaleString() }}</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showConfirmation = false"
            class="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            修正する
          </button>
          <button
            @click="proceedToPayment"
            class="flex-1 px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90"
            style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
          >
            決済へ進む
          </button>
        </div>
      </div>
    </div>

    <!-- 決済処理中のローディング -->
    <div v-if="isProcessing" class="fixed inset-0 bg-white/95 flex items-center justify-center z-50">
      <div class="text-center">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">決済処理中...</h3>
        <p class="text-sm text-gray-600 mb-1">カード情報を確認しています</p>
        <p class="text-xs text-gray-500">この画面を閉じないでください（最大30秒）</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookingOption, SelectedBookingOption } from '~/types'

definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const { createBooking } = useBookings()
const { createPaymentIntent, initializeElements, confirmCardPayment } = useStripePayment()
const { calculatePrice, pricingSetting, loadFromFirestore } = useEnhancedPricing()
const { getActivePolicy, generatePolicyDescription } = useCancellationPolicy()
const { getActiveOptions } = useBookingOptions()

// パンくずリスト
const breadcrumbItems = [
  { label: '家具の家 No.1 予約サイト', path: '/' },
  { label: '予約をリクエスト' }
]

// クエリパラメータから予約情報を取得
const checkInDate = ref(route.query.checkIn as string || '')
const checkOutDate = ref(route.query.checkOut as string || '')
const adults = ref(parseInt(route.query.adults as string) || 1)
const children = ref(parseInt(route.query.children as string) || 0)
const infants = ref(parseInt(route.query.infants as string) || 0)

// オプション関連
const availableOptions = ref<BookingOption[]>([])
const selectedOptions = ref<SelectedBookingOption[]>([])
const optionAvailability = ref<Record<string, { available: boolean; remaining: number; dailyLimit: number }>>({})
const loadingOptions = ref(true)

// オプションの合計金額
const optionsTotalPrice = computed(() => {
  return selectedOptions.value.reduce((sum, opt) => sum + opt.price, 0)
})

// オプションが選択されているか確認
const isOptionSelected = (optionId: string): boolean => {
  return selectedOptions.value.some(opt => opt.optionId === optionId)
}

// オプションの選択/解除
const toggleOption = (option: BookingOption) => {
  const index = selectedOptions.value.findIndex(opt => opt.optionId === option.id)
  if (index >= 0) {
    selectedOptions.value.splice(index, 1)
  } else {
    selectedOptions.value.push({
      optionId: option.id,
      name: option.name,
      price: option.price,
      imageUrl: option.imageUrl
    })
  }
}

// オプションと空き状況を読み込み
const loadOptionsAndAvailability = async () => {
  try {
    loadingOptions.value = true

    // 有効なオプションを取得
    const options = await getActiveOptions()
    availableOptions.value = options

    if (options.length > 0 && checkInDate.value) {
      // 空き状況を確認
      const result = await $fetch('/api/public/options-availability', {
        method: 'POST',
        body: {
          date: checkInDate.value,
          optionIds: options.map(o => o.id)
        }
      })

      if (result.success && result.availability) {
        optionAvailability.value = result.availability
      }
    }
  } catch (error) {
    console.error('オプション読み込みエラー:', error)
  } finally {
    loadingOptions.value = false
  }
}

// 料金設定とキャンセルポリシーを読み込み
onMounted(async () => {
  await loadFromFirestore()

  // オプションを読み込み
  await loadOptionsAndAvailability()

  // キャンセルポリシーを取得
  try {
    const policy = await getActivePolicy()
    if (policy) {
      cancellationPolicyDescription.value = generatePolicyDescription(policy.rules)
    }
  } catch (error) {
    console.error('キャンセルポリシー取得エラー:', error)
  }
})

// 子供の年齢リストを生成（7〜15歳の子供 + 0〜6歳の乳幼児）
const childrenAges = computed(() => {
  const ages: number[] = []
  // 子ども（7〜15歳）は中央値の11歳として計算
  for (let i = 0; i < children.value; i++) {
    ages.push(11)
  }
  // 乳幼児（0〜6歳）は中央値の3歳として計算
  for (let i = 0; i < infants.value; i++) {
    ages.push(3)
  }
  return ages
})

// 料金計算（拡張版）
const priceCalculation = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) {
    return null
  }

  const checkIn = new Date(checkInDate.value)
  const checkOut = new Date(checkOutDate.value)

  return calculatePrice(
    checkIn,
    checkOut,
    adults.value,
    childrenAges.value, // 子供の年齢リスト
    0   // クーポン割引率
  )
})

// 料金の詳細項目
const numberOfNights = computed(() => priceCalculation.value?.numberOfNights || 0)
const subtotal = computed(() => priceCalculation.value?.subtotal || 0)
const cleaningFee = computed(() => priceCalculation.value?.cleaningFee || 0)
const subtotalBeforeTax = computed(() => priceCalculation.value?.subtotalBeforeTax || 0)
const tax = computed(() => priceCalculation.value?.tax || 0)
const taxAmount = computed(() => priceCalculation.value?.tax || 0)
const taxRatePercent = computed(() => {
  const rate = pricingSetting.value?.taxRate || 0.1
  return Math.round(rate * 100)
})
const totalAmount = computed(() => priceCalculation.value?.totalAmount || 0)

// オプションを含めた料金計算
const subtotalBeforeTaxWithOptions = computed(() => subtotalBeforeTax.value + optionsTotalPrice.value)
const taxWithOptions = computed(() => {
  const rate = pricingSetting.value?.taxRate || 0.1
  return Math.floor(subtotalBeforeTaxWithOptions.value * rate)
})
const totalAmountWithOptions = computed(() => subtotalBeforeTaxWithOptions.value + taxWithOptions.value)

// 1泊あたりの平均料金（料金サマリーカードに表示用）
const pricePerNight = computed(() => {
  if (!priceCalculation.value || numberOfNights.value === 0) return 0
  return Math.floor(subtotal.value / numberOfNights.value)
})

// ゲスト情報
const guestName = ref('')
const guestEmail = ref('')
const guestPhone = ref('')

// 支払い関連（Stripe）
const paymentReady = ref(false)
const clientSecret = ref('')
let cardElement: any = null

// 同意
const agreedToTerms = ref(false)
const isSubmitting = ref(false)

// モーダル・ローディング
const showConfirmation = ref(false)
const isProcessing = ref(false)
const showEditForm = ref(false)

// キャンセルポリシー
const cancellationPolicyDescription = ref('')

const cancellationDeadline = computed(() => {
  if (!checkInDate.value) return ''
  const date = new Date(checkInDate.value)
  date.setDate(date.getDate() - 5) // チェックイン5日前
  return `${date.getMonth() + 1}月${date.getDate()}日`
})

// 日付フォーマット
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// 初期化処理
onMounted(async () => {
  try {
    // Payment Intentを作成
    const guestCount = adults.value + children.value

    const result = await createPaymentIntent(
      checkInDate.value,
      checkOutDate.value,
      guestCount
    )

    console.log('📦 Payment Intent作成結果:', result)

    if (!result || !result.clientSecret) {
      console.error('❌ clientSecretが取得できませんでした:', result)
      throw new Error('決済の準備に失敗しました')
    }

    clientSecret.value = result.clientSecret
    console.log('✅ clientSecret取得成功:', result.clientSecret.substring(0, 30) + '...')

    // Stripe Elementsを初期化
    const elements = await initializeElements(result.clientSecret)

    // paymentReadyをtrueにしてDOMをレンダリング
    paymentReady.value = true

    // DOMの準備を待ってからマウント
    await nextTick()

    // Card Elementを作成してマウント
    const cardElementContainer = document.getElementById('card-element')
    if (!cardElementContainer) {
      throw new Error('決済フォーム要素が見つかりません')
    }

    // Card Elementを作成（スタイル付き、郵便番号非表示）
    cardElement = elements.create('card', {
      hidePostalCode: true, // 郵便番号フィールドを非表示
      style: {
        base: {
          fontSize: '16px',
          color: '#30313d',
          fontFamily: 'system-ui, sans-serif',
          '::placeholder': {
            color: '#9ca3af'
          }
        },
        invalid: {
          color: '#df1b41'
        }
      }
    })

    console.log('🎨 Card Element作成完了、マウント開始...')
    cardElement.mount('#card-element')
    console.log('✅ Card Elementマウント完了')
  } catch (error: any) {
    console.error('Stripe初期化エラー:', error)
    alert('決済フォームの準備に失敗しました。ページを再読み込みしてください。')
  }
})

// バリデーション
const isFormValid = computed(() => {
  // ゲスト情報のチェック
  if (!guestName.value.trim() || !guestEmail.value.trim() || !guestPhone.value.trim()) {
    return false
  }

  // 決済フォームの準備完了チェック
  if (!paymentReady.value) {
    return false
  }

  // 同意のチェック
  if (!agreedToTerms.value) return false

  return true
})

// 送信処理（確認モーダルを表示）
const handleSubmit = async () => {
  if (!isFormValid.value) {
    alert('すべての項目を正しく入力してください')
    return
  }

  // 確認モーダルを表示
  showConfirmation.value = true
}

// 決済処理の実行
const proceedToPayment = async () => {
  showConfirmation.value = false
  isProcessing.value = true
  isSubmitting.value = true

  try {
    // Payment Intentのmetadataを更新（最新のゲスト情報を含める）
    const config = useRuntimeConfig()
    const { csrf } = useCsrf()

    await $fetch('/api/stripe/update-payment-intent', {
      method: 'POST',
      headers: {
        'csrf-token': csrf || ''
      },
      body: {
        paymentIntentId: clientSecret.value.split('_secret_')[0],
        metadata: {
          guestName: guestName.value,
          guestEmail: guestEmail.value,
          guestPhone: guestPhone.value,
          checkIn: checkInDate.value,
          checkOut: checkOutDate.value,
          guests: `大人${adults.value}人${children.value > 0 ? `、子ども${children.value}人` : ''}${infants.value > 0 ? `、乳幼児${infants.value}人` : ''}`,
          totalAmount: totalAmountWithOptions.value.toString(),
          options: selectedOptions.value.map(o => o.name).join('、') || 'なし'
        }
      }
    })

    // 予約をFirestoreに保存
    const bookingData = {
      type: 'stay' as const,
      startDate: new Date(checkInDate.value),
      endDate: new Date(checkOutDate.value),
      guestCount: adults.value + children.value,
      guestName: guestName.value,
      guestEmail: guestEmail.value,
      guestPhone: guestPhone.value,
      totalAmount: totalAmountWithOptions.value,
      baseAmount: subtotal.value,
      discountAmount: 0,
      notes: `決済ID: ${clientSecret.value.split('_secret_')[0]}`,
      selectedOptions: selectedOptions.value,
      optionsTotalPrice: optionsTotalPrice.value
    }

    const bookingId = await createBooking(bookingData)
    console.log('✅ 予約作成成功:', bookingId)

    // Stripe決済を確定（Card Element用）
    // ローカル開発環境（HTTP）ではStripe決済が制限されるため、テスト環境では決済をスキップ
    const isLocalDev = window.location.hostname === 'localhost'

    if (isLocalDev) {
      // ローカル開発: 決済スキップして完了ページへ
      console.log('🔧 ローカル開発環境: 決済をスキップします')
      const paymentIntentId = clientSecret.value.split('_secret_')[0]
      router.push({
        path: '/booking/complete',
        query: {
          payment_intent: paymentIntentId,
          booking_id: bookingId,
          email: guestEmail.value
        }
      })
    } else {
      // 本番環境: 実際に決済を実行
      const paymentIntent = await confirmCardPayment(clientSecret.value, cardElement)

      // 決済成功後、完了ページにリダイレクト
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        router.push({
          path: '/booking/complete',
          query: {
            payment_intent: paymentIntent.id,
            booking_id: bookingId,
            email: guestEmail.value
          }
        })
      }
    }
  } catch (error: any) {
    console.error('予約・決済エラー:', error)
    alert(error.message || '予約・決済の処理に失敗しました')
    isProcessing.value = false
    isSubmitting.value = false
  }
}

// SEO設定
useHead({
  title: '予約をリクエスト | 家具の家 No.1',
  meta: [
    { name: 'robots', content: 'noindex' }
  ]
})
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
