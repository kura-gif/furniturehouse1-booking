<template>
  <div class="guide-page guide-organic-bg">
    <!-- タイトル -->
    <header class="text-center pt-6 pb-4 px-4">
      <h1 class="guide-title text-xl sm:text-2xl">Wi-Fiのご案内</h1>
    </header>

    <div class="px-4 sm:px-6 pb-8">
      <div class="max-w-md mx-auto">
        <!-- ネットワーク名 -->
        <section class="mb-6">
          <p class="text-xs text-organic-text-light mb-1.5">ネットワーク名</p>
          <div class="divider-line"></div>
          <p class="py-3 text-lg font-medium text-organic-text tracking-wide">
            Furniture-a
          </p>
          <div class="divider-line"></div>
          <p class="py-3 text-lg font-medium text-organic-text tracking-wide">
            Furniture-b
          </p>
          <div class="divider-line"></div>
        </section>

        <!-- パスワード -->
        <section class="mb-6">
          <p class="text-xs text-organic-text-light mb-1.5">パスワード</p>
          <div class="divider-line"></div>
          <div class="py-3 flex items-center justify-between">
            <p class="text-lg font-medium text-organic-text tracking-wide">
              House-01
            </p>
            <button
              @click="copyPassword"
              class="px-3 py-1.5 text-xs border border-organic-button text-organic-button hover:bg-organic-button hover:text-white transition-colors"
            >
              {{ copied ? "コピー済み" : "コピー" }}
            </button>
          </div>
          <div class="divider-line"></div>
        </section>

        <!-- 接続方法 -->
        <section class="mb-8">
          <h2 class="guide-title text-base mb-4">接続方法</h2>
          <ol class="space-y-3">
            <li
              v-for="(step, index) in steps"
              :key="index"
              class="flex items-start gap-3"
            >
              <span
                class="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-medium text-organic-accent border border-organic-accent"
              >
                {{ index + 1 }}
              </span>
              <span class="text-sm text-organic-text pt-0.5">{{ step }}</span>
            </li>
          </ol>
        </section>

        <!-- 注意事項 -->
        <section class="mb-10">
          <div class="bg-white p-4 border-l-4 border-organic-accent shadow-sm">
            <h3 class="text-sm font-medium text-organic-text mb-2">ご注意</h3>
            <ul class="text-xs text-organic-text-light space-y-1.5">
              <li>• 2つのネットワークはどちらも同じパスワードです</li>
              <li>• 電波状況により接続が不安定な場合があります</li>
              <li>• 接続できない場合はホストまでご連絡ください</li>
            </ul>
          </div>
        </section>

        <!-- 線画イラスト -->
        <div class="text-center opacity-60">
          <svg
            class="w-40 h-24 mx-auto"
            viewBox="0 0 160 60"
            fill="none"
            stroke="#8B7355"
            stroke-width="0.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <!-- 観葉植物 -->
            <path d="M25 55 L25 38" />
            <path d="M25 42 C21 38, 17 34, 19 28" />
            <path d="M25 40 C29 36, 33 32, 31 26" />
            <path d="M25 37 C23 33, 21 29, 23 24" />
            <path d="M25 35 C27 31, 29 27, 27 22" />
            <ellipse cx="25" cy="57" rx="6" ry="2" />
            <!-- サイドテーブル -->
            <rect x="95" y="32" width="40" height="23" />
            <line x1="95" y1="44" x2="135" y2="44" />
            <circle cx="104" cy="38" r="1.5" />
            <circle cx="126" cy="38" r="1.5" />
            <circle cx="104" cy="50" r="1.5" />
            <circle cx="126" cy="50" r="1.5" />
            <line x1="100" y1="55" x2="100" y2="60" />
            <line x1="130" y1="55" x2="130" y2="60" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "guide",
  middleware: ["guest-guide"],
});

const { t } = useI18n();
const copied = ref(false);

const steps = [
  "スマートフォンやPCの設定画面を開く",
  "Wi-Fi設定から「Furniture-a」または「Furniture-b」を選択",
  "パスワード「House-01」を入力",
  "接続完了",
];

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText("House-01");
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (e) {
    console.error("Failed to copy:", e);
  }
};

useHead({ title: "Wi-Fi | ガイドブック" });
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
