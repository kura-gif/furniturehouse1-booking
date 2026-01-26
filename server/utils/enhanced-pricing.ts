/**
 * サーバーサイド用拡張料金計算ユーティリティ
 * クライアント側のuseEnhancedPricing.tsと同じロジックを実装
 */

// 型定義（クライアント側と同じ）
export type SeasonType = "regular" | "high" | "off";
export type DayType = "weekday" | "weekend";

export interface SeasonPeriod {
  seasonType: SeasonType;
  startDate: string; // MM-DD形式
  endDate: string; // MM-DD形式
  description?: string;
}

export interface HolidayCalendar {
  year?: number;
  holidays?: string[]; // YYYY-MM-DD形式の配列
}

export interface GuestCountPricing {
  baseGuestCount?: number;
  thirdGuestRate?: number;
  additionalGuestRates?: {
    fourth?: number;
    fifth?: number;
    sixth?: number;
  };
}

export interface MultiNightPricing {
  rates?: {
    night1?: number;
    night2?: number;
    night3?: number;
    night4?: number;
    night5?: number;
    night6Plus?: number;
  };
}

export interface ChildPricingRule {
  minAge?: number;
  maxAge?: number;
  ageFrom?: number;
  ageTo?: number;
  priceRate?: number;
  discountType?: "free" | "percentage";
  discountValue?: number;
}

export interface EnhancedPricingSettingServer {
  basePrice?: number;
  basePriceAdult?: number;
  seasonPeriods?: SeasonPeriod[];
  seasonMultipliers?: {
    regular: number;
    high: number;
    off: number;
  };
  dayTypePricing?: {
    weekendMultiplier?: number;
  };
  dayTypeMultipliers?: {
    weekday: number;
    weekend: number;
  };
  guestCountPricing?: GuestCountPricing;
  multiNightPricing?: MultiNightPricing;
  childPricingRules?: ChildPricingRule[];
  holidayCalendar?: HolidayCalendar[];
  cleaningFee?: number;
  taxRate?: number;
}

export interface EnhancedPriceResult {
  totalAmount: number;
  subtotal: number;
  cleaningFee: number;
  tax: number;
  numberOfNights: number;
  couponDiscount: number;
}

/**
 * 日付をYYYY-MM-DD形式の文字列に変換
 */
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 日付から曜日タイプを判定（金曜・土曜・祝前日 = weekend）
 */
export function getEnhancedDayType(
  date: Date,
  holidayCalendar?: HolidayCalendar[],
): DayType {
  const dayOfWeek = date.getDay();

  // 金曜(5)、土曜(6)を休日前日とする
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    return "weekend";
  }

  // 祝日カレンダーがある場合、祝前日もチェック
  if (holidayCalendar && holidayCalendar.length > 0) {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const nextDayStr = formatDateToYYYYMMDD(nextDay);

    for (const cal of holidayCalendar) {
      if (cal.holidays && cal.holidays.includes(nextDayStr)) {
        return "weekend";
      }
    }
  }

  return "weekday";
}

/**
 * 日付からシーズンタイプを判定
 */
export function getEnhancedSeasonType(
  date: Date,
  seasonPeriods?: SeasonPeriod[],
): SeasonType {
  if (!seasonPeriods || seasonPeriods.length === 0) {
    return "regular";
  }

  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  for (const period of seasonPeriods) {
    if (monthDay >= period.startDate && monthDay <= period.endDate) {
      return period.seasonType;
    }
  }

  return "regular";
}

/**
 * 泊数に応じた料金率を取得
 */
export function getNightRate(
  nightNumber: number,
  multiNightPricing?: MultiNightPricing,
): number {
  const rates = multiNightPricing?.rates;

  if (!rates) {
    return 1.0;
  }

  switch (nightNumber) {
    case 1:
      return rates.night1 ?? 1.0;
    case 2:
      return rates.night2 ?? 0.9;
    case 3:
      return rates.night3 ?? 0.8;
    case 4:
      return rates.night4 ?? 0.7;
    case 5:
      return rates.night5 ?? 0.6;
    default:
      return rates.night6Plus ?? 0.6;
  }
}

/**
 * 人数別追加料金を計算
 */
export function calculateGuestCountCharges(
  totalAdults: number,
  basePrice: number,
  guestCountPricing?: GuestCountPricing,
): { total: number } {
  if (!guestCountPricing) {
    return { total: 0 };
  }

  let total = 0;
  const baseGuestCount = guestCountPricing.baseGuestCount ?? 2;

  // 基本人数以下は追加料金なし
  if (totalAdults <= baseGuestCount) {
    return { total: 0 };
  }

  // 3人目の料金
  const thirdGuestCharge = Math.floor(
    basePrice * (guestCountPricing.thirdGuestRate ?? 0.5),
  );

  if (totalAdults >= 3) {
    total += thirdGuestCharge;
  }

  // 4人目の料金
  if (totalAdults >= 4) {
    total += Math.floor(
      thirdGuestCharge *
        (guestCountPricing.additionalGuestRates?.fourth ?? 0.9),
    );
  }

  // 5人目の料金
  if (totalAdults >= 5) {
    total += Math.floor(
      thirdGuestCharge *
        (guestCountPricing.additionalGuestRates?.fifth ?? 0.8),
    );
  }

  // 6人目の料金
  if (totalAdults >= 6) {
    total += Math.floor(
      thirdGuestCharge *
        (guestCountPricing.additionalGuestRates?.sixth ?? 0.7),
    );
  }

  return { total };
}

/**
 * 子供料金を計算
 */
export function calculateChildCharges(
  childrenAges: number[],
  adultPrice: number,
  childPricingRules?: ChildPricingRule[],
): { total: number } {
  if (!childPricingRules || childrenAges.length === 0) {
    return { total: 0 };
  }

  let total = 0;

  for (const age of childrenAges) {
    let childCharge = 0;

    for (const rule of childPricingRules) {
      const minAge = rule.minAge ?? rule.ageFrom ?? 0;
      const maxAge = rule.maxAge ?? rule.ageTo ?? 0;

      if (age >= minAge && age <= maxAge) {
        if (rule.priceRate !== undefined) {
          if (rule.priceRate === 0) {
            childCharge = 0;
          } else {
            childCharge = Math.floor(adultPrice * rule.priceRate);
          }
        } else if (rule.discountType === "free") {
          childCharge = 0;
        } else if (
          rule.discountType === "percentage" &&
          rule.discountValue !== undefined
        ) {
          childCharge = Math.floor(adultPrice * (rule.discountValue / 100));
        }
        break;
      }
    }

    // 16歳以上は大人料金
    if (age >= 16) {
      childCharge = adultPrice;
    }

    total += childCharge;
  }

  return { total };
}

/**
 * 拡張版料金計算（サーバーサイド）
 */
export function calculateEnhancedPriceServer(
  checkInDate: Date,
  checkOutDate: Date,
  adultCount: number,
  childrenAges: number[],
  pricingSetting: EnhancedPricingSettingServer,
  couponDiscountRate: number = 0,
): EnhancedPriceResult {
  // 泊数を計算
  const numberOfNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (numberOfNights <= 0) {
    throw new Error("無効な日付範囲です");
  }

  let subtotal = 0;

  // 各泊の料金を計算
  for (let i = 0; i < numberOfNights; i++) {
    const currentDate = new Date(checkInDate);
    currentDate.setDate(checkInDate.getDate() + i);
    const nightNumber = i + 1;

    // シーズンと曜日タイプを判定
    const seasonType = getEnhancedSeasonType(
      currentDate,
      pricingSetting.seasonPeriods,
    );
    const dayType = getEnhancedDayType(
      currentDate,
      pricingSetting.holidayCalendar,
    );

    // 基本料金を計算
    const basePrice = pricingSetting.basePriceAdult ?? pricingSetting.basePrice ?? 35000;
    const seasonMultiplier =
      pricingSetting.seasonMultipliers?.[seasonType] ?? 1.0;

    // 曜日倍率（dayTypeMultipliersまたはdayTypePricing.weekendMultiplierから取得）
    let dayTypeMultiplier = 1.0;
    if (dayType === "weekend") {
      dayTypeMultiplier =
        pricingSetting.dayTypeMultipliers?.weekend ??
        pricingSetting.dayTypePricing?.weekendMultiplier ??
        1.3;
    } else {
      dayTypeMultiplier = pricingSetting.dayTypeMultipliers?.weekday ?? 1.0;
    }

    // シーズン倍率を適用した基本料金
    const basePriceAfterSeason = Math.floor(basePrice * seasonMultiplier);
    // 曜日倍率を適用
    const basePriceAfterAdjustments = Math.floor(
      basePriceAfterSeason * dayTypeMultiplier,
    );

    // 人数別追加料金を計算
    const guestCountCharges = calculateGuestCountCharges(
      adultCount,
      basePriceAfterAdjustments,
      pricingSetting.guestCountPricing,
    );

    // 子供料金を計算
    const childCharges = calculateChildCharges(
      childrenAges,
      basePriceAfterAdjustments,
      pricingSetting.childPricingRules,
    );

    // 泊数調整前の小計
    const subtotalBeforeNightRate =
      basePriceAfterAdjustments + guestCountCharges.total + childCharges.total;

    // 泊数による料金率を取得
    const nightRate = getNightRate(
      nightNumber,
      pricingSetting.multiNightPricing,
    );

    // 泊数調整後の1泊合計
    const nightTotal = Math.floor(subtotalBeforeNightRate * nightRate);

    subtotal += nightTotal;
  }

  // 清掃料金を追加
  const cleaningFee = pricingSetting.cleaningFee ?? 0;

  // 税抜合計（宿泊料金 + 清掃料金）
  const subtotalBeforeTax = subtotal + cleaningFee;

  // 消費税を計算（税率はデフォルト10%）
  const taxRate = pricingSetting.taxRate ?? 0.1;
  const tax = Math.floor(subtotalBeforeTax * taxRate);

  // クーポン割引を計算（税込金額から割引）
  const subtotalWithTax = subtotalBeforeTax + tax;
  const couponDiscount = Math.floor(subtotalWithTax * couponDiscountRate);

  // 最終合計金額（税込 - クーポン割引）
  const totalAmount = Math.max(subtotalWithTax - couponDiscount, 0);

  return {
    totalAmount,
    subtotal,
    cleaningFee,
    tax,
    numberOfNights,
    couponDiscount,
  };
}

/**
 * Firestoreから取得した料金設定をEnhancedPricingSettingServerに変換
 */
export function convertFirestoreSettingToEnhanced(
  firestoreData: Record<string, unknown>,
): EnhancedPricingSettingServer {
  return {
    basePrice: firestoreData.basePrice as number | undefined,
    basePriceAdult: firestoreData.basePriceAdult as number | undefined,
    seasonPeriods: firestoreData.seasonPeriods as SeasonPeriod[] | undefined,
    seasonMultipliers: firestoreData.seasonMultipliers as
      | { regular: number; high: number; off: number }
      | undefined,
    dayTypePricing: firestoreData.dayTypePricing as
      | { weekendMultiplier?: number }
      | undefined,
    dayTypeMultipliers: firestoreData.dayTypeMultipliers as
      | { weekday: number; weekend: number }
      | undefined,
    guestCountPricing: firestoreData.guestCountPricing as
      | GuestCountPricing
      | undefined,
    multiNightPricing: firestoreData.multiNightPricing as
      | MultiNightPricing
      | undefined,
    childPricingRules: firestoreData.childPricingRules as
      | ChildPricingRule[]
      | undefined,
    holidayCalendar: firestoreData.holidayCalendar as
      | HolidayCalendar[]
      | undefined,
    cleaningFee: firestoreData.cleaningFee as number | undefined,
    taxRate: firestoreData.taxRate as number | undefined,
  };
}
