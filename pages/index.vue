<template>
  <!-- chladni.co.jp の場合は会社ページを表示 -->
  <ChladniIndexPage v-if="isChladniDomain" />

  <!-- furniturehouse1.com の場合はサイト紹介ページを表示 -->
  <div v-else class="site-page">
    <!-- ヘッダー -->
    <header class="site-header">
      <div class="site-header-inner">
        <NuxtLink :to="localePath('/')" class="site-logo">
          <img src="/images/title-logo.svg" :alt="$t('site.title')" class="site-logo-img" />
        </NuxtLink>
        <div class="site-header-right">
          <!-- 言語切り替え -->
          <button @click="toggleLocale" class="site-lang-switch">
            {{ $t('common.languageSwitch') }}
          </button>
          <a href="https://www.instagram.com/furniture.house.1/" target="_blank" rel="noopener" class="site-instagram" :title="$t('site.header.instagramTooltip')">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <defs>
                <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#FFDC80"/>
                  <stop offset="25%" style="stop-color:#F77737"/>
                  <stop offset="50%" style="stop-color:#E1306C"/>
                  <stop offset="75%" style="stop-color:#C13584"/>
                  <stop offset="100%" style="stop-color:#405DE6"/>
                </linearGradient>
              </defs>
              <path fill="url(#instagram-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>
        </div>
      </div>
    </header>

    <!-- ヒーローセクション -->
    <section class="site-hero">
      <div class="site-hero-main">
        <transition name="fade" mode="out-in">
          <img :key="currentImageIndex" :src="heroImages[currentImageIndex].src" :alt="heroImages[currentImageIndex].alt" class="site-hero-image" />
        </transition>
        <div v-if="heroImages[currentImageIndex].credit" :class="['site-hero-credit', { 'light-text': heroImages[currentImageIndex].lightText }]">
          <template v-if="heroImages[currentImageIndex].credit.includes('@')">
            {{ $t('site.hero.photoCredit') }} <a
              :href="`https://instagram.com/${heroImages[currentImageIndex].credit.split('@')[1]}`"
              target="_blank"
              rel="noopener noreferrer"
            >@{{ heroImages[currentImageIndex].credit.split('@')[1] }}</a>
          </template>
          <span v-else>{{ heroImages[currentImageIndex].credit }}</span>
        </div>
      </div>
    </section>

    <!-- 滞在セクション -->
    <section class="site-stay-section">
      <div class="site-stay-inner">
        <div class="site-stay-image">
          <img src="/images/hero/07.webp" alt="" loading="lazy" />
          <div class="site-stay-image-credit">
            {{ $t('site.hero.photoCredit') }} <a href="https://instagram.com/martin_holtkamp" target="_blank" rel="noopener noreferrer">@martin_holtkamp</a>
          </div>
        </div>
        <div class="site-stay-content">
          <h2 class="site-stay-title">{{ $t('site.stay.title') }}</h2>
          <div class="site-stay-text">
            <p>{{ $t('site.stay.text1') }}</p>
            <p>{{ $t('site.stay.text2') }}</p>
            <p>{{ $t('site.stay.text3') }}<br>{{ $t('site.stay.text3br') }}</p>
            <p>{{ $t('site.stay.text4') }}</p>
            <p>{{ $t('site.stay.text5') }}</p>
          </div>
          <p class="site-stay-notice">{{ $t('site.stay.notice') }}</p>
        </div>
      </div>
    </section>

    <!-- 構造体セクション -->
    <section class="site-structure-section">
      <div class="site-structure-inner">
        <h2 class="site-structure-title" v-html="$t('site.structure.title') + '<br>' + $t('site.structure.titleBr')"></h2>
        <div class="site-structure-flow">
          <div class="site-structure-text">
            <p>{{ $t('site.structure.text1') }}</p>
            <p>{{ $t('site.structure.text2') }}</p>
            <p>{{ $t('site.structure.text3') }}</p>
            <p>{{ $t('site.structure.text4') }}</p>
            <p>{{ $t('site.structure.text5') }}</p>
            <p>{{ $t('site.structure.text6') }}</p>
            <p class="site-structure-credit">{{ $t('site.structure.credit') }}</p>
          </div>
          <div class="site-structure-images">
            <div class="site-structure-figure">
              <img src="/images/hero/08.webp" :alt="$t('site.structure.caption1')" loading="lazy" />
              <p class="site-image-caption">{{ $t('site.structure.caption1') }}</p>
            </div>
            <div class="site-structure-figure">
              <img src="/images/hero/09.webp" :alt="$t('site.structure.caption2')" loading="lazy" />
              <p class="site-image-caption">{{ $t('site.structure.caption2') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 上部ギャラリー（4枚横一列） -->
    <section class="site-gallery-section">
      <div class="site-gallery-grid">
        <div v-for="(img, index) in galleryTopImages" :key="index" class="site-gallery-item">
          <div class="site-gallery-skeleton"></div>
          <img v-img-loaded :src="img.src" :alt="img.alt" loading="lazy" class="site-gallery-img" @load="onImageLoad" />
        </div>
      </div>
    </section>

    <!-- 施設情報セクション -->
    <section class="site-facility-section">
      <div class="site-facility-inner">
        <h2 class="site-facility-title">{{ $t('site.facility.title') }}</h2>
        <div class="site-facility-columns">
          <div class="site-facility-column">
            <div class="site-facility-row">
              <span class="site-facility-label">{{ $t('site.facility.purpose') }}</span>
              <span class="site-facility-value">{{ $t('site.facility.purposeValue') }}</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">{{ $t('site.facility.design') }}</span>
              <span class="site-facility-value">{{ $t('site.facility.designValue') }}</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">{{ $t('site.facility.location') }}</span>
              <span class="site-facility-value">{{ $t('site.facility.locationValue') }}</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">{{ $t('site.facility.completion') }}</span>
              <span class="site-facility-value">{{ $t('site.facility.completionValue') }}</span>
            </div>
          </div>
          <div class="site-facility-column">
            <div class="site-facility-row">
              <span class="site-facility-label">{{ $t('site.facility.structure') }}</span>
              <span class="site-facility-value">{{ $t('site.facility.structureValue') }}</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">{{ $t('site.facility.area') }}</span>
              <span class="site-facility-value">{{ $t('site.facility.areaValue') }}</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">{{ $t('site.facility.layout') }}</span>
              <span class="site-facility-value">{{ $t('site.facility.layoutValue') }}</span>
            </div>
          </div>
        </div>
        <p class="site-facility-notice">{{ $t('site.stay.notice') }}</p>
      </div>
    </section>

    <!-- 中間ギャラリー（4枚横一列） -->
    <section class="site-gallery-section">
      <div class="site-gallery-grid">
        <div v-for="(img, index) in galleryMiddleImages" :key="index" class="site-gallery-item">
          <div class="site-gallery-skeleton"></div>
          <img v-img-loaded :src="img.src" :alt="img.alt" loading="lazy" class="site-gallery-img" @load="onImageLoad" />
        </div>
      </div>
    </section>

    <!-- 別荘地について -->
    <section class="site-resort-section">
      <div class="site-resort-inner">
        <h2 class="site-resort-title">{{ $t('site.resort.title') }}</h2>
        <div class="site-resort-text">
          <p>{{ $t('site.resort.text1') }}</p>
          <p>{{ $t('site.resort.text2') }}</p>
        </div>
      </div>
    </section>

    <!-- 下部ギャラリー（10枚、5x2グリッド） -->
    <section class="site-gallery-section">
      <div class="site-gallery-grid-10">
        <div v-for="(img, index) in galleryBottomImages" :key="index" class="site-gallery-item-10">
          <div class="site-gallery-skeleton"></div>
          <img v-img-loaded :src="img.src" :alt="img.alt" loading="lazy" class="site-gallery-img" @load="onImageLoad" />
        </div>
      </div>
    </section>

    <!-- 宿泊のご案内セクション -->
    <section class="site-guide-section">
      <div class="site-guide-inner">
        <h2 class="site-guide-title">{{ $t('site.guide.title') }}</h2>
        <p class="site-guide-intro" v-html="$t('site.guide.intro') + '<br>' + $t('site.guide.introBr')"></p>

        <div class="site-guide-grid">
          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-1.webp" :alt="$t('site.guide.item1.title')" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">{{ $t('site.guide.item1.title') }}</h3>
            <p class="site-guide-item-text">{{ $t('site.guide.item1.text') }}</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-2.webp" :alt="$t('site.guide.item2.title')" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">{{ $t('site.guide.item2.title') }}</h3>
            <p class="site-guide-item-text">{{ $t('site.guide.item2.text') }}</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-3.webp" :alt="$t('site.guide.item3.title')" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">{{ $t('site.guide.item3.title') }}</h3>
            <p class="site-guide-item-text">{{ $t('site.guide.item3.text') }}</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-4.webp" :alt="$t('site.guide.item4.title')" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">{{ $t('site.guide.item4.title') }}</h3>
            <p class="site-guide-item-text">{{ $t('site.guide.item4.text') }}</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-5.webp" :alt="$t('site.guide.item5.title')" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">{{ $t('site.guide.item5.title') }}</h3>
            <p class="site-guide-item-text">{{ $t('site.guide.item5.text') }}</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-6.webp" :alt="$t('site.guide.item6.title')" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">{{ $t('site.guide.item6.title') }}</h3>
            <p class="site-guide-item-text">{{ $t('site.guide.item6.text') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- フッター -->
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span class="site-footer-title">{{ $t('site.title') }}</span>
        <div class="site-footer-right">
          <a href="https://www.instagram.com/furniture.house.1/" target="_blank" rel="noopener" class="site-footer-instagram">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <defs>
                <linearGradient id="instagram-gradient-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#FFDC80"/>
                  <stop offset="25%" style="stop-color:#F77737"/>
                  <stop offset="50%" style="stop-color:#E1306C"/>
                  <stop offset="75%" style="stop-color:#C13584"/>
                  <stop offset="100%" style="stop-color:#405DE6"/>
                </linearGradient>
              </defs>
              <path fill="url(#instagram-gradient-footer)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span>@furniture.house.1</span>
          </a>
          <p class="site-footer-credit">{{ $t('site.footer.credit') }} <a href="https://chladni.co.jp/" target="_blank" rel="noopener" class="site-footer-link">{{ $t('site.footer.company') }}</a></p>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import ChladniIndexPage from '~/components/pages/ChladniIndexPage.vue'

const { locale, setLocale } = useI18n()
const localePath = useLocalePath()

// 画像スライダー（creditは任意、@usernameでInstagramリンク、lightTextで白文字）
const heroImages = [
  { src: '/images/hero/01.webp', alt: 'Furniture House No.1 Photo 1', credit: '@martin_holtkamp', lightText: false },
  { src: '/images/hero/02.webp', alt: 'Furniture House No.1 Photo 2', credit: '@martin_holtkamp', lightText: true },
  { src: '/images/hero/03.webp', alt: 'Furniture House No.1 Photo 3', credit: '', lightText: false },
  { src: '/images/hero/04.webp', alt: 'Furniture House No.1 Photo 4', credit: '', lightText: false },
  { src: '/images/hero/05.webp', alt: 'Furniture House No.1 Photo 5', credit: '', lightText: false },
  { src: '/images/hero/06.webp', alt: 'Furniture House No.1 Photo 6', credit: '', lightText: false },
]

// 上部ギャラリー（4枚）
const galleryTopImages = [
  { src: '/images/hero/gallery-1.webp', alt: 'Interior 1' },
  { src: '/images/hero/gallery-2.webp', alt: 'Interior 2' },
  { src: '/images/hero/gallery-3.webp', alt: 'Interior 3' },
  { src: '/images/hero/gallery-4.webp', alt: 'Interior 4' },
]

// 中間ギャラリー（4枚）
const galleryMiddleImages = [
  { src: '/images/hero/gallery-5.webp', alt: 'Exterior 1' },
  { src: '/images/hero/gallery-6.webp', alt: 'Exterior 2' },
  { src: '/images/hero/gallery-7.webp', alt: 'Exterior 3' },
  { src: '/images/hero/gallery-8.webp', alt: 'Exterior 4' },
]

// 下部ギャラリー（10枚、5x2グリッド）
const galleryBottomImages = [
  { src: '/images/hero/gallery-1.webp', alt: 'Photo 1' },
  { src: '/images/hero/gallery-2.webp', alt: 'Photo 2' },
  { src: '/images/hero/gallery-3.webp', alt: 'Photo 3' },
  { src: '/images/hero/gallery-4.webp', alt: 'Photo 4' },
  { src: '/images/hero/gallery-5.webp', alt: 'Photo 5' },
  { src: '/images/hero/gallery-6.webp', alt: 'Photo 6' },
  { src: '/images/hero/gallery-7.webp', alt: 'Photo 7' },
  { src: '/images/hero/gallery-8.webp', alt: 'Photo 8' },
  { src: '/images/hero/gallery-1.webp', alt: 'Photo 9' },
  { src: '/images/hero/gallery-2.webp', alt: 'Photo 10' },
]

const currentImageIndex = ref(0)
const autoplay = ref(true)
let autoplayInterval: ReturnType<typeof setInterval> | null = null

// 画像読み込み完了時にフェードイン
const onImageLoad = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.classList.add('loaded')
}

// キャッシュされた画像に対応するためのディレクティブ
const vImgLoaded = {
  mounted(el: HTMLImageElement) {
    if (el.complete && el.naturalHeight !== 0) {
      el.classList.add('loaded')
    }
  }
}

const nextImage = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % heroImages.length
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

// 言語切り替え
const toggleLocale = () => {
  const newLocale = locale.value === 'ja' ? 'en' : 'ja'
  setLocale(newLocale)
}

// ドメイン判定
const isChladniDomain = ref(false)

// サーバーサイドでホストを取得
if (import.meta.server) {
  const headers = useRequestHeaders()
  const host = headers['host'] || ''
  isChladniDomain.value = host === 'chladni.co.jp' || host === 'www.chladni.co.jp'
}

// クライアントサイドでホストを取得
if (import.meta.client) {
  isChladniDomain.value = window.location.host === 'chladni.co.jp' || window.location.host === 'www.chladni.co.jp'
}

onMounted(() => {
  if (autoplay.value && !isChladniDomain.value) {
    startAutoplay()
  }
})

onUnmounted(() => {
  stopAutoplay()
})

definePageMeta({
  layout: false
})

// i18n対応のhead設定
const { t } = useI18n()
useHead({
  title: () => t('site.title'),
  meta: [
    { name: 'description', content: () => t('site.meta.description') },
    { property: 'og:title', content: () => t('site.title') },
    { property: 'og:description', content: () => t('site.meta.description') },
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/favicon.png' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500&family=Zen+Kaku+Gothic+New:wght@400;500&display=swap' },
    { rel: 'preload', as: 'image', href: '/images/hero/01.webp' }
  ]
})
</script>

<style scoped>
/* ベース */
.site-page {
  font-family: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #231815;
  line-height: 2.2;
  font-weight: 400;
  font-size: 16px;
  background-color: #ffffff;
  -webkit-font-smoothing: antialiased;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

*, *::before, *::after {
  box-sizing: border-box;
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
  max-width: none;
  margin: 0 auto;
  padding: 0 120px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 1024px) {
  .site-header-inner {
    padding: 0 24px;
  }
}

.site-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.site-logo-img {
  width: 175px;
  height: auto;
}

.site-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.site-lang-switch {
  font-size: 14px;
  font-weight: 400;
  color: #231815;
  background: transparent;
  border: 1px solid #231815;
  padding: 6px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
}

.site-lang-switch:hover {
  background: #231815;
  color: #fff;
}

.site-instagram {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.site-instagram:hover {
  transform: scale(1.15);
  opacity: 0.85;
}

.site-instagram svg {
  transition: transform 0.3s ease;
}

/* ヒーロー */
.site-hero {
  padding-top: 100px;
  width: 100%;
}

.site-hero-main {
  position: relative;
  width: 100%;
  height: 640px;
  overflow: hidden;
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .site-hero {
    padding-top: 80px;
  }

  .site-hero-main {
    height: 400px;
    width: 100%;
  }
}

.site-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.site-hero-credit {
  position: absolute;
  bottom: 16px;
  right: 16px;
  font-size: 12px;
  color: #231815;
  padding: 4px 10px;
}

.site-hero-credit a {
  color: #231815;
  text-decoration: none;
}

.site-hero-credit a:hover {
  text-decoration: underline;
}

.site-hero-credit.light-text,
.site-hero-credit.light-text a {
  color: #fff;
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
  width: 100%;
  background-color: #eeeeee;
  padding: 104px 120px 120px 120px;
  box-sizing: border-box;
}

@media (max-width: 1024px) {
  .site-stay-section {
    padding: 60px 24px;
  }
}

@media (max-width: 768px) {
  .site-stay-section {
    padding: 60px 24px;
    width: 100%;
  }
}

.site-stay-inner {
  max-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 72px;
  align-items: flex-start;
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .site-stay-inner {
    flex-direction: column;
    gap: 40px;
    width: 100%;
  }
}

.site-stay-image {
  flex-shrink: 0;
  width: 50%;
  margin: 0;
  padding: 0;
  position: relative;
}

@media (max-width: 768px) {
  .site-stay-image {
    width: 100%;
  }
}

.site-stay-image img {
  width: 100%;
  height: auto;
  display: block;
}

.site-stay-image-credit {
  position: absolute;
  bottom: 12px;
  right: 12px;
  font-size: 12px;
  color: #231815;
}

.site-stay-image-credit a {
  color: #231815;
  text-decoration: none;
}

.site-stay-image-credit a:hover {
  text-decoration: underline;
}

.site-stay-content {
  flex: 1;
  height: auto;
  margin-top: 40px;
}

.site-stay-title {
  font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif;
  font-size: 40px;
  font-weight: 500;
  letter-spacing: 0;
  margin-bottom: 40px;
  color: #333333;
  line-height: 1.4;
}

.site-stay-text p {
  font-size: 16px;
  line-height: 2.2;
  margin-bottom: 8px;
  color: #231815;
  font-weight: 400;
}

.site-stay-notice {
  font-size: 16px;
  font-weight: 600;
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
  padding: 104px 120px 0 120px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0;
}

@media (max-width: 1024px) {
  .site-structure-section {
    padding: 60px 24px 0;
  }
}

@media (max-width: 768px) {
  .site-structure-section {
    padding: 40px 24px 0;
    width: 100%;
  }

  .site-structure-inner {
    width: 100%;
  }

  .site-structure-title {
    font-size: 32px;
    margin-bottom: 32px;
  }

  .site-structure-flow {
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    gap: 32px;
  }

  .site-structure-text {
    width: 100% !important;
    flex: none !important;
  }

  .site-structure-images {
    width: 100% !important;
    flex: none !important;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .site-structure-figure {
    width: 100%;
  }

  .site-structure-figure img {
    width: 100%;
    height: auto;
  }
}

.site-structure-inner {
  width: 100%;
  max-width: none;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
}

.site-structure-title {
  font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif;
  font-size: 48px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0;
  margin-bottom: 40px;
  color: #333333;
  text-align: left;
}

.site-structure-flow {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 72px;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
}

.site-structure-text {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0;
  margin: 0;
  padding: 0;
}

.site-structure-text p {
  font-size: 16px;
  line-height: 2.2;
  margin-bottom: 24px;
  color: #231815;
  font-weight: 400;
}

.site-structure-images {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: flex-end;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
}

.site-structure-figure {
  width: 100%;
}

.site-structure-figure img {
  width: 100%;
  height: auto;
}

.site-image-caption {
  font-size: 13px;
  color: #666;
  margin-top: 12px;
  line-height: 1.6;
}

.site-structure-text .site-structure-credit {
  display: none;
}

/* 構造体セクション ナビゲーション */
.site-structure-nav {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0 80px;
  gap: 16px;
}

.site-structure-nav-credit {
  font-size: 13px;
  color: #666;
  text-align: center;
}

.site-structure-nav-btns {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.95);
  padding: 6px 10px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.site-structure-nav-btn {
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

.site-structure-nav-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  opacity: 1;
}

/* ギャラリーセクション */
.site-gallery-section {
  padding: 0;
}

.site-gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}

@media (max-width: 768px) {
  .site-gallery-grid {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  .site-gallery-item {
    height: auto !important;
    aspect-ratio: 1 / 1;
  }

  .site-gallery-item:nth-child(n+4) {
    display: none;
  }
}

.site-gallery-item {
  height: 560px;
  overflow: hidden;
  position: relative;
  background: #f0f0f0;
}

.site-gallery-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.site-gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, opacity 0.5s ease;
  opacity: 0;
  position: relative;
  z-index: 1;
}

.site-gallery-img.loaded {
  opacity: 1;
}

.site-gallery-item:hover .site-gallery-img.loaded {
  transform: scale(1.05);
}

/* 下部ギャラリー（10枚、5x2グリッド） */
.site-gallery-grid-10 {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
}

@media (max-width: 768px) {
  .site-gallery-grid-10 {
    grid-template-columns: repeat(3, 1fr) !important;
  }

  .site-gallery-item-10:nth-child(n+10) {
    display: none;
  }
}

.site-gallery-item-10 {
  aspect-ratio: 1 / 1;
  overflow: hidden;
  position: relative;
  background: #f0f0f0;
}

.site-gallery-item-10 .site-gallery-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.site-gallery-item-10 .site-gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, opacity 0.5s ease;
  opacity: 0;
  position: relative;
  z-index: 1;
}

.site-gallery-item-10 .site-gallery-img.loaded {
  opacity: 1;
}

.site-gallery-item-10:hover .site-gallery-img.loaded {
  transform: scale(1.05);
}

/* 施設情報セクション */
.site-facility-section {
  background-color: #ffffff;
  padding: 104px 0 104px 0;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .site-facility-section {
    padding: 60px 24px;
  }
}

.site-facility-inner {
  width: 60%;
  max-width: none;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .site-facility-inner {
    width: 100%;
  }
}

.site-facility-title {
  font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif;
  font-size: 32px;
  font-weight: 400;
  margin-bottom: 32px;
  color: #231815;
}

.site-facility-columns {
  display: flex;
  gap: 64px;
  margin-top: 48px;
}

@media (max-width: 768px) {
  .site-facility-columns {
    flex-direction: column;
    gap: 0;
    margin-top: 24px;
  }

  .site-facility-column:first-child,
  .site-facility-column:last-child {
    min-width: auto;
  }

  .site-facility-label {
    width: 80px;
    margin-right: 48px;
  }

  .site-facility-notice {
    text-align: left;
    margin-top: 32px;
  }
}

.site-facility-column:first-child {
  flex: 0 0 auto;
  min-width: 280px;
}

.site-facility-column:last-child {
  flex: 1;
}

.site-facility-row {
  display: flex;
  padding: 8px 0;
}

.site-facility-label {
  width: 56px;
  flex-shrink: 0;
  font-size: 16px;
  line-height: 2.2;
  font-weight: 400;
  color: #231815;
  margin-right: 40px;
}

.site-facility-value {
  font-size: 16px;
  line-height: 2.2;
  font-weight: 400;
  color: #231815;
}

.site-facility-notice {
  margin-top: 48px;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  text-align: center;
}

/* 別荘地セクション */
.site-resort-section {
  background-color: #ffffff;
  padding: 80px 80px;
}

@media (max-width: 768px) {
  .site-resort-section {
    padding: 40px 24px;
  }
}

.site-resort-inner {
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .site-resort-inner {
    max-width: none;
  }

  .site-resort-title {
    font-size: 24px;
  }
}

.site-resort-title {
  font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.4;
  margin-bottom: 32px;
  color: #231815;
}

.site-resort-text p {
  font-size: 16px;
  line-height: 2.2;
  margin-bottom: 24px;
  color: #231815;
  font-weight: 400;
}

/* 宿泊のご案内セクション */
.site-guide-section {
  background-color: #eeeeee;
  padding: 104px 120px;
}

@media (max-width: 1024px) {
  .site-guide-section {
    padding: 60px 24px;
  }
}

.site-guide-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.site-guide-title {
  font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif;
  font-size: 32px;
  font-weight: 400;
  margin-bottom: 32px;
  color: #231815;
  text-align: center;
}

.site-guide-intro {
  font-size: 16px;
  line-height: 2.2;
  color: #231815;
  text-align: center;
  margin-bottom: 64px;
}

.site-guide-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 48px 40px;
}

@media (max-width: 1024px) {
  .site-guide-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 40px 32px;
  }
}

@media (max-width: 768px) {
  .site-guide-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
}

.site-guide-item {
  display: flex;
  flex-direction: column;
}

.site-guide-item-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  margin-bottom: 20px;
}

.site-guide-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.site-guide-item:hover .site-guide-item-image img {
  transform: scale(1.03);
}

.site-guide-item-title {
  font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #231815;
  margin-bottom: 12px;
  line-height: 1.4;
}

.site-guide-item-text {
  font-size: 15px;
  line-height: 2;
  color: #231815;
  font-weight: 400;
}

/* フッター */
.site-footer {
  padding: 40px 80px;
  background-color: #ffffff;
}

@media (max-width: 1024px) {
  .site-footer {
    padding: 40px 24px;
  }
}

.site-footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .site-footer-inner {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}

.site-footer-title {
  font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #231815;
}

.site-footer-right {
  text-align: right;
}

@media (max-width: 768px) {
  .site-footer-right {
    text-align: left;
  }
}

.site-footer-contact {
  font-size: 13px;
  color: #666;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
}

.site-footer-contact:hover {
  text-decoration: underline;
}

.site-footer-instagram {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  margin-bottom: 8px;
  transition: opacity 0.3s ease;
}

.site-footer-instagram:hover {
  opacity: 0.7;
}

.site-footer-instagram span {
  color: #666;
}

.site-footer-credit {
  font-size: 11px;
  color: #999;
}

.site-footer-link {
  color: #999;
  text-decoration: none;
}

.site-footer-link:hover {
  text-decoration: underline;
}
</style>
