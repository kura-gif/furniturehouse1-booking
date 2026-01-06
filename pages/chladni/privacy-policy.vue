<template>
  <div class="chladni-privacy-page">
    <header class="chladni-header">
      <div class="chladni-header-inner">
        <a href="/chladni" class="chladni-logo">chladni</a>
        <nav class="chladni-nav">
          <a href="/chladni#greeting" class="chladni-nav-link">ご挨拶</a>
          <a href="/chladni#works" class="chladni-nav-link">私たちの仕事</a>
          <a href="/chladni#company" class="chladni-nav-link">会社情報</a>
          <a href="/chladni#contact" class="chladni-nav-link">お問合せ</a>
        </nav>
      </div>
    </header>

    <main class="chladni-privacy-main">
      <div class="chladni-privacy-inner">
        <h1 class="chladni-privacy-title">プライバシーポリシー</h1>
        
        <div class="chladni-privacy-content">
          <p>株式会社クラドニ（以下「当社」といいます。）は、当社が提供するサービスにおいて取得する個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。</p>

          <section class="chladni-privacy-section">
            <h2>1. 個人情報の定義</h2>
            <p>本ポリシーにおいて「個人情報」とは、個人情報保護法に定める個人情報を指し、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別できるもの、または個人識別符号が含まれるものをいいます。</p>
          </section>

          <section class="chladni-privacy-section">
            <h2>2. 個人情報の収集</h2>
            <p>当社は、以下の場合に個人情報を収集することがあります。</p>
            <ul>
              <li>お問い合わせフォームからのお問い合わせ時</li>
              <li>サービスのお申し込み時</li>
              <li>その他、当社サービスのご利用時</li>
            </ul>
          </section>

          <section class="chladni-privacy-section">
            <h2>3. 個人情報の利用目的</h2>
            <p>当社は、収集した個人情報を以下の目的で利用いたします。</p>
            <ul>
              <li>お問い合わせへの対応</li>
              <li>サービスの提供・運営</li>
              <li>サービスに関するご案内</li>
              <li>当社サービスの改善・新サービスの開発</li>
              <li>その他、上記利用目的に付随する目的</li>
            </ul>
          </section>

          <section class="chladni-privacy-section">
            <h2>4. 個人情報の第三者提供</h2>
            <p>当社は、以下の場合を除き、お客様の個人情報を第三者に提供することはありません。</p>
            <ul>
              <li>お客様の同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合</li>
            </ul>
          </section>

          <section class="chladni-privacy-section">
            <h2>5. 個人情報の安全管理</h2>
            <p>当社は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。</p>
          </section>

          <section class="chladni-privacy-section">
            <h2>6. 個人情報の開示・訂正・削除</h2>
            <p>お客様は、当社に対して、ご自身の個人情報の開示、訂正、追加、削除、利用停止を請求することができます。ご請求の際は、下記のお問い合わせ先までご連絡ください。</p>
          </section>

          <section class="chladni-privacy-section">
            <h2>7. プライバシーポリシーの変更</h2>
            <p>当社は、法令の変更等に伴い、本ポリシーを変更することがあります。変更後のプライバシーポリシーは、当社ウェブサイトに掲載した時点から効力を生じるものとします。</p>
          </section>

          <section class="chladni-privacy-section">
            <h2>8. お問い合わせ</h2>
            <p>本ポリシーに関するお問い合わせは、下記までお願いいたします。</p>
            <p class="chladni-privacy-contact">
              株式会社クラドニ<br>
              〒107-0062 東京都港区南青山3-1-36 青山丸竹ビル6階<br>
            </p>
          </section>

          <p class="chladni-privacy-date">制定日：2023年1月1日</p>
        </div>
      </div>
    </main>

    <footer class="chladni-footer">
      <nav class="chladni-footer-nav">
        <a href="/chladni#greeting">ご挨拶</a>
        <a href="/chladni#works">私たちの仕事</a>
        <a href="/chladni#company">会社情報</a>
        <a href="/chladni#contact">お問合せ</a>
      </nav>
      <a href="/chladni/privacy-policy" class="chladni-footer-privacy">| プライバシーポリシー |</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useHead({
  title: 'プライバシーポリシー | 株式会社クラドニ',
  meta: [
    { name: 'description', content: '株式会社クラドニのプライバシーポリシーについてご説明します。' },
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap' }
  ]
})
</script>

<style scoped>
.chladni-privacy-page {
  font-family: 'Noto Sans JP', sans-serif;
  color: #1a1a1a;
  line-height: 1.8;
  font-size: 15px;
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.chladni-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.chladni-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.chladni-logo {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
  letter-spacing: 2px;
}
.chladni-nav { display: flex; gap: 48px; }
.chladni-nav-link {
  font-size: 14px;
  color: #1a1a1a;
  text-decoration: none;
  letter-spacing: 1px;
}
.chladni-nav-link:hover { color: #1e3a8a; }

@media (max-width: 768px) {
  .chladni-header-inner { padding: 0 20px; height: 60px; }
  .chladni-nav { display: none; }
}

.chladni-privacy-main {
  flex: 1;
  padding: 140px 40px 100px;
}
.chladni-privacy-inner {
  max-width: 800px;
  margin: 0 auto;
}
.chladni-privacy-title {
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 60px;
  text-align: center;
  letter-spacing: 2px;
}
.chladni-privacy-content p {
  margin-bottom: 24px;
  line-height: 2;
  color: #333;
}
.chladni-privacy-section {
  margin-bottom: 48px;
}
.chladni-privacy-section h2 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #1a1a1a;
}
.chladni-privacy-section ul {
  margin: 16px 0;
  padding-left: 24px;
}
.chladni-privacy-section li {
  margin-bottom: 8px;
  line-height: 1.8;
  color: #333;
}
.chladni-privacy-contact {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
}
.chladni-privacy-date {
  text-align: right;
  color: #666;
  font-size: 14px;
  margin-top: 60px;
}

@media (max-width: 768px) {
  .chladni-privacy-main { padding: 100px 20px 60px; }
  .chladni-privacy-title { font-size: 24px; margin-bottom: 40px; }
}

.chladni-footer {
  background: #1a1a1a;
  padding: 50px 40px;
  text-align: center;
}
.chladni-footer-nav { display: flex; justify-content: center; gap: 40px; margin-bottom: 24px; }
.chladni-footer-nav a { font-size: 13px; color: #fff; text-decoration: none; }
.chladni-footer-nav a:hover { opacity: 0.7; }
.chladni-footer-privacy { font-size: 12px; color: #999; text-decoration: none; }
.chladni-footer-privacy:hover { color: #fff; }

@media (max-width: 768px) {
  .chladni-footer { padding: 40px 20px; }
  .chladni-footer-nav { flex-wrap: wrap; gap: 20px; }
}
</style>
