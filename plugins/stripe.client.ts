import { loadStripe } from '@stripe/stripe-js'
import type { Stripe } from '@stripe/stripe-js'

let stripeInstance: Stripe | null = null

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  // デバッグ: Public Keyの存在確認
  if (!config.public.stripePublicKey) {
    console.error('❌ STRIPE_PUBLIC_KEYが設定されていません')
    throw new Error('Stripe設定エラー: Public Keyが見つかりません')
  }

  console.log('✅ Stripe Public Key:', config.public.stripePublicKey.substring(0, 20) + '...')

  // Stripeインスタンスをロード
  if (!stripeInstance) {
    stripeInstance = await loadStripe(config.public.stripePublicKey)
  }

  if (!stripeInstance) {
    console.error('❌ Stripeの初期化に失敗しました')
    throw new Error('Stripeの初期化に失敗しました')
  }

  console.log('✅ Stripe初期化成功')

  return {
    provide: {
      stripe: stripeInstance
    }
  }
})
