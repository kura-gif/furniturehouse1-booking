<template>
  <div class="min-h-screen bg-white">
    <!-- ヘッダー -->
    <AppHeader />

    <!-- メインコンテンツ -->
    <div class="max-w-4xl mx-auto px-6 md:px-12 py-12">
      <!-- パンくず -->
      <div class="mb-8">
        <p class="text-sm text-gray-600">
          <NuxtLink to="/" class="hover:underline">ホーム</NuxtLink>
          <span class="mx-2">›</span>
          <span>プライバシーポリシー</span>
        </p>
      </div>

      <!-- タイトル -->
      <h1
        class="text-4xl font-medium mb-8"
        style="color: #231815; font-weight: 500"
      >
        プライバシーポリシー
      </h1>

      <!-- 本文 -->
      <div class="prose prose-gray max-w-none">
        <div class="mb-8 text-gray-700" style="line-height: 1.8">
          <p>
            株式会社クラドニ（以下「当社」）は、保養所「家具の家」の利用者の皆様の個人情報を以下のとおり取り扱います。
          </p>
        </div>

        <!-- 1. 取得する個人情報 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            1. 取得する個人情報
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              氏名、住所、電話番号、メールアドレス、利用人数、宿泊日、チェックイン・チェックアウト記録、アンケート回答、お問い合わせ内容、ウェブサイトアクセス情報。
            </p>
          </div>
        </section>

        <!-- 2. 利用目的 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            2. 利用目的
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              予約受付・管理、利用案内・連絡、料金決済、お問い合わせ対応、アンケート実施、緊急連絡、法令対応。
            </p>
          </div>
        </section>

        <!-- 3. 第三者への提供 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            3. 第三者への提供
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              以下の場合を除き、第三者に提供しません：
            </p>
            <ul
              class="list-disc list-inside space-y-2 ml-4 mt-4"
              style="line-height: 1.8"
            >
              <li>ご本人の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産保護に必要な場合</li>
              <li>公衆衛生向上・児童健全育成に必要な場合</li>
              <li>国の機関等への協力が必要な場合</li>
              <li>業務委託先への提供（適切な監督）</li>
              <li>事業承継の場合</li>
            </ul>
          </div>
        </section>

        <!-- 4. 個人情報の管理 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            4. 個人情報の管理
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              不正アクセス、紛失、破壊、改ざん、漏洩等を防止するため、適切に管理します。
            </p>
          </div>
        </section>

        <!-- 5. 保管期間 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            5. 保管期間
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              原則として1年間保管します。法令で定めがある場合はその期間に従います。
            </p>
          </div>
        </section>

        <!-- 6. 個人情報に関する権利 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            6. 個人情報に関する権利
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              開示、訂正、追加、削除、利用停止、消去、第三者への提供停止を求める権利があります。お問い合わせ窓口までご連絡ください。
            </p>
          </div>
        </section>

        <!-- 7. Cookie等の利用 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            7. Cookie等の利用
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              ウェブサイト利用状況分析のため、Cookie等を利用する場合があります。ブラウザ設定で無効にできますが、一部機能が利用できなくなる可能性があります。
            </p>
          </div>
        </section>

        <!-- 8. 他サイトへのリンク -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            8. 他サイトへのリンク
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              リンク先のウェブサイトにおける個人情報の取り扱いについて、当社は責任を負いません。各サイトのプライバシーポリシーをご確認ください。
            </p>
          </div>
        </section>

        <!-- 9. 国際的なデータ移転 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            9. 国際的なデータ移転
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              現時点では、海外への移転予定はありません。
            </p>
          </div>
        </section>

        <!-- 10. 未成年者の個人情報 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            10. 未成年者の個人情報
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">成人と同様に取り扱います。</p>
          </div>
        </section>

        <!-- 11. プライバシーポリシーの変更 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            11. プライバシーポリシーの変更
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              法令・社会情勢等の変化に伴い、予告なく変更することがあります。変更後のポリシーはウェブサイト掲載時から効力を生じます。
            </p>
          </div>
        </section>

        <!-- 12. お問い合わせ窓口 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            12. お問い合わせ窓口
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              株式会社クラドニ<br />
              <a
                href="mailto:furniturehouse1@chladni.co.jp"
                class="text-indigo-600 hover:underline"
              >
                furniturehouse1@chladni.co.jp
              </a>
            </p>
          </div>
        </section>

        <!-- 13. 附則 -->
        <section class="mb-12">
          <h2
            class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200"
            style="color: #231815"
          >
            13. 附則
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8">
              本ポリシーは、2025年1月1日から施行します。
            </p>
          </div>
        </section>

        <!-- お問い合わせ -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            個人情報の取り扱いに関するご質問は、
            <a
              href="mailto:furniturehouse1@chladni.co.jp"
              class="text-indigo-600 hover:underline"
            >
              furniturehouse1@chladni.co.jp
            </a>
            までお問い合わせください。
          </p>
        </div>
      </div>
    </div>

    <!-- フッター -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
});

// SEO設定
useHead({
  title: "プライバシーポリシー | 家具の家 No.1",
  meta: [
    {
      name: "description",
      content:
        "家具の家 No.1のプライバシーポリシー。個人情報の取り扱いについてご確認ください。",
    },
    { property: "og:title", content: "プライバシーポリシー | 家具の家 No.1" },
    {
      property: "og:description",
      content: "家具の家 No.1のプライバシーポリシー",
    },
    { name: "robots", content: "index, follow" },
  ],
});
</script>

<style scoped>
/* プロースタイル調整 */
.prose {
  max-width: none;
}

.prose h2 {
  color: #231815;
  font-weight: 500;
}

.prose a {
  color: #4f46e5;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}
</style>
