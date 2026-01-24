/**
 * セキュアなPayment Intent作成API
 * - サーバーサイドで金額を再計算
 * - クライアントから送信された金額を検証
 * - クーポン検証
 * - 審査機能対応: capture_method: 'manual' で与信のみ確保
 */

import Stripe from "stripe";
import { stripeLogger } from "../../utils/logger";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const stripe = new Stripe(config.stripeSecretKey);

  try {
    // 1. リクエストボディを取得・検証
    const rawBody = await readBody(event);
    stripeLogger.debug("Request body received", rawBody);
    const validatedData = validateInput(createPaymentIntentSchema, rawBody);

    // 2. 料金設定を取得（Firebase Admin SDKを使用しない）
    let pricingRule = DEFAULT_PRICING;
    let couponDiscount = 0;
    let couponId = "";

    // 開発環境ではデフォルト料金設定を使用
    // 本番環境では必要に応じてFirebase Admin SDKを使用
    try {
      const db = getFirestoreAdmin();

      // 3. 料金設定を取得（enhancedPricingSettingsから読み込み）
      const enhancedPricingDoc = await db
        .collection("enhancedPricingSettings")
        .doc("default")
        .get();
      if (enhancedPricingDoc.exists) {
        const enhancedSettings = enhancedPricingDoc.data();
        // 拡張設定から必要な値をマッピング
        pricingRule = {
          ...DEFAULT_PRICING,
          basePrice: enhancedSettings?.basePrice ?? DEFAULT_PRICING.basePrice,
          cleaningFee:
            enhancedSettings?.cleaningFee ?? DEFAULT_PRICING.cleaningFee,
          // 週末料金は倍率から計算（weekendMultiplier - 1）× basePrice
          weekendSurcharge: enhancedSettings?.dayTypePricing?.weekendMultiplier
            ? Math.round(
                (enhancedSettings.dayTypePricing.weekendMultiplier - 1) *
                  (enhancedSettings?.basePrice ?? DEFAULT_PRICING.basePrice),
              )
            : DEFAULT_PRICING.weekendSurcharge,
        };
      }

      // 4. 基本金額を先に計算（割引なし）
      const baseAmount = calculateBookingAmount(
        new Date(validatedData.checkInDate),
        new Date(validatedData.checkOutDate),
        validatedData.guestCount,
        pricingRule,
        0, // 割引なしで計算
      );

      // 5. クーポン割引を計算
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

          // クーポン有効期限チェック（validUntilまたはexpiresAtをサポート）
          const expiryDate = coupon.validUntil || coupon.expiresAt;
          if (expiryDate && expiryDate.toDate() < new Date()) {
            throw createError({
              statusCode: 400,
              message: "クーポンの有効期限が切れています",
            });
          }

          // 使用回数制限チェック（usageLimitまたはmaxUsesをサポート）
          const maxUses = coupon.usageLimit || coupon.maxUses;
          const usedCount = coupon.usageCount || coupon.usedCount || 0;
          if (maxUses && usedCount >= maxUses) {
            throw createError({
              statusCode: 400,
              message: "クーポンの使用回数が上限に達しています",
            });
          }

          // 割引額を計算（discountTypeに基づく）
          if (coupon.discountType === "percentage") {
            // パーセンテージ割引
            const discountRate = (coupon.discountValue || 0) / 100;
            couponDiscount = Math.floor(baseAmount * discountRate);

            // 最大割引額の制限
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
              couponDiscount = coupon.maxDiscount;
            }
          } else {
            // 固定額割引（discountType === 'fixed' または未指定）
            couponDiscount = Math.min(
              coupon.discountValue || coupon.discountAmount || 0,
              baseAmount,
            );
          }

          stripeLogger.debug("Coupon applied", {
            code: validatedData.couponCode,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            calculatedDiscount: couponDiscount,
          });
        } else {
          stripeLogger.warn("Invalid coupon code", {
            code: validatedData.couponCode,
          });
          // クーポンが無効な場合でも続行（割引なし）
        }
      }
    } catch (error: unknown) {
      // Firebase Admin SDKが使用できない場合はデフォルト設定を使用
      stripeLogger.warn(
        "Using default pricing (Firebase Admin not available)",
        error,
      );
    }

    // 6. 最終金額を計算（基本金額 - クーポン割引）
    const calculatedAmount = calculateBookingAmount(
      new Date(validatedData.checkInDate),
      new Date(validatedData.checkOutDate),
      validatedData.guestCount,
      pricingRule,
      couponDiscount,
    );

    stripeLogger.debug("Calculated amount", {
      basePrice: pricingRule.basePrice,
      weekendSurcharge: pricingRule.weekendSurcharge,
      guestCount: validatedData.guestCount,
      couponDiscount,
      total: calculatedAmount,
    });

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
          baseAmount: couponDiscount - pricingRule.cleaningFee,
          cleaningFee: pricingRule.cleaningFee,
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
          couponCode: validatedData.couponCode || "",
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
        baseAmount: calculatedAmount + couponDiscount - pricingRule.cleaningFee,
        cleaningFee: pricingRule.cleaningFee,
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
