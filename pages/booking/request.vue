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
        <h1 class="text-3xl font-semibold mb-6" style="color: #231815">
          予約をリクエスト
        </h1>

        <!-- ステップインジケータ -->
        <div class="flex items-center justify-center">
          <div class="flex items-center w-full max-w-2xl">
            <!-- ステップ1 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div
                  class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold"
                >
                  1
                </div>
                <span
                  class="ml-2 text-sm font-medium text-gray-900 hidden sm:inline"
                  >予約内容</span
                >
              </div>
            </div>
            <div class="flex-1 h-0.5 bg-purple-600 mx-2"></div>

            <!-- ステップ2 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div
                  class="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold"
                >
                  2
                </div>
                <span
                  class="ml-2 text-sm font-medium text-gray-900 hidden sm:inline"
                  >お客様情報</span
                >
              </div>
            </div>
            <div class="flex-1 h-0.5 bg-gray-200 mx-2"></div>

            <!-- ステップ3 -->
            <div class="flex items-center flex-1">
              <div class="flex items-center">
                <div
                  class="w-10 h-10 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-semibold"
                >
                  3
                </div>
                <span
                  class="ml-2 text-sm font-medium text-gray-400 hidden sm:inline"
                  >お支払い</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左側: フォーム -->
        <div class="lg:col-span-2 space-y-8">
          <!-- オプション選択セクション -->
          <div
            v-if="availableOptions.length > 0"
            class="bg-white rounded-xl shadow-md p-6 border border-gray-200"
          >
            <h2 class="text-xl font-semibold mb-4" style="color: #231815">
              オプションを追加
            </h2>
            <p class="text-sm text-gray-600 mb-4">
              ご滞在をより快適にするオプションをお選びください
            </p>

            <!-- オプション一覧 -->
            <div class="space-y-4">
              <div
                v-for="option in availableOptions"
                :key="option.id"
                class="border rounded-lg p-4 transition-all"
                :class="{
                  'border-purple-500 bg-purple-50': isOptionSelected(option.id),
                  'border-gray-200 hover:border-gray-300': !isOptionSelected(
                    option.id,
                  ),
                  'opacity-50': !optionAvailability[option.id]?.available,
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
                      <svg
                        class="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>

                  <!-- オプション情報 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between">
                      <div>
                        <h3 class="font-semibold text-gray-900">
                          {{ option.name }}
                        </h3>
                        <p class="text-sm text-gray-600 mt-1">
                          {{ option.description }}
                        </p>
                      </div>
                      <span
                        class="text-lg font-semibold text-purple-600 whitespace-nowrap ml-4"
                      >
                        ¥{{ option.price.toLocaleString() }}
                      </span>
                    </div>

                    <!-- 空き状況と選択ボタン -->
                    <div class="flex items-center justify-between mt-3">
                      <div class="text-sm">
                        <span
                          v-if="optionAvailability[option.id]?.available"
                          class="text-green-600"
                        >
                          残り{{ optionAvailability[option.id]?.remaining }}件
                        </span>
                        <span v-else class="text-red-500"> 予約済み </span>
                      </div>

                      <button
                        v-if="optionAvailability[option.id]?.available"
                        @click="toggleOption(option)"
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        :class="{
                          'bg-purple-600 text-white hover:bg-purple-700':
                            isOptionSelected(option.id),
                          'bg-gray-100 text-gray-700 hover:bg-gray-200':
                            !isOptionSelected(option.id),
                        }"
                      >
                        {{
                          isOptionSelected(option.id) ? "選択済み" : "追加する"
                        }}
                      </button>
                      <span v-else class="text-sm text-gray-400">選択不可</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 選択中のオプション合計 -->
            <div
              v-if="selectedOptions.length > 0"
              class="mt-4 pt-4 border-t border-gray-200"
            >
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600"
                  >選択中のオプション ({{ selectedOptions.length }}件)</span
                >
                <span class="font-semibold text-purple-600"
                  >+¥{{ optionsTotalPrice.toLocaleString() }}</span
                >
              </div>
            </div>
          </div>

          <!-- オプション読み込み中 -->
          <div
            v-else-if="loadingOptions"
            class="bg-white rounded-xl shadow-md p-6 border border-gray-200"
          >
            <div class="flex items-center justify-center py-4">
              <div
                class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"
              ></div>
              <span class="text-gray-600">オプションを読み込み中...</span>
            </div>
          </div>

          <!-- ステップ1: 予約内容の確認 -->
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold" style="color: #231815">
                1. 予約内容をご確認ください
              </h2>
              <button
                @click="showEditForm = !showEditForm"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {{ showEditForm ? "閉じる" : "変更する" }}
              </button>
            </div>

            <div class="space-y-4">
              <!-- 編集フォーム -->
              <div
                v-if="showEditForm"
                class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >チェックイン</label
                  >
                  <input
                    type="date"
                    v-model="checkInDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >チェックアウト</label
                  >
                  <input
                    type="date"
                    v-model="checkOutDate"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >大人（16歳以上）</label
                  >
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
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >子ども（7〜15歳・50%）</label
                  >
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
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >乳幼児（0〜6歳・無料）</label
                  >
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
                    <span class="text-gray-900">{{
                      formatDisplayDate(checkInDate)
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">チェックアウト</span>
                    <span class="text-gray-900">{{
                      formatDisplayDate(checkOutDate)
                    }}</span>
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
              <div
                v-if="priceCalculation && priceCalculation.nightlyBreakdown"
                class="space-y-3 text-sm"
              >
                <!-- 基本情報 -->
                <div class="flex justify-between text-xs text-gray-500">
                  <span>大人{{ adults }}人 × {{ numberOfNights }}泊</span>
                  <span>{{ adults <= 2 ? "基本料金" : "人数別料金適用" }}</span>
                </div>

                <!-- 泊別内訳 -->
                <div
                  v-for="(night, index) in priceCalculation.nightlyBreakdown"
                  :key="index"
                  class="border-l-2 border-purple-200 pl-3 py-1"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-medium text-gray-700">
                        {{ index + 1 }}泊目 ({{ formatShortDate(night.date) }})
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">
                        {{
                          night.seasonType === "high"
                            ? "ハイ"
                            : night.seasonType === "off"
                              ? "オフ"
                              : "通常"
                        }}シーズン ・{{
                          night.dayType === "weekend" ? "休日前日" : "平日"
                        }}
                      </div>
                    </div>
                    <span class="text-gray-900 ml-2"
                      >¥{{ (night.nightTotal ?? 0).toLocaleString() }}</span
                    >
                  </div>
                </div>

                <!-- 小計（宿泊料金） -->
                <div class="flex justify-between pt-2 border-t border-gray-200">
                  <span class="text-gray-600">宿泊料金</span>
                  <span class="text-gray-900"
                    >¥{{ subtotal.toLocaleString() }}</span
                  >
                </div>

                <!-- 清掃料金 -->
                <div class="flex justify-between">
                  <span class="text-gray-600">清掃料金</span>
                  <span class="text-gray-900"
                    >¥{{ cleaningFee.toLocaleString() }}</span
                  >
                </div>

                <!-- オプション料金 -->
                <div v-if="selectedOptions.length > 0" class="space-y-1">
                  <div
                    v-for="opt in selectedOptions"
                    :key="opt.optionId"
                    class="flex justify-between text-sm"
                  >
                    <span class="text-gray-600">{{ opt.name }}</span>
                    <span class="text-gray-900"
                      >¥{{ opt.price.toLocaleString() }}</span
                    >
                  </div>
                </div>

                <!-- 税抜合計 -->
                <div class="flex justify-between text-xs text-gray-500">
                  <span>小計（税抜）</span>
                  <span
                    >¥{{ subtotalBeforeTaxWithOptions.toLocaleString() }}</span
                  >
                </div>

                <!-- 消費税 -->
                <div class="flex justify-between">
                  <span class="text-gray-600"
                    >消費税 ({{ taxRatePercent }}%)</span
                  >
                  <span class="text-gray-900"
                    >¥{{ taxWithOptions.toLocaleString() }}</span
                  >
                </div>

                <!-- クーポン割引 -->
                <div
                  v-if="appliedCoupon"
                  class="flex justify-between text-green-600"
                >
                  <span>割引（{{ appliedCoupon.code }}）</span>
                  <span>-¥{{ couponDiscountAmount.toLocaleString() }}</span>
                </div>

                <!-- 合計（税込） -->
                <div
                  class="flex justify-between pt-2 border-t-2 border-gray-300 font-semibold text-base"
                >
                  <span>合計（税込）</span>
                  <span>¥{{ finalTotalAmount.toLocaleString() }}</span>
                </div>

                <!-- 料金サマリー -->
                <div
                  v-if="priceCalculation.summary"
                  class="text-xs text-gray-500 pt-2 border-t border-gray-100"
                >
                  <div class="flex justify-between">
                    <span>1人1泊あたり平均</span>
                    <span
                      >¥{{
                        Math.floor(
                          finalTotalAmount /
                            (adults + children + infants) /
                            numberOfNights,
                        ).toLocaleString()
                      }}</span
                    >
                  </div>
                </div>

                <!-- コード入力欄（URLパラメータがある場合のみ表示） -->
                <div
                  v-if="showCouponField"
                  class="pt-3 border-t border-gray-100"
                >
                  <button
                    v-if="!showCouponInput && !appliedCoupon"
                    @click="showCouponInput = true"
                    class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    type="button"
                  >
                    コードをお持ちの方
                  </button>
                  <div
                    v-if="showCouponInput && !appliedCoupon"
                    class="mt-2 space-y-2"
                  >
                    <div class="flex gap-2">
                      <input
                        v-model="couponCode"
                        type="text"
                        placeholder="コードを入力"
                        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        :disabled="isValidatingCoupon"
                      />
                      <button
                        @click="applyCoupon"
                        :disabled="!couponCode || isValidatingCoupon"
                        class="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        type="button"
                      >
                        {{ isValidatingCoupon ? "..." : "適用" }}
                      </button>
                    </div>
                    <p v-if="couponError" class="text-xs text-red-500">
                      {{ couponError }}
                    </p>
                  </div>
                  <div
                    v-if="appliedCoupon"
                    class="flex items-center justify-between mt-2"
                  >
                    <span class="text-xs text-green-600"
                      >{{ appliedCoupon.code }} 適用中</span
                    >
                    <button
                      @click="removeCoupon"
                      class="text-xs text-gray-500 hover:text-red-500 transition-colors"
                      type="button"
                    >
                      取り消す
                    </button>
                  </div>
                </div>
              </div>

              <!-- 読み込み中 -->
              <div
                v-else
                class="space-y-2 text-sm text-gray-500 text-center py-4"
              >
                <div
                  class="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"
                ></div>
                <p>料金を計算しています...</p>
              </div>

              <!-- キャンセルポリシー -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                  <svg
                    class="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <h3 class="font-medium text-gray-900">キャンセルポリシー</h3>
                </div>
                <div
                  v-if="cancellationPolicyDescription"
                  class="text-sm text-gray-700 space-y-1"
                >
                  <p
                    v-for="(line, index) in cancellationPolicyDescription.split(
                      '\n',
                    )"
                    :key="index"
                  >
                    {{ line }}
                  </p>
                </div>
                <div v-else class="text-sm text-gray-700">
                  <p>
                    {{
                      cancellationDeadline
                    }}までにキャンセルすれば、全額が返金されます。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- ステップ2: ゲスト情報の確認 -->
          <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <h2 class="text-xl font-semibold mb-4" style="color: #231815">
              2. ゲスト情報をご確認ください
            </h2>

            <div class="space-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  お名前
                </label>
                <div
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                >
                  {{ guestName }}
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <div
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900"
                >
                  {{ guestEmail }}
                </div>
                <p class="mt-1 text-xs text-gray-500">
                  予約確認メールはこのアドレスに送信されます
                </p>
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
                <p class="mt-1 text-xs text-gray-500">
                  緊急連絡先として使用します
                </p>
              </div>

              <!-- 郵便番号・住所 -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    郵便番号 <span class="text-red-500">*</span>
                  </label>
                  <div class="flex gap-2">
                    <input
                      v-model="guestPostalCode"
                      type="text"
                      placeholder="123-4567"
                      maxlength="8"
                      required
                      class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      @input="onPostalCodeInput"
                    />
                    <button
                      type="button"
                      @click="searchAddress"
                      :disabled="isSearchingAddress"
                      class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
                    >
                      {{ isSearchingAddress ? "..." : "検索" }}
                    </button>
                  </div>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    住所 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="guestAddress"
                    type="text"
                    placeholder="東京都渋谷区..."
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- 職業 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  ご職業 <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="guestOccupation"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="会社員">会社員</option>
                  <option value="公務員">公務員</option>
                  <option value="自営業">自営業</option>
                  <option value="会社役員">会社役員</option>
                  <option value="パート・アルバイト">パート・アルバイト</option>
                  <option value="学生">学生</option>
                  <option value="主婦・主夫">主婦・主夫</option>
                  <option value="無職">無職</option>
                  <option value="その他">その他</option>
                </select>
              </div>

              <!-- 法人予約チェック -->
              <div class="border-t border-gray-200 pt-4">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="isCorporate"
                    class="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span class="text-sm text-gray-700">法人でのご予約</span>
                </label>
              </div>

              <!-- 法人の場合の追加フィールド -->
              <div
                v-if="isCorporate"
                class="space-y-4 bg-purple-50 border border-purple-200 rounded-lg p-4"
              >
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    会社名 <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="companyName"
                    type="text"
                    placeholder="株式会社〇〇"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  />
                </div>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="invoiceRequired"
                    class="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span class="text-sm text-gray-700">請求書の発行を希望する</span>
                </label>
              </div>

              <!-- 外国籍チェック -->
              <div class="border-t border-gray-200 pt-4">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    v-model="isForeignNational"
                    class="w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
                  />
                  <span class="text-sm text-gray-700">外国籍の方</span>
                </label>
              </div>

              <!-- 外国籍の場合の追加フィールド -->
              <div
                v-if="isForeignNational"
                class="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <p class="text-sm text-blue-700 mb-2">
                  旅館業法により、外国籍の方は国籍とパスポート番号の記載が必要です
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      国籍 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="guestNationality"
                      type="text"
                      placeholder="例: United States"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      パスポート番号 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="guestPassportNumber"
                      type="text"
                      placeholder="AB1234567"
                      required
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <h3 class="text-lg font-semibold mb-4" style="color: #231815">
              お支払い情報
            </h3>

            <!-- 0円予約の場合 -->
            <div v-if="isZeroAmountBooking" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center gap-2 text-green-700">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium">お支払いは不要です</span>
              </div>
              <p class="text-sm text-green-600 mt-2">
                クーポン適用により、今回のご予約は無料でご利用いただけます。
              </p>
            </div>

            <!-- Stripe Card Element -->
            <div v-else-if="paymentReady" class="space-y-4">
              <div
                id="card-element"
                class="p-4 border border-gray-200 rounded-lg bg-white"
              ></div>
              <p class="text-xs text-gray-500">
                お支払い情報は安全に暗号化されて処理されます
              </p>
            </div>

            <!-- ローディング状態 -->
            <div v-else class="text-center py-8">
              <div
                class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"
              ></div>
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
                <strong>ハウスルール</strong
                >、<strong>キャンセルポリシー</strong>、および
                <strong>ゲストへの返金ポリシー</strong
                >に同意します。また、家具の家が
                <strong>支払いに関する規約</strong
                >に従って料金の請求を行うことに同意します。
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
              style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              "
            >
              {{ isSubmitting ? "処理中..." : "リクエストを送信" }}
            </button>
          </div>
        </div>

        <!-- 右側: 予約サマリーカード -->
        <div class="lg:col-span-1">
          <div
            class="bg-white rounded-xl shadow-md p-6 border border-gray-200 sticky top-24"
          >
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
                  <span class="text-gray-900">{{
                    formatDisplayDate(checkInDate)
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">チェックアウト</span>
                  <span class="text-gray-900">{{
                    formatDisplayDate(checkOutDate)
                  }}</span>
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
            <div
              v-if="selectedOptions.length > 0"
              class="mb-6 pb-6 border-b border-gray-200"
            >
              <h4 class="font-semibold text-gray-900 mb-3">オプション</h4>
              <div class="space-y-2">
                <div
                  v-for="opt in selectedOptions"
                  :key="opt.optionId"
                  class="flex items-center gap-2 text-sm"
                >
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
                <span class="text-gray-600 underline"
                  >¥{{ pricePerNight.toLocaleString() }} x
                  {{ numberOfNights }}泊</span
                >
                <span class="text-gray-900"
                  >¥{{ subtotal.toLocaleString() }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 underline">清掃料金</span>
                <span class="text-gray-900"
                  >¥{{ cleaningFee.toLocaleString() }}</span
                >
              </div>
              <div
                v-if="selectedOptions.length > 0"
                class="flex justify-between"
              >
                <span class="text-gray-600 underline">オプション</span>
                <span class="text-gray-900"
                  >¥{{ optionsTotalPrice.toLocaleString() }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">税金</span>
                <span class="text-gray-900"
                  >¥{{ taxWithOptions.toLocaleString() }}</span
                >
              </div>
              <div
                v-if="appliedCoupon"
                class="flex justify-between text-green-600"
              >
                <span>割引</span>
                <span>-¥{{ couponDiscountAmount.toLocaleString() }}</span>
              </div>
            </div>

            <!-- 合計 -->
            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-900">合計額 JPY</span>
                <span class="font-semibold text-gray-900 text-xl"
                  >¥{{ finalTotalAmount.toLocaleString() }}</span
                >
              </div>
              <button
                type="button"
                class="text-sm underline text-gray-600 hover:text-gray-900 mt-2"
              >
                料金内訳
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />

    <!-- 決済前確認モーダル -->
    <div
      v-if="showConfirmation"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">
          予約内容の最終確認
        </h3>

        <div class="space-y-3 mb-6">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">チェックイン</span>
            <span class="font-medium text-gray-900"
              >{{ formatDisplayDate(checkInDate) }}
              {{ facilitySettings.checkInTime }}以降</span
            >
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">チェックアウト</span>
            <span class="font-medium text-gray-900"
              >{{ formatDisplayDate(checkOutDate) }}
              {{ facilitySettings.checkOutTime }}まで</span
            >
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">宿泊人数</span>
            <span class="font-medium text-gray-900">
              大人{{ adults }}名
              <span v-if="children > 0">、子ども{{ children }}名</span>
              <span v-if="infants > 0">、乳幼児{{ infants }}名</span>
            </span>
          </div>
          <div
            v-if="selectedOptions.length > 0"
            class="flex justify-between text-sm"
          >
            <span class="text-gray-600">オプション</span>
            <span class="font-medium text-gray-900">{{
              selectedOptions.map((o) => o.name).join("、")
            }}</span>
          </div>
          <div
            v-if="appliedCoupon"
            class="flex justify-between text-sm text-green-600"
          >
            <span>割引（{{ appliedCoupon.code }}）</span>
            <span>-¥{{ couponDiscountAmount.toLocaleString() }}</span>
          </div>
          <div class="border-t pt-3 flex justify-between">
            <span class="font-semibold text-gray-900">合計金額</span>
            <span class="font-semibold text-lg text-gray-900"
              >¥{{ finalTotalAmount.toLocaleString() }}</span
            >
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
            style="
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            "
          >
            決済へ進む
          </button>
        </div>
      </div>
    </div>

    <!-- 決済処理中のローディング -->
    <div
      v-if="isProcessing"
      class="fixed inset-0 bg-white/95 flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"
        ></div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">決済処理中...</h3>
        <p class="text-sm text-gray-600 mb-1">カード情報を確認しています</p>
        <p class="text-xs text-gray-500">
          この画面を閉じないでください（最大30秒）
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BookingOption, SelectedBookingOption, Coupon } from "~/types";

definePageMeta({
  layout: false,
  middleware: "auth",
});

const route = useRoute();
const router = useRouter();
const { user, appUser } = useAuth();
const { createBooking } = useBookings();
const { createPaymentIntent, initializeElements, confirmCardPayment } =
  useStripePayment();
const { calculatePrice, pricingSetting, loadFromFirestore } =
  useEnhancedPricing();
const { getActivePolicy, generatePolicyDescription } = useCancellationPolicy();
const { validateCoupon, incrementCouponUsage } = useCoupon();
const toast = useToast();

// 施設設定
const facilitySettings = ref({
  checkInTime: "14:00",
  checkOutTime: "11:00",
});

// パンくずリスト
const breadcrumbItems = [
  { label: "家具の家 No.1 予約サイト", path: "/" },
  { label: "予約をリクエスト" },
];

// クエリパラメータから予約情報を取得
const checkInDate = ref((route.query.checkIn as string) || "");
const checkOutDate = ref((route.query.checkOut as string) || "");
const adults = ref(parseInt(route.query.adults as string) || 1);
const children = ref(parseInt(route.query.children as string) || 0);
const infants = ref(parseInt(route.query.infants as string) || 0);

// オプション関連
const availableOptions = ref<BookingOption[]>([]);
const selectedOptions = ref<SelectedBookingOption[]>([]);
const optionAvailability = ref<
  Record<string, { available: boolean; remaining: number; dailyLimit: number }>
>({});
const loadingOptions = ref(true);

// クーポン関連
const showCouponField = computed(() => route.query.promo !== undefined);
const showCouponInput = ref(!!route.query.promo); // promoパラメータがある場合は最初から開く
const couponCode = ref((route.query.promo as string) || "");
const appliedCoupon = ref<Coupon | null>(null);
const couponDiscountAmount = ref(0);
const isValidatingCoupon = ref(false);
const couponError = ref("");

// クーポン適用
const applyCoupon = async () => {
  if (!couponCode.value) return;

  isValidatingCoupon.value = true;
  couponError.value = "";

  try {
    const result = await validateCoupon(
      couponCode.value,
      totalAmountWithOptions.value,
    );

    if (result.isValid && result.coupon) {
      appliedCoupon.value = result.coupon;
      couponDiscountAmount.value = result.discountAmount || 0;
      showCouponInput.value = false;

      // クーポン適用後、Payment Intentを再作成
      await recreatePaymentIntentWithCoupon();
    } else {
      couponError.value = result.error || "クーポンが無効です";
    }
  } catch (e) {
    couponError.value = "クーポンの検証に失敗しました";
  } finally {
    isValidatingCoupon.value = false;
  }
};

// クーポン適用後にPayment Intentを再作成
const recreatePaymentIntentWithCoupon = async () => {
  try {
    const guestCount = adults.value + children.value;
    const result = await createPaymentIntent(
      checkInDate.value,
      checkOutDate.value,
      guestCount,
      appliedCoupon.value?.code || "",
    );

    // 0円予約の場合
    if (result && result.isZeroAmount) {
      isZeroAmountBooking.value = true;
      clientSecret.value = "";
      console.log("✅ 0円予約（100%割引）：決済スキップ");
      return;
    }

    // 通常の予約の場合
    if (result && result.clientSecret) {
      isZeroAmountBooking.value = false;
      clientSecret.value = result.clientSecret;
      console.log(
        "✅ クーポン適用後のPayment Intent再作成成功:",
        `金額: ¥${result.amount}`,
      );
    }
  } catch (error) {
    console.error("Payment Intent再作成エラー:", error);
    // エラーが発生してもクーポン適用状態は維持（決済時に再試行可能）
  }
};

// クーポン取り消し
const removeCoupon = async () => {
  const wasZeroAmount = isZeroAmountBooking.value;

  appliedCoupon.value = null;
  couponDiscountAmount.value = 0;
  couponCode.value = "";
  showCouponInput.value = false;
  isZeroAmountBooking.value = false;

  // クーポン取り消し後、Payment Intentを再作成（クーポンなし）
  try {
    const guestCount = adults.value + children.value;
    const result = await createPaymentIntent(
      checkInDate.value,
      checkOutDate.value,
      guestCount,
    );

    if (result && result.clientSecret) {
      clientSecret.value = result.clientSecret;
      console.log(
        "✅ クーポン取り消し後のPayment Intent再作成成功:",
        `金額: ¥${result.amount}`,
      );

      // 0円予約状態から戻った場合、Stripe Elementsを再初期化
      if (wasZeroAmount) {
        const elements = await initializeElements(result.clientSecret);
        paymentReady.value = true;

        await nextTick();

        const cardElementContainer = document.getElementById("card-element");
        if (cardElementContainer) {
          cardElement = elements.create("card", {
            hidePostalCode: true,
            style: {
              base: {
                fontSize: "16px",
                color: "#30313d",
                fontFamily: "system-ui, sans-serif",
                "::placeholder": { color: "#9ca3af" },
              },
              invalid: { color: "#df1b41" },
            },
          });
          cardElement.mount("#card-element");
          console.log("✅ カード入力フォームを再初期化");
        }
      }
    }
  } catch (error) {
    console.error("Payment Intent再作成エラー:", error);
  }
};

// 最終合計金額（クーポン適用後）
const finalTotalAmount = computed(() => {
  return totalAmountWithOptions.value - couponDiscountAmount.value;
});

// オプションの合計金額
const optionsTotalPrice = computed(() => {
  return selectedOptions.value.reduce((sum, opt) => sum + opt.price, 0);
});

// オプションが選択されているか確認
const isOptionSelected = (optionId: string): boolean => {
  return selectedOptions.value.some((opt) => opt.optionId === optionId);
};

// オプションの選択/解除
const toggleOption = (option: BookingOption) => {
  const index = selectedOptions.value.findIndex(
    (opt) => opt.optionId === option.id,
  );
  if (index >= 0) {
    selectedOptions.value.splice(index, 1);
  } else {
    selectedOptions.value.push({
      optionId: option.id,
      name: option.name,
      price: option.price,
      imageUrl: option.imageUrl,
    });
  }
};

// オプションと空き状況を読み込み
const loadOptionsAndAvailability = async () => {
  try {
    loadingOptions.value = true;

    // 公開APIから有効なオプションを取得（Firestoreインデックス不要）
    const optionsResult = await $fetch("/api/public/options");
    if (optionsResult.success && optionsResult.options) {
      availableOptions.value = optionsResult.options as BookingOption[];

      if (optionsResult.options.length > 0 && checkInDate.value) {
        // 空き状況を確認
        const result = await $fetch("/api/public/options-availability", {
          method: "POST",
          body: {
            date: checkInDate.value,
            optionIds: optionsResult.options.map((o: { id: string }) => o.id),
          },
        });

        if (result.success && result.availability) {
          optionAvailability.value = result.availability;
        }
      }
    }
  } catch (error) {
    console.error("オプション読み込みエラー:", error);
  } finally {
    loadingOptions.value = false;
  }
};

// 施設設定を読み込み
const loadFacilitySettings = async () => {
  try {
    const response = await fetch("/api/public/settings");
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.settings) {
        facilitySettings.value = {
          checkInTime: data.settings.checkInTime || "14:00",
          checkOutTime: data.settings.checkOutTime || "11:00",
        };
      }
    }
  } catch (error) {
    console.error("施設設定の取得に失敗:", error);
  }
};

// 料金設定とキャンセルポリシーを読み込み
onMounted(async () => {
  await loadFromFirestore();
  await loadFacilitySettings();

  // オプションを読み込み
  await loadOptionsAndAvailability();

  // キャンセルポリシーを取得
  try {
    const policy = await getActivePolicy();
    if (policy) {
      cancellationPolicyDescription.value = generatePolicyDescription(
        policy.rules,
      );
    }
  } catch (error) {
    console.error("キャンセルポリシー取得エラー:", error);
  }

  // URLパラメータにプロモコードがある場合は自動適用を試みる
  if (couponCode.value && showCouponField.value) {
    // 料金計算が完了するのを少し待つ
    setTimeout(() => {
      applyCoupon();
    }, 500);
  }
});

// 子供の年齢リストを生成（7〜15歳の子供 + 0〜6歳の乳幼児）
const childrenAges = computed(() => {
  const ages: number[] = [];
  // 子ども（7〜15歳）は中央値の11歳として計算
  for (let i = 0; i < children.value; i++) {
    ages.push(11);
  }
  // 乳幼児（0〜6歳）は中央値の3歳として計算
  for (let i = 0; i < infants.value; i++) {
    ages.push(3);
  }
  return ages;
});

// 料金計算（拡張版）
const priceCalculation = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) {
    return null;
  }

  const checkIn = new Date(checkInDate.value);
  const checkOut = new Date(checkOutDate.value);

  return calculatePrice(
    checkIn,
    checkOut,
    adults.value,
    childrenAges.value, // 子供の年齢リスト
    0, // クーポン割引率
  );
});

// 料金の詳細項目
const numberOfNights = computed(
  () => priceCalculation.value?.numberOfNights || 0,
);
const subtotal = computed(() => priceCalculation.value?.subtotal || 0);
const cleaningFee = computed(() => priceCalculation.value?.cleaningFee || 0);
const subtotalBeforeTax = computed(
  () => priceCalculation.value?.subtotalBeforeTax || 0,
);
const tax = computed(() => priceCalculation.value?.tax || 0);
const taxAmount = computed(() => priceCalculation.value?.tax || 0);
const taxRatePercent = computed(() => {
  const rate = pricingSetting.value?.taxRate || 0.1;
  return Math.round(rate * 100);
});
const totalAmount = computed(() => priceCalculation.value?.totalAmount || 0);

// オプションを含めた料金計算
const subtotalBeforeTaxWithOptions = computed(
  () => subtotalBeforeTax.value + optionsTotalPrice.value,
);
const taxWithOptions = computed(() => {
  const rate = pricingSetting.value?.taxRate || 0.1;
  return Math.floor(subtotalBeforeTaxWithOptions.value * rate);
});
const totalAmountWithOptions = computed(
  () => subtotalBeforeTaxWithOptions.value + taxWithOptions.value,
);

// 1泊あたりの平均料金（料金サマリーカードに表示用）
const pricePerNight = computed(() => {
  if (!priceCalculation.value || numberOfNights.value === 0) return 0;
  return Math.floor(subtotal.value / numberOfNights.value);
});

// ゲスト情報（ログインユーザーから自動取得）
const guestName = computed(() => appUser.value?.displayName || "");
const guestEmail = computed(() => appUser.value?.email || "");
const guestPhone = ref(""); // 電話番号はアカウントに無い可能性があるため入力式
const guestPostalCode = ref("");
const guestAddress = ref("");
const guestOccupation = ref("");
const isForeignNational = ref(false);
const guestNationality = ref("");
const guestPassportNumber = ref("");
const isSearchingAddress = ref(false);

// 法人予約関連
const isCorporate = ref(false);
const companyName = ref("");
const invoiceRequired = ref(false);

// 郵便番号入力時の自動フォーマット
const onPostalCodeInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/[^0-9]/g, "");
  if (value.length > 3) {
    value = value.slice(0, 3) + "-" + value.slice(3, 7);
  }
  guestPostalCode.value = value;

  // 7桁入力されたら自動検索
  if (value.replace("-", "").length === 7) {
    searchAddress();
  }
};

// 郵便番号から住所を検索
const searchAddress = async () => {
  const postalCode = guestPostalCode.value.replace("-", "");
  if (postalCode.length !== 7) return;

  isSearchingAddress.value = true;
  try {
    const response = await fetch(
      `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`,
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      guestAddress.value = result.address1 + result.address2 + result.address3;
    }
  } catch (error) {
    console.error("住所検索エラー:", error);
  } finally {
    isSearchingAddress.value = false;
  }
};

// 支払い関連（Stripe）
const paymentReady = ref(false);
const clientSecret = ref("");
const isZeroAmountBooking = ref(false); // 0円予約フラグ（100%割引時）
import type { StripeCardElement } from "@stripe/stripe-js";
let cardElement: StripeCardElement | null = null;

// 同意
const agreedToTerms = ref(false);
const isSubmitting = ref(false);

// モーダル・ローディング
const showConfirmation = ref(false);
const isProcessing = ref(false);
const showEditForm = ref(false);

// キャンセルポリシー
const cancellationPolicyDescription = ref("");

const cancellationDeadline = computed(() => {
  if (!checkInDate.value) return "";
  const date = new Date(checkInDate.value);
  date.setDate(date.getDate() - 5); // チェックイン5日前
  return `${date.getMonth() + 1}月${date.getDate()}日`;
});

// 日付フォーマット
const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 初期化処理
onMounted(async () => {
  try {
    // Payment Intentを作成
    const guestCount = adults.value + children.value;

    const result = await createPaymentIntent(
      checkInDate.value,
      checkOutDate.value,
      guestCount,
    );

    console.log("📦 Payment Intent作成結果:", result);

    // 0円予約の場合（100%割引クーポンが最初から適用されている場合など）
    if (result && result.isZeroAmount) {
      isZeroAmountBooking.value = true;
      paymentReady.value = true; // UIを表示（0円メッセージ）
      console.log("✅ 0円予約: 決済フォームは不要");
      return;
    }

    if (!result || !result.clientSecret) {
      console.error("❌ clientSecretが取得できませんでした:", result);
      throw new Error("決済の準備に失敗しました");
    }

    clientSecret.value = result.clientSecret;
    console.log(
      "✅ clientSecret取得成功:",
      result.clientSecret.substring(0, 30) + "...",
    );

    // Stripe Elementsを初期化
    const elements = await initializeElements(result.clientSecret);

    // paymentReadyをtrueにしてDOMをレンダリング
    paymentReady.value = true;

    // DOMの準備を待ってからマウント
    await nextTick();

    // Card Elementを作成してマウント
    const cardElementContainer = document.getElementById("card-element");
    if (!cardElementContainer) {
      throw new Error("決済フォーム要素が見つかりません");
    }

    // Card Elementを作成（スタイル付き、郵便番号非表示）
    cardElement = elements.create("card", {
      hidePostalCode: true, // 郵便番号フィールドを非表示
      style: {
        base: {
          fontSize: "16px",
          color: "#30313d",
          fontFamily: "system-ui, sans-serif",
          "::placeholder": {
            color: "#9ca3af",
          },
        },
        invalid: {
          color: "#df1b41",
        },
      },
    });

    console.log("🎨 Card Element作成完了、マウント開始...");
    cardElement.mount("#card-element");
    console.log("✅ Card Elementマウント完了");
  } catch (error: unknown) {
    console.error("Stripe初期化エラー:", error);
    toast.error(
      "決済フォームの準備に失敗しました。ページを再読み込みしてください。",
    );
  }
});

// バリデーション
const isFormValid = computed(() => {
  // ログイン済みユーザー情報のチェック
  if (!guestName.value || !guestEmail.value) {
    return false;
  }

  // 電話番号のチェック
  if (!guestPhone.value.trim()) {
    return false;
  }

  // 住所関連のチェック
  if (
    !guestPostalCode.value.trim() ||
    guestPostalCode.value.replace("-", "").length !== 7
  ) {
    return false;
  }
  if (!guestAddress.value.trim()) {
    return false;
  }
  if (!guestOccupation.value) {
    return false;
  }

  // 法人の場合の追加チェック
  if (isCorporate.value) {
    if (!companyName.value.trim()) {
      return false;
    }
  }

  // 外国籍の場合の追加チェック
  if (isForeignNational.value) {
    if (!guestNationality.value.trim() || !guestPassportNumber.value.trim()) {
      return false;
    }
  }

  // 決済フォームの準備完了チェック（0円予約の場合はスキップ）
  if (!isZeroAmountBooking.value && !paymentReady.value) {
    return false;
  }

  // 同意のチェック
  if (!agreedToTerms.value) return false;

  return true;
});

// 送信処理（確認モーダルを表示）
const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.warning("すべての項目を正しく入力してください");
    return;
  }

  // 確認モーダルを表示
  showConfirmation.value = true;
};

// 決済処理の実行
const proceedToPayment = async () => {
  showConfirmation.value = false;
  isProcessing.value = true;
  isSubmitting.value = true;

  try {
    let paymentIntentId = "";

    // 0円予約でない場合のみPayment Intentを更新
    if (!isZeroAmountBooking.value && clientSecret.value) {
      // Payment Intentのmetadataを更新（最新のゲスト情報を含める）
      await $fetch("/api/stripe/update-payment-intent", {
        method: "POST",
        body: {
          paymentIntentId: clientSecret.value.split("_secret_")[0],
          metadata: {
            guestName: guestName.value,
            guestEmail: guestEmail.value,
            guestPhone: guestPhone.value,
            checkIn: checkInDate.value,
            checkOut: checkOutDate.value,
            guests: `大人${adults.value}人${children.value > 0 ? `、子ども${children.value}人` : ""}${infants.value > 0 ? `、乳幼児${infants.value}人` : ""}`,
            totalAmount: finalTotalAmount.value.toString(),
            discount:
              couponDiscountAmount.value > 0
                ? `-¥${couponDiscountAmount.value}`
                : "なし",
            couponCode: appliedCoupon.value?.code || "なし",
            options:
              selectedOptions.value.map((o) => o.name).join("、") || "なし",
          },
        },
      });

      paymentIntentId = clientSecret.value.split("_secret_")[0];
    }

    // サーバーサイドAPIで予約を作成（Firebase Admin SDK使用）
    const bookingResult = await $fetch<{
      success: boolean;
      bookingId?: string;
      message?: string;
    }>("/api/bookings/create-booking", {
      method: "POST",
      body: {
        userId: user.value?.uid || "",
        checkInDate: checkInDate.value,
        checkOutDate: checkOutDate.value,
        guestCount: adults.value + children.value,
        guestName: guestName.value,
        guestEmail: guestEmail.value,
        guestPhone: guestPhone.value,
        guestPostalCode: guestPostalCode.value,
        guestAddress: guestAddress.value,
        guestOccupation: guestOccupation.value,
        isForeignNational: isForeignNational.value,
        guestNationality: isForeignNational.value
          ? guestNationality.value
          : undefined,
        guestPassportNumber: isForeignNational.value
          ? guestPassportNumber.value
          : undefined,
        isCorporate: isCorporate.value,
        companyName: isCorporate.value ? companyName.value : undefined,
        invoiceRequired: isCorporate.value ? invoiceRequired.value : false,
        totalAmount: finalTotalAmount.value,
        baseAmount: subtotal.value,
        cleaningFee: cleaningFee.value,
        couponDiscount: couponDiscountAmount.value,
        couponCode: appliedCoupon.value?.code || "",
        notes: "",
        selectedOptions: selectedOptions.value,
        optionsTotalPrice: optionsTotalPrice.value,
        stripePaymentIntentId: paymentIntentId,
      },
    });

    if (!bookingResult.success) {
      throw new Error(bookingResult.message || "予約の作成に失敗しました");
    }

    const bookingId = bookingResult.bookingId;
    console.log("✅ 予約作成成功:", bookingId);

    // クーポン使用回数を更新
    if (appliedCoupon.value?.id) {
      await incrementCouponUsage(appliedCoupon.value.id);
      console.log("✅ クーポン使用回数を更新:", appliedCoupon.value.code);
    }

    // 0円予約の場合は決済スキップして完了ページへ
    if (isZeroAmountBooking.value) {
      console.log("✅ 0円予約: 決済をスキップして完了ページへ");
      router.push({
        path: "/booking/complete",
        query: {
          booking_id: bookingId,
          email: guestEmail.value,
          zero_amount: "true",
        },
      });
      return;
    }

    // Stripe決済を確定（Card Element用）
    // ローカル開発環境（HTTP）ではStripe決済が制限されるため、テスト環境では決済をスキップ
    const isLocalDev = window.location.hostname === "localhost";

    if (isLocalDev) {
      // ローカル開発: 決済スキップして完了ページへ
      console.log("🔧 ローカル開発環境: 決済をスキップします");
      router.push({
        path: "/booking/complete",
        query: {
          payment_intent: paymentIntentId,
          booking_id: bookingId,
          email: guestEmail.value,
        },
      });
    } else {
      // 本番環境: 実際に決済を実行
      if (!cardElement) {
        throw new Error("カード情報が入力されていません");
      }
      const paymentIntent = await confirmCardPayment(
        clientSecret.value,
        cardElement,
      );

      // 決済成功後、完了ページにリダイレクト
      // requires_capture: 与信確保成功（審査待ち）
      // succeeded: 即時決済成功
      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "requires_capture")
      ) {
        router.push({
          path: "/booking/complete",
          query: {
            payment_intent: paymentIntent.id,
            booking_id: bookingId,
            email: guestEmail.value,
          },
        });
      }
    }
  } catch (error: unknown) {
    console.error("予約・決済エラー:", error);
    const message =
      error instanceof Error ? error.message : "予約・決済の処理に失敗しました";
    toast.error(message);
    isProcessing.value = false;
    isSubmitting.value = false;
  }
};

// SEO設定
useHead({
  title: "予約をリクエスト | 家具の家 No.1",
  meta: [{ name: "robots", content: "noindex" }],
});
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>
