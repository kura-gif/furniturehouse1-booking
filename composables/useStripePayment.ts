import type {
  Stripe,
  StripeElements,
  StripeCardElement,
} from "@stripe/stripe-js";

export const useStripePayment = () => {
  const { $stripe } = useNuxtApp();

  let elements: StripeElements | null = null;
  let cardElement: StripeCardElement | null = null;

  /**
   * Payment Intentを作成
   */
  const createPaymentIntent = async (
    checkInDate: string,
    checkOutDate: string,
    guestCount: number,
    couponCode?: string,
    optionsTotalPrice?: number,
  ) => {
    try {
      const data = await $fetch("/api/stripe/create-payment-intent-secure", {
        method: "POST",
        body: {
          checkInDate,
          checkOutDate,
          guestCount,
          couponCode: couponCode || "",
          optionsTotalPrice: optionsTotalPrice || 0,
        },
      });

      return data;
    } catch (error: unknown) {
      console.error("Payment Intent作成エラー:", error);
      // APIからのエラーメッセージは安全（サーバー側でサニタイズ済み）
      // FetchErrorの場合はdata.messageを取得
      if (error && typeof error === "object" && "data" in error) {
        const fetchError = error as { data?: { message?: string } };
        if (fetchError.data?.message) {
          throw new Error(fetchError.data.message);
        }
      }
      throw new Error("決済の準備に失敗しました");
    }
  };

  /**
   * Stripe Elementsを初期化（Card Element用）
   */
  const initializeElements = async (clientSecret: string) => {
    if (!$stripe) {
      throw new Error("Stripeが初期化されていません");
    }

    console.log("🔧 Stripe Elements初期化開始（Card Element）");

    const stripe = $stripe as Stripe;

    // Card Element用のシンプルなElements初期化
    elements = stripe.elements();

    console.log("✅ Stripe Elements初期化成功");

    return elements;
  };

  /**
   * カードエレメントをマウント
   */
  const mountCardElement = (elementId: string) => {
    if (!elements) {
      throw new Error("Elementsが初期化されていません");
    }

    cardElement = elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#30313d",
          "::placeholder": {
            color: "#9ca3af",
          },
        },
        invalid: {
          color: "#df1b41",
        },
      },
    });

    cardElement.mount(`#${elementId}`);
    return cardElement;
  };

  /**
   * 支払いを確定（Card Element用）
   */
  const confirmCardPayment = async (
    clientSecret: string,
    cardElement: StripeCardElement,
  ) => {
    if (!$stripe) {
      throw new Error("Stripeが初期化されていません");
    }

    const stripe = $stripe as Stripe;

    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      },
    );

    if (error) {
      throw new Error(error.message || "決済に失敗しました");
    }

    return paymentIntent;
  };

  /**
   * 支払いを確定（Payment Element用）
   */
  const confirmPayment = async (returnUrl?: string) => {
    if (!$stripe || !elements) {
      throw new Error("Stripe/Elementsが初期化されていません");
    }

    const stripe = $stripe as Stripe;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl || `${window.location.origin}/booking/complete`,
      },
    });

    if (error) {
      throw new Error(error.message || "決済に失敗しました");
    }
  };

  /**
   * 支払いステータスを確認
   */
  const retrievePaymentIntent = async (clientSecret: string) => {
    if (!$stripe) {
      throw new Error("Stripeが初期化されていません");
    }

    const stripe = $stripe as Stripe;
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

    return paymentIntent;
  };

  /**
   * クリーンアップ
   */
  const cleanup = () => {
    if (cardElement) {
      cardElement.unmount();
      cardElement = null;
    }
    elements = null;
  };

  return {
    createPaymentIntent,
    initializeElements,
    mountCardElement,
    confirmCardPayment,
    confirmPayment,
    retrievePaymentIntent,
    cleanup,
  };
};
