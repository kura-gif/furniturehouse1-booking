<template>
  <div class="space-y-6">
    <!-- シーズン期間設定 -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-semibold">シーズン期間設定</h2>
          <p class="text-sm text-gray-600 mt-1">各シーズンの期間を設定します</p>
        </div>
        <button @click="addSeasonPeriod" class="btn-primary">
          + 期間を追加
        </button>
      </div>

      <div class="space-y-4">
        <div
          v-for="(period, index) in pricingSettings.seasonPeriods"
          :key="index"
          class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
        >
          <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">シーズン</label>
              <select
                v-model="period.seasonType"
                class="w-full px-3 py-2 border rounded-lg text-sm"
              >
                <option value="off">オフシーズン</option>
                <option value="regular">レギュラー</option>
                <option value="high">ハイシーズン</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">開始日</label>
              <input
                v-model="period.startDate"
                type="text"
                placeholder="MM-DD"
                class="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">終了日</label>
              <input
                v-model="period.endDate"
                type="text"
                placeholder="MM-DD"
                class="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">説明</label>
              <input
                v-model="period.description"
                type="text"
                placeholder="例: 春のハイシーズン"
                class="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          </div>
          <button
            @click="removeSeasonPeriod(index)"
            class="text-red-600 hover:text-red-800 p-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 料金レート設定 -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-semibold">料金レート設定</h2>
          <p class="text-sm text-gray-600 mt-1">条件別の料金を設定します</p>
        </div>
        <button @click="generateAllRates" class="btn-secondary">
          全パターンを自動生成
        </button>
      </div>

      <!-- フィルター -->
      <div class="mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">シーズン</label>
          <select v-model="rateFilter.seasonType" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">すべて</option>
            <option value="off">オフシーズン</option>
            <option value="regular">レギュラー</option>
            <option value="high">ハイシーズン</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">泊数</label>
          <select v-model="rateFilter.nightCategory" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">すべて</option>
            <option value="1night">1泊</option>
            <option value="2nights">2泊</option>
            <option value="3nights_plus">3泊以上</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">曜日タイプ</label>
          <select v-model="rateFilter.dayType" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">すべて</option>
            <option value="weekday">平日</option>
            <option value="weekend">休日前日</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">宿泊者数</label>
          <select v-model="rateFilter.guestCount" class="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="">すべて</option>
            <option value="1">1名</option>
            <option value="2">2名</option>
            <option value="3">3名</option>
            <option value="4">4名</option>
          </select>
        </div>
      </div>

      <!-- レート一覧 -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">シーズン</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">泊数</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">曜日</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">人数</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">料金</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(rate, index) in filteredRates" :key="index" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm">
                <span :class="getSeasonBadgeClass(rate.seasonType)">
                  {{ getSeasonLabel(rate.seasonType) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm">{{ getNightLabel(rate.nightCategory) }}</td>
              <td class="px-4 py-3 text-sm">{{ rate.dayType === 'weekday' ? '平日' : '休日前日' }}</td>
              <td class="px-4 py-3 text-sm">{{ rate.guestCount }}名</td>
              <td class="px-4 py-3 text-sm">
                <input
                  v-model.number="rate.pricePerNight"
                  type="number"
                  class="w-32 px-2 py-1 border rounded text-sm"
                  step="1000"
                />
              </td>
              <td class="px-4 py-3 text-sm">
                <button
                  @click="removeRate(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  削除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredRates.length === 0" class="text-center py-8 text-gray-500">
        該当する料金レートがありません
      </div>
    </div>

    <!-- 保存ボタン -->
    <div class="flex justify-end gap-4">
      <button @click="resetToDefault" class="btn-secondary">
        デフォルトに戻す
      </button>
      <button @click="savePricingSettings" class="btn-primary">
        保存する
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { createDemoPricingSetting } from '~/composables/usePricing'
import type { DetailedPricingSetting, SeasonType, NightCategory, DayType, SeasonPeriod, PriceRate } from '~/types'

// 料金設定（編集可能）
const pricingSettings = reactive<DetailedPricingSetting>(createDemoPricingSetting())

// 初期化時にローカルストレージから読み込み
onMounted(() => {
  loadSettings()
})

function loadSettings() {
  try {
    const stored = localStorage.getItem('pricingSettings')
    if (stored) {
      const loaded = JSON.parse(stored)
      pricingSettings.seasonPeriods = loaded.seasonPeriods
      pricingSettings.priceRates = loaded.priceRates
    }
  } catch (e) {
    console.error('設定の読み込みエラー:', e)
  }
}

// フィルター
const rateFilter = reactive({
  seasonType: '' as SeasonType | '',
  nightCategory: '' as NightCategory | '',
  dayType: '' as DayType | '',
  guestCount: '' as number | ''
})

// フィルタリングされた料金レート
const filteredRates = computed(() => {
  return pricingSettings.priceRates.filter(rate => {
    if (rateFilter.seasonType && rate.seasonType !== rateFilter.seasonType) return false
    if (rateFilter.nightCategory && rate.nightCategory !== rateFilter.nightCategory) return false
    if (rateFilter.dayType && rate.dayType !== rateFilter.dayType) return false
    if (rateFilter.guestCount && rate.guestCount !== Number(rateFilter.guestCount)) return false
    return true
  })
})

// シーズン期間を追加
function addSeasonPeriod() {
  pricingSettings.seasonPeriods.push({
    seasonType: 'regular',
    startDate: '01-01',
    endDate: '01-31',
    description: ''
  })
}

// シーズン期間を削除
function removeSeasonPeriod(index: number) {
  if (confirm('この期間を削除しますか?')) {
    pricingSettings.seasonPeriods.splice(index, 1)
  }
}

// 料金レートを削除
function removeRate(index: number) {
  const actualIndex = pricingSettings.priceRates.findIndex(r =>
    filteredRates.value[index] === r
  )
  if (actualIndex !== -1 && confirm('この料金レートを削除しますか?')) {
    pricingSettings.priceRates.splice(actualIndex, 1)
  }
}

// 全パターンの料金レートを自動生成
function generateAllRates() {
  if (!confirm('すべての料金レートを自動生成しますか？既存のレートは上書きされます。')) {
    return
  }

  const seasons: SeasonType[] = ['regular', 'high', 'off']
  const nightCategories: NightCategory[] = ['1night', '2nights', '3nights_plus']
  const dayTypes: DayType[] = ['weekday', 'weekend']
  const guestCounts = [1, 2, 3, 4]

  const basePrices = {
    regular: { weekday: { '1night': 35000, '2nights': 33000, '3nights_plus': 31000 }, weekend: { '1night': 45000, '2nights': 43000, '3nights_plus': 41000 } },
    high: { weekday: { '1night': 45000, '2nights': 43000, '3nights_plus': 41000 }, weekend: { '1night': 55000, '2nights': 53000, '3nights_plus': 51000 } },
    off: { weekday: { '1night': 25000, '2nights': 23000, '3nights_plus': 21000 }, weekend: { '1night': 30000, '2nights': 28000, '3nights_plus': 26000 } }
  }

  const guestAdditions = {
    1: 0,
    2: 10000,
    3: 18000,
    4: 25000
  }

  pricingSettings.priceRates = []

  for (const season of seasons) {
    for (const nightCat of nightCategories) {
      for (const dayType of dayTypes) {
        for (const guestCount of guestCounts) {
          const basePrice = basePrices[season][dayType][nightCat]
          const guestAddition = guestAdditions[guestCount as keyof typeof guestAdditions]

          pricingSettings.priceRates.push({
            seasonType: season,
            nightCategory: nightCat,
            dayType: dayType,
            guestCount,
            pricePerNight: basePrice + guestAddition
          })
        }
      }
    }
  }

  alert(`${pricingSettings.priceRates.length}件の料金レートを生成しました`)
}

// デフォルトに戻す
function resetToDefault() {
  if (!confirm('デフォルトの設定に戻しますか？')) {
    return
  }
  const defaultSettings = createDemoPricingSetting()
  pricingSettings.seasonPeriods = defaultSettings.seasonPeriods
  pricingSettings.priceRates = defaultSettings.priceRates

  // ローカルストレージから削除
  localStorage.removeItem('pricingSettings')
  alert('デフォルト設定に戻しました')
}

// 保存
function savePricingSettings() {
  try {
    // ローカルストレージに保存
    localStorage.setItem('pricingSettings', JSON.stringify(pricingSettings))
    alert('料金設定を保存しました！\n予約ページで新しい料金が適用されます。')
  } catch (e) {
    console.error('保存エラー:', e)
    alert('保存に失敗しました')
  }
}

// ラベル取得関数
function getSeasonLabel(seasonType: SeasonType): string {
  const labels = {
    off: 'オフ',
    regular: 'レギュラー',
    high: 'ハイ'
  }
  return labels[seasonType]
}

function getNightLabel(nightCategory: NightCategory): string {
  const labels = {
    '1night': '1泊',
    '2nights': '2泊',
    '3nights_plus': '3泊以上'
  }
  return labels[nightCategory]
}

function getSeasonBadgeClass(seasonType: SeasonType): string {
  const classes = {
    off: 'px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800',
    regular: 'px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800',
    high: 'px-2 py-1 rounded-full text-xs bg-red-100 text-red-800'
  }
  return classes[seasonType]
}
</script>
