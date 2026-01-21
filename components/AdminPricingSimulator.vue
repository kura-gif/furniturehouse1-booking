<template>
  <div class="card sticky top-4">
    <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
      <span>💰</span>
      <span>料金シミュレーター</span>
    </h3>

    <!-- 入力フォーム -->
    <div class="space-y-4 mb-6">
      <!-- チェックイン -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          チェックイン
        </label>
        <input
          v-model="checkInDate"
          type="date"
          class="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <!-- チェックアウト -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          チェックアウト
        </label>
        <input
          v-model="checkOutDate"
          type="date"
          class="w-full px-3 py-2 border rounded-lg"
        />
        <p v-if="numberOfNights > 0" class="text-xs text-gray-500 mt-1">
          {{ numberOfNights }}泊
        </p>
      </div>

      <!-- 宿泊者 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          大人
        </label>
        <input
          v-model.number="adultCount"
          type="number"
          min="1"
          max="6"
          class="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <!-- 子供 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          子供
        </label>
        <div class="space-y-2">
          <div
            v-for="(age, index) in childrenAges"
            :key="index"
            class="flex items-center gap-2"
          >
            <input
              v-model.number="childrenAges[index]"
              type="number"
              min="0"
              max="17"
              placeholder="年齢"
              class="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              @click="removeChild(index)"
              class="text-red-600 hover:text-red-800 text-sm"
            >
              削除
            </button>
          </div>
          <button
            @click="addChild"
            class="text-purple-600 hover:text-purple-800 text-sm"
          >
            + 子供を追加
          </button>
        </div>
      </div>

      <!-- クーポン -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          クーポン割引率
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="couponDiscountPercent"
            type="number"
            min="0"
            max="100"
            class="flex-1 px-3 py-2 border rounded-lg"
          />
          <span class="text-gray-500">%</span>
        </div>
      </div>
    </div>

    <div class="border-t pt-4">
      <!-- 料金内訳 -->
      <div v-if="calculation" class="space-y-4">
        <div class="text-sm font-medium text-gray-700 mb-2">📊 料金内訳</div>

        <!-- 各泊の詳細 -->
        <div
          v-for="night in calculation.nightlyBreakdown"
          :key="night.nightNumber"
          class="p-3 bg-gray-50 rounded-lg text-sm"
        >
          <div class="font-medium mb-2">
            【{{ night.nightNumber }}泊目】{{ night.date }}
            <span class="text-xs text-gray-500">
              {{ getSeasonLabel(night.seasonType) }}・{{
                getDayTypeLabel(night.dayType)
              }}
            </span>
          </div>

          <div class="space-y-1 text-xs text-gray-600">
            <div>
              基本(1〜2人) ¥{{
                (night.basePriceAfterAdjustments ?? 0).toLocaleString()
              }}
            </div>

            <div v-if="night.guestCountCharges?.guest3rd">
              + 3人目 ¥{{
                (night.guestCountCharges?.guest3rd ?? 0).toLocaleString()
              }}
            </div>
            <div v-if="night.guestCountCharges?.guest4th">
              + 4人目 ¥{{
                (night.guestCountCharges?.guest4th ?? 0).toLocaleString()
              }}
            </div>
            <div v-if="night.guestCountCharges?.guest5th">
              + 5人目 ¥{{
                (night.guestCountCharges?.guest5th ?? 0).toLocaleString()
              }}
            </div>
            <div v-if="night.guestCountCharges?.guest6th">
              + 6人目 ¥{{
                (night.guestCountCharges?.guest6th ?? 0).toLocaleString()
              }}
            </div>

            <div v-if="(night.childCharges?.total ?? 0) > 0">
              + 子供料金 ¥{{
                (night.childCharges?.total ?? 0).toLocaleString()
              }}
              <span class="text-gray-500">
                ({{ night.childCharges?.discountedChildren ?? 0 }}名)
              </span>
            </div>

            <div class="pt-1 border-t font-medium text-gray-700">
              小計: ¥{{
                (night.subtotalBeforeNightRate ?? 0).toLocaleString()
              }}
              × {{ Math.round((night.nightRate ?? 1) * 100) }}% = ¥{{
                (night.nightTotal ?? 0).toLocaleString()
              }}
            </div>
          </div>
        </div>

        <!-- 合計 -->
        <div class="border-t pt-3 space-y-2">
          <div class="flex justify-between text-sm">
            <span>合計</span>
            <span class="font-medium"
              >¥{{ (calculation.subtotal ?? 0).toLocaleString() }}</span
            >
          </div>

          <div
            v-if="(calculation.couponDiscount ?? 0) > 0"
            class="flex justify-between text-sm text-green-600"
          >
            <span>クーポン -{{ couponDiscountPercent }}%</span>
            <span
              >-¥{{ (calculation.couponDiscount ?? 0).toLocaleString() }}</span
            >
          </div>

          <div class="border-t pt-2">
            <div class="flex justify-between items-center">
              <span class="text-lg font-semibold">💴 お支払い金額</span>
              <span class="text-2xl font-bold text-purple-600">
                ¥{{ calculation.totalAmount.toLocaleString() }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 pt-2">
            <div>
              1泊あたり平均: ¥{{
                (
                  calculation.summary?.averagePricePerNight ?? 0
                ).toLocaleString()
              }}
            </div>
            <div>
              1人あたり平均: ¥{{
                (
                  calculation.summary?.averagePricePerPerson ?? 0
                ).toLocaleString()
              }}
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-sm text-gray-500 text-center py-4">
        日付を選択してください
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useEnhancedPricing } from "~/composables/useEnhancedPricing";
import type { SeasonType, DayType } from "~/types";

const { calculatePrice } = useEnhancedPricing();

// フォーム入力
const checkInDate = ref("");
const checkOutDate = ref("");
const adultCount = ref(2);
const childrenAges = ref<number[]>([]);
const couponDiscountPercent = ref(0);

// 泊数計算
const numberOfNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 0;

  const start = new Date(checkInDate.value);
  const end = new Date(checkOutDate.value);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

// 料金計算
const calculation = computed(() => {
  if (!checkInDate.value || !checkOutDate.value || numberOfNights.value <= 0) {
    return null;
  }

  try {
    return calculatePrice(
      new Date(checkInDate.value),
      new Date(checkOutDate.value),
      adultCount.value,
      childrenAges.value,
      couponDiscountPercent.value / 100,
    );
  } catch (e) {
    console.error("料金計算エラー:", e);
    return null;
  }
});

// 子供を追加
function addChild() {
  childrenAges.value.push(10);
}

// 子供を削除
function removeChild(index: number) {
  childrenAges.value.splice(index, 1);
}

// ラベル取得
function getSeasonLabel(seasonType: SeasonType): string {
  const labels = {
    off: "オフ",
    regular: "レギュラー",
    high: "ハイ",
  };
  return labels[seasonType];
}

function getDayTypeLabel(dayType: DayType): string {
  return dayType === "weekday" ? "平日" : "休日前日";
}

// デフォルト日付を設定
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date();
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

checkInDate.value = tomorrow.toISOString().split("T")[0];
checkOutDate.value = dayAfterTomorrow.toISOString().split("T")[0];
</script>
