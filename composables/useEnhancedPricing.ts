import type {
  EnhancedPricingSetting,
  EnhancedPriceCalculation,
  SeasonType,
  DayType,
  GuestCountPricing,
  MultiNightPricing
} from '~/types'

/**
 * 日付から曜日タイプを判定（金曜・土曜・祝前日 = weekend）
 */
export function getEnhancedDayType(
  date: Date,
  holidayCalendar?: EnhancedPricingSetting['holidayCalendar']
): DayType {
  const dayOfWeek = date.getDay()

  // 金曜(5)、土曜(6)を休日前日とする
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    return 'weekend'
  }

  // 祝日カレンダーがある場合、祝前日もチェック
  if (holidayCalendar) {
    const nextDay = new Date(date)
    nextDay.setDate(date.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]

    for (const cal of holidayCalendar) {
      if (cal.holidays.includes(nextDayStr)) {
        return 'weekend'
      }
    }
  }

  return 'weekday'
}

/**
 * 日付からシーズンタイプを判定
 */
export function getEnhancedSeasonType(
  date: Date,
  seasonPeriods: EnhancedPricingSetting['seasonPeriods']
): SeasonType {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  for (const period of seasonPeriods) {
    // シンプルな日付範囲チェック
    if (monthDay >= period.startDate && monthDay <= period.endDate) {
      return period.seasonType
    }
  }

  // デフォルトはregular
  return 'regular'
}

/**
 * 泊数に応じた料金率を取得
 */
export function getNightRate(nightNumber: number, multiNightPricing: MultiNightPricing): number {
  const { rates } = multiNightPricing

  switch (nightNumber) {
    case 1:
      return rates.night1
    case 2:
      return rates.night2
    case 3:
      return rates.night3
    case 4:
      return rates.night4
    case 5:
      return rates.night5
    default:
      return rates.night6Plus
  }
}

/**
 * 泊数に応じた説明テキストを取得
 */
export function getNightRateDescription(nightNumber: number, rate: number): string {
  const percentage = Math.round(rate * 100)
  return `${nightNumber}泊目 ${percentage}%`
}

/**
 * 人数別追加料金を計算
 */
export function calculateGuestCountCharges(
  totalAdults: number,
  basePrice: number,
  guestCountPricing: GuestCountPricing
) {
  const charges: {
    guest3rd?: number
    guest4th?: number
    guest5th?: number
    guest6th?: number
    total: number
  } = { total: 0 }

  // 2人以下は追加料金なし
  if (totalAdults <= guestCountPricing.baseGuestCount) {
    return charges
  }

  // 3人目の料金
  const thirdGuestCharge = Math.floor(basePrice * guestCountPricing.thirdGuestRate)

  if (totalAdults >= 3) {
    charges.guest3rd = thirdGuestCharge
    charges.total += thirdGuestCharge
  }

  // 4人目の料金
  if (totalAdults >= 4) {
    charges.guest4th = Math.floor(thirdGuestCharge * guestCountPricing.additionalGuestRates.fourth)
    charges.total += charges.guest4th
  }

  // 5人目の料金
  if (totalAdults >= 5) {
    charges.guest5th = Math.floor(thirdGuestCharge * guestCountPricing.additionalGuestRates.fifth)
    charges.total += charges.guest5th
  }

  // 6人目の料金
  if (totalAdults >= 6) {
    charges.guest6th = Math.floor(thirdGuestCharge * guestCountPricing.additionalGuestRates.sixth)
    charges.total += charges.guest6th
  }

  return charges
}

/**
 * 子供料金を計算
 */
export function calculateChildCharges(
  childrenAges: number[],
  adultPrice: number,
  childPricingRules?: EnhancedPricingSetting['childPricingRules']
) {
  const charges = {
    freeChildren: 0,
    discountedChildren: 0,
    total: 0
  }

  if (!childPricingRules || childrenAges.length === 0) {
    return charges
  }

  for (const age of childrenAges) {
    // ルールに基づいて料金を計算
    let childCharge = 0
    let isFree = false

    for (const rule of childPricingRules) {
      if (age >= rule.ageFrom && age <= rule.ageTo) {
        if (rule.discountType === 'free') {
          isFree = true
          childCharge = 0
        } else if (rule.discountType === 'percentage') {
          // 割引率を適用（例: 50% = 大人料金の50%を請求）
          childCharge = Math.floor(adultPrice * (rule.discountValue / 100))
        }
        break
      }
    }

    // 16歳以上は大人料金
    if (age >= 16) {
      childCharge = adultPrice
    }

    if (isFree) {
      charges.freeChildren++
    } else if (childCharge > 0 && childCharge < adultPrice) {
      charges.discountedChildren++
    }

    charges.total += childCharge
  }

  return charges
}

/**
 * 拡張版料金計算
 */
export function calculateEnhancedPrice(
  checkInDate: Date,
  checkOutDate: Date,
  adultCount: number,
  childrenAges: number[],
  pricingSetting: EnhancedPricingSetting,
  couponDiscountRate: number = 0
): EnhancedPriceCalculation {
  // 泊数を計算
  const numberOfNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (numberOfNights <= 0) {
    throw new Error('無効な日付範囲です')
  }

  const nightlyBreakdown: EnhancedPriceCalculation['nightlyBreakdown'] = []
  let subtotal = 0

  // 各泊の料金を計算
  for (let i = 0; i < numberOfNights; i++) {
    const currentDate = new Date(checkInDate)
    currentDate.setDate(checkInDate.getDate() + i)
    const nightNumber = i + 1

    // シーズンと曜日タイプを判定
    const seasonType = getEnhancedSeasonType(currentDate, pricingSetting.seasonPeriods)
    const dayType = getEnhancedDayType(currentDate, pricingSetting.holidayCalendar)

    // 基本料金を計算
    const basePrice = pricingSetting.basePriceAdult
    const seasonMultiplier = pricingSetting.seasonMultipliers[seasonType]
    const dayTypeSurcharge = pricingSetting.dayTypeSurcharges[dayType]

    // シーズン倍率を適用した基本料金
    const basePriceAfterSeason = Math.floor(basePrice * seasonMultiplier)
    // 曜日追加料金を加算
    const basePriceAfterAdjustments = basePriceAfterSeason + dayTypeSurcharge

    // 人数別追加料金を計算
    const guestCountCharges = calculateGuestCountCharges(
      adultCount,
      basePriceAfterAdjustments,
      pricingSetting.guestCountPricing
    )

    // 子供料金を計算
    const childCharges = calculateChildCharges(
      childrenAges,
      basePriceAfterAdjustments,
      pricingSetting.childPricingRules
    )

    // 泊数調整前の小計
    const subtotalBeforeNightRate =
      basePriceAfterAdjustments +
      guestCountCharges.total +
      childCharges.total

    // 泊数による料金率を取得
    const nightRate = getNightRate(nightNumber, pricingSetting.multiNightPricing)
    const nightRateDescription = getNightRateDescription(nightNumber, nightRate)

    // 泊数調整後の1泊合計
    const nightTotal = Math.floor(subtotalBeforeNightRate * nightRate)

    // 詳細説明を生成
    const seasonLabel = seasonType === 'regular' ? 'レギュラー' :
                       seasonType === 'high' ? 'ハイ' : 'オフ'
    const dayTypeLabel = dayType === 'weekday' ? '平日' : '休日前日'
    const description = `${seasonLabel}シーズン・${dayTypeLabel} / ${adultCount}名`

    nightlyBreakdown.push({
      nightNumber,
      date: currentDate.toLocaleDateString('ja-JP'),
      seasonType,
      dayType,
      basePrice,
      seasonMultiplier,
      dayTypeSurcharge,
      basePriceAfterAdjustments,
      guestCountCharges,
      childCharges,
      nightRate,
      nightRateDescription,
      subtotalBeforeNightRate,
      nightTotal,
      description
    })

    subtotal += nightTotal
  }

  // 清掃料金を追加
  const cleaningFee = pricingSetting.cleaningFee || 0

  // 税抜合計（宿泊料金 + 清掃料金）
  const subtotalBeforeTax = subtotal + cleaningFee

  // 消費税を計算（税率はデフォルト10%）
  const taxRate = pricingSetting.taxRate || 0.1
  const tax = Math.floor(subtotalBeforeTax * taxRate)

  // クーポン割引を計算（税込金額から割引）
  const subtotalWithTax = subtotalBeforeTax + tax
  const couponDiscount = Math.floor(subtotalWithTax * couponDiscountRate)

  // 最終合計金額（税込 - クーポン割引）
  const totalAmount = subtotalWithTax - couponDiscount

  // 平均料金を計算
  const totalGuestCount = adultCount + childrenAges.length
  const averagePricePerNight = Math.floor(totalAmount / numberOfNights)
  const averagePricePerPerson = totalGuestCount > 0 ?
    Math.floor(totalAmount / totalGuestCount) : 0

  return {
    checkInDate,
    checkOutDate,
    numberOfNights,
    adultCount,
    childrenAges,
    totalGuestCount,
    nightlyBreakdown,
    subtotal,
    cleaningFee,
    subtotalBeforeTax,
    tax,
    couponDiscount,
    totalAmount,
    summary: {
      averagePricePerNight,
      averagePricePerPerson
    }
  }
}

/**
 * デフォルトの料金設定を生成
 */
export function createDefaultEnhancedPricingSetting(): EnhancedPricingSetting {
  return {
    id: 'default-enhanced-pricing',
    type: 'stay',

    // 基本料金: ¥35,000 (1〜2人分)
    basePriceAdult: 35000,

    // シーズン期間定義
    seasonPeriods: [
      // ハイシーズン
      { seasonType: 'high', startDate: '03-20', endDate: '05-06', description: '春のGW期間' },
      { seasonType: 'high', startDate: '07-20', endDate: '08-31', description: '夏休み期間' },
      { seasonType: 'high', startDate: '12-25', endDate: '01-05', description: '年末年始' },

      // レギュラーシーズン（上記以外）
      { seasonType: 'regular', startDate: '01-06', endDate: '03-19', description: '冬〜春' },
      { seasonType: 'regular', startDate: '05-07', endDate: '07-19', description: '春〜夏' },
      { seasonType: 'regular', startDate: '09-01', endDate: '12-24', description: '秋〜冬' }
    ],

    // シーズン別料金倍率
    seasonMultipliers: {
      regular: 1.0,
      high: 1.2,
      off: 0.7
    },

    // 曜日タイプ別追加料金
    dayTypeSurcharges: {
      weekday: 0,
      weekend: 10000
    },

    // 人数別追加料金設定
    guestCountPricing: {
      baseGuestCount: 2,
      thirdGuestRate: 0.5,
      additionalGuestRates: {
        fourth: 0.9,
        fifth: 0.8,
        sixth: 0.7
      }
    },

    // 泊数別料金調整設定
    multiNightPricing: {
      rates: {
        night1: 1.0,
        night2: 0.9,
        night3: 0.8,
        night4: 0.7,
        night5: 0.6,
        night6Plus: 0.6
      }
    },

    // 清掃料金
    cleaningFee: 5000,

    // 消費税率（10%）
    taxRate: 0.1,

    // 子供料金ルール
    childPricingRules: [
      { ageFrom: 0, ageTo: 5, discountType: 'free', discountValue: 0 },
      { ageFrom: 6, ageTo: 15, discountType: 'percentage', discountValue: 50 }
    ],

    createdAt: null as any, // デモ用
    updatedAt: null as any  // デモ用
  }
}

/**
 * Firestoreから拡張版料金設定を読み込む
 */
async function loadEnhancedPricingSettingsFromFirestore(): Promise<EnhancedPricingSetting | null> {
  if (typeof window === 'undefined') return null

  try {
    const { $db } = useNuxtApp()
    if (!$db) return null

    const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore')

    const q = query(
      collection($db, 'enhancedPricingSettings'),
      where('type', '==', 'stay'),
      orderBy('updatedAt', 'desc'),
      limit(1)
    )

    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as EnhancedPricingSetting
    }
  } catch (e) {
    console.error('Firestoreから料金設定の読み込みエラー:', e)
  }

  return null
}

/**
 * ローカルストレージから拡張版料金設定を読み込む（フォールバック）
 */
function loadEnhancedPricingSettingsFromLocalStorage(): EnhancedPricingSetting {
  if (typeof window === 'undefined') {
    return createDefaultEnhancedPricingSetting()
  }

  try {
    const stored = localStorage.getItem('enhancedPricingSettings')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('LocalStorageから料金設定の読み込みエラー:', e)
  }
  return createDefaultEnhancedPricingSetting()
}

/**
 * Firestoreに拡張版料金設定を保存
 */
export async function saveEnhancedPricingSettingsToFirestore(
  settings: Omit<EnhancedPricingSetting, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const { $db } = useNuxtApp()
  if (!$db) throw new Error('Firestore is not initialized')

  const { collection, addDoc, doc, setDoc, Timestamp } = await import('firebase/firestore')

  const now = Timestamp.now()

  // 既存の設定があれば更新、なければ新規作成
  if (settings.id) {
    const docRef = doc($db, 'enhancedPricingSettings', settings.id)
    await setDoc(docRef, {
      ...settings,
      updatedAt: now
    }, { merge: true })
    return settings.id
  } else {
    const docRef = await addDoc(collection($db, 'enhancedPricingSettings'), {
      ...settings,
      createdAt: now,
      updatedAt: now
    })
    return docRef.id
  }
}

/**
 * ローカルストレージに拡張版料金設定を保存（フォールバック）
 */
export function saveEnhancedPricingSettingsToLocalStorage(settings: EnhancedPricingSetting): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('enhancedPricingSettings', JSON.stringify(settings))
  } catch (e) {
    console.error('LocalStorageへの料金設定の保存エラー:', e)
  }
}

/**
 * 拡張版料金計算のComposable
 */
export const useEnhancedPricing = () => {
  const pricingSetting = ref<EnhancedPricingSetting>(loadEnhancedPricingSettingsFromLocalStorage())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Firestoreから読み込み
  const loadFromFirestore = async () => {
    loading.value = true
    error.value = null

    try {
      const settings = await loadEnhancedPricingSettingsFromFirestore()
      if (settings) {
        pricingSetting.value = settings
        // LocalStorageにもバックアップ
        saveEnhancedPricingSettingsToLocalStorage(settings)
      }
    } catch (e: any) {
      console.error('料金設定の読み込みエラー:', e)
      error.value = e.message || '料金設定の読み込みに失敗しました'
    } finally {
      loading.value = false
    }
  }

  // Firestoreに保存
  const saveToFirestore = async (settings: EnhancedPricingSetting) => {
    loading.value = true
    error.value = null

    try {
      const docId = await saveEnhancedPricingSettingsToFirestore(settings)
      pricingSetting.value = { ...settings, id: docId }
      // LocalStorageにもバックアップ
      saveEnhancedPricingSettingsToLocalStorage(pricingSetting.value)
      return docId
    } catch (e: any) {
      console.error('料金設定の保存エラー:', e)
      error.value = e.message || '料金設定の保存に失敗しました'
      throw e
    } finally {
      loading.value = false
    }
  }

  const calculatePrice = (
    checkInDate: Date,
    checkOutDate: Date,
    adultCount: number,
    childrenAges: number[] = [],
    couponDiscountRate: number = 0
  ): EnhancedPriceCalculation => {
    return calculateEnhancedPrice(
      checkInDate,
      checkOutDate,
      adultCount,
      childrenAges,
      pricingSetting.value,
      couponDiscountRate
    )
  }

  const savePricing = (settings: EnhancedPricingSetting) => {
    pricingSetting.value = settings
    saveEnhancedPricingSettingsToLocalStorage(settings)
  }

  const resetToDefault = () => {
    pricingSetting.value = createDefaultEnhancedPricingSetting()
    if (typeof window !== 'undefined') {
      localStorage.removeItem('enhancedPricingSettings')
    }
  }

  return {
    pricingSetting,
    loading,
    error,
    calculatePrice,
    savePricing,
    saveToFirestore,
    loadFromFirestore,
    resetToDefault
  }
}
