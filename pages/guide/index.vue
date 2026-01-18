<template>
  <div>
    <!-- ヒーローセクション -->
    <section class="relative h-[50vh] min-h-[300px] overflow-hidden">
      <img
        src="/images/hero/guide-top.webp"
        alt="家具の家 no.1"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
        <div class="bg-black/50 backdrop-blur-sm rounded-2xl px-8 py-6 md:px-12 md:py-8 flex flex-col items-center">
          <h1 class="text-3xl md:text-5xl lg:text-6xl font-bold tracking-wider text-white text-center" style="font-family: 'Inter', 'SF Pro Display', -apple-system, sans-serif;">
            {{ $t('guestGuide.hero.welcome') }}
          </h1>

          <!-- 宿泊者情報 -->
          <div v-if="guestName" class="mt-5 space-y-2 text-center">
            <p class="text-xl md:text-2xl font-medium tracking-wide text-white">
              {{ guestName }} 様
            </p>
            <p v-if="stayInfoText" class="text-base md:text-lg font-light text-white">
              {{ stayInfoText }}
            </p>
          </div>

          <!-- パーソナライズされたメッセージ -->
          <p class="mt-5 text-sm md:text-base font-light tracking-wide text-white max-w-lg text-center leading-relaxed">
            {{ personalizedMessage }}
          </p>
        </div>
      </div>
    </section>

    <!-- 天気・室内温湿度 -->
    <WeatherWidget />

    <!-- Wi-Fi情報 (認証済みの場合) -->
    <section v-if="isAuthenticated" class="bg-primary-50 border-b border-primary-100">
      <div class="container-responsive py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📶</span>
            <div>
              <p class="text-xs text-primary-600 font-medium">Wi-Fi</p>
              <p class="text-sm font-semibold text-gray-900">Furniture-a / Furniture-b</p>
            </div>
          </div>
          <button
            @click="copyWifiPassword"
            class="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          >
            {{ copied ? $t('guestGuide.wifi.copied') : $t('guestGuide.wifi.copyPassword') }}
          </button>
        </div>
      </div>
    </section>

    <!-- クイックアクセス -->
    <section class="container-responsive py-8">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          v-for="action in quickActions"
          :key="action.to"
          :to="action.to"
          class="guide-card flex flex-col items-center p-5 text-center hover:shadow-lg transition-shadow"
        >
          <span class="text-3xl mb-2">{{ action.icon }}</span>
          <span class="text-sm font-medium text-gray-900">{{ $t(action.labelKey) }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- お出かけ前にお知らせしたいこと -->
    <section class="bg-amber-50 border-y border-amber-100">
      <div class="container-responsive py-6">
        <div class="flex items-start gap-3">
          <span class="text-2xl">📢</span>
          <div>
            <h2 class="text-base font-bold text-amber-900 mb-2">
              {{ $t('guestGuide.notice.title') }}
            </h2>
            <ul class="text-sm text-amber-800 space-y-1">
              <li>• {{ $t('guestGuide.notice.item1') }}</li>
              <li>• {{ $t('guestGuide.notice.item2') }}</li>
              <li>• {{ $t('guestGuide.notice.item3') }}</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- セクション一覧 -->
    <section class="container-responsive py-8">
      <h2 class="text-lg font-bold text-gray-900 mb-4">{{ $t('guestGuide.sections.title') }}</h2>
      <div class="space-y-3">
        <NuxtLink
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          class="guide-card flex items-center gap-4 p-4"
        >
          <span class="text-2xl">{{ section.icon }}</span>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t(section.titleKey) }}</h3>
            <p class="text-xs text-gray-500">{{ $t(section.descKey) }}</p>
          </div>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </section>

    <!-- 緊急連絡先 -->
    <section class="container-responsive pb-8">
      <GuideEmergencyContact />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useGuideState } from '~/middleware/guest-guide'

definePageMeta({
  layout: 'guide',
  middleware: ['guest-guide']
})

const { t } = useI18n()

// ゲスト認証状態
const guideState = useGuideState()

// 開発用サンプルデータ（?sample=true でアクセス時に表示）
const route = useRoute()
const showSample = computed(() => route.query.sample === 'true')

const sampleData = {
  guestName: '佐藤',
  checkInDate: new Date(2025, 0, 20),  // 1月20日
  checkOutDate: new Date(2025, 0, 22), // 1月22日
  adults: 2,
  children: 1,
  infants: 0
}

const isAuthenticated = computed(() => showSample.value || (guideState.value?.isAuthenticated ?? false))
const guestName = computed(() => showSample.value ? sampleData.guestName : (guideState.value?.guestName ?? ''))
const checkInDate = computed(() => showSample.value ? sampleData.checkInDate : (guideState.value?.checkInDate ?? null))
const checkOutDate = computed(() => showSample.value ? sampleData.checkOutDate : (guideState.value?.checkOutDate ?? null))
const tokenData = computed(() => showSample.value ? sampleData : (guideState.value?.tokenData ?? null))

// 宿泊人数を取得
const guestCount = computed(() => {
  if (!tokenData.value) return null
  const adults = tokenData.value.adults || 0
  const children = tokenData.value.children || 0
  const infants = tokenData.value.infants || 0
  return { adults, children, infants, total: adults + children + infants }
})

// 滞在日数
const stayNights = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return 0
  const diffTime = checkOutDate.value.getTime() - checkInDate.value.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 滞在までの日数
const daysUntilStay = computed(() => {
  if (!checkInDate.value) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const checkIn = new Date(checkInDate.value)
  checkIn.setHours(0, 0, 0, 0)
  const diffTime = checkIn.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// 宿泊情報テキスト（日付・人数）
const stayInfoText = computed(() => {
  if (!checkInDate.value || !checkOutDate.value) return ''

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }

  let text = `${formatDate(checkInDate.value)} 〜 ${formatDate(checkOutDate.value)}（${stayNights.value}泊）`

  if (guestCount.value && guestCount.value.total > 0) {
    const parts = []
    if (guestCount.value.adults > 0) parts.push(`大人${guestCount.value.adults}名`)
    if (guestCount.value.children > 0) parts.push(`お子様${guestCount.value.children}名`)
    if (guestCount.value.infants > 0) parts.push(`乳幼児${guestCount.value.infants}名`)
    text += ` / ${parts.join('・')}`
  }

  return text
})

// 滞在時期の季節を判定
const getSeasonForMonth = (month: number): 'spring' | 'summer' | 'autumn' | 'winter' => {
  if (month >= 2 && month <= 4) return 'spring'   // 3-5月
  if (month >= 5 && month <= 7) return 'summer'   // 6-8月
  if (month >= 8 && month <= 10) return 'autumn'  // 9-11月
  return 'winter'                                  // 12-2月
}

// 季節ごとの山中湖の魅力
const seasonalDescriptions: Record<string, string> = {
  spring: '新緑が芽吹き、山桜が咲き誇る季節',
  summer: '木漏れ日が揺れ、涼やかな風が通り抜ける季節',
  autumn: '紅葉に染まり、澄んだ空気に包まれる季節',
  winter: '凛とした空気と、雪化粧した富士山が美しい季節'
}

// パーソナライズされたメッセージを生成
const personalizedMessage = computed(() => {
  const now = new Date()
  const days = daysUntilStay.value

  // 認証されていない場合は現在の季節のメッセージ
  if (!isAuthenticated.value || !checkInDate.value) {
    const currentSeason = getSeasonForMonth(now.getMonth())
    return `${seasonalDescriptions[currentSeason]}の山中湖。家具の家で特別な時間をお過ごしください。`
  }

  const staySeason = getSeasonForMonth(checkInDate.value.getMonth())
  const staySeasonDesc = seasonalDescriptions[staySeason]

  // 滞在中
  if (days !== null && days <= 0 && checkOutDate.value && now <= checkOutDate.value) {
    return `ご滞在をお楽しみいただいていますでしょうか。${staySeasonDesc}の山中湖で、家具が構造体となるこの空間をゆっくりとお過ごしください。`
  }

  // 滞在終了後
  if (days !== null && checkOutDate.value && now > checkOutDate.value) {
    return `ご滞在ありがとうございました。またのお越しを心よりお待ちしております。`
  }

  // 今日チェックイン
  if (days === 0) {
    return `本日のご到着、心よりお待ちしております。${staySeasonDesc}の山中湖で、特別な時間をお過ごしください。`
  }

  // 明日チェックイン
  if (days === 1) {
    return `いよいよ明日ですね。${staySeasonDesc}の山中湖が、皆様をお迎えする準備を整えてお待ちしております。`
  }

  // 2-3日前
  if (days !== null && days >= 2 && days <= 3) {
    return `ご滞在まであと${days}日。${staySeasonDesc}の山中湖で、忘れられない思い出をお作りください。`
  }

  // 1週間以内
  if (days !== null && days >= 4 && days <= 7) {
    return `ご滞在まであと${days}日となりました。${staySeasonDesc}の山中湖が皆様をお待ちしております。`
  }

  // 2週間以内
  if (days !== null && days >= 8 && days <= 14) {
    return `ご滞在まであと約${Math.ceil(days / 7)}週間。${staySeasonDesc}の山中湖で過ごす時間を、どうぞ楽しみにお待ちください。`
  }

  // 1ヶ月以内
  if (days !== null && days >= 15 && days <= 30) {
    return `ご滞在まであと約${Math.ceil(days / 7)}週間。${staySeasonDesc}の山中湖で、家具の家ならではの建築体験が皆様をお待ちしております。`
  }

  // 2ヶ月以内
  if (days !== null && days >= 31 && days <= 60) {
    return `ご予約ありがとうございます。${staySeasonDesc}の山中湖で過ごす特別な時間まで、あと約${Math.ceil(days / 30)}ヶ月。楽しみにお待ちください。`
  }

  // 2ヶ月以上先
  if (days !== null && days > 60) {
    const months = Math.ceil(days / 30)
    return `ご予約ありがとうございます。${staySeasonDesc}の山中湖でお会いできる日を、約${months}ヶ月後に心待ちにしております。`
  }

  // フォールバック
  return `${staySeasonDesc}の山中湖。家具の家で特別な時間をお過ごしください。`
})

// Wi-Fiパスワードコピー
const copied = ref(false)
const copyWifiPassword = async () => {
  try {
    await navigator.clipboard.writeText('House-01')
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}

// クイックアクション
const quickActions = [
  { to: '/guide/checkin', icon: '🔑', labelKey: 'guestGuide.quick.checkin' },
  { to: '/guide/wifi', icon: '📶', labelKey: 'guestGuide.quick.wifi' },
  { to: '/guide/amenities', icon: '🛋️', labelKey: 'guestGuide.quick.amenities' },
  { to: '/guide/area', icon: '🗺️', labelKey: 'guestGuide.quick.area' },
]

// セクション一覧
const sections = [
  { to: '/guide/about', icon: '🏛️', titleKey: 'guestGuide.sections.about', descKey: 'guestGuide.sections.aboutDesc' },
  { to: '/guide/access', icon: '🚗', titleKey: 'guestGuide.sections.access', descKey: 'guestGuide.sections.accessDesc' },
  { to: '/guide/checkin', icon: '🔑', titleKey: 'guestGuide.sections.checkin', descKey: 'guestGuide.sections.checkinDesc' },
  { to: '/guide/amenities', icon: '🛋️', titleKey: 'guestGuide.sections.amenities', descKey: 'guestGuide.sections.amenitiesDesc' },
  { to: '/guide/area', icon: '🗺️', titleKey: 'guestGuide.sections.area', descKey: 'guestGuide.sections.areaDesc' },
  { to: '/guide/rules', icon: '📋', titleKey: 'guestGuide.sections.rules', descKey: 'guestGuide.sections.rulesDesc' },
  { to: '/guide/faq', icon: '❓', titleKey: 'guestGuide.sections.faq', descKey: 'guestGuide.sections.faqDesc' },
]

// SEO
useHead({
  title: t('guestGuide.meta.title'),
  meta: [
    { name: 'description', content: t('guestGuide.meta.description') }
  ]
})
</script>

<style scoped>
.guide-card {
  @apply bg-white border border-gray-100 shadow-sm;
  transition: all 0.2s ease;
}

.guide-card:hover {
  @apply shadow-md border-gray-200;
}
</style>
