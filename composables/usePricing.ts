import { Timestamp } from "firebase/firestore";
import type {
  DetailedPricingSetting,
  PriceCalculation,
  SeasonType,
  DayType,
  NightCategory,
  PriceRate,
} from "~/types";

/**
 * 日付から曜日タイプを判定（金曜・土曜・祝前日 = weekend）
 */
export function getDayType(date: Date): DayType {
  const dayOfWeek = date.getDay();
  // 金曜(5)、土曜(6)を休日前日とする
  // TODO: 祝日判定を追加する場合はここに実装
  return dayOfWeek === 5 || dayOfWeek === 6 ? "weekend" : "weekday";
}

/**
 * 日付からシーズンタイプを判定
 */
export function getSeasonType(
  date: Date,
  seasonPeriods: DetailedPricingSetting["seasonPeriods"],
): SeasonType {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  for (const period of seasonPeriods) {
    // シンプルな日付範囲チェック（年をまたぐ場合の処理は後で実装）
    if (monthDay >= period.startDate && monthDay <= period.endDate) {
      return period.seasonType;
    }
  }

  // デフォルトはregular
  return "regular";
}

/**
 * 泊数から泊数カテゴリを判定
 */
export function getNightCategory(numberOfNights: number): NightCategory {
  if (numberOfNights === 1) return "1night";
  if (numberOfNights === 2) return "2nights";
  return "3nights_plus";
}

/**
 * 条件に合致する料金レートを検索
 */
export function findPriceRate(
  priceRates: PriceRate[],
  seasonType: SeasonType,
  nightCategory: NightCategory,
  dayType: DayType,
  guestCount: number,
): number | null {
  const rate = priceRates.find(
    (r) =>
      r.seasonType === seasonType &&
      r.nightCategory === nightCategory &&
      r.dayType === dayType &&
      r.guestCount === guestCount,
  );

  return rate?.pricePerNight ?? null;
}

/**
 * 予約期間の料金を計算
 */
export function calculateDetailedPrice(
  startDate: Date,
  endDate: Date,
  guestCount: number,
  pricingSetting: DetailedPricingSetting,
  couponDiscountRate: number = 0,
): PriceCalculation {
  // 泊数を計算
  const numberOfNights = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (numberOfNights <= 0) {
    throw new Error("無効な日付範囲です");
  }

  const nightCategory = getNightCategory(numberOfNights);
  const nightlyBreakdown: PriceCalculation["breakdown"]["nightlyBreakdown"] =
    [];
  let subtotal = 0;

  // 各泊の料金を計算
  for (let i = 0; i < numberOfNights; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const seasonType = getSeasonType(currentDate, pricingSetting.seasonPeriods);
    const dayType = getDayType(currentDate);

    // 料金レートを検索
    const rate = findPriceRate(
      pricingSetting.priceRates,
      seasonType,
      nightCategory,
      dayType,
      guestCount,
    );

    if (rate === null) {
      console.warn(
        `料金が設定されていません: ${seasonType}, ${nightCategory}, ${dayType}, ${guestCount}名`,
      );
      // デフォルト料金を使用（例: 30000円）
      const defaultRate = 30000;
      nightlyBreakdown.push({
        date: currentDate.toLocaleDateString("ja-JP"),
        seasonType,
        dayType,
        rate: defaultRate,
        description: `${seasonType === "regular" ? "レギュラー" : seasonType === "high" ? "ハイ" : "オフ"}シーズン / ${dayType === "weekday" ? "平日" : "休日前日"} / ${guestCount}名 (デフォルト料金)`,
      });
      subtotal += defaultRate;
    } else {
      nightlyBreakdown.push({
        date: currentDate.toLocaleDateString("ja-JP"),
        seasonType,
        dayType,
        rate,
        description: `${seasonType === "regular" ? "レギュラー" : seasonType === "high" ? "ハイ" : "オフ"}シーズン / ${dayType === "weekday" ? "平日" : "休日前日"} / ${guestCount}名`,
      });
      subtotal += rate;
    }
  }

  const baseAmount = subtotal;
  const couponDiscount = Math.floor(baseAmount * couponDiscountRate);
  const discountAmount = couponDiscount;
  const totalAmount = baseAmount - discountAmount;

  return {
    baseAmount,
    discountAmount,
    totalAmount,
    breakdown: {
      numberOfNights,
      nightCategory,
      nightlyBreakdown,
      subtotal,
      couponDiscount: couponDiscount > 0 ? couponDiscount : undefined,
    },
  };
}

/**
 * デモ用の料金設定データを生成
 */
export function createDemoPricingSetting(): DetailedPricingSetting {
  const seasonPeriods = [
    // オフシーズン: 1月-2月、6月-7月
    {
      seasonType: "off" as SeasonType,
      startDate: "01-01",
      endDate: "02-28",
      description: "冬のオフシーズン",
    },
    {
      seasonType: "off" as SeasonType,
      startDate: "06-01",
      endDate: "07-15",
      description: "梅雨時期",
    },

    // ハイシーズン: 3月-5月、8月、12月
    {
      seasonType: "high" as SeasonType,
      startDate: "03-01",
      endDate: "05-31",
      description: "春のハイシーズン",
    },
    {
      seasonType: "high" as SeasonType,
      startDate: "08-01",
      endDate: "08-31",
      description: "夏のハイシーズン",
    },
    {
      seasonType: "high" as SeasonType,
      startDate: "12-20",
      endDate: "12-31",
      description: "年末のハイシーズン",
    },

    // レギュラーシーズン: 7月後半、9月-11月、12月前半
    {
      seasonType: "regular" as SeasonType,
      startDate: "07-16",
      endDate: "07-31",
      description: "夏のレギュラー",
    },
    {
      seasonType: "regular" as SeasonType,
      startDate: "09-01",
      endDate: "12-19",
      description: "秋冬のレギュラー",
    },
  ];

  const priceRates: PriceRate[] = [];

  // 全パターンの料金を設定
  const seasons: SeasonType[] = ["regular", "high", "off"];
  const nightCategories: NightCategory[] = [
    "1night",
    "2nights",
    "3nights_plus",
  ];
  const dayTypes: DayType[] = ["weekday", "weekend"];
  const guestCounts = [1, 2, 3, 4];

  // 基本料金テーブル（1名あたりの基準料金）
  const basePrices = {
    regular: {
      weekday: { "1night": 35000, "2nights": 33000, "3nights_plus": 31000 },
      weekend: { "1night": 45000, "2nights": 43000, "3nights_plus": 41000 },
    },
    high: {
      weekday: { "1night": 45000, "2nights": 43000, "3nights_plus": 41000 },
      weekend: { "1night": 55000, "2nights": 53000, "3nights_plus": 51000 },
    },
    off: {
      weekday: { "1night": 25000, "2nights": 23000, "3nights_plus": 21000 },
      weekend: { "1night": 30000, "2nights": 28000, "3nights_plus": 26000 },
    },
  };

  // 人数による追加料金
  const guestAdditions = {
    1: 0, // 1名: 追加なし
    2: 10000, // 2名: +10,000円
    3: 18000, // 3名: +18,000円
    4: 25000, // 4名: +25,000円
  };

  for (const season of seasons) {
    for (const nightCat of nightCategories) {
      for (const dayType of dayTypes) {
        for (const guestCount of guestCounts) {
          const basePrice = basePrices[season][dayType][nightCat];
          const guestAddition =
            guestAdditions[guestCount as keyof typeof guestAdditions];

          priceRates.push({
            seasonType: season,
            nightCategory: nightCat,
            dayType: dayType,
            guestCount,
            pricePerNight: basePrice + guestAddition,
          });
        }
      }
    }
  }

  return {
    id: "demo-pricing",
    type: "stay",
    seasonPeriods,
    priceRates,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

/**
 * ローカルストレージから料金設定を読み込む
 */
function loadPricingSettings(): DetailedPricingSetting {
  try {
    const stored = localStorage.getItem("pricingSettings");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("料金設定の読み込みエラー:", e);
  }
  return createDemoPricingSetting();
}

/**
 * 料金計算のComposable
 */
export const usePricing = () => {
  const calculatePrice = (
    startDate: Date,
    endDate: Date,
    guestCount: number,
    couponDiscountRate: number = 0,
  ): PriceCalculation => {
    // 毎回最新の設定を読み込む
    const pricingSetting = loadPricingSettings();
    return calculateDetailedPrice(
      startDate,
      endDate,
      guestCount,
      pricingSetting,
      couponDiscountRate,
    );
  };

  return {
    calculatePrice,
    pricingSetting: loadPricingSettings(),
  };
};
