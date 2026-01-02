/**
 * ヘルスチェックAPI
 * システムの状態を確認
 */

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const status = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      server: true,
      firebase: {
        configured: !!(
          config.public.firebaseApiKey &&
          config.public.firebaseProjectId
        ),
        projectId: config.public.firebaseProjectId || 'not set',
      },
      stripe: {
        configured: !!(
          config.stripeSecretKey &&
          config.public.stripePublicKey
        ),
        testMode: config.public.stripePublicKey?.startsWith('pk_test_') || false,
      },
      firebaseAdmin: {
        credentialsSet: !!(
          process.env.FIREBASE_ADMIN_KEY ||
          process.env.FIREBASE_PRIVATE_KEY ||
          process.env.GOOGLE_APPLICATION_CREDENTIALS
        ),
      },
    },
  }

  return status
})
