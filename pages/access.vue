<template>
  <div class="access-page">
    <!-- Header -->
    <header class="access-header">
      <NuxtLink to="/" class="back-to-top">
        ← トップへ戻る
      </NuxtLink>
      <div class="access-header-inner">
        <h1>アクセス</h1>
      </div>
    </header>

    <div class="access-container">
      <nav class="section-nav">
        <a
          v-for="nav in navItems"
          :key="nav.id"
          :href="`#${nav.id}`"
          :class="['nav-btn', { active: activeSection === nav.id }]"
          @click="setActiveSection(nav.id)"
        >
          {{ nav.label }}
        </a>
      </nav>
    </div>

    <main class="access-container">
      <!-- 車｜中央道ルート -->
      <section id="car-chuo" class="section">
        <div class="section-header">
          <span class="section-number">01</span>
          <h2 class="section-title">車で行く｜中央自動車道ルート</h2>
        </div>

        <div class="route-grid single">
          <div class="route-card">
            <div class="route-header">
              <h3>調布IC → 河口湖IC → 山中湖IC</h3>
              <span class="route-badge">河口湖経由</span>
            </div>
            <div class="route-body">
              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">中央道 調布IC</span>
                  </div>
                  <span class="step-transport">中央自動車道 約60分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">河口湖IC</span>
                  </div>
                  <span class="step-transport">東富士五湖道路 約20分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖IC</span>
                  </div>
                  <span class="step-transport">一般道 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約1時間30分</span>
                  </div>
                </div>
              </div>

              <div class="warning-box">
                <div class="title">⚠ ご注意</div>
                <p>高井戸ICには上り方面（山梨方面）の入口がありません。永福ICから首都高経由、または調布ICからご利用ください。</p>
              </div>

              <div class="spots-box">
                <div class="title">このルートで寄れるスポット</div>
                <div class="spots-list">
                  <div class="spot-item">
                    <span class="spot-icon">🏔</span>
                    <div class="spot-info">
                      <div class="name">河口湖</div>
                      <div class="meta">河口湖ICから約5分</div>
                    </div>
                  </div>
                  <div class="spot-item">
                    <span class="spot-icon">🎢</span>
                    <div class="spot-info">
                      <div class="name">富士急ハイランド</div>
                      <div class="meta">河口湖IC最寄</div>
                    </div>
                  </div>
                  <div class="spot-item">
                    <span class="spot-icon">🗻</span>
                    <div class="spot-info">
                      <div class="name">忍野八海</div>
                      <div class="meta">山中湖ICから約10分</div>
                    </div>
                  </div>
                  <div class="spot-item">
                    <span class="spot-icon">🌊</span>
                    <div class="spot-info">
                      <div class="name">山中湖</div>
                      <div class="meta">山中湖ICすぐ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 車｜東名ルート -->
      <section id="car-tomei" class="section">
        <div class="section-header">
          <span class="section-number">02</span>
          <h2 class="section-title">車で行く｜東名高速ルート</h2>
        </div>

        <div class="route-grid single">
          <div class="route-card">
            <div class="route-header">
              <h3>用賀IC → 御殿場IC → 山中湖IC</h3>
              <span class="route-badge">御殿場経由</span>
            </div>
            <div class="route-body">
              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">東名高速 用賀IC</span>
                  </div>
                  <span class="step-transport">東名高速道路 約60分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">御殿場IC</span>
                  </div>
                  <span class="step-transport">国道138号→須走IC→東富士五湖道路 約30分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖IC</span>
                  </div>
                  <span class="step-transport">一般道 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約1時間40分</span>
                  </div>
                </div>
              </div>

              <div class="spots-box">
                <div class="title">このルートで寄れるスポット</div>
                <div class="spots-list">
                  <div class="spot-item">
                    <span class="spot-icon">🛍️</span>
                    <div class="spot-info">
                      <div class="name">御殿場プレミアム・アウトレット</div>
                      <div class="meta">御殿場ICから約5分</div>
                    </div>
                  </div>
                  <div class="spot-item">
                    <span class="spot-icon">♨️</span>
                    <div class="spot-info">
                      <div class="name">木の花の湯</div>
                      <div class="meta">アウトレット隣接</div>
                    </div>
                  </div>
                  <div class="spot-item">
                    <span class="spot-icon">🗻</span>
                    <div class="spot-info">
                      <div class="name">忍野八海</div>
                      <div class="meta">山中湖ICから約10分</div>
                    </div>
                  </div>
                  <div class="spot-item">
                    <span class="spot-icon">🌊</span>
                    <div class="spot-info">
                      <div class="name">山中湖</div>
                      <div class="meta">山中湖ICすぐ</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 高速バス＋レンタカー・タクシー -->
      <section id="bus" class="section">
        <div class="section-header">
          <span class="section-number">03</span>
          <h2 class="section-title">高速バス＋レンタカー・タクシー</h2>
        </div>

        <div class="route-grid">
          <div class="route-card">
            <div class="route-header">
              <h3>新宿から高速バス＋タクシー</h3>
              <span class="route-badge">乗換1回</span>
            </div>
            <div class="route-body">
              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">バスタ新宿</span>
                  </div>
                  <span class="step-transport">富士五湖線（富士急・京王バス）約2時間20分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖旭日丘</span>
                  </div>
                  <span class="step-transport">タクシー 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約2時間30分</span>
                  </div>
                </div>
              </div>

              <div class="info-box">
                <div class="title">高速バス情報</div>
                <ul>
                  <li>1日約40便運行</li>
                  <li>事前予約推奨</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <h3>新宿から高速バス＋レンタカー</h3>
              <span class="route-badge">現地で自由に</span>
            </div>
            <div class="route-body">
              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">バスタ新宿</span>
                  </div>
                  <span class="step-transport">高速バス 約2時間20分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖旭日丘</span>
                  </div>
                  <span class="step-transport">レンタカー 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約2時間30分</span>
                  </div>
                </div>
              </div>

              <div class="info-box">
                <div class="title">山中湖のレンタカー</div>
                <ul>
                  <li><a href="https://rent.toyota.co.jp/sp/shop/detail.aspx?rCode=63901&eCode=012" target="_blank" rel="noopener noreferrer">トヨタレンタカー山中湖店</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <h3>タクシー情報</h3>
              <span class="route-badge">参考情報</span>
            </div>
            <div class="route-body">
              <p class="route-description">
                山中湖旭日丘バス停から家具の家まで、タクシーで約10分です。
              </p>

              <div class="info-box">
                <div class="title">タクシー会社</div>
                <ul>
                  <li><a href="https://kyowa-taxi.jp/" target="_blank" rel="noopener noreferrer">共和タクシー（山中湖）</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 電車＋バス・タクシー・レンタカー -->
      <section id="train" class="section">
        <div class="section-header">
          <span class="section-number">04</span>
          <h2 class="section-title">電車＋バス・タクシー・レンタカー</h2>
        </div>

        <div class="route-grid">
          <div class="route-card">
            <div class="route-header">
              <h3>新宿から御殿場経由</h3>
              <span class="route-badge">小田急ふじさん号</span>
            </div>
            <div class="route-body">
              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">小田急 新宿駅</span>
                  </div>
                  <span class="step-transport">特急ふじさん号 約1時間40分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">御殿場駅</span>
                  </div>
                  <span class="step-transport">富士急バス 約40分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖エリア</span>
                  </div>
                  <span class="step-transport">タクシー 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約2時間40分</span>
                  </div>
                </div>
              </div>

              <div class="info-box">
                <div class="title">乗換情報</div>
                <ul>
                  <li>特急ふじさん号は要予約</li>
                  <li>御殿場駅から路線バス利用</li>
                </ul>
              </div>

              <div class="info-box secondary">
                <div class="title">御殿場駅でレンタカーも可</div>
                <ul>
                  <li>トヨタレンタカー御殿場駅前店（駅徒歩1分）</li>
                  <li>日産レンタカー御殿場駅前（駅徒歩2分）</li>
                  <li>御殿場駅から家具の家まで車で約40分</li>
                </ul>
              </div>

              <div class="spots-box">
                <div class="title">このルートで寄れるスポット</div>
                <div class="spots-list">
                  <div class="spot-item">
                    <span class="spot-icon">🛍️</span>
                    <div class="spot-info">
                      <div class="name">御殿場プレミアム・アウトレット</div>
                      <div class="meta">御殿場駅からバス約15分</div>
                    </div>
                  </div>
                  <div class="spot-item">
                    <span class="spot-icon">♨️</span>
                    <div class="spot-info">
                      <div class="name">木の花の湯</div>
                      <div class="meta">アウトレット隣接の日帰り温泉</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <h3>品川・東京から御殿場経由</h3>
              <span class="route-badge">JR御殿場線</span>
            </div>
            <div class="route-body">
              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">品川駅 / 東京駅</span>
                  </div>
                  <span class="step-transport">東海道本線→国府津で乗換→御殿場線 約2時間</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">御殿場駅</span>
                  </div>
                  <span class="step-transport">富士急バス 約40分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">山中湖エリア</span>
                  </div>
                  <span class="step-transport">タクシー 約10分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約3時間</span>
                  </div>
                </div>
              </div>

              <div class="info-box">
                <div class="title">ルート情報</div>
                <ul>
                  <li>国府津駅でJR御殿場線に乗換</li>
                  <li>のんびり車窓を楽しみたい方に</li>
                </ul>
              </div>

              <div class="info-box secondary">
                <div class="title">御殿場駅でレンタカーも可</div>
                <ul>
                  <li>トヨタレンタカー御殿場駅前店（駅徒歩1分）</li>
                  <li>日産レンタカー御殿場駅前（駅徒歩2分）</li>
                  <li>御殿場駅から家具の家まで車で約40分</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <h3>新宿から河口湖経由</h3>
              <span class="route-badge">特急富士回遊</span>
            </div>
            <div class="route-body">
              <div class="route-visual">
                <div class="route-step start">
                  <div class="step-main">
                    <span class="step-place">JR新宿駅</span>
                  </div>
                  <span class="step-transport">特急富士回遊 約1時間50分</span>
                </div>
                <div class="route-step">
                  <div class="step-main">
                    <span class="step-place">河口湖駅</span>
                  </div>
                  <span class="step-transport">レンタカー 約30分</span>
                </div>
                <div class="route-step end">
                  <div class="step-main">
                    <span class="step-place">家具の家</span>
                    <span class="step-time">計 約2時間20分</span>
                  </div>
                </div>
              </div>

              <div class="info-box">
                <div class="title">乗換情報</div>
                <ul>
                  <li>特急富士回遊は要予約</li>
                  <li>河口湖駅前にレンタカー各社あり</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="route-card">
            <div class="route-header">
              <h3>タクシー情報</h3>
              <span class="route-badge">参考情報</span>
            </div>
            <div class="route-body">
              <p class="route-description">
                山中湖エリアから家具の家まで、タクシーで約10分です。
              </p>

              <div class="info-box">
                <div class="title">タクシー会社</div>
                <ul>
                  <li><a href="https://kyowa-taxi.jp/" target="_blank" rel="noopener noreferrer">共和タクシー（山中湖）</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Location -->
      <div class="location-box">
        <p class="label">LOCATION</p>
        <p class="place">山中湖エリア</p>
        <p class="note">詳細な住所は予約確定後にお知らせします</p>
      </div>
    </main>

    <!-- 注意書き -->
    <div class="access-notice">
      <p>
        バス時刻・料金は変更になる場合があります。お出かけ前に各交通機関の公式サイトをご確認ください。
      </p>
    </div>

    <!-- 共通フッター -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const activeSection = ref('car-chuo')

const navItems = [
  { id: 'car-chuo', label: '車｜中央道ルート' },
  { id: 'car-tomei', label: '車｜東名ルート' },
  { id: 'bus', label: '高速バス＋レンタカー・タクシー' },
  { id: 'train', label: '電車＋バス・タクシー・レンタカー' },
]

const setActiveSection = (id: string) => {
  activeSection.value = id
}

onMounted(() => {
  const sections = document.querySelectorAll('section[id]')

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id')
          if (id) {
            activeSection.value = id
          }
        }
      })
    },
    { rootMargin: '-20% 0px -80% 0px' }
  )

  sections.forEach((section) => observer.observe(section))
})

useHead({
  title: 'アクセス | 家具の家 No.1',
  meta: [
    { name: 'description', content: '家具の家 No.1へのアクセス方法。車、高速バス、電車でのルートをご案内します。' },
    { property: 'og:title', content: 'アクセス | 家具の家 No.1' },
    { property: 'og:description', content: '家具の家 No.1へのアクセス方法' },
    { name: 'robots', content: 'index, follow' }
  ],
})
</script>

<style scoped>
.access-page {
  font-family: 'Noto Sans JP', 'Tsukushi Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', sans-serif;
  background-color: #ffffff;
  color: #1a1a1a;
  line-height: 1.8;
  min-height: 100vh;
}

/* Header */
.access-header {
  background: #000000;
  color: #ffffff;
  padding: 32px 24px;
  text-align: center;
  border-bottom: 1px solid #3a3a3a;
  position: relative;
}

.access-header-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.access-header h1 {
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  color: #ffffff;
}

/* Back to Top Button */
.back-to-top {
  position: absolute;
  top: 24px;
  left: 24px;
  color: #999999;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.back-to-top:hover {
  color: #ffffff;
}

/* Container */
.access-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Section Nav */
.section-nav {
  display: flex;
  border-bottom: 1px solid #dddddd;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.section-nav::-webkit-scrollbar {
  display: none;
}

.nav-btn {
  flex-shrink: 0;
  background: transparent;
  border: none;
  border-right: 1px solid #dddddd;
  padding: 20px 32px;
  font-size: 0.85rem;
  color: #555555;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.nav-btn:last-child {
  border-right: none;
}

.nav-btn:hover {
  background: #f5f5f5;
  color: #000000;
}

.nav-btn.active {
  background: #000000;
  color: #ffffff;
}

/* Section */
.section {
  padding: 64px 0;
  border-bottom: 1px solid #dddddd;
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 40px;
}

.section-number {
  font-size: 0.75rem;
  color: #999999;
  letter-spacing: 0.1em;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 400;
  letter-spacing: 0.05em;
}

/* Route Grid */
.route-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

.route-grid.single {
  max-width: 700px;
}

/* Route Card */
.route-card {
  border: 1px solid #dddddd;
}

.route-header {
  background: #1a1a1a;
  color: #ffffff;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.route-header h3 {
  font-size: 0.95rem;
  font-weight: 500;
}

.route-badge {
  font-size: 0.85rem;
  color: #ffffff;
  letter-spacing: 0.05em;
}

.route-body {
  padding: 24px;
}

.route-description {
  font-size: 0.9rem;
  color: #555555;
  margin-bottom: 20px;
  line-height: 1.9;
}

/* Route Visual */
.route-visual {
  position: relative;
  padding-left: 24px;
  border-left: 2px solid #bbbbbb;
  margin-left: 8px;
}

.route-step {
  position: relative;
  padding: 12px 0;
}

.route-step::before {
  content: '';
  position: absolute;
  left: -29px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #ffffff;
  border: 2px solid #999999;
  border-radius: 50%;
}

.route-step.start::before {
  background: #000000;
  border-color: #000000;
}

.route-step.end::before {
  background: #555555;
  border-color: #555555;
}

.step-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.step-place {
  font-weight: 500;
  font-size: 0.95rem;
}

.step-time {
  font-size: 0.8rem;
  color: #777777;
}

.step-transport {
  display: block;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f5f5f5;
  font-size: 0.8rem;
  color: #555555;
  border-left: 2px solid #bbbbbb;
}

/* Info Box */
.info-box {
  background: #f5f5f5;
  padding: 20px;
  margin-top: 24px;
  border-left: 3px solid #000000;
}

.info-box.secondary {
  margin-top: 16px;
  border-left-color: #999999;
}

.info-box .title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #000000;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}

.info-box ul {
  list-style: none;
  font-size: 0.85rem;
  color: #555555;
  padding: 0;
  margin: 0;
}

.info-box li {
  padding: 4px 0;
  padding-left: 16px;
  position: relative;
}

.info-box li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: #999999;
}

.info-box a {
  color: #000000;
  text-decoration: underline;
}

.info-box a:hover {
  text-decoration: none;
}

/* Spots Box */
.spots-box {
  margin-top: 24px;
  padding: 20px;
  border: 1px solid #dddddd;
  background: #ffffff;
}

.spots-box .title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #777777;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.spots-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
}

.spot-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.spot-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.spot-info .name {
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 2px;
}

.spot-info .meta {
  font-size: 0.75rem;
  color: #777777;
}

/* Warning Box */
.warning-box {
  background: #1a1a1a;
  color: #ffffff;
  padding: 20px;
  margin-top: 24px;
}

.warning-box .title {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.warning-box p {
  font-size: 0.85rem;
  color: #bbbbbb;
}

/* Location Box */
.location-box {
  padding: 48px;
  border: 1px solid #dddddd;
  text-align: center;
  margin: 48px 0;
}

.location-box .label {
  font-size: 0.7rem;
  color: #777777;
  letter-spacing: 0.2em;
  margin-bottom: 12px;
}

.location-box .place {
  font-size: 1.25rem;
  margin-bottom: 8px;
}

.location-box .note {
  font-size: 0.8rem;
  color: #777777;
}

/* Notice */
.access-notice {
  background: #f5f5f5;
  border-top: 1px solid #dddddd;
  padding: 48px 24px;
  text-align: center;
}

.access-notice p {
  font-size: 0.8rem;
  color: #777777;
  max-width: 600px;
  margin: 0 auto;
}

/* PC Layout */
@media (min-width: 768px) {
  .access-header {
    padding: 56px 48px;
  }

  .access-header h1 {
    font-size: 1.75rem;
  }

  .access-container {
    padding: 0 48px;
  }

  .nav-btn {
    padding: 24px 48px;
    font-size: 0.9rem;
  }

  .section {
    padding: 80px 0;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .route-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .route-grid.single {
    grid-template-columns: 1fr;
  }

  .spots-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .access-header {
    padding: 70px 64px;
  }

  .access-header h1 {
    font-size: 2rem;
  }

  .section-header {
    margin-bottom: 48px;
  }

  .route-body {
    padding: 32px;
  }
}

/* Mobile adjustments */
@media (max-width: 480px) {
  .access-header {
    padding: 40px 20px;
  }

  .access-container {
    padding: 0 20px;
  }

  .section {
    padding: 48px 0;
  }

  .spots-list {
    grid-template-columns: 1fr;
  }

  .route-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
