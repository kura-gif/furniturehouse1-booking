<template>
  <div class="chladni-page">
    <!-- ヘッダー -->
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

    <!-- 完了メッセージ -->
    <section class="chladni-complete">
      <div class="chladni-complete-inner">
        <div class="chladni-complete-icon">
          <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 12l2.5 2.5L16 9"/>
          </svg>
        </div>
        <h1 class="chladni-complete-title">お問い合わせを<br>受け付けました</h1>
        <p class="chladni-complete-text">
          この度はお問い合わせいただき、<br>
          誠にありがとうございます。
        </p>
        <p class="chladni-complete-text">
          内容を確認の上、2営業日以内に<br>
          ご連絡させていただきます。
        </p>
        <a href="/chladni" class="chladni-complete-btn">トップページに戻る</a>
      </div>
    </section>

    <!-- フッター -->
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
  title: 'お問い合わせ完了 | 株式会社クラドニ',
  meta: [
    { name: 'robots', content: 'noindex' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Noto+Serif+JP:wght@400;500;600&family=Shippori+Mincho:wght@400;500;600&display=swap' }
  ]
})
</script>

<style scoped>
.chladni-page {
  font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif;
  color: #1a1a1a;
  line-height: 1.8;
  font-size: 16px;
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
*, *::before, *::after { box-sizing: border-box; }

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
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  text-decoration: none;
  letter-spacing: 2px;
}
.chladni-nav { display: flex; gap: 48px; }
.chladni-nav-link {
  font-size: 15px;
  color: #1a1a1a;
  text-decoration: none;
  letter-spacing: 1px;
}
.chladni-nav-link:hover { color: #1e3a8a; }
@media (max-width: 768px) {
  .chladni-header-inner { padding: 0 20px; height: 60px; }
  .chladni-nav { display: none; }
}

.chladni-complete {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 20px 80px;
  background: #f9f9f9;
}
.chladni-complete-inner {
  text-align: center;
  max-width: 500px;
}
.chladni-complete-icon {
  color: #1e3a8a;
  margin-bottom: 32px;
}
.chladni-complete-title {
  font-family: 'Shippori Mincho', 'Noto Serif JP', serif;
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 32px;
  letter-spacing: 3px;
  line-height: 1.6;
}
.chladni-complete-text {
  font-size: 15px;
  color: #666;
  margin-bottom: 16px;
  line-height: 2;
}
.chladni-complete-btn {
  display: inline-block;
  margin-top: 40px;
  padding: 16px 48px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background: #1a1a1a;
  text-decoration: none;
  border-radius: 30px;
  transition: background 0.3s;
}
.chladni-complete-btn:hover { background: #333; }

.chladni-footer {
  background: #1a1a1a;
  padding: 50px 40px;
  text-align: center;
}
.chladni-footer-nav { display: flex; justify-content: center; gap: 40px; margin-bottom: 24px; }
.chladni-footer-nav a { font-size: 14px; color: #fff; text-decoration: none; }
.chladni-footer-nav a:hover { opacity: 0.7; }
.chladni-footer-privacy { font-size: 13px; color: #999; text-decoration: none; }
.chladni-footer-privacy:hover { color: #fff; }
@media (max-width: 768px) {
  .chladni-footer { padding: 40px 20px; }
  .chladni-footer-nav { flex-wrap: wrap; gap: 20px; }
  .chladni-complete-title { font-size: 24px; }
}
</style>
