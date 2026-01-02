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
          <span>キャンセルポリシー</span>
        </p>
      </div>

      <!-- タイトル -->
      <h1 class="text-4xl font-medium mb-8" style="color: #231815; font-weight: 500;">
        キャンセルポリシー
      </h1>

      <!-- 本文 -->
      <div class="prose prose-gray max-w-none">
        <div class="mb-8 text-gray-700" style="line-height: 1.8;">
          <p>
            家具の家 No.1のキャンセルポリシーをご確認ください。ご予約の変更・キャンセルは、予約サイトからお手続きいただけます。
          </p>
        </div>

        <!-- キャンセル料金表 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            キャンセル料金
          </h2>
          <div class="overflow-x-auto">
            <table class="min-w-full border border-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                    キャンセル日時
                  </th>
                  <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-300">
                    キャンセル料
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-700">
                    利用日の<strong>3日前まで</strong>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700">
                    <span class="font-semibold text-green-600">無料</span>
                  </td>
                </tr>
                <tr class="bg-gray-50">
                  <td class="px-6 py-4 text-sm text-gray-700">
                    利用日の<strong>2日前～当日</strong>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700">
                    <span class="font-semibold text-red-600">利用料金の100%</span><br />
                    <span class="text-xs text-gray-500">（清掃料等を含む）</span>
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 text-sm text-gray-700">
                    <strong>無断キャンセル</strong>（不泊）
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-700">
                    <span class="font-semibold text-red-600">利用料金の100%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- キャンセル手続き -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            キャンセル手続き
          </h2>
          <div class="space-y-4 text-gray-700">
            <div class="bg-blue-50 border-l-4 border-blue-500 p-6">
              <h3 class="font-semibold text-blue-900 mb-2">予約サイトからキャンセル</h3>
              <p style="line-height: 1.8;">
                ご予約時にご利用いただいた予約サイトにログインし、「予約の管理」または「キャンセル」メニューからお手続きください。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">メールでのお問い合わせ</h3>
              <p style="line-height: 1.8;">
                予約サイトからキャンセルできない場合は、
                <a href="mailto:furniturehouse1@chladni.co.jp" class="text-indigo-600 hover:underline">
                  furniturehouse1@chladni.co.jp
                </a>
                までご連絡ください。
              </p>
            </div>
          </div>
        </section>

        <!-- 例外事項 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            例外事項
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8;" class="mb-4">
              以下の場合、キャンセル料は発生しません：
            </p>
            <ul class="list-disc list-inside space-y-2 ml-4" style="line-height: 1.8;">
              <li>悪天候や自然災害等で当社が施設の利用が危険と判断した場合</li>
              <li>施設の設備故障等により利用が不可能となった場合</li>
              <li>その他、やむを得ない事由により当社が利用不可と判断した場合</li>
            </ul>
            <p style="line-height: 1.8;" class="mt-4">
              返金が生じる場合は、予約サイトの決済手段・規定に従って返金いたします。
            </p>
          </div>
        </section>

        <!-- 予約変更について -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            予約の変更について
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8;">
              宿泊日の変更をご希望の場合は、一度キャンセルの上、新たにご予約ください。変更時期によってはキャンセル料が発生する場合がございますので、お早めにお手続きください。
            </p>
          </div>
        </section>

        <!-- 注意事項 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            注意事項
          </h2>
          <div class="text-gray-700">
            <ul class="list-disc list-inside space-y-2 ml-4" style="line-height: 1.8;">
              <li>キャンセル料の計算は、施設利用日を基準とします</li>
              <li>キャンセル料には、基本利用料金および清掃料等の追加料金が含まれます</li>
              <li>返金処理には、決済方法により数日～数週間かかる場合があります</li>
              <li>詳細は<NuxtLink to="/terms" class="text-indigo-600 hover:underline">利用規約</NuxtLink>をご確認ください</li>
            </ul>
          </div>
        </section>

        <!-- お問い合わせ -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-3">キャンセルに関するお問い合わせ</h3>
            <p class="text-sm text-gray-600 mb-4">
              キャンセルポリシーや手続きに関するご質問は、以下までお気軽にお問い合わせください。
            </p>
            <p class="text-sm">
              <strong>株式会社クラドニ</strong><br />
              Email: <a href="mailto:furniturehouse1@chladni.co.jp" class="text-indigo-600 hover:underline">
                furniturehouse1@chladni.co.jp
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- フッター -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

// SEO設定
useHead({
  title: 'キャンセルポリシー | 家具の家 No.1',
  meta: [
    { name: 'description', content: '家具の家 No.1のキャンセルポリシー。予約のキャンセル料金、手続き方法をご確認ください。' },
    { property: 'og:title', content: 'キャンセルポリシー | 家具の家 No.1' },
    { property: 'og:description', content: '家具の家 No.1のキャンセルポリシー' },
    { name: 'robots', content: 'index, follow' }
  ]
})
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

.prose h3 {
  color: #231815;
}

.prose a {
  color: #4f46e5;
  text-decoration: none;
}

.prose a:hover {
  text-decoration: underline;
}

/* テーブルスタイル */
table {
  border-collapse: collapse;
}
</style>
