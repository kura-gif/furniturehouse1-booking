<template>
  <div class="guide-page guide-organic-bg">
    <!-- タイトル -->
    <header class="text-center pt-6 pb-4 px-4">
      <h1 class="guide-title text-xl sm:text-2xl">建築を守るためのお願い</h1>
    </header>

    <div class="px-4 sm:px-6 pb-8">
      <div class="max-w-md mx-auto">
        <!-- ルールリスト -->
        <section class="mb-6">
          <div v-for="(rule, index) in rules" :key="index">
            <div class="divider-line"></div>
            <p class="py-4 text-sm text-organic-text leading-relaxed">
              {{ rule }}
            </p>
          </div>
          <div class="divider-line"></div>
        </section>

        <!-- 同意チェック（認証済みかつ未同意の場合のみ） -->
        <section v-if="showAgreement" class="mb-6">
          <div class="bg-white p-4 shadow-sm">
            <label class="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                v-model="agreed"
                class="mt-0.5 w-5 h-5 text-organic-accent border-organic-border focus:ring-organic-accent"
              />
              <span class="text-sm text-organic-text"
                >上記のルールを読み、同意します</span
              >
            </label>
            <button
              v-if="agreed"
              @click="submitAgreement"
              :disabled="submitting"
              class="mt-4 w-full py-3 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              style="background-color: #5c5347"
            >
              {{ submitting ? "送信中..." : "同意を送信" }}
            </button>
          </div>
        </section>

        <!-- 同意完了メッセージ -->
        <section v-if="agreementSuccess || alreadyAgreed" class="mb-6">
          <div
            class="bg-white p-4 text-center border-l-4 border-green-500 shadow-sm"
          >
            <p class="text-sm text-organic-text">同意を記録しました</p>
          </div>
        </section>

        <!-- 最後のメッセージ -->
        <p class="text-center text-sm text-organic-text-light mb-10">
          ルールを守って、素敵な滞在をお楽しみください
        </p>

        <!-- 線画イラスト（建築物） -->
        <div class="text-center opacity-60">
          <svg
            class="w-52 h-28 mx-auto"
            viewBox="0 0 210 80"
            fill="none"
            stroke="#8B7355"
            stroke-width="0.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <!-- 基礎ライン -->
            <line x1="15" y1="70" x2="195" y2="70" />
            <!-- 建物本体 -->
            <rect x="30" y="30" width="150" height="40" />
            <!-- 屋根 -->
            <line x1="22" y1="30" x2="188" y2="30" />
            <line x1="22" y1="28" x2="188" y2="28" />
            <!-- 柱 -->
            <line x1="48" y1="30" x2="48" y2="70" />
            <line x1="65" y1="30" x2="65" y2="70" />
            <line x1="145" y1="30" x2="145" y2="70" />
            <line x1="162" y1="30" x2="162" y2="70" />
            <!-- 中央開口 -->
            <rect x="70" y="35" width="70" height="32" />
            <line x1="93" y1="35" x2="93" y2="67" />
            <line x1="117" y1="35" x2="117" y2="67" />
            <!-- デッキ -->
            <line x1="30" y1="70" x2="30" y2="75" />
            <line x1="180" y1="70" x2="180" y2="75" />
            <rect x="25" y="75" width="160" height="2" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGuideState } from "~/middleware/guest-guide";

definePageMeta({
  layout: "guide",
  middleware: ["guest-guide"],
});

const { t } = useI18n();
const { recordRulesAgreement } = useGuestGuide();

const guideState = useGuideState();
const isAuthenticated = computed(
  () => guideState.value?.isAuthenticated ?? false,
);
const alreadyAgreed = computed(() => guideState.value?.rulesAgreed ?? false);

const showAgreement = computed(
  () =>
    isAuthenticated.value && !alreadyAgreed.value && !agreementSuccess.value,
);
const agreed = ref(false);
const submitting = ref(false);
const agreementSuccess = ref(false);

// シンプルなルールテキスト
const rules = [
  "館内は禁煙です。火気の使用はお控えください。",
  "館内では靴をお脱ぎください。",
  "展示物や家具にお手を触れないようお願いいたします。",
  "お静かにお過ごしいただきますよう、お願い申し上げます。",
];

const submitAgreement = async () => {
  if (!guideState.value?.tokenData) return;

  submitting.value = true;
  try {
    const tokenData = guideState.value.tokenData;
    await recordRulesAgreement(
      tokenData.id,
      tokenData.bookingId,
      tokenData.bookingReference,
      tokenData.guestName,
      tokenData.guestEmail,
    );
    agreementSuccess.value = true;
    if (guideState.value) {
      guideState.value.rulesAgreed = true;
    }
  } catch (e) {
    console.error("Failed to record agreement:", e);
  } finally {
    submitting.value = false;
  }
};

useHead({ title: "建築を守るためのお願い | ガイドブック" });
</script>

<style scoped>
.guide-page {
  max-width: 100%;
  overflow-x: hidden;
}

.divider-line {
  border-top: 1px solid #e8e2d9;
}
</style>
