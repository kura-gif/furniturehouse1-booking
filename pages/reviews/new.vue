<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <div class="max-w-2xl mx-auto px-6 py-12 mt-16">
      <div class="bg-white rounded-lg shadow-md p-8">
        <h1 class="text-2xl font-medium mb-6" style="color: #231815">
          レビューを投稿
        </h1>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- 評価 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              総合評価 <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                @click="formData.rating = star"
                class="text-3xl transition-colors"
                :class="
                  star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'
                "
              >
                ★
              </button>
            </div>
            <p v-if="formData.rating > 0" class="text-sm text-gray-600 mt-1">
              {{ ratingLabels[formData.rating - 1] }}
            </p>
          </div>

          <!-- 宿泊時期 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              宿泊時期
            </label>
            <input
              v-model="formData.stayDate"
              type="text"
              placeholder="例：2024年11月"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <!-- 宿泊人数 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              宿泊人数
            </label>
            <select
              v-model="formData.stayType"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              <option value="1名">1名</option>
              <option value="2名">2名</option>
              <option value="3名">3名</option>
              <option value="4名">4名</option>
            </select>
          </div>

          <!-- コメント -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              レビュー <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="formData.comment"
              rows="6"
              placeholder="宿泊体験についてご自由にお書きください"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            ></textarea>
            <p class="text-sm text-gray-500 mt-1">
              {{ formData.comment.length }} / 500文字
            </p>
          </div>

          <!-- レビューのお願い -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-gray-700">
              レビューのお願い：体験談が他の方の参考になるようレビューのご協力をお願いします。投稿レビューは管理者の承認後、匿名で公開させていただきます。
            </p>
          </div>

          <!-- エラーメッセージ -->
          <div
            v-if="errorMessage"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p class="text-sm text-red-700">{{ errorMessage }}</p>
          </div>

          <!-- 送信ボタン -->
          <div class="flex gap-4">
            <button
              type="button"
              @click="$router.back()"
              class="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="flex-1 px-6 py-3 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              "
            >
              {{ isSubmitting ? "投稿中..." : "レビューを投稿" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import type { CreateReviewRequest } from "~/types";

definePageMeta({
  layout: false,
  middleware: "auth",
});

const { createReview } = useReviews();
const router = useRouter();
const toast = useToast();

// フォームデータ
const formData = reactive<CreateReviewRequest>({
  rating: 0,
  comment: "",
  stayDate: "",
  stayType: "",
});

const isSubmitting = ref(false);
const errorMessage = ref("");

// 評価ラベル
const ratingLabels = ["最悪", "不満", "普通", "良い", "最高"];

// フォームのバリデーション
const isFormValid = computed(() => {
  return (
    formData.rating > 0 &&
    formData.comment.trim().length > 0 &&
    formData.comment.length <= 500
  );
});

// フォーム送信
const handleSubmit = async () => {
  if (!isFormValid.value) {
    errorMessage.value = "評価とレビューは必須です";
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = "";

  try {
    await createReview(formData);

    // 成功メッセージを表示してマイページに戻る
    toast.success("レビューを投稿しました。管理者の承認をお待ちください。");
    router.push("/mypage");
  } catch (error: unknown) {
    console.error("レビュー投稿エラー:", error);
    errorMessage.value =
      error instanceof Error ? error.message : "レビューの投稿に失敗しました";
  } finally {
    isSubmitting.value = false;
  }
};

// SEO設定
useHead({
  title: "レビューを投稿 | 家具の家 No.1",
  meta: [{ name: "robots", content: "noindex" }],
});
</script>
