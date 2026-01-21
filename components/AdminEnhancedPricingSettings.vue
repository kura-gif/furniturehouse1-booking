<template>
  <div class="card">
    <h2 class="text-2xl font-semibold mb-6">拡張料金設定</h2>

    <!-- ステップナビゲーション -->
    <div class="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        v-for="step in steps"
        :key="step.id"
        @click="currentStep = step.id"
        :class="[
          'p-4 rounded-lg border-2 transition-all text-left',
          currentStep === step.id
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 hover:border-purple-300',
        ]"
      >
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold">{{ step.label }}</span>
          <span v-if="step.completed" class="text-green-600">✓</span>
        </div>
        <div class="text-xs text-gray-600">{{ step.description }}</div>
      </button>
    </div>

    <!-- Step 1: 基本料金設定 -->
    <div v-if="currentStep === 1" class="space-y-6">
      <h3 class="text-lg font-semibold">① 基本料金設定</h3>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Regular平日 大人1〜2人1泊の基準価格
        </label>
        <div class="flex items-center gap-2">
          <span class="text-gray-600">¥</span>
          <input
            v-model.number="settings.basePrice"
            type="number"
            step="1000"
            min="0"
            class="w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <span class="text-gray-600">円/泊</span>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          💡 1人でも2人でも同じ料金です。3人目以降は別途追加料金が発生します
        </p>
      </div>

      <div class="border-t border-gray-200 pt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          清掃料金（1予約あたり）
        </label>
        <div class="flex items-center gap-2">
          <span class="text-gray-600">¥</span>
          <input
            v-model.number="settings.cleaningFee"
            type="number"
            step="500"
            min="0"
            class="w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <span class="text-gray-600">円</span>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          💡 チェックアウト後の清掃費用です。予約ごとに1回加算されます
        </p>
      </div>

      <button @click="saveSettings" class="btn-primary">設定を保存</button>
    </div>

    <!-- Step 2: 人数別追加料金設定 -->
    <div v-if="currentStep === 2" class="space-y-6">
      <h3 class="text-lg font-semibold">② 人数別追加料金設定</h3>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          基本料金に含まれる人数
        </label>
        <p class="text-gray-900">
          1〜{{ settings.guestCountPricing.baseGuestCount }}人
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          3人目の追加料金（基本料金の割合）
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="thirdGuestRatePercent"
            type="number"
            step="1"
            min="0"
            max="100"
            class="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <span class="text-gray-600">%</span>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          計算例: ¥{{ formatPrice(settings.basePrice ?? 0) }} ×
          {{ thirdGuestRatePercent }}% = ¥{{
            formatPrice(
              Math.floor(
                ((settings.basePrice ?? 0) * thirdGuestRatePercent) / 100,
              ),
            )
          }}
        </p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-4">
          4人目以降の料金率（3人目に対する割合）
        </label>
        <div class="space-y-3">
          <div class="flex items-center gap-4">
            <span class="w-20 text-sm font-medium">4人目:</span>
            <input
              v-model.number="fourthGuestRatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span class="text-gray-600"
              >% → ¥{{ formatPrice(calculateAdditionalGuestPrice(4)) }}</span
            >
          </div>
          <div class="flex items-center gap-4">
            <span class="w-20 text-sm font-medium">5人目:</span>
            <input
              v-model.number="fifthGuestRatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span class="text-gray-600"
              >% → ¥{{ formatPrice(calculateAdditionalGuestPrice(5)) }}</span
            >
          </div>
          <div class="flex items-center gap-4">
            <span class="w-20 text-sm font-medium">6人目:</span>
            <input
              v-model.number="sixthGuestRatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span class="text-gray-600"
              >% → ¥{{ formatPrice(calculateAdditionalGuestPrice(6)) }}</span
            >
          </div>
        </div>
      </div>

      <div class="bg-blue-50 p-4 rounded-lg">
        <p class="text-sm font-semibold mb-2">
          💡 料金例（基本¥{{ formatPrice(settings.basePrice ?? 0) }}の場合）:
        </p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>・2人: ¥{{ formatPrice(calculateTotalGuestPrice(2)) }}</div>
          <div>・3人: ¥{{ formatPrice(calculateTotalGuestPrice(3)) }}</div>
          <div>・4人: ¥{{ formatPrice(calculateTotalGuestPrice(4)) }}</div>
          <div>・5人: ¥{{ formatPrice(calculateTotalGuestPrice(5)) }}</div>
          <div>・6人: ¥{{ formatPrice(calculateTotalGuestPrice(6)) }}</div>
        </div>
      </div>

      <button @click="saveSettings" class="btn-primary">設定を保存</button>
    </div>

    <!-- Step 3: 泊数別料金調整設定 -->
    <div v-if="currentStep === 3" class="space-y-6">
      <h3 class="text-lg font-semibold">③ 泊数別料金調整設定</h3>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-4">
          各泊の料金率（1泊目を基準）
        </label>
        <div class="space-y-3">
          <div class="flex items-center gap-4">
            <span class="w-32 text-sm font-medium">1泊目:</span>
            <input
              v-model.number="night1RatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              disabled
            />
            <span class="text-gray-600">%（基準）</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-32 text-sm font-medium">2泊目:</span>
            <input
              v-model.number="night2RatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span class="text-gray-600">%</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-32 text-sm font-medium">3泊目:</span>
            <input
              v-model.number="night3RatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span class="text-gray-600">%</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-32 text-sm font-medium">4泊目:</span>
            <input
              v-model.number="night4RatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span class="text-gray-600">%</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-32 text-sm font-medium">5泊目:</span>
            <input
              v-model.number="night5RatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span class="text-gray-600">%</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="w-32 text-sm font-medium">6泊目以降:</span>
            <input
              v-model.number="night6PlusRatePercent"
              type="number"
              step="1"
              min="0"
              max="100"
              class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
            <span class="text-gray-600">%（5泊目と同じ）</span>
          </div>
        </div>
      </div>

      <div class="bg-blue-50 p-4 rounded-lg">
        <p class="text-sm font-semibold mb-2">
          💡 料金例（1泊¥{{ formatPrice(settings.basePrice ?? 0) }}の場合）:
        </p>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>・1泊: ¥{{ formatPrice(calculateMultiNightPrice(1)) }}</div>
          <div>・2泊: ¥{{ formatPrice(calculateMultiNightPrice(2)) }}</div>
          <div>・3泊: ¥{{ formatPrice(calculateMultiNightPrice(3)) }}</div>
          <div>・4泊: ¥{{ formatPrice(calculateMultiNightPrice(4)) }}</div>
          <div>・5泊: ¥{{ formatPrice(calculateMultiNightPrice(5)) }}</div>
        </div>
      </div>

      <button @click="saveSettings" class="btn-primary">設定を保存</button>
    </div>

    <!-- Step 4: シーズン設定 -->
    <div v-if="currentStep === 4" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold">④ シーズン設定</h3>
        <button @click="addSeasonPeriod" class="btn-secondary text-sm">
          期間を追加
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(period, index) in settings.seasonPeriods"
          :key="index"
          class="border rounded-lg p-4"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span
                :class="[
                  'w-4 h-4 rounded-full',
                  period.seasonType === 'high'
                    ? 'bg-red-500'
                    : period.seasonType === 'off'
                      ? 'bg-blue-500'
                      : 'bg-gray-400',
                ]"
              ></span>
              <select
                v-model="period.seasonType"
                class="px-3 py-1 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="regular">レギュラーシーズン</option>
                <option value="high">ハイシーズン</option>
                <option value="off">オフシーズン</option>
              </select>
            </div>
            <button
              @click="removeSeasonPeriod(index)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              削除
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">開始日</label>
              <input
                v-model="period.startDate"
                type="text"
                placeholder="MM-DD"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">終了日</label>
              <input
                v-model="period.endDate"
                type="text"
                placeholder="MM-DD"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="block text-xs text-gray-600 mb-1">説明</label>
            <input
              v-model="period.description"
              type="text"
              placeholder="例: 春のGW期間"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1">料金倍率</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="period.multiplier"
                type="number"
                step="0.1"
                min="0"
                class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <span class="text-sm text-gray-600"
                >× （基本料金の{{
                  Math.round((period.multiplier ?? 1) * 100)
                }}%）</span
              >
            </div>
          </div>
        </div>
      </div>

      <button @click="saveSettings" class="btn-primary">設定を保存</button>
    </div>

    <!-- Step 5: 平日・休日設定 -->
    <div v-if="currentStep === 5" class="space-y-6">
      <h3 class="text-lg font-semibold">⑤ 平日・休日設定</h3>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          休日前日の料金割増率
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="weekendSurchargePercent"
            type="number"
            step="5"
            min="0"
            max="200"
            class="w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <span class="text-gray-600">%</span>
        </div>
        <p class="text-sm text-gray-600 mt-2">
          金曜・土曜・祝日前日に適用されます（100% = 追加なし、130% = 30%増し）
        </p>
      </div>

      <div class="bg-blue-50 p-4 rounded-lg">
        <p class="text-sm font-semibold mb-2">
          💡 料金例（基本¥{{ formatPrice(settings.basePrice ?? 0) }}の場合）:
        </p>
        <div class="text-sm space-y-1">
          <div>・平日: ¥{{ formatPrice(settings.basePrice ?? 0) }}</div>
          <div>
            ・休日前日: ¥{{
              formatPrice(
                Math.floor(
                  ((settings.basePrice ?? 0) * weekendSurchargePercent) / 100,
                ),
              )
            }}（{{ weekendSurchargePercent }}%）
          </div>
        </div>
      </div>

      <!-- 祝日カレンダー設定 -->
      <div class="border-t border-gray-200 pt-6 mt-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4 class="font-semibold text-gray-900">祝日カレンダー</h4>
            <p class="text-sm text-gray-600">
              祝日の前日も休日前日料金が適用されます
            </p>
          </div>
          <button @click="addHolidayYear" class="btn-secondary text-sm">
            年を追加
          </button>
        </div>

        <div
          v-if="settings.holidayCalendar && settings.holidayCalendar.length > 0"
          class="space-y-4"
        >
          <div
            v-for="(cal, calIndex) in settings.holidayCalendar"
            :key="calIndex"
            class="border rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <input
                  v-model.number="cal.year"
                  type="number"
                  min="2024"
                  max="2030"
                  class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <span class="text-gray-600">年</span>
                <span class="text-sm text-gray-500"
                  >（{{ cal.holidays.length }}件の祝日）</span
                >
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="loadJapaneseHolidays(calIndex)"
                  class="text-sm text-purple-600 hover:text-purple-800"
                >
                  日本の祝日を読み込み
                </button>
                <button
                  @click="removeHolidayYear(calIndex)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  削除
                </button>
              </div>
            </div>

            <!-- 祝日リスト -->
            <div class="space-y-2">
              <div
                v-for="(holiday, hIndex) in cal.holidays"
                :key="hIndex"
                class="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded"
              >
                <input
                  v-model="cal.holidays[hIndex]"
                  type="date"
                  class="flex-1 px-2 py-1 border rounded focus:ring-2 focus:ring-purple-500"
                />
                <span class="text-sm text-gray-600">{{
                  getHolidayName(cal.holidays[hIndex])
                }}</span>
                <button
                  @click="removeHoliday(calIndex, hIndex)"
                  class="text-red-500 hover:text-red-700"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <button
                @click="addHoliday(calIndex)"
                class="text-sm text-purple-600 hover:text-purple-800"
              >
                + 祝日を追加
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
          <p class="text-gray-500 mb-3">祝日カレンダーが設定されていません</p>
          <button @click="addHolidayYear" class="btn-secondary">
            祝日カレンダーを追加
          </button>
        </div>
      </div>

      <button @click="saveSettings" class="btn-primary">設定を保存</button>
    </div>

    <!-- Step 6: 子供料金設定 -->
    <div v-if="currentStep === 6" class="space-y-6">
      <h3 class="text-lg font-semibold">⑥ 子供料金設定</h3>

      <div class="space-y-4">
        <div
          v-for="(rule, index) in settings.childPricingRules"
          :key="index"
          class="border rounded-lg p-4"
        >
          <div class="flex items-start justify-between mb-3">
            <h4 class="font-semibold">ルール{{ index + 1 }}</h4>
            <button
              v-if="
                settings.childPricingRules &&
                settings.childPricingRules.length > 1
              "
              @click="removeChildRule(index)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              削除
            </button>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">最小年齢</label>
              <input
                v-model.number="rule.minAge"
                type="number"
                min="0"
                max="17"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">最大年齢</label>
              <input
                v-model.number="rule.maxAge"
                type="number"
                min="0"
                max="17"
                class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs text-gray-600 mb-1"
              >料金率（大人料金の割合）</label
            >
            <div class="flex items-center gap-2">
              <input
                v-model.number="rule.priceRate"
                type="number"
                step="0.1"
                min="0"
                max="1"
                class="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <span class="text-sm text-gray-600"
                >（{{ Math.round((rule.priceRate ?? 0) * 100) }}%）</span
              >
            </div>
          </div>
        </div>

        <button @click="addChildRule" class="btn-secondary text-sm">
          ルールを追加
        </button>
      </div>

      <div class="bg-blue-50 p-4 rounded-lg">
        <p class="text-sm font-semibold mb-2">💡 デフォルト設定:</p>
        <div class="text-sm space-y-1">
          <div>・0〜6歳（乳幼児）: 無料</div>
          <div>・7〜15歳（子ども）: 大人料金の50%</div>
          <div>・16歳以上（大人）: 大人料金100%</div>
        </div>
      </div>

      <button @click="saveSettings" class="btn-primary">設定を保存</button>
    </div>

    <!-- Step 7: 確認と保存 -->
    <div v-if="currentStep === 7" class="space-y-6">
      <h3 class="text-lg font-semibold">⑦ 設定の確認</h3>

      <div class="bg-gray-50 p-6 rounded-lg space-y-4">
        <div>
          <h4 class="font-semibold mb-2">基本料金</h4>
          <p>¥{{ formatPrice(settings.basePrice ?? 0) }} / 泊（大人1〜2人）</p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">清掃料金</h4>
          <p>¥{{ formatPrice(settings.cleaningFee || 0) }} / 予約</p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">人数別追加料金</h4>
          <p class="text-sm">3人目: {{ thirdGuestRatePercent }}%</p>
          <p class="text-sm">
            4人目: {{ fourthGuestRatePercent }}%、5人目:
            {{ fifthGuestRatePercent }}%、6人目: {{ sixthGuestRatePercent }}%
          </p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">泊数別料金率</h4>
          <p class="text-sm">
            2泊: {{ night2RatePercent }}%、3泊: {{ night3RatePercent }}%、4泊:
            {{ night4RatePercent }}%、5泊: {{ night5RatePercent }}%
          </p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">シーズン設定</h4>
          <p class="text-sm">
            {{ settings.seasonPeriods.length }}件の期間が設定されています
          </p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">休日前日料金率</h4>
          <p>
            {{ weekendSurchargePercent }}%（平日の{{
              weekendSurchargePercent > 100
                ? weekendSurchargePercent - 100 + "%増し"
                : weekendSurchargePercent === 100
                  ? "同額"
                  : 100 - weekendSurchargePercent + "%引き"
            }}）
          </p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">祝日カレンダー</h4>
          <p
            class="text-sm"
            v-if="
              settings.holidayCalendar && settings.holidayCalendar.length > 0
            "
          >
            {{
              settings.holidayCalendar
                .map((c) => `${c.year}年: ${c.holidays.length}件`)
                .join("、")
            }}
          </p>
          <p class="text-sm text-gray-500" v-else>未設定</p>
        </div>

        <div>
          <h4 class="font-semibold mb-2">子供料金ルール</h4>
          <p class="text-sm">
            {{
              settings.childPricingRules?.length ?? 0
            }}件のルールが設定されています
          </p>
        </div>
      </div>

      <button @click="saveSettings" class="btn-primary w-full">
        すべての設定を保存
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { EnhancedPricingSetting } from "~/types";

const currentStep = ref(1);

const steps = [
  {
    id: 1,
    label: "① 基本料金",
    description: "1泊あたりの基準価格",
    completed: false,
  },
  {
    id: 2,
    label: "② 人数別",
    description: "3人目以降の料金",
    completed: false,
  },
  {
    id: 3,
    label: "③ 泊数別",
    description: "連泊時の料金調整",
    completed: false,
  },
  {
    id: 4,
    label: "④ シーズン",
    description: "ハイ/オフシーズン",
    completed: false,
  },
  {
    id: 5,
    label: "⑤ 平日/休日",
    description: "休日前日の料金",
    completed: false,
  },
  {
    id: 6,
    label: "⑥ 子供料金",
    description: "年齢別料金ルール",
    completed: false,
  },
  { id: 7, label: "⑦ 確認", description: "設定内容の確認", completed: false },
];

const settings = reactive<EnhancedPricingSetting>({
  id: "",
  type: "stay",
  createdAt: null,
  updatedAt: null,
  basePrice: 35000,
  cleaningFee: 5000,
  guestCountPricing: {
    baseGuestCount: 2,
    thirdGuestRate: 0.5,
    additionalGuestRates: {
      fourth: 0.9,
      fifth: 0.8,
      sixth: 0.7,
    },
  },
  multiNightPricing: {
    rates: {
      night1: 1.0,
      night2: 0.9,
      night3: 0.8,
      night4: 0.7,
      night5: 0.6,
      night6Plus: 0.6,
    },
  },
  seasonPeriods: [],
  dayTypePricing: {
    weekendMultiplier: 1.3,
  },
  childPricingRules: [
    { minAge: 0, maxAge: 6, priceRate: 0 },
    { minAge: 7, maxAge: 15, priceRate: 0.5 },
  ],
  holidayCalendar: [] as { year: number; holidays: string[] }[],
});

// パーセント表示用の計算プロパティ
const thirdGuestRatePercent = computed({
  get: () => Math.round(settings.guestCountPricing.thirdGuestRate * 100),
  set: (val) => {
    settings.guestCountPricing.thirdGuestRate = val / 100;
  },
});

const fourthGuestRatePercent = computed({
  get: () =>
    Math.round(settings.guestCountPricing.additionalGuestRates.fourth * 100),
  set: (val) => {
    settings.guestCountPricing.additionalGuestRates.fourth = val / 100;
  },
});

const fifthGuestRatePercent = computed({
  get: () =>
    Math.round(settings.guestCountPricing.additionalGuestRates.fifth * 100),
  set: (val) => {
    settings.guestCountPricing.additionalGuestRates.fifth = val / 100;
  },
});

const sixthGuestRatePercent = computed({
  get: () =>
    Math.round(settings.guestCountPricing.additionalGuestRates.sixth * 100),
  set: (val) => {
    settings.guestCountPricing.additionalGuestRates.sixth = val / 100;
  },
});

const night1RatePercent = computed({
  get: () => Math.round(settings.multiNightPricing.rates.night1 * 100),
  set: (val) => {
    settings.multiNightPricing.rates.night1 = val / 100;
  },
});

const night2RatePercent = computed({
  get: () => Math.round(settings.multiNightPricing.rates.night2 * 100),
  set: (val) => {
    settings.multiNightPricing.rates.night2 = val / 100;
  },
});

const night3RatePercent = computed({
  get: () => Math.round(settings.multiNightPricing.rates.night3 * 100),
  set: (val) => {
    settings.multiNightPricing.rates.night3 = val / 100;
  },
});

const night4RatePercent = computed({
  get: () => Math.round(settings.multiNightPricing.rates.night4 * 100),
  set: (val) => {
    settings.multiNightPricing.rates.night4 = val / 100;
  },
});

const night5RatePercent = computed({
  get: () => Math.round(settings.multiNightPricing.rates.night5 * 100),
  set: (val) => {
    settings.multiNightPricing.rates.night5 = val / 100;
  },
});

const night6PlusRatePercent = computed({
  get: () => Math.round(settings.multiNightPricing.rates.night6Plus * 100),
  set: (val) => {
    settings.multiNightPricing.rates.night6Plus = val / 100;
  },
});

// 休日前日料金率（パーセント表示）
const weekendSurchargePercent = computed({
  get: () =>
    Math.round((settings.dayTypePricing?.weekendMultiplier ?? 1.3) * 100),
  set: (val) => {
    if (settings.dayTypePricing) {
      settings.dayTypePricing.weekendMultiplier = val / 100;
    }
  },
});

// 料金計算ヘルパー
function calculateAdditionalGuestPrice(guestNumber: number): number {
  const basePrice = settings.basePrice ?? 0;
  const thirdGuestPrice = Math.floor(
    basePrice * settings.guestCountPricing.thirdGuestRate,
  );

  switch (guestNumber) {
    case 4:
      return Math.floor(
        thirdGuestPrice *
          settings.guestCountPricing.additionalGuestRates.fourth,
      );
    case 5:
      return Math.floor(
        thirdGuestPrice * settings.guestCountPricing.additionalGuestRates.fifth,
      );
    case 6:
      return Math.floor(
        thirdGuestPrice * settings.guestCountPricing.additionalGuestRates.sixth,
      );
    default:
      return 0;
  }
}

function calculateTotalGuestPrice(totalGuests: number): number {
  const basePrice = settings.basePrice ?? 0;
  let total = basePrice;

  if (totalGuests >= 3) {
    total += Math.floor(basePrice * settings.guestCountPricing.thirdGuestRate);
  }
  if (totalGuests >= 4) {
    total += calculateAdditionalGuestPrice(4);
  }
  if (totalGuests >= 5) {
    total += calculateAdditionalGuestPrice(5);
  }
  if (totalGuests >= 6) {
    total += calculateAdditionalGuestPrice(6);
  }

  return total;
}

function calculateMultiNightPrice(nights: number): number {
  const basePrice = settings.basePrice ?? 0;
  let total = 0;

  for (let i = 1; i <= nights; i++) {
    let rate: number;
    switch (i) {
      case 1:
        rate = settings.multiNightPricing.rates.night1;
        break;
      case 2:
        rate = settings.multiNightPricing.rates.night2;
        break;
      case 3:
        rate = settings.multiNightPricing.rates.night3;
        break;
      case 4:
        rate = settings.multiNightPricing.rates.night4;
        break;
      case 5:
        rate = settings.multiNightPricing.rates.night5;
        break;
      default:
        rate = settings.multiNightPricing.rates.night6Plus;
    }
    total += Math.floor(basePrice * rate);
  }

  return total;
}

function formatPrice(price: number): string {
  return price.toLocaleString();
}

// シーズン期間管理
function addSeasonPeriod() {
  settings.seasonPeriods.push({
    seasonType: "high",
    startDate: "",
    endDate: "",
    description: "",
    multiplier: 1.3,
  });
}

function removeSeasonPeriod(index: number) {
  settings.seasonPeriods.splice(index, 1);
}

// 子供料金ルール管理
function addChildRule() {
  if (!settings.childPricingRules) {
    settings.childPricingRules = [];
  }
  settings.childPricingRules.push({
    minAge: 0,
    maxAge: 0,
    priceRate: 0,
  });
}

function removeChildRule(index: number) {
  if (settings.childPricingRules && settings.childPricingRules.length > 1) {
    settings.childPricingRules.splice(index, 1);
  }
}

// 祝日カレンダー管理
function addHolidayYear() {
  const currentYear = new Date().getFullYear();
  const existingYears = settings.holidayCalendar?.map((c) => c.year) || [];
  let newYear = currentYear;

  // 既存の年と重複しないように
  while (existingYears.includes(newYear)) {
    newYear++;
  }

  if (!settings.holidayCalendar) {
    settings.holidayCalendar = [];
  }
  settings.holidayCalendar.push({
    year: newYear,
    holidays: [],
  });
}

function removeHolidayYear(index: number) {
  settings.holidayCalendar?.splice(index, 1);
}

function addHoliday(calIndex: number) {
  const cal = settings.holidayCalendar?.[calIndex];
  if (cal) {
    // 今日の日付をデフォルト値として追加
    const today = new Date().toISOString().split("T")[0];
    cal.holidays.push(today);
  }
}

function removeHoliday(calIndex: number, holidayIndex: number) {
  settings.holidayCalendar?.[calIndex]?.holidays.splice(holidayIndex, 1);
}

// 日本の祝日データ（2025年・2026年）
const japaneseHolidays: Record<number, { date: string; name: string }[]> = {
  2025: [
    { date: "2025-01-01", name: "元日" },
    { date: "2025-01-13", name: "成人の日" },
    { date: "2025-02-11", name: "建国記念の日" },
    { date: "2025-02-23", name: "天皇誕生日" },
    { date: "2025-02-24", name: "天皇誕生日 振替休日" },
    { date: "2025-03-20", name: "春分の日" },
    { date: "2025-04-29", name: "昭和の日" },
    { date: "2025-05-03", name: "憲法記念日" },
    { date: "2025-05-04", name: "みどりの日" },
    { date: "2025-05-05", name: "こどもの日" },
    { date: "2025-05-06", name: "こどもの日 振替休日" },
    { date: "2025-07-21", name: "海の日" },
    { date: "2025-08-11", name: "山の日" },
    { date: "2025-09-15", name: "敬老の日" },
    { date: "2025-09-23", name: "秋分の日" },
    { date: "2025-10-13", name: "スポーツの日" },
    { date: "2025-11-03", name: "文化の日" },
    { date: "2025-11-23", name: "勤労感謝の日" },
    { date: "2025-11-24", name: "勤労感謝の日 振替休日" },
  ],
  2026: [
    { date: "2026-01-01", name: "元日" },
    { date: "2026-01-12", name: "成人の日" },
    { date: "2026-02-11", name: "建国記念の日" },
    { date: "2026-02-23", name: "天皇誕生日" },
    { date: "2026-03-20", name: "春分の日" },
    { date: "2026-04-29", name: "昭和の日" },
    { date: "2026-05-03", name: "憲法記念日" },
    { date: "2026-05-04", name: "みどりの日" },
    { date: "2026-05-05", name: "こどもの日" },
    { date: "2026-05-06", name: "こどもの日 振替休日" },
    { date: "2026-07-20", name: "海の日" },
    { date: "2026-08-11", name: "山の日" },
    { date: "2026-09-21", name: "敬老の日" },
    { date: "2026-09-22", name: "国民の休日" },
    { date: "2026-09-23", name: "秋分の日" },
    { date: "2026-10-12", name: "スポーツの日" },
    { date: "2026-11-03", name: "文化の日" },
    { date: "2026-11-23", name: "勤労感謝の日" },
  ],
};

function loadJapaneseHolidays(calIndex: number) {
  const cal = settings.holidayCalendar?.[calIndex];
  if (!cal) return;

  const holidays = japaneseHolidays[cal.year];
  if (holidays) {
    cal.holidays = holidays.map((h) => h.date);
    alert(`${cal.year}年の日本の祝日（${holidays.length}件）を読み込みました`);
  } else {
    alert(
      `${cal.year}年の祝日データがありません。2025年または2026年を選択してください。`,
    );
  }
}

function getHolidayName(dateStr: string): string {
  if (!dateStr) return "";

  const year = parseInt(dateStr.split("-")[0]);
  const holidays = japaneseHolidays[year];
  if (holidays) {
    const holiday = holidays.find((h) => h.date === dateStr);
    if (holiday) return holiday.name;
  }
  return "";
}

// データの読み込みと保存
async function loadSettings() {
  try {
    const { $db } = useNuxtApp();

    if (!$db) {
      console.warn("Firestore not initialized yet");
      return;
    }

    // アクティブな設定を探す
    const settingsQuery = query(
      collection($db, "enhancedPricingSettings"),
      where("isActive", "==", true),
    );
    const querySnapshot = await getDocs(settingsQuery);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data() as EnhancedPricingSetting;
      Object.assign(settings, data);
      console.log("✅ 料金設定を読み込みました");
    } else {
      // データがない場合はデフォルトを使用
      console.log("⚠️ 料金設定が見つかりません。デフォルト値を使用します");
    }
  } catch (error) {
    console.error("料金設定の読み込みエラー:", error);
  }
}

async function saveSettings() {
  try {
    const { $db } = useNuxtApp();

    if (!$db) {
      alert("Firestoreが初期化されていません。ページをリロードしてください。");
      return;
    }

    const docRef = doc($db, "enhancedPricingSettings", "default");
    await setDoc(docRef, {
      ...settings,
      isActive: true,
      updatedAt: new Date(),
    });
    alert("料金設定を保存しました");
  } catch (error) {
    console.error("料金設定の保存エラー:", error);
    alert("料金設定の保存に失敗しました: " + (error as Error).message);
  }
}

onMounted(async () => {
  // Firestoreが初期化されるまで少し待つ
  await new Promise((resolve) => setTimeout(resolve, 200));
  await loadSettings();
});
</script>
