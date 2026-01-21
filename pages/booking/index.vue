<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <!-- パンくずリスト -->
    <div class="bg-white border-b border-gray-200 mt-16">
      <Breadcrumb :items="breadcrumbItems" />
    </div>

    <div class="max-w-6xl mx-auto px-4 py-12">
      <!-- ヘッダー -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">宿泊日程を選択</h1>
        <p class="text-gray-600">
          カレンダーから希望の日程と料金を確認できます
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- 左側: ゲスト選択とカレンダー -->
        <div class="lg:col-span-2 space-y-6">
          <!-- ゲスト選択 -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold mb-4">宿泊人数</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- 大人（16歳以上） -->
              <div class="border rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  大人
                  <span class="text-xs text-gray-500 ml-1">(16歳以上)</span>
                </label>
                <div class="flex items-center gap-4">
                  <button
                    @click="decrementAdults"
                    :disabled="adults <= 1"
                    class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      class="w-5 h-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span
                    class="text-xl font-semibold min-w-[40px] text-center"
                    >{{ adults }}</span
                  >
                  <button
                    @click="incrementAdults"
                    :disabled="totalGuests >= 6"
                    class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      class="w-5 h-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 子ども（7〜15歳） -->
              <div class="border rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  子ども
                  <span class="text-xs text-gray-500 ml-1">(7〜15歳・50%)</span>
                </label>
                <div class="flex items-center gap-4">
                  <button
                    @click="decrementChildren"
                    :disabled="children <= 0"
                    class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      class="w-5 h-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span
                    class="text-xl font-semibold min-w-[40px] text-center"
                    >{{ children }}</span
                  >
                  <button
                    @click="incrementChildren"
                    :disabled="totalGuests >= 6"
                    class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      class="w-5 h-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 乳幼児（0〜6歳） -->
              <div class="border rounded-lg p-4">
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  乳幼児
                  <span class="text-xs text-gray-500 ml-1">(0〜6歳・無料)</span>
                </label>
                <div class="flex items-center gap-4">
                  <button
                    @click="decrementInfants"
                    :disabled="infants <= 0"
                    class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      class="w-5 h-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <span
                    class="text-xl font-semibold min-w-[40px] text-center"
                    >{{ infants }}</span
                  >
                  <button
                    @click="incrementInfants"
                    :disabled="totalGuests >= 6"
                    class="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg
                      class="w-5 h-5 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-500 mt-3">
              ※ 最大6名様までご利用いただけます
            </p>
          </div>

          <!-- カレンダー -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold mb-4">宿泊日程を選択</h2>
            <PricingCalendar
              v-model:modelCheckIn="checkInDate"
              v-model:modelCheckOut="checkOutDate"
              :adults="adults"
              :children="children"
              @datesSelected="handleDatesSelected"
            />
          </div>

          <!-- 注意事項 -->
          <div class="card p-6 bg-blue-50 border-blue-200">
            <div class="flex gap-3">
              <svg
                class="w-6 h-6 text-blue-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div class="text-sm text-gray-700">
                <p class="font-semibold mb-1">料金について</p>
                <ul class="space-y-1 list-disc list-inside">
                  <li>表示料金は1泊あたりの金額です</li>
                  <li>シーズンや曜日により料金が変動します</li>
                  <li>祝日・週末は追加料金が発生する場合があります</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- 右側: 予約サマリー -->
        <div class="lg:col-span-1">
          <div class="card p-6 sticky top-24">
            <h2 class="text-lg font-semibold mb-4">予約内容</h2>

            <div class="space-y-4">
              <!-- 日程 -->
              <div class="pb-4 border-b border-gray-200">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-gray-600">チェックイン</span>
                  <span class="font-semibold">{{
                    checkInDate ? formatDisplayDate(checkInDate) : "未選択"
                  }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">チェックアウト</span>
                  <span class="font-semibold">{{
                    checkOutDate ? formatDisplayDate(checkOutDate) : "未選択"
                  }}</span>
                </div>
                <div v-if="nights > 0" class="mt-2 text-sm text-gray-600">
                  {{ nights }}泊{{ nights + 1 }}日
                </div>
              </div>

              <!-- 人数 -->
              <div class="pb-4 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">宿泊人数</span>
                  <span class="font-semibold">
                    大人{{ adults }}名
                    <span v-if="children > 0">・子ども{{ children }}名</span>
                    <span v-if="infants > 0">・乳幼児{{ infants }}名</span>
                  </span>
                </div>
              </div>

              <!-- 料金 -->
              <div v-if="totalPrice > 0" class="pb-4 border-b border-gray-200">
                <div
                  class="flex items-center justify-between text-lg font-bold"
                >
                  <span>合計</span>
                  <span class="text-purple-600"
                    >¥{{ formatPrice(totalPrice) }}</span
                  >
                </div>
                <p class="text-xs text-gray-500 mt-1">税込価格</p>
              </div>

              <!-- ボタン -->
              <button
                @click="handleProceedToRequest"
                :disabled="!canProceed"
                class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                予約をリクエスト
              </button>

              <p class="text-xs text-gray-500 text-center">
                この段階ではまだ予約は確定していません
              </p>
            </div>

            <!-- キャンセルポリシー -->
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex items-center gap-2 mb-3">
                <svg
                  class="w-5 h-5 text-gray-500"
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
                <h3 class="text-sm font-semibold text-gray-700">
                  キャンセルポリシー
                </h3>
              </div>
              <div
                v-if="cancellationPolicyDescription"
                class="text-xs text-gray-600 space-y-1"
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
              <div v-else class="text-xs text-gray-600 space-y-1">
                <p>• チェックイン5日前まで: 全額返金</p>
                <p>• チェックイン3〜4日前: 50%返金</p>
                <p>• チェックイン2日前以降: 返金不可</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

definePageMeta({
  layout: false,
});

const router = useRouter();
const route = useRoute();
const { getActivePolicy, generatePolicyDescription } = useCancellationPolicy();

// パンくずリスト
const breadcrumbItems = [
  { label: "家具の家 No.1 予約サイト", path: "/" },
  { label: "宿泊日程を選択" },
];

// クエリパラメータから初期値を取得
const adults = ref(parseInt(route.query.adults as string) || 1);
const children = ref(parseInt(route.query.children as string) || 0);
const infants = ref(parseInt(route.query.infants as string) || 0);
const checkInDate = ref((route.query.checkIn as string) || "");
const checkOutDate = ref((route.query.checkOut as string) || "");

// キャンセルポリシー
const cancellationPolicyDescription = ref("");

// 合計ゲスト数
const totalGuests = computed(
  () => adults.value + children.value + infants.value,
);

// 人数調整
function incrementAdults() {
  if (totalGuests.value < 6) {
    adults.value++;
  }
}

function decrementAdults() {
  if (adults.value > 1) {
    adults.value--;
  }
}

function incrementChildren() {
  if (totalGuests.value < 6) {
    children.value++;
  }
}

function decrementChildren() {
  if (children.value > 0) {
    children.value--;
  }
}

function incrementInfants() {
  if (totalGuests.value < 6) {
    infants.value++;
  }
}

function decrementInfants() {
  if (infants.value > 0) {
    infants.value--;
  }
}

// 計算されたプロパティ
const nights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 0;
  const checkIn = new Date(checkInDate.value);
  const checkOut = new Date(checkOutDate.value);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

const totalPrice = ref(0);

const canProceed = computed(() => {
  return checkInDate.value && checkOutDate.value && adults.value > 0;
});

// 日付選択時のハンドラー
function handleDatesSelected(
  checkIn: string,
  checkOut: string,
  nightsCount: number,
  price: number,
) {
  totalPrice.value = price;
}

// 予約リクエストページへ進む
function handleProceedToRequest() {
  if (!canProceed.value) return;

  const query: Record<string, string> = {
    checkIn: checkInDate.value,
    checkOut: checkOutDate.value,
    adults: adults.value.toString(),
    children: children.value.toString(),
    infants: infants.value.toString(),
  };

  // promoパラメータがある場合は引き継ぐ
  if (route.query.promo) {
    query.promo = route.query.promo as string;
  }

  router.push({
    path: "/booking/request",
    query,
  });
}

// 日付フォーマット
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatPrice(price: number): string {
  return price.toLocaleString();
}

// キャンセルポリシーをロード
async function loadCancellationPolicy() {
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
}

onMounted(() => {
  loadCancellationPolicy();
});

// SEO設定
useHead({
  title: "宿泊日程を選択 | 家具の家 No.1",
  meta: [
    {
      name: "description",
      content:
        "カレンダーから宿泊日程と料金を確認して予約をリクエストできます。",
    },
    { name: "robots", content: "noindex, nofollow" },
  ],
});
</script>
