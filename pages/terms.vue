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
          <span>利用規約</span>
        </p>
      </div>

      <!-- タイトル -->
      <h1 class="text-4xl font-medium mb-8" style="color: #231815; font-weight: 500;">
        利用規約
      </h1>

      <!-- 本文 -->
      <div class="prose prose-gray max-w-none">
        <div class="mb-8 text-gray-700" style="line-height: 1.8;">
          <p>
            本規約は、株式会社クラドニ（以下「当社」）が所有・管理する保養所「家具の家」（以下「本施設」）の利用条件を定めるものです。
          </p>
          <p class="mt-4">
            本施設は、当社の福利厚生および当社関係者の保養・滞在を主目的として運用されており、ホテル・旅館のような常駐スタッフによる接客サービスはありません。
          </p>
          <p class="mt-4">
            本施設の利用は、当社の承認を得た方の保養・滞在に限り、当社の裁量により運用します。
          </p>
          <p class="mt-4">
            当社指定の申込サイト（予約サイト。以下「申込サイト」）を通じてお申し込みいただいた場合、本規約に同意したものとみなします。なお、予約は当社による内容確認および承認（確認）をもって成立します。
          </p>
        </div>

        <!-- 1. 予約と利用資格 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            1. 予約と利用資格
          </h2>
          <div class="space-y-4 text-gray-700">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">予約方法</h3>
              <p style="line-height: 1.8;">
                当社指定の申込サイトからお申し込みください。お申し込み後、当社が内容を確認し、当社が承認（確認）した場合に予約が成立します。クレジットカード決済は申込サイト上で行っていただき、決済完了後に当社の承認（確認）通知をもって予約が確定します。（当社が承認しない場合、予約は成立せず、決済済みの料金は所定の方法で返金します。）
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">利用資格</h3>
              <p style="line-height: 1.8;">
                当社社員・家族、取引先、当社の知人・招待者とその知人、別途審査で承認された方。当社は、利用資格を満たさない場合や規約違反の可能性がある場合、予約を拒否または取消すことがあります。審査に関するお問い合わせには回答できません。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">利用目的の確認</h3>
              <p style="line-height: 1.8;">
                本施設の性質上、当社は必要に応じて利用目的・利用人数等の確認を行うことがあります。
              </p>
            </div>
          </div>
        </section>

        <!-- 2. 利用料金 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            2. 利用料金
          </h2>
          <div class="space-y-4 text-gray-700">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">料金</h3>
              <p style="line-height: 1.8;">
                基本利用料金は宿泊日等により変動します。清掃料等の追加料金がかかる場合があります。詳細は申込サイトでご確認ください。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">利用料金の定義</h3>
              <p style="line-height: 1.8;">
                本規約における「利用料金」とは、基本利用料金に加え、清掃料その他申込サイト上で表示される追加料金（必要に応じて税・手数料等を含む）を合算した総額をいいます。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">ペット同伴料（設定がある場合）</h3>
              <p style="line-height: 1.8;">
                ペット同伴をご希望の場合、申込サイトに表示されるペット同伴料（または追加清掃費等）が別途発生します。ペット同伴の申告がない場合、当社は同伴をお断りし、または追加費用をお願いすることがあります。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">支払</h3>
              <p style="line-height: 1.8;">
                予約確定のため、申込サイトにてクレジットカード決済をお願いします。
              </p>
            </div>
          </div>
        </section>

        <!-- 3. 利用方法 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            3. 利用方法
          </h2>
          <div class="space-y-4 text-gray-700">
            <ul class="list-disc list-inside space-y-2" style="line-height: 1.8;">
              <li><strong>チェックイン:</strong> 13:00以降（スマートロック利用、詳細は別途案内）</li>
              <li><strong>チェックアウト:</strong> 11:00まで（時間厳守）</li>
              <li><strong>利用人数:</strong> 最大6名まで</li>
            </ul>
          </div>
        </section>

        <!-- 4. キャンセル -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            4. キャンセル
          </h2>
          <div class="space-y-4 text-gray-700">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">手続き</h3>
              <p style="line-height: 1.8;">
                申込サイトから行ってください。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">キャンセル料</h3>
              <ul class="list-disc list-inside space-y-2 ml-4" style="line-height: 1.8;">
                <li>利用日の3日前まで：無料</li>
                <li>利用日の2日前～当日・不泊：利用料金の100%（清掃料等を含む）</li>
                <li>例外：悪天候や災害等で当社が危険と判断した場合や施設利用が不可能となった場合はキャンセル料は発生しません。返金が生じる場合は、申込サイトの決済手段・規定に従って返金します。</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- 5. 施設利用上の注意 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            5. 施設利用上の注意
          </h2>
          <div class="space-y-4 text-gray-700">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">禁止事項</h3>
              <ul class="list-disc list-inside space-y-2 ml-4" style="line-height: 1.8;">
                <li>宿泊目的以外の利用（パーティー等）</li>
                <li>敷地内禁煙（電子タバコ等含む）</li>
                <li>花火</li>
                <li>法令・公序良俗に反する行為</li>
                <li>近隣への迷惑行為（夜間の騒音等）</li>
              </ul>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">近隣配慮</h3>
              <p style="line-height: 1.8;">
                特に夜間（21時以降）はお静かにお願いします。屋外（庭・駐車場・BBQ周辺）での大声の会話・音楽再生はお控えください。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">ゴミ</h3>
              <p style="line-height: 1.8;">
                分別し、室内の指定場所へ置いてください。分別不備・大量廃棄等があった場合、追加費用をお願いすることがあります。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">設備・備品</h3>
              <p style="line-height: 1.8;">
                キッチン、洗濯乾燥機、Wi-Fi、駐車場（3台）、BBQ設備等をご利用いただけます。故意・過失による破損・紛失等は損害賠償を請求します。
              </p>
            </div>
          </div>
        </section>

        <!-- 6. ペット -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            6. ペット
          </h2>
          <div class="space-y-4 text-gray-700">
            <ul class="list-disc list-inside space-y-2 ml-4" style="line-height: 1.8;">
              <li>しつけ済みの室内小型犬・猫は同伴可。同伴の有無・頭数は申込時に申告してください。</li>
              <li>受入れの目安は、合計最大2頭までとします（例外は事前にご相談ください）。</li>
              <li>室内では、ペット用ベッド（またはケージ等）をご持参いただき、ソファ・ベッド・寝具への立ち入りはご遠慮ください。</li>
              <li>排泄は必ず屋外またはトイレシート等で行い、排泄物は衛生的に処理してください。</li>
              <li>短時間を含め、ペットのみを残しての外出はお控えください（鳴き声等の近隣配慮のため）。</li>
              <li>破損・汚損・臭気残存等が生じた場合、原状回復費用等をお願いすることがあります。ペットに関するトラブルは利用者の責任となります。</li>
            </ul>
          </div>
        </section>

        <!-- 7. 緊急連絡先 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            7. 緊急連絡先
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8;">
              <a href="mailto:furniturehouse1@chladni.co.jp" class="text-indigo-600 hover:underline">
                furniturehouse1@chladni.co.jp
              </a>
            </p>
          </div>
        </section>

        <!-- 8. 免責・損害賠償 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            8. 免責・損害賠償
          </h2>
          <div class="space-y-4 text-gray-700">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">免責</h3>
              <p style="line-height: 1.8;">
                施設・駐車場内での所持品の盗難・紛失、利用者間のトラブル、車両事故等について当社は責任を負いません。不可抗力による利用不能時は料金を返金しますが、それ以上の補償はいたしかねます。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">損害賠償（原状回復費用の範囲）</h3>
              <p style="line-height: 1.8;">
                利用者が本規約違反、故意・過失により当社または第三者に損害を与えた場合、その損害を賠償していただきます。なお「原状回復費用等」には、修理・交換費用、特別清掃費、消臭作業費、寝具等のクリーニング費、備品補充費、鍵・スマートロック等の再発行費、その他当社に生じた実費を含みます。また、当社が原状回復対応・手配を行った場合、事務手数料（上限30,000円）をお願いすることがあります。
              </p>
            </div>
          </div>
        </section>

        <!-- 9. その他 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            9. その他
          </h2>
          <div class="space-y-4 text-gray-700">
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">反社会的勢力</h3>
              <p style="line-height: 1.8;">
                該当者および関係者の利用は固くお断りします。違反時は即時契約解除し、損害賠償を請求します。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">規約変更</h3>
              <p style="line-height: 1.8;">
                当社は本規約を変更することがあり、変更後の規約は申込サイト等で告知後に適用されます。
              </p>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-2">準拠法・管轄</h3>
              <p style="line-height: 1.8;">
                日本法に準拠し、紛争時は東京地方裁判所を専属的合意管轄裁判所とします。
              </p>
            </div>
          </div>
        </section>

        <!-- 附則 -->
        <section class="mb-12">
          <h2 class="text-2xl font-medium mb-6 pb-3 border-b border-gray-200" style="color: #231815;">
            附則
          </h2>
          <div class="text-gray-700">
            <p style="line-height: 1.8;">
              本規約は、2025年1月1日より施行します。
            </p>
          </div>
        </section>

        <!-- お問い合わせ -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            ご不明な点がございましたら、
            <a href="mailto:furniturehouse1@chladni.co.jp" class="text-indigo-600 hover:underline">
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
  layout: false
})

// SEO設定
useHead({
  title: '利用規約 | 家具の家 No.1',
  meta: [
    { name: 'description', content: '家具の家 No.1の利用規約。予約方法、キャンセルポリシー、施設利用上の注意事項などをご確認ください。' },
    { property: 'og:title', content: '利用規約 | 家具の家 No.1' },
    { property: 'og:description', content: '家具の家 No.1の利用規約' },
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
</style>
