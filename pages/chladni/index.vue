<template>
  <div class="chladni-page">
    <!-- ヘッダー -->
    <header class="chladni-header">
      <div class="chladni-header-inner">
        <a href="/chladni" class="chladni-logo">chladni</a>
        <nav class="chladni-nav">
          <a href="#greeting" class="chladni-nav-link">ご挨拶</a>
          <a href="#works" class="chladni-nav-link">私たちの仕事</a>
          <a href="#company" class="chladni-nav-link">会社情報</a>
          <a href="#contact" class="chladni-nav-link">お問合せ</a>
        </nav>
        <button class="chladni-mobile-menu-btn" @click="toggleMobileMenu" aria-label="メニュー">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    <!-- モバイルメニュー -->
    <div class="chladni-mobile-menu" :class="{ active: mobileMenuOpen }">
      <nav class="chladni-mobile-nav">
        <a href="#greeting" class="chladni-mobile-nav-link" @click="closeMobileMenu">ご挨拶</a>
        <a href="#works" class="chladni-mobile-nav-link" @click="closeMobileMenu">私たちの仕事</a>
        <a href="#company" class="chladni-mobile-nav-link" @click="closeMobileMenu">会社情報</a>
        <a href="#contact" class="chladni-mobile-nav-link" @click="closeMobileMenu">お問合せ</a>
      </nav>
    </div>

    <!-- ヒーローセクション -->
    <section class="chladni-hero">
      <video class="chladni-hero-video" autoplay muted loop playsinline>
        <source src="/images/chladni/hero.mp4" type="video/mp4" />
      </video>
      <div class="chladni-hero-overlay"></div>
      <div class="chladni-hero-content">
        <h1 class="chladni-hero-title">静かな振動は、組織を強くする。</h1>
      </div>
    </section>

    <!-- ご挨拶セクション -->
    <section id="greeting" class="chladni-section chladni-greeting">
      <div class="chladni-section-inner">
        <div class="chladni-section-label">
          <span>ご</span>
          <span>挨</span>
          <span>拶</span>
        </div>
        <div class="chladni-greeting-content">
          <h2 class="chladni-greeting-title">小さい仕組みが、組織を育てる。</h2>
          <div class="chladni-greeting-text">
            <p>人が集まっただけでは、そこにはまだ価値はありません。最初はバラバラでも、意図ある「振動」――仕組み――を与えることで、やがて秩序が現れ、規則を持った構造となって持続的な組織は生まれるのです。</p>
            <p>わたしたちは、人的資本経営を軸に、個人の成長と組織の健全な関係性を支援する会社です。組織がうまく機能しないとき、声にならない揺らぎに耳を澄ませ、共鳴のかたちを見出す――私たちは、そんな存在でありたいと考えています。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 画像セクション1 -->
    <section class="chladni-image-section">
      <img src="/images/chladni/meeting.jpg" alt="ミーティング風景" class="chladni-full-image" />
    </section>

    <!-- 私たちの仕事セクション -->
    <section id="works" class="chladni-section chladni-works">
      <div class="chladni-section-inner">
        <div class="chladni-section-label">
          <span>私</span>
          <span>た</span>
          <span>ち</span>
          <span>の</span>
          <span>仕</span>
          <span>事</span>
        </div>
        <div class="chladni-works-content">
          <div class="chladni-work-item">
            <div class="chladni-work-number">1</div>
            <h3 class="chladni-work-title">人的資本経営コンサルティング</h3>
            <p class="chladni-work-desc">ISO30414対応、組織への生成AI導入、スタートアップ組織支援</p>
          </div>
          <div class="chladni-work-item">
            <div class="chladni-work-number">2</div>
            <h3 class="chladni-work-title">企業ブランディング</h3>
            <p class="chladni-work-desc">組織の本質を伝える戦略設計、クリエイティブ表現、マーケティング支援</p>
          </div>
          <div class="chladni-work-item">
            <div class="chladni-work-number">3</div>
            <h3 class="chladni-work-title">研修支援</h3>
            <p class="chladni-work-desc">組織力向上の機会や場所を提供</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 画像セクション2 -->
    <section class="chladni-image-section">
      <img src="/images/chladni/office.jpg" alt="オフィス風景" class="chladni-full-image" />
    </section>

    <!-- 会社情報セクション -->
    <section id="company" class="chladni-section chladni-company">
      <div class="chladni-section-inner">
        <div class="chladni-section-label">
          <span>会</span>
          <span>社</span>
          <span>情</span>
          <span>報</span>
        </div>
        <div class="chladni-company-content">
          <div class="chladni-company-nav">
            <button class="chladni-nav-btn" aria-label="次へ">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button class="chladni-nav-btn" aria-label="メニュー">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <rect x="4" y="4" width="3" height="16" rx="1"/>
                <rect x="10.5" y="6" width="3" height="12" rx="1"/>
                <rect x="17" y="2" width="3" height="20" rx="1"/>
              </svg>
            </button>
          </div>

          <div class="chladni-profile">
            <div class="chladni-profile-image">
              <img src="/images/chladni/ceo.jpg" alt="倉島陽一" />
            </div>
            <div class="chladni-profile-info">
              <h3 class="chladni-profile-name">倉島陽一 プロフィール</h3>
              <p class="chladni-profile-text">東京藝術大学美術学部建築学科卒。スキーマ建築計画を創業し代表取締役。退任後、Samsung出資の株式会社A.C.O.創業社員、買収し代表取締役。デジタル領域のデザインコンサル企業として成長。自身もプロデューサーとして企業やサービスのデザインを担当。キー局新規事業会社の取締役兼務を経て、2018年株式会社モンスターラボへ事業譲渡後も代表として事業拡大。2022年統合後退社。2023年に株式会社クラドニ設立。2025年モンスターラボ取締役監査等委員長就任。人的資本GL(ISO30414)リードコンサルタント。</p>
            </div>
          </div>

          <div class="chladni-company-table">
            <div class="chladni-company-row">
              <span class="chladni-company-label">会社名</span>
              <span class="chladni-company-value">株式会社クラドニ</span>
            </div>
            <div class="chladni-company-row">
              <span class="chladni-company-label">代表</span>
              <span class="chladni-company-value">倉島陽一</span>
            </div>
            <div class="chladni-company-row">
              <span class="chladni-company-label">創業</span>
              <span class="chladni-company-value">2022年12月</span>
            </div>
            <div class="chladni-company-row">
              <span class="chladni-company-label">資本金</span>
              <span class="chladni-company-value">300万円</span>
            </div>
            <div class="chladni-company-row">
              <span class="chladni-company-label">所在地</span>
              <span class="chladni-company-value">港区南青山3-1-36 青山丸竹ビル6階</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- お問合せセクション -->
    <section id="contact" class="chladni-section chladni-contact">
      <div class="chladni-contact-inner">
        <h2 class="chladni-contact-title">お問合せ</h2>
        <p class="chladni-contact-desc">弊社へのお問い合わせはこちらよりお願い致します。</p>
        <p class="chladni-contact-desc">2営業日以内にご返信させて頂きます。</p>

        <form class="chladni-form" @submit.prevent="submitForm">
          <div class="chladni-form-group">
            <label class="chladni-form-label">お名前<span class="chladni-required">必須</span></label>
            <input type="text" v-model="form.name" required class="chladni-form-input" />
          </div>

          <div class="chladni-form-group">
            <label class="chladni-form-label">会社名</label>
            <input type="text" v-model="form.company" class="chladni-form-input" />
          </div>

          <div class="chladni-form-group">
            <label class="chladni-form-label">メールアドレス<span class="chladni-required">必須</span></label>
            <input type="email" v-model="form.email" required class="chladni-form-input" />
          </div>

          <div class="chladni-form-group">
            <label class="chladni-form-label">電話番号</label>
            <input type="tel" v-model="form.phone" class="chladni-form-input" />
          </div>

          <div class="chladni-form-group">
            <label class="chladni-form-label">お問合せ内容<span class="chladni-required">必須</span></label>
            <textarea v-model="form.message" required class="chladni-form-textarea" rows="6"></textarea>
          </div>

          <div class="chladni-form-group chladni-privacy-check">
            <a href="/chladni/privacy-policy" target="_blank" class="chladni-privacy-link">プライバシーポリシーを確認する</a>
            <label class="chladni-checkbox-label">
              <input type="checkbox" v-model="form.privacyAgreed" required />
              <span>プライバシーポリシーに同意する</span>
            </label>
          </div>

          <button type="submit" class="chladni-submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? '送信中...' : '送信' }}
          </button>
        </form>
      </div>
    </section>

    <!-- フッター -->
    <footer class="chladni-footer">
      <nav class="chladni-footer-nav">
        <a href="#greeting">ご挨拶</a>
        <a href="#works">私たちの仕事</a>
        <a href="#company">会社情報</a>
        <a href="#contact">お問合せ</a>
      </nav>
      <a href="/chladni/privacy-policy" class="chladni-footer-privacy">| プライバシーポリシー |</a>
    </footer>
  </div>
</template>

<script setup lang="ts">
const mobileMenuOpen = ref(false)
const isSubmitting = ref(false)

const form = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
  privacyAgreed: false
})

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const router = useRouter()

const submitForm = async () => {
  if (!form.privacyAgreed) {
    alert('プライバシーポリシーに同意してください。')
    return
  }
  isSubmitting.value = true
  try {
    await $fetch('/api/chladni/contact', {
      method: 'POST',
      body: {
        name: form.name,
        company: form.company,
        email: form.email,
        phone: form.phone,
        message: form.message
      }
    })
    router.push('/chladni/contact-complete')
  } catch {
    alert('送信に失敗しました。もう一度お試しください。')
  } finally {
    isSubmitting.value = false
  }
}

definePageMeta({ layout: false })

useHead({
  title: '株式会社クラドニ | 静かな振動は、組織を強くする。',
  meta: [
    { name: 'description', content: '人が集まると、仕組みによって秩序が生まれ、組織が形になります。クラドニは、人的資本経営を軸に、個人と組織が共鳴し成長する関係を支援します。' },
    { property: 'og:title', content: '株式会社クラドニ' },
    { property: 'og:description', content: 'クラドニは、人的資本経営を軸に、個人と組織が共鳴し成長する関係を支援します。' },
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
.chladni-mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
}
.chladni-mobile-menu-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: #1a1a1a;
}
@media (max-width: 768px) {
  .chladni-header-inner { padding: 0 20px; height: 60px; }
  .chladni-nav { display: none; }
  .chladni-mobile-menu-btn { display: flex; }
}

.chladni-mobile-menu {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: #fff;
  z-index: 99;
  padding: 20px;
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.3s;
  pointer-events: none;
}
.chladni-mobile-menu.active {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}
.chladni-mobile-nav { display: flex; flex-direction: column; gap: 20px; }
.chladni-mobile-nav-link {
  font-size: 16px;
  color: #1a1a1a;
  text-decoration: none;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.chladni-hero {
  position: relative;
  height: 80vh;
  min-height: 480px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.chladni-hero-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
}
.chladni-hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.3);
}
.chladni-hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 20px;
}
.chladni-hero-title {
  font-family: 'Shippori Mincho', 'Noto Serif JP', serif;
  font-size: 40px;
  font-weight: 500;
  color: #fff;
  letter-spacing: 6px;
}
@media (max-width: 768px) {
  .chladni-hero { min-height: 500px; }
  .chladni-hero-title { font-size: 26px; letter-spacing: 2px; }
}

.chladni-section { padding: 100px 40px; }
.chladni-section-inner {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  gap: 60px;
}
.chladni-section-label {
  display: flex;
  flex-direction: column;
  font-size: 15px;
  letter-spacing: 2px;
  padding-right: 20px;
  border-right: 1px solid #ddd;
  line-height: 1.8;
}
@media (max-width: 768px) {
  .chladni-section { padding: 60px 20px; }
  .chladni-section-inner { flex-direction: column; gap: 30px; }
  .chladni-section-label {
    flex-direction: row;
    border-right: none;
    border-bottom: 1px solid #ddd;
    padding-bottom: 15px;
    gap: 2px;
  }
}

.chladni-greeting-content { flex: 1; }
.chladni-greeting-title {
  font-family: 'Shippori Mincho', 'Noto Serif JP', serif;
  font-size: 31px;
  font-weight: 500;
  margin-bottom: 40px;
  letter-spacing: 3px;
}
.chladni-greeting-text p {
  margin-bottom: 24px;
  line-height: 2.2;
  color: #333;
}
@media (max-width: 768px) {
  .chladni-greeting-title { font-size: 22px; }
}

.chladni-image-section {
  width: 93%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}
.chladni-full-image {
  width: 100%;
  height: 416px;
  object-fit: cover;
  display: block;
  box-shadow: -10px 10px 0 rgb(100, 100, 100);
}

.chladni-works-content { flex: 1; }
.chladni-work-item { margin-bottom: 60px; }
.chladni-work-item:last-child { margin-bottom: 0; }
.chladni-work-number {
  font-size: 20px;
  color: #1e3a8a;
  margin-bottom: 8px;
  font-weight: 500;
}
.chladni-work-number::before {
  content: '';
  display: inline-block;
  width: 20px;
  height: 1px;
  background: #1e3a8a;
  margin-right: 10px;
  vertical-align: middle;
}
.chladni-work-title {
  font-family: 'Shippori Mincho', 'Noto Serif JP', serif;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 16px;
  letter-spacing: 3px;
}
.chladni-work-desc { font-size: 15px; color: #666; }
@media (max-width: 768px) {
  .chladni-work-title { font-size: 20px; }
}

.chladni-company-content { flex: 1; }
.chladni-company-nav {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
}
.chladni-nav-btn {
  width: 48px;
  height: 48px;
  border: 1px solid #ddd;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.chladni-nav-btn:hover { background: #f5f5f5; }

.chladni-profile {
  display: flex;
  gap: 30px;
  margin-bottom: 50px;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 4px;
}
.chladni-profile-image { flex-shrink: 0; width: 180px; }
.chladni-profile-image img { width: 100%; border-radius: 4px; }
.chladni-profile-info { flex: 1; }
.chladni-profile-name { font-size: 15px; font-weight: 500; margin-bottom: 16px; }
.chladni-profile-text { font-size: 14px; line-height: 2; color: #333; }
@media (max-width: 768px) {
  .chladni-profile { flex-direction: column; padding: 20px; }
  .chladni-profile-image { width: 120px; }
}

.chladni-company-table { border-top: 1px solid #eee; }
.chladni-company-row {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}
.chladni-company-label { width: 100px; font-size: 15px; color: #666; }
.chladni-company-value { flex: 1; font-size: 15px; }

.chladni-contact { background: #f9f9f9; }
.chladni-contact-inner { max-width: 600px; margin: 0 auto; text-align: center; }
.chladni-contact-title {
  font-family: 'Shippori Mincho', 'Noto Serif JP', serif;
  font-size: 31px;
  font-weight: 500;
  margin-bottom: 24px;
  letter-spacing: 3px;
}
.chladni-contact-desc { font-size: 15px; color: #666; margin-bottom: 8px; }
.chladni-form { margin-top: 50px; text-align: left; }
.chladni-form-group { margin-bottom: 30px; }
.chladni-form-label { display: block; font-size: 15px; font-weight: 500; margin-bottom: 10px; }
.chladni-required {
  display: inline-block;
  background: #1e3a8a;
  color: #fff;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
  margin-left: 8px;
}
.chladni-form-input, .chladni-form-textarea {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  font-family: inherit;
}
.chladni-form-input:focus, .chladni-form-textarea:focus {
  outline: none;
  border-color: #1e3a8a;
}
.chladni-form-textarea { resize: vertical; min-height: 150px; }
.chladni-privacy-check { text-align: left; }
.chladni-privacy-link { display: block; font-size: 14px; margin-bottom: 12px; text-decoration: underline; }
.chladni-checkbox-label { display: flex; align-items: center; gap: 10px; font-size: 14px; cursor: pointer; }
.chladni-checkbox-label input { width: 18px; height: 18px; }
.chladni-submit-btn {
  display: block;
  width: 240px;
  margin: 40px auto 0;
  padding: 16px 32px;
  font-size: 15px;
  font-weight: 500;
  color: #fff;
  background: #1a1a1a;
  border: none;
  border-radius: 30px;
  cursor: pointer;
}
.chladni-submit-btn:hover { background: #333; }
.chladni-submit-btn:disabled { background: #999; cursor: not-allowed; }

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
}
</style>
