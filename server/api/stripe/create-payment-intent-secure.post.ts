/**
 * セキュアなPayment Intent作成API
 * - サーバーサイドで金額を再計算
 * - クライアントから送信された金額を検証
 * - クーポン検証
 * - 審査機能対応: capture_method: 'manual' で与信のみ確保
 */

import Stripe from "stripe";
import { stripeLogger } from "../../utils/logger";
import { getFirestoreAdmin } from "../../utils/firebase-admin";
import {
  validateInput,
  createPaymentIntentSchema,
  type CreatePaymentIntentInput,
} from "../../utils/validation";
import {
  calculateEnhancedPriceServer,
  convertFirestoreSettingToEnhanced,
  type EnhancedPricingSettingServer,
} from "../../utils/enhanced-pricing";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey);

  try {
    // 1. リクエストボディを取得・検証
    const rawBody = await readBody(event);
    stripeLogger.debug("Request body received", rawBody);
    const validatedData: CreatePaymentIntentInput = validateInput(createPaymentIntentSchema, rawBody);

    // 2. Firebase Admin SDKを取得
    const db = getFirestoreAdmin();

    // 3. 料金設定を取得（拡張版）
    let pricingSetting: EnhancedPricingSettingServer = {
      basePrice: 35000,
      cleaningFee: 5000,
      taxRate: 0.1,
    };
    let couponDiscountRate = 0;
    let couponId = "";

    // 料金設定を取得（enhancedPricingSettingsから読み込み）
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

    // 4. クーポン検証と割引率の取得
    if (validatedData.couponCode) {
      const couponSnapshot = await db
        .collection("coupons")
        .where("code", "==", validatedData.couponCode)
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (!couponSnapshot.empty) {
        const coupon = couponSnapshot.docs[0].data();
        couponId = couponSnapshot.docs[0].id;

        // クーポン有効期限チェック
        const expiryDate = coupon.validUntil || coupon.expiresAt;
        if (expiryDate && expiryDate.toDate() < new Date()) {
          throw createError({
            statusCode: 400,
            message: "クーポンの有効期限が切れています",
          });
        }

        // 使用回数制限チェック
        const maxUses = coupon.usageLimit || coupon.maxUses;
        const usedCount = coupon.usageCount || coupon.usedCount || 0;
        if (maxUses && usedCount >= maxUses) {
          throw createError({
            statusCode: 400,
            message: "クーポンの使用回数が上限に達しています",
          });
        }

        // パーセンテージ割引の場合、割引率を設定
        if (coupon.discountType === "percentage") {
          couponDiscountRate = (coupon.discountValue || 0) / 100;
        }

        stripeLogger.debug("Coupon validated", {
          code: validatedData.couponCode,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        });
      } else {
        stripeLogger.warn("Invalid coupon code", {
          code: validatedData.couponCode,
        });
      }
    }

    // 5. 拡張版料金計算（クライアントと同じロジック）
    // adultsが指定されていればそれを使用、なければguestCountを大人数として扱う
    const adultCount = validatedData.adults ?? validatedData.guestCount;
    const childrenAges = validatedData.childrenAges ?? [];

    stripeLogger.debug("Price calculation params", {
      adultCount,
      childrenAges,
      guestCount: validatedData.guestCount,
    });

    const priceResult = calculateEnhancedPriceServer(
      new Date(validatedData.checkInDate),
      new Date(validatedData.checkOutDate),
      adultCount,
      childrenAges,
      pricingSetting,
      couponDiscountRate,
    );

    // 6. 固定額クーポンの場合は別途計算
    let couponDiscount = priceResult.couponDiscount;
    let serverTotalAmount = priceResult.totalAmount;

    if (validatedData.couponCode && couponDiscountRate === 0) {
      // 固定額割引の場合
      const couponSnapshot = await db
        .collection("coupons")
        .where("code", "==", validatedData.couponCode)
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (!couponSnapshot.empty) {
        const coupon = couponSnapshot.docs[0].data();
        if (coupon.discountType === "fixed" || !coupon.discountType) {
          const fixedDiscount = Math.min(
            coupon.discountValue || coupon.discountAmount || 0,
            serverTotalAmount,
          );
          couponDiscount = fixedDiscount;
          serverTotalAmount = Math.max(serverTotalAmount - fixedDiscount, 0);
        }
      }
    }

    // 7. オプション料金をサーバー側で計算
    let serverOptionsTotalPrice = 0;
    const selectedOptions = validatedData.selectedOptions || [];

    if (selectedOptions.length > 0) {
      const optionsSnapshot = await db.collection("bookingOptions").get();
      const optionPrices = new Map<string, { id: string; price: number; isActive: boolean }>();

      optionsSnapshot.docs.forEach((doc) => {
        const data = doc.data();
        optionPrices.set(doc.id, {
          id: doc.id,
          price: data.price || 0,
          isActive: data.isActive === true,
        });
      });

      for (const selected of selectedOptions) {
        const optionInfo = optionPrices.get(selected.optionId);
        if (!optionInfo) {
          throw createError({
            statusCode: 400,
            message: `無効なオプションが選択されています`,
          });
        }
        if (!optionInfo.isActive) {
          throw createError({
            statusCode: 400,
            message: `選択されたオプションは現在利用できません`,
          });
        }
        serverOptionsTotalPrice += optionInfo.price * selected.quantity;
      }

      // オプション料金を加算
      serverTotalAmount += serverOptionsTotalPrice;
    }

    // 8. クライアント計算金額との照合（許容誤差: 100円 - 丸め誤差を考慮）
    const clientCalculatedAmount = validatedData.calculatedTotalAmount;
    const amountDifference = Math.abs(serverTotalAmount - clientCalculatedAmount);

    // 金額に大きな差異がある場合はエラー（改ざん検知）
    if (amountDifference > 100) {
      stripeLogger.warn("Amount mismatch detected - possible tampering", {
        serverTotalAmount,
        clientCalculatedAmount,
        difference: amountDifference,
        priceResult,
        serverOptionsTotalPrice,
      });

      throw createError({
        statusCode: 400,
        message: "金額の計算に問題があります。ページを更新して再度お試しください",
      });
    }

    // 差異がある場合は警告ログのみ（サーバー計算を使用）
    if (amountDifference > 1) {
      stripeLogger.warn("Minor amount difference detected (using server amount)", {
        serverTotalAmount,
        clientCalculatedAmount,
        difference: amountDifference,
      });
    }

    stripeLogger.debug("Server-side amount calculation completed", {
      serverTotalAmount,
      clientCalculatedAmount,
      priceResult,
      serverOptionsTotalPrice,
      guestCount: validatedData.guestCount,
    });

    // サーバー計算の金額を使用
    const calculatedAmount = serverTotalAmount;
    const optionsTotalPrice = serverOptionsTotalPrice;

    // 0円予約の場合（100%割引クーポン適用時など）
    if (calculatedAmount <= 0) {
      stripeLogger.event("zero_amount_booking", {
        couponCode: validatedData.couponCode,
        couponDiscount,
      });

      return {
        clientSecret: null,
        paymentIntentId: "",
        amount: 0,
        isZeroAmount: true,
        breakdown: {
          optionsTotalPrice,
          couponDiscount,
          total: 0,
        },
      };
    }

    // 7. Payment Intentを作成（与信確保のみ、審査後にキャプチャ）
    // capture_method: 'manual' で与信枠を確保し、実際の請求は審査承認後に行う
    // idempotencyKey: リトライ時の二重課金を防止
    const idempotencyKey = `pi-${validatedData.checkInDate}-${validatedData.checkOutDate}-${validatedData.guestCount}-${calculatedAmount}-${Date.now()}`;
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: calculatedAmount,
        currency: "jpy",
        capture_method: "manual", // 審査機能: 与信のみ確保、後でcaptureする
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          checkInDate: validatedData.checkInDate,
          checkOutDate: validatedData.checkOutDate,
          guestCount: validatedData.guestCount.toString(),
          calculatedAmount: calculatedAmount.toString(),
          optionsTotalPrice: optionsTotalPrice.toString(),
          couponCode: validatedData.couponCode || "",
          couponDiscount: couponDiscount.toString(),
          couponId,
          timestamp: new Date().toISOString(),
        },
      },
      {
        idempotencyKey,
      },
    );

    stripeLogger.event("payment_intent_created", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    });

    // 8. レスポンス
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: calculatedAmount,
      isZeroAmount: false,
      breakdown: {
        optionsTotalPrice,
        couponDiscount,
        total: calculatedAmount,
      },
    };
  } catch (error: unknown) {
    stripeLogger.error("Payment Intent creation error", error);

    // エラーログをFirestoreに記録（Firebase Admin SDKが利用可能な場合のみ）
    try {
      const db = getFirestoreAdmin();
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      await db.collection("errorLogs").add({
        type: "payment_intent_creation_failed",
        error: errorMessage,
        timestamp: new Date(),
      });
    } catch (_logError) {
      // ログ記録失敗は無視（開発環境では正常）
      stripeLogger.debug(
        "Error logging skipped (Firebase Admin not available)",
      );
    }

    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500;
    throw createError({
      statusCode,
      message: "決済の準備に失敗しました",
    });
  }
});
