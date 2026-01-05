<template>
  <div class="site-page">
    <!-- ヘッダー -->
    <header class="site-header">
      <div class="site-header-inner">
        <a href="/site" class="site-logo">家具の家 No.1</a>
        <a href="https://www.instagram.com/" target="_blank" rel="noopener" class="site-instagram">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </a>
      </div>
    </header>

    <!-- ヒーローセクション -->
    <section class="site-hero">
      <div class="site-hero-main">
        <transition name="fade" mode="out-in">
          <img :key="currentImageIndex" :src="heroImages[currentImageIndex]" :alt="`家具の家 No.1 写真${currentImageIndex + 1}`" class="site-hero-image" />
        </transition>
        <div class="site-hero-nav">
          <button class="site-hero-nav-btn" @click="nextImage" aria-label="次の画像">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <button class="site-hero-nav-btn" :class="{ active: autoplay }" @click="toggleAutoplay" aria-label="自動再生">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <rect x="4" y="4" width="3" height="16" rx="1"/>
              <rect x="10.5" y="6" width="3" height="12" rx="1"/>
              <rect x="17" y="2" width="3" height="20" rx="1"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- 滞在セクション -->
    <section class="site-stay-section">
      <div class="site-stay-inner">
        <div class="site-stay-image">
          <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=800&fit=crop" alt="家具の家 内観" />
        </div>
        <div class="site-stay-content">
          <h2 class="site-stay-title">家具の家 No.1に滞在する</h2>
          <div class="site-stay-text">
            <p>この家は、「体験する建築」です。</p>
            <p>見て、触れて、過ごすことで、少しずつその輪郭が浮かび上がってきます。</p>
            <p>家具が家を支え、静かに風が通う空間。<br>最初は気づかなかったような音や気配、温度の違いに、ふと身体が反応する瞬間があります。</p>
            <p>何かを特別にしようとしなくても、ここでの時間は、感覚を研ぎ澄まし、豊かなものとなる。</p>
            <p>ここでは、そんな体験をより深く味わうための、いくつかのヒントをご紹介します。</p>
          </div>
          <p class="site-stay-notice">※冬季休業中のため、2026年1月31日予約開始、予約可能日4月1日以降となります。</p>
          <a href="/booking-full" class="site-stay-btn">宿泊のご案内</a>
        </div>
      </div>
    </section>

    <!-- 構造体セクション -->
    <section class="site-structure-section">
      <div class="site-structure-inner">
        <div class="site-structure-content">
          <h2 class="site-structure-title">風の通う家<br>構造体としての家具</h2>
          <div class="site-structure-text">
            <p>私たちの「家具の家 No.1」との出会いは、2023年の夏のことでした。山中湖の森の中にひっそりと佇むその空間に、私たちは自然と引き寄せられました。初めて足を踏み入れたとき、目に飛び込んできたのは、整然と並ぶユニット家具と、その上に軽やかに載る屋根。家具がそのまま家を支えている──それは建築というより、空間に浮かぶ「構造そのもの」のようでした。</p>
            <p>この家は1990年代に設計されました。設計者は、後に世界的に活躍する建築家として知られる人物です。この建物を特徴づけるのは、家具ユニットがそのまま構造体となっていること。家具は屋根を支え、壁となり、空間を仕切っています。</p>
            <p>この家が建つ山中湖の別荘地は、かつて某自動車メーカーの経営者がまとめて開発した区画です。当時としては先進的な設計で、多くの著名建築家による実験的な住宅が建てられました。そんな中、この建築家にとっても初期の代表作となるこの家は、独自の構法と美しさで注目を集めました。</p>
          </div>
        </div>
        <div class="site-structure-image">
          <img src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400" alt="家具と建築との修練継承" />
        </div>
      </div>
    </section>

    <!-- 体験セクション -->
    <section class="site-experience-section">
      <div class="site-experience-inner">
        <div class="site-experience-text">
          <p>わたり光風部分に影響を及ぼしていたのです。2024年の冬、私たちは、屋根と家具の構造体を残したまま、環境が選んだ建築と調和し、すべての人を迎え入れるという修復作業を行いました。家具が家に寄りそえば注目を維持した姿は、この家の構造を体現するうえでのあらゆものです。</p>
          <p>実際にこの家で時間を過ごしてみると、空気の流れや光の移ろい、そして音の響き方までが、家具によって謳われていることに気づかされます。内と外の境界は限りなくゆるやかで、風は自由に通り抜け、建築は静かに呼吸しているように感じられます。</p>
          <p>人が使い、風が動き、建築が呼吸する——そんな体験に、私たちは心を奪われました。ただ泊まるだけでなく、実際に、静かな時間の流れのなかで、構造体としての家具に囲まれる不思議な時間を、多くの人に体験してもらいたかったし、そうすればこの家は、居心地というとなく、これからも長く息づいていくことでしょう。</p>
        </div>
        <div class="site-experience-image">
          <img src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400" alt="家具を活した建築との修練継承" />
        </div>
      </div>
      <p class="site-experience-credit">家具の家No.1 運営委員会</p>
    </section>

    <!-- 施設情報セクション -->
    <section class="site-facility-section">
      <div class="site-facility-inner">
        <h2 class="site-facility-title">施設情報</h2>
        <div class="site-facility-table">
          <div class="site-facility-row">
            <span class="site-facility-label">用途</span>
            <span class="site-facility-value">保養所</span>
          </div>
          <div class="site-facility-row">
            <span class="site-facility-label">構造</span>
            <span class="site-facility-value">木造平屋</span>
          </div>
          <div class="site-facility-row">
            <span class="site-facility-label">設計</span>
            <span class="site-facility-value">坂茂建築設計</span>
          </div>
          <div class="site-facility-row">
            <span class="site-facility-label">面積</span>
            <span class="site-facility-value">約100㎡</span>
          </div>
          <div class="site-facility-row">
            <span class="site-facility-label">所在</span>
            <span class="site-facility-value">山梨県 山中湖村</span>
          </div>
          <div class="site-facility-row">
            <span class="site-facility-label">間取</span>
            <span class="site-facility-value">リビングキッチン、お風呂トイレ、和室（寝室3名様まで）、洋室（寝室3名様まで）</span>
          </div>
          <div class="site-facility-row">
            <span class="site-facility-label">竣工</span>
            <span class="site-facility-value">1995年</span>
          </div>
        </div>
        <p class="site-facility-notice">※冬季休業中のため、2026年1月31日予約開始、予約可能日4月1日以降となります。</p>
      </div>
    </section>

    <!-- ギャラリーセクション -->
    <section class="site-gallery-section">
      <div class="site-gallery-grid">
        <div v-for="(img, index) in galleryImages" :key="index" class="site-gallery-item">
          <img :src="img.src" :alt="img.alt" />
        </div>
      </div>
    </section>

    <!-- フッター -->
    <footer class="site-footer">
      <div class="site-footer-inner">
        <p class="site-footer-copyright">© 2024 Furniture House No.1</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 画像スライダー
const heroImages = [
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&h=800&fit=crop',
  'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&h=800&fit=crop',
]

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600', alt: '内観1' },
  { src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600', alt: '内観2' },
  { src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600', alt: '内観3' },
  { src: 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=600', alt: '外観1' },
  { src: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=600', alt: '外観2' },
  { src: 'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=600', alt: 'テラス' },
]

const currentImageIndex = ref(0)
const autoplay = ref(true)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % heroImages.length
}

const toggleAutoplay = () => {
  autoplay.value = !autoplay.value
  if (autoplay.value) {
    startAutoplay()
  } else {
    stopAutoplay()
  }
}

const startAutoplay = () => {
  if (autoplayInterval) return
  autoplayInterval = setInterval(() => {
    nextImage()
  }, 5000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

onMounted(() => {
  if (autoplay.value) {
    startAutoplay()
  }
})

onUnmounted(() => {
  stopAutoplay()
})

definePageMeta({
  layout: false
})

useHead({
  title: '家具の家 No.1',
  meta: [
    { name: 'description', content: '家具が家を支える「体験する建築」。静かな時間の中で構造体に囲まれる不思議な宿泊体験。' },
    { property: 'og:title', content: '家具の家 No.1' },
    { property: 'og:description', content: '家具が家を支える「体験する建築」。静かな時間の中で構造体に囲まれる不思議な宿泊体験。' },
  ]
})
</script>

<style scoped>
/* ベース */
.site-page {
  font-family: 'Tsukushi Gothic', 'TsukushiGothic', 'A-OTF 筑紫ゴシック Pr6N', '筑紫ゴシック', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #231815;
  line-height: 1.8;
  font-weight: 300;
  font-size: 14px;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
}

/* ヘッダー */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
}

.site-header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-logo {
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0.5px;
  color: #231815;
  text-decoration: none;
}

.site-instagram {
  color: #231815;
  opacity: 0.6;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
}

.site-instagram:hover {
  opacity: 1;
}

/* ヒーロー */
.site-hero {
  padding-top: 60px;
}

.site-hero-main {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 5;
  overflow: hidden;
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .site-hero-main {
    aspect-ratio: 16 / 9;
  }
}

.site-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* フェードトランジション */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.site-hero-nav {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.site-hero-nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #231815;
  border-radius: 50%;
  transition: background 0.3s;
  opacity: 0.7;
}

.site-hero-nav-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  opacity: 1;
}

.site-hero-nav-btn.active {
  opacity: 1;
}

/* サムネイル */
.site-hero-thumbnails {
  display: flex;
  gap: 3px;
  padding: 6px;
  overflow-x: auto;
  background: #fff;
  justify-content: center;
}

.site-hero-thumb {
  flex-shrink: 0;
  width: 72px;
  height: 54px;
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.3s;
  overflow: hidden;
  background: #f0f0f0;
}

.site-hero-thumb.active {
  opacity: 1;
}

.site-hero-thumb:hover {
  opacity: 0.8;
}

.site-hero-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 滞在セクション */
.site-stay-section {
  background-color: #eeeeee;
  padding: 80px 120px 100px;
}

@media (max-width: 1024px) {
  .site-stay-section {
    padding: 60px 24px;
  }
}

.site-stay-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 80px;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .site-stay-inner {
    flex-direction: column;
    gap: 40px;
  }
}

.site-stay-image {
  flex-shrink: 0;
  width: 340px;
}

@media (max-width: 768px) {
  .site-stay-image {
    width: 100%;
    max-width: 340px;
  }
}

.site-stay-image img {
  width: 100%;
  height: auto;
  display: block;
}

.site-stay-content {
  flex: 1;
}

.site-stay-title {
  font-size: 28px;
  font-weight: 400;
  letter-spacing: 1px;
  margin-bottom: 40px;
  color: #231815;
  line-height: 1.4;
}

.site-stay-text p {
  font-size: 15px;
  line-height: 2.2;
  margin-bottom: 8px;
  color: #231815;
  font-weight: 300;
}

.site-stay-notice {
  font-size: 14px;
  color: #666;
  margin-top: 40px;
  margin-bottom: 32px;
}

.site-stay-btn {
  display: inline-block;
  padding: 14px 28px;
  font-size: 14px;
  font-weight: 400;
  color: #231815;
  background: transparent;
  border: 1px solid #231815;
  text-decoration: none;
  transition: all 0.3s;
}

.site-stay-btn:hover {
  background: #231815;
  color: #fff;
}

/* 構造体セクション */
.site-structure-section {
  background-color: #ffffff;
  padding: 80px 120px 60px;
}

@media (max-width: 1024px) {
  .site-structure-section {
    padding: 60px 24px;
  }
}

.site-structure-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 80px;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .site-structure-inner {
    flex-direction: column;
    gap: 40px;
  }
}

.site-structure-content {
  flex: 1;
}

.site-structure-title {
  font-size: 28px;
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: 1px;
  margin-bottom: 40px;
  color: #231815;
}

.site-structure-text p {
  font-size: 15px;
  line-height: 2.2;
  margin-bottom: 8px;
  color: #231815;
  font-weight: 300;
}

.site-structure-image {
  flex-shrink: 0;
  width: 340px;
}

@media (max-width: 768px) {
  .site-structure-image {
    width: 100%;
    max-width: 340px;
  }
}

.site-structure-image img {
  width: 100%;
  height: auto;
}

/* 体験セクション */
.site-experience-section {
  background-color: #ffffff;
  padding: 40px 120px 60px;
}

@media (max-width: 1024px) {
  .site-experience-section {
    padding: 40px 24px 60px;
  }
}

.site-experience-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 80px;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .site-experience-inner {
    flex-direction: column;
    gap: 40px;
  }
}

.site-experience-text {
  flex: 1;
}

.site-experience-text p {
  font-size: 15px;
  line-height: 2.2;
  margin-bottom: 8px;
  color: #231815;
  font-weight: 300;
}

.site-experience-image {
  flex-shrink: 0;
  width: 340px;
}

@media (max-width: 768px) {
  .site-experience-image {
    width: 100%;
    max-width: 340px;
  }
}

.site-experience-image img {
  width: 100%;
  height: auto;
}

.site-experience-credit {
  max-width: 1000px;
  margin: 40px auto 0;
  padding: 0 80px;
  font-size: 13px;
  color: #666;
  text-align: center;
}

@media (max-width: 1024px) {
  .site-experience-credit {
    padding: 0 24px;
  }
}

/* 施設情報セクション */
.site-facility-section {
  background-color: #ffffff;
  padding: 80px 80px;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

@media (max-width: 1024px) {
  .site-facility-section {
    padding: 60px 24px;
  }
}

.site-facility-inner {
  max-width: 800px;
  margin: 0 auto;
}

.site-facility-title {
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 32px;
  color: #231815;
}

.site-facility-table {
  display: grid;
  grid-template-columns: 60px 1fr 60px 1fr;
  gap: 0;
  border-top: 1px solid #ddd;
}

@media (max-width: 768px) {
  .site-facility-table {
    grid-template-columns: 60px 1fr;
  }
}

.site-facility-row {
  display: contents;
}

.site-facility-label {
  padding: 12px 16px 12px 0;
  font-size: 13px;
  color: #666;
  border-bottom: 1px solid #ddd;
}

.site-facility-value {
  padding: 12px 24px 12px 0;
  font-size: 13px;
  color: #231815;
  border-bottom: 1px solid #ddd;
}

.site-facility-notice {
  margin-top: 24px;
  font-size: 12px;
  color: #999;
}

/* ギャラリーセクション */
.site-gallery-section {
  padding: 0;
}

.site-gallery-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
}

@media (max-width: 1024px) {
  .site-gallery-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .site-gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.site-gallery-item {
  aspect-ratio: 1;
  overflow: hidden;
}

.site-gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.site-gallery-item:hover img {
  transform: scale(1.05);
}

/* フッター */
.site-footer {
  padding: 30px 24px;
  background-color: #f8f8f8;
}

.site-footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  text-align: center;
}

.site-footer-copyright {
  font-size: 11px;
  color: #999;
}
</style>
