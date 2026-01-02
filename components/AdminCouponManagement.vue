<template>
  <div class="space-y-6">
    <!-- クーポン一覧 -->
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-semibold">クーポン管理</h2>
          <p class="text-sm text-gray-600 mt-1">割引クーポンの作成・管理ができます</p>
        </div>
        <button @click="openCreateModal" class="btn-primary">
          + 新規作成
        </button>
      </div>

      <!-- クーポンリスト -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">コード</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">割引内容</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">有効期間</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">使用状況</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">ステータス</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="coupon in coupons" :key="coupon.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-mono font-semibold">
                {{ coupon.code }}
              </td>
              <td class="px-4 py-3 text-sm">
                <span v-if="coupon.discountType === 'percentage'" class="text-purple-600">
                  {{ coupon.discountValue }}% OFF
                </span>
                <span v-else class="text-purple-600">
                  ¥{{ coupon.discountValue.toLocaleString() }} OFF
                </span>
                <div v-if="coupon.minAmount" class="text-xs text-gray-500 mt-1">
                  最低金額: ¥{{ coupon.minAmount.toLocaleString() }}
                </div>
              </td>
              <td class="px-4 py-3 text-sm">
                <div>{{ formatDate(coupon.validFrom) }}</div>
                <div class="text-gray-500">〜 {{ formatDate(coupon.validUntil) }}</div>
              </td>
              <td class="px-4 py-3 text-sm">
                <div>{{ coupon.usageCount }}回使用</div>
                <div v-if="coupon.usageLimit" class="text-xs text-gray-500">
                  上限: {{ coupon.usageLimit }}回
                </div>
              </td>
              <td class="px-4 py-3 text-sm">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs',
                    coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]"
                >
                  {{ coupon.isActive ? '有効' : '無効' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm space-x-2">
                <button
                  @click="editCoupon(coupon)"
                  class="text-purple-600 hover:text-purple-800"
                >
                  編集
                </button>
                <button
                  @click="toggleCoupon(coupon)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  {{ coupon.isActive ? '無効化' : '有効化' }}
                </button>
                <button
                  @click="deleteCoupon(coupon.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  削除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="coupons.length === 0" class="text-center py-12 text-gray-500">
        クーポンがありません。新規作成してください。
      </div>
    </div>

    <!-- クーポン作成/編集モーダル -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold mb-4">
          {{ editingCoupon ? 'クーポン編集' : 'クーポン新規作成' }}
        </h3>

        <form @submit.prevent="saveCoupon" class="space-y-4">
          <!-- クーポンコード -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              クーポンコード <span class="text-red-500">*</span>
            </label>
            <input
              v-model="couponForm.code"
              type="text"
              class="w-full px-3 py-2 border rounded-lg uppercase"
              placeholder="例: WELCOME50"
              required
            />
            <p class="text-xs text-gray-500 mt-1">大文字英数字で入力してください</p>
          </div>

          <!-- 割引タイプ -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              割引タイプ <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-4">
              <label class="flex items-center">
                <input
                  v-model="couponForm.discountType"
                  type="radio"
                  value="percentage"
                  class="mr-2"
                />
                <span>割引率（%）</span>
              </label>
              <label class="flex items-center">
                <input
                  v-model="couponForm.discountType"
                  type="radio"
                  value="fixed"
                  class="mr-2"
                />
                <span>固定額（円）</span>
              </label>
            </div>
          </div>

          <!-- 割引値 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              割引{{ couponForm.discountType === 'percentage' ? '率' : '額' }}
              <span class="text-red-500">*</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="couponForm.discountValue"
                type="number"
                class="flex-1 px-3 py-2 border rounded-lg"
                :placeholder="couponForm.discountType === 'percentage' ? '例: 25' : '例: 5000'"
                :min="couponForm.discountType === 'percentage' ? 1 : 100"
                :max="couponForm.discountType === 'percentage' ? 100 : undefined"
                required
              />
              <span class="text-gray-600">
                {{ couponForm.discountType === 'percentage' ? '%' : '円' }}
              </span>
            </div>
          </div>

          <!-- 最低利用金額 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              最低利用金額（任意）
            </label>
            <input
              v-model.number="couponForm.minAmount"
              type="number"
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="例: 10000"
              step="1000"
            />
            <p class="text-xs text-gray-500 mt-1">
              この金額以上の予約でのみ使用可能
            </p>
          </div>

          <!-- 最大割引額（割引率の場合のみ） -->
          <div v-if="couponForm.discountType === 'percentage'">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              最大割引額（任意）
            </label>
            <input
              v-model.number="couponForm.maxDiscount"
              type="number"
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="例: 20000"
              step="1000"
            />
            <p class="text-xs text-gray-500 mt-1">
              割引額の上限を設定
            </p>
          </div>

          <!-- 有効期間 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                有効開始日 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="couponForm.validFrom"
                type="date"
                class="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                有効終了日 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="couponForm.validUntil"
                type="date"
                class="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <!-- 使用回数制限 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              使用回数制限（任意）
            </label>
            <input
              v-model.number="couponForm.usageLimit"
              type="number"
              class="w-full px-3 py-2 border rounded-lg"
              placeholder="無制限"
              min="1"
            />
            <p class="text-xs text-gray-500 mt-1">
              空欄の場合は無制限
            </p>
          </div>

          <!-- ステータス -->
          <div>
            <label class="flex items-center">
              <input
                v-model="couponForm.isActive"
                type="checkbox"
                class="mr-2"
              />
              <span class="text-sm font-medium text-gray-700">有効にする</span>
            </label>
          </div>

          <!-- ボタン -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              class="btn-primary px-6"
            >
              {{ editingCoupon ? '更新' : '作成' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Coupon } from '~/types'

// クーポンリスト
const coupons = ref<Coupon[]>([])

// モーダル表示
const showModal = ref(false)
const editingCoupon = ref<Coupon | null>(null)

// クーポンフォーム
const couponForm = reactive({
  code: '',
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: 0,
  minAmount: undefined as number | undefined,
  maxDiscount: undefined as number | undefined,
  validFrom: '',
  validUntil: '',
  usageLimit: undefined as number | undefined,
  isActive: true
})

// 初期化時にローカルストレージから読み込み
onMounted(() => {
  loadCoupons()
})

function loadCoupons() {
  try {
    const stored = localStorage.getItem('coupons')
    if (stored) {
      coupons.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('クーポンの読み込みエラー:', e)
  }
}

function saveCoupons() {
  try {
    localStorage.setItem('coupons', JSON.stringify(coupons.value))
  } catch (e) {
    console.error('クーポンの保存エラー:', e)
  }
}

function openCreateModal() {
  editingCoupon.value = null
  resetForm()
  showModal.value = true
}

function editCoupon(coupon: Coupon) {
  editingCoupon.value = coupon
  couponForm.code = coupon.code
  couponForm.discountType = coupon.discountType
  couponForm.discountValue = coupon.discountValue
  couponForm.minAmount = coupon.minAmount
  couponForm.maxDiscount = coupon.maxDiscount
  couponForm.validFrom = new Date(coupon.validFrom.toDate()).toISOString().split('T')[0]
  couponForm.validUntil = new Date(coupon.validUntil.toDate()).toISOString().split('T')[0]
  couponForm.usageLimit = coupon.usageLimit
  couponForm.isActive = coupon.isActive
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function resetForm() {
  couponForm.code = ''
  couponForm.discountType = 'percentage'
  couponForm.discountValue = 0
  couponForm.minAmount = undefined
  couponForm.maxDiscount = undefined
  couponForm.validFrom = ''
  couponForm.validUntil = ''
  couponForm.usageLimit = undefined
  couponForm.isActive = true
}

function saveCoupon() {
  const newCoupon: Coupon = {
    id: editingCoupon.value?.id || `coupon-${Date.now()}`,
    code: couponForm.code.toUpperCase(),
    discountType: couponForm.discountType,
    discountValue: couponForm.discountValue,
    minAmount: couponForm.minAmount,
    maxDiscount: couponForm.maxDiscount,
    validFrom: { toDate: () => new Date(couponForm.validFrom) } as any,
    validUntil: { toDate: () => new Date(couponForm.validUntil) } as any,
    usageLimit: couponForm.usageLimit,
    usageCount: editingCoupon.value?.usageCount || 0,
    isActive: couponForm.isActive,
    createdAt: editingCoupon.value?.createdAt || { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any
  }

  if (editingCoupon.value) {
    // 更新
    const index = coupons.value.findIndex(c => c.id === editingCoupon.value!.id)
    if (index !== -1) {
      coupons.value[index] = newCoupon
    }
  } else {
    // 新規作成
    coupons.value.push(newCoupon)
  }

  saveCoupons()
  closeModal()
  alert(`クーポン「${newCoupon.code}」を${editingCoupon.value ? '更新' : '作成'}しました`)
}

function toggleCoupon(coupon: Coupon) {
  coupon.isActive = !coupon.isActive
  saveCoupons()
}

function deleteCoupon(id: string) {
  if (!confirm('このクーポンを削除しますか？')) return

  const index = coupons.value.findIndex(c => c.id === id)
  if (index !== -1) {
    coupons.value.splice(index, 1)
    saveCoupons()
    alert('クーポンを削除しました')
  }
}

function formatDate(timestamp: any): string {
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}
</script>
