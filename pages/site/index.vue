<template>
  <div class="site-page">
    <!-- ヘッダー -->
    <header class="site-header">
      <div class="site-header-inner">
        <a href="/" class="site-logo">
          <img src="/images/title-logo.svg" alt="家具の家 No.1" class="site-logo-img" />
        </a>
        <a href="https://www.instagram.com/furniture.house.1/" target="_blank" rel="noopener" class="site-instagram">
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
    </header>

    <!-- ヒーローセクション -->
    <section class="site-hero">
      <div class="site-hero-main">
        <transition name="fade" mode="out-in">
          <img :key="currentImageIndex" :src="heroImages[currentImageIndex].src" :alt="heroImages[currentImageIndex].alt" class="site-hero-image" />
        </transition>
        <div v-if="heroImages[currentImageIndex].credit" class="site-hero-credit">
          <template v-if="heroImages[currentImageIndex].credit.includes('@')">
            {{ heroImages[currentImageIndex].credit.split('@')[0] }}<a
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
          <img src="/images/hero/07.webp" alt="家具の家 内観" loading="lazy" />
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
        </div>
      </div>
    </section>

    <!-- 構造体セクション -->
    <section class="site-structure-section">
      <div class="site-structure-inner">
        <h2 class="site-structure-title">風の通う家<br>構造体としての家具</h2>
        <div class="site-structure-flow">
          <div class="site-structure-text">
            <p>私たちの「家具の家 No.1」との出会いは、2023年の夏のことでした。山中湖の森の中にひっそりと佇むその空間に、私たちは自然と引き寄せられました。初めて足を踏み入れたとき、目に飛び込んできたのは、整然と並ぶユニット家具と、その上に軽やかに載る屋根。家具がそのまま家を支えている——それは建築というより、空間に浮かぶ「構造そのもの」のようでした。</p>
            <p>この家は1990年代に設計されました。設計者は、後に世界的に活躍する建築家として知られる人物です。この建物を特徴づけるのは、家具ユニットがそのまま構造体となっていること。家具は屋根を支え、壁となり、空間を仕切っています。</p>
            <p>この家が建つ山中湖の別荘地は、かつて日本を代表するクリエイターたちが自らの居場所を設けて別荘を建てた場所でしたが、老朽化により徐々にその姿を消そうとしています。そんな中、この建築家によって設計された3棟のうち、2棟は老朽化で取り壊されてしまいました。</p>
            <p>「家具の家 No.1」も、修復を必要としていました。湿度の高い山中湖の環境が、長年にわたり基礎部分に影響を及ぼしていたのです。2024年の冬、私たちは、屋根と家具の構造体を残したまま、腐食が進んだ基礎と床をすべて入れ替えるという修復作業を行いました。家具が宙に浮いたまま床を解体した姿は、この家の構造を体現するようでもありました。</p>
            <p>実際にこの家で時間を過ごしてみると、空気の流れや光の移ろい、そして音の吸い込み方までが、家具によって誘われていることに気づかされます。内と外の境界は限りなくゆるやかで、風は自由に通り抜け、建築は静かに呼吸しているように感じられます。</p>
            <p>人が使い、風が動き、建築が呼吸する——そんな体験に、私たちは心を奪われました。ただ眺めるだけでなく、実際に泊まり、静かな時間の流れのなかで、構造体としての家具に囲まれる不思議な感覚を、多くの人に体験してもらいただきたい。そうすればこの家は、腐ちることなく、これからも長く息づいていくことでしょう。</p>
            <p class="site-structure-credit">家具の家No.1 運営委員会</p>
          </div>
          <div class="site-structure-images">
            <div class="site-structure-figure">
              <img src="/images/hero/08.webp" alt="家具が構造体として機能する" loading="lazy" />
              <p class="site-image-caption">家具が構造体として機能する</p>
            </div>
            <div class="site-structure-figure">
              <img src="/images/hero/09.webp" alt="家具を残した基礎と床の修繕課程" loading="lazy" />
              <p class="site-image-caption">家具を残した基礎と床の修繕課程</p>
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
        <h2 class="site-facility-title">施設情報</h2>
        <div class="site-facility-columns">
          <div class="site-facility-column">
            <div class="site-facility-row">
              <span class="site-facility-label">用途</span>
              <span class="site-facility-value">保養所</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">設計</span>
              <span class="site-facility-value">坂茂建築設計</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">所在</span>
              <span class="site-facility-value">山梨県 山中湖村</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">竣工</span>
              <span class="site-facility-value">1995年</span>
            </div>
          </div>
          <div class="site-facility-column">
            <div class="site-facility-row">
              <span class="site-facility-label">構造</span>
              <span class="site-facility-value">木造平屋</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">面積</span>
              <span class="site-facility-value">約100㎡</span>
            </div>
            <div class="site-facility-row">
              <span class="site-facility-label">間取</span>
              <span class="site-facility-value">リビングキッチン、お風呂トイレ、和室、洋室</span>
            </div>
          </div>
        </div>
        <p class="site-facility-notice">※冬季休業中のため、2026年1月31日予約開始、予約可能日4月1日以降となります。</p>
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
        <h2 class="site-resort-title">別荘地について</h2>
        <div class="site-resort-text">
          <p>雄大な富士山と山中湖を臨むこの別荘地は、1960年代後半に開発されました。この地が特徴されるのは、当時日本を代表するクリエイターたちが、近代日本を代表する建築家や、後に世界的な評価を得る若き建築家達に、自身の別荘を創造的な実験の機会として設計を依頼し、さらには分野を超え互いに刺激し合うコミュニティを形成していたことでした。</p>
          <p>しかし時が経つにつれ、これらの貴重な建築群は少しずつ姿を消し、それに伴い、その記憶や文化的価値もまた失われつつあります。この地の持つ豊かな物語と、それが日本のクリエイティブシーンに与えた影響を深く認識し、未来へと語り継いでいくことが私たちの願いです。</p>
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
        <h2 class="site-guide-title">宿泊のご案内</h2>
        <p class="site-guide-intro">
          雨を気にせず集まってBBQをする、寝っ転がって景色を眺める、読書にふける。<br>
          あなたらしい過ごし方が、この空間で見つかりますように。
        </p>

        <div class="site-guide-grid">
          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-1.webp" alt="大きな窓" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">大きな窓</h3>
            <p class="site-guide-item-text">リビングには大きな4枚のガラス戸。一度はぜひ全開にしてみてください。心地よい風が部屋を抜け、内と外の境界がふっと溶けていく感覚を味わってください。</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-2.webp" alt="テラスで、コーヒー" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">テラスで、コーヒー</h3>
            <p class="site-guide-item-text">晴れも雨でも、コーヒーはデッキテラスで。大平山を望みながら深呼吸をすれば、からだの芯まで澄み渡るような時間が流れます。</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-3.webp" alt="全身で、朝の光" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">全身で、朝の光</h3>
            <p class="site-guide-item-text">静けさの中でぐっすりと眠った朝。遮光カーテンを開けて、差し込む朝日をたっぷり浴びれば、身体も心もふんわりと目覚めていきます。</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-4.webp" alt="リビングに、キッチン" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">リビングに、キッチン</h3>
            <p class="site-guide-item-text">リビングの中にキッチンがあるから、くつろぎながら料理を楽しめます。必要な道具は一通りそろえていますので、ご安心を。</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-5.webp" alt="森の中の、お風呂" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">森の中の、お風呂</h3>
            <p class="site-guide-item-text">寒冷地仕様のため追焚きはできませんが、ブラインドを開ければ森に溶け込むような開放感。外の緑を眺めながら、静かなお風呂の時間をお楽しみください。</p>
          </div>

          <div class="site-guide-item">
            <div class="site-guide-item-image">
              <img src="/images/hero/guide-6.webp" alt="クーラーは、山中湖の風" loading="lazy" />
            </div>
            <h3 class="site-guide-item-title">クーラーは、山中湖の風</h3>
            <p class="site-guide-item-text">山中湖の澄んだ空気を感じていただきたいので、エアコンは設置していません。山中湖の天然クーラーを感じてください。</p>
          </div>
        </div>
      </div>
    </section>

    <!-- フッター -->
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span class="site-footer-title">家具の家 No.1</span>
        <div class="site-footer-right">
          <p class="site-footer-credit">運営：家具の家 no.1 運営委員会 ＋ <a href="https://chladni.co.jp/" target="_blank" rel="noopener" class="site-footer-link">株式会社クラドニ</a></p>
        </div>
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
// 画像スライダー（creditは任意、@usernameでInstagramリンク）
const heroImages = [
  { src: '/images/hero/01.webp', alt: '家具の家 No.1 写真1', credit: 'Photo by @martin_holtkamp' },
  { src: '/images/hero/02.webp', alt: '家具の家 No.1 写真2', credit: '' },
  { src: '/images/hero/03.webp', alt: '家具の家 No.1 写真3', credit: '' },
  { src: '/images/hero/04.webp', alt: '家具の家 No.1 写真4', credit: '' },
  { src: '/images/hero/05.webp', alt: '家具の家 No.1 写真5', credit: '' },
  { src: '/images/hero/06.webp', alt: '家具の家 No.1 写真6', credit: '' },
]

// 上部ギャラリー（4枚）
const galleryTopImages = [
  { src: '/images/hero/gallery-1.webp', alt: '内観1' },
  { src: '/images/hero/gallery-2.webp', alt: '内観2' },
  { src: '/images/hero/gallery-3.webp', alt: '内観3' },
  { src: '/images/hero/gallery-4.webp', alt: '内観4' },
]

// 中間ギャラリー（4枚）
const galleryMiddleImages = [
  { src: '/images/hero/gallery-5.webp', alt: '外観1' },
  { src: '/images/hero/gallery-6.webp', alt: '外観2' },
  { src: '/images/hero/gallery-7.webp', alt: '外観3' },
  { src: '/images/hero/gallery-8.webp', alt: '外観4' },
]

// 下部ギャラリー（10枚、5x2グリッド）
const galleryBottomImages = [
  { src: '/images/hero/gallery-1.webp', alt: '写真1' },
  { src: '/images/hero/gallery-2.webp', alt: '写真2' },
  { src: '/images/hero/gallery-3.webp', alt: '写真3' },
  { src: '/images/hero/gallery-4.webp', alt: '写真4' },
  { src: '/images/hero/gallery-5.webp', alt: '写真5' },
  { src: '/images/hero/gallery-6.webp', alt: '写真6' },
  { src: '/images/hero/gallery-7.webp', alt: '写真7' },
  { src: '/images/hero/gallery-8.webp', alt: '写真8' },
  { src: '/images/hero/gallery-1.webp', alt: '写真9' },
  { src: '/images/hero/gallery-2.webp', alt: '写真10' },
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

.site-instagram {
  display: flex;
  align-items: center;
  transition: opacity 0.3s;
}

.site-instagram:hover {
  opacity: 0.7;
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
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  padding: 4px 10px;
  border-radius: 4px;
}

.site-hero-credit a {
  color: #fff;
  text-decoration: none;
}

.site-hero-credit a:hover {
  text-decoration: underline;
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
