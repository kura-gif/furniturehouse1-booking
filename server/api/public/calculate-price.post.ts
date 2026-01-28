/**
 * 公開用料金計算API
 * テストやフロントエンドで使用する料金計算エンドポイント
 */

import { getFirestoreAdmin } from "../../utils/firebase-admin";
import {
  calculateEnhancedPriceServer,
  convertFirestoreSettingToEnhanced,
  type EnhancedPricingSettingServer,
} from "../../utils/enhanced-pricing";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { checkInDate, checkOutDate, guestCount, couponCode, adults, childrenAges } = body;

    if (!checkInDate || !checkOutDate || !guestCount) {
      throw createError({
        statusCode: 400,
        message: "checkInDate, checkOutDate, guestCount are required",
      });
    }

    // adultsが指定されていればそれを使用、なければguestCountを大人数として扱う
    const adultCount = adults ?? guestCount;
    const childAges: number[] = childrenAges ?? [];

    const db = getFirestoreAdmin();

    // 料金設定を取得
    let pricingSetting: EnhancedPricingSettingServer = {
      basePrice: 35000,
      cleaningFee: 5000,
      taxRate: 0.1,
    };

    const enhancedPricingDoc = await db
      .collection("enhancedPricingSettings")
      .doc("default")
      .get();
    if (enhancedPricingDoc.exists) {
      const firestoreData = enhancedPricingDoc.data();
      if (firestoreData) {
        pricingSetting = convertFirestoreSettingToEnhanced(firestoreData);
      }
    }

    // クーポン割引率を取得
    let couponDiscountRate = 0;
    let couponFixedDiscount = 0;

    if (couponCode) {
      const couponSnapshot = await db
        .collection("coupons")
        .where("code", "==", couponCode)
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (!couponSnapshot.empty) {
        const coupon = couponSnapshot.docs[0].data();
        if (coupon.discountType === "percentage") {
          couponDiscountRate = (coupon.discountValue || 0) / 100;
        } else {
          couponFixedDiscount = coupon.discountValue || coupon.discountAmount || 0;
        }
      }
    }

    // 料金計算
    const priceResult = calculateEnhancedPriceServer(
      new Date(checkInDate),
      new Date(checkOutDate),
      adultCount,
      childAges,
      pricingSetting,
      couponDiscountRate,
    );

    // 固定額クーポンの適用
    let totalAmount = priceResult.totalAmount;
    let couponDiscount = priceResult.couponDiscount;

    if (couponFixedDiscount > 0) {
      couponDiscount = Math.min(couponFixedDiscount, totalAmount);
      totalAmount = Math.max(totalAmount - couponDiscount, 0);
    }

    return {
      totalAmount,
      subtotal: priceResult.subtotal,
      cleaningFee: priceResult.cleaningFee,
      tax: priceResult.tax,
      couponDiscount,
      numberOfNights: priceResult.numberOfNights,
    };
  } catch (error: unknown) {
    console.error("Price calculation error:", error);
    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    throw createError({
      statusCode,
      message:
        error instanceof Error ? error.message : "料金計算に失敗しました",
    });
  }
});
