/**
 * サーバー起動時の初期化処理
 * - Firebase Admin SDKの初期化
 * - 環境変数の検証
 */

export default defineNitroPlugin((nitroApp) => {
  console.log('🚀 Initializing server...')

  // 1. 環境変数の検証
  validateEnvironmentVariables()

  // 2. Firebase Admin SDKの初期化
  try {
    initializeFirebaseAdmin()
    console.log('✅ Firebase Admin SDK initialized successfully')
  } catch (error: any) {
    console.error('❌ Firebase Admin SDK initialization failed:', error.message)
    // 開発環境では警告のみ、本番環境ではエラー
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
  }

  console.log('✅ Server initialization complete')
})

/**
 * 必須環境変数を検証
 */
function validateEnvironmentVariables() {
  const config = useRuntimeConfig()

  const requiredVars = [
    { name: 'FIREBASE_PROJECT_ID', value: config.public.firebaseProjectId },
    { name: 'FIREBASE_API_KEY', value: config.public.firebaseApiKey },
    { name: 'STRIPE_SECRET_KEY', value: config.stripeSecretKey },
    { name: 'STRIPE_PUBLIC_KEY', value: config.public.stripePublicKey },
  ]

  const missing: string[] = []

  requiredVars.forEach(({ name, value }) => {
    if (!value || value === '') {
      missing.push(name)
    }
  })

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`
    console.error('❌', message)

    if (process.env.NODE_ENV === 'production') {
      throw new Error(message)
    } else {
      console.warn('⚠️ Running in development mode with missing environment variables')
    }
  } else {
    console.log('✅ All required environment variables are set')
  }

  // Webhook Secretの確認（本番環境のみ必須）
  if (process.env.NODE_ENV === 'production' && !config.stripeWebhookSecret) {
    console.warn('⚠️ STRIPE_WEBHOOK_SECRET is not set (required for production)')
  }
}
