// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-csurf'
  ],

  // CSRF保護設定
  csurf: {
    https: process.env.NODE_ENV === 'production',
    cookie: {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    },
    methodsToProtect: ['POST', 'PUT', 'PATCH', 'DELETE']
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '家具の家 No.1 | 坂茂の初期作品に宿泊する',
      meta: [
        { name: 'description', content: '家具が家を支える「体験する建築」。風が通り、光が移ろい、音が吸い込まれる。静かな時間の中で、構造体としての家具に囲まれる不思議な感覚を味わう宿泊体験。' },
        { property: 'og:site_name', content: '家具の家 No.1 | 坂茂の初期作品に宿泊する' },
        { property: 'og:title', content: '家具の家 No.1｜坂茂の初期作品に宿泊する' },
        { property: 'og:description', content: '家具が家を支える『体験する建築』。静かな時間の中で構造体に囲まれる不思議な宿泊体験。' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Nitro設定
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true,
    routeRules: {
      '/**': {
        headers: {
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://m.stripe.com https://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data: blob:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; frame-src https://js.stripe.com https://hooks.stripe.com https://*.firebaseapp.com; worker-src 'self' blob:;"
        }
      },
      // CSRF除外ルート
      '/api/stripe/webhook': { csurf: false },
      '/api/stripe/create-payment-intent': { csurf: false },
      '/api/bookings/create': { csurf: false },
      '/api/emails/**': { csurf: false },
      '/api/admin/**': { csurf: false },
      '/api/test/**': { csurf: false }
    }
  },

  css: [
    '~/assets/css/main.css'
  ],

  runtimeConfig: {
    // サーバーサイドのみで使用（秘密情報）
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    internalApiSecret: process.env.INTERNAL_API_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '',
    emailUser: process.env.EMAIL_USER || '',
    emailPassword: process.env.EMAIL_PASSWORD || '',
    emailReplyTo: process.env.EMAIL_REPLY_TO || '',
    firebaseAdminKey: process.env.FIREBASE_ADMIN_KEY || '',
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || '',

    // クライアント・サーバー両方で使用（公開情報）
    public: {
      firebaseApiKey: process.env.FIREBASE_API_KEY || '',
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      firebaseAppId: process.env.FIREBASE_APP_ID || '',
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      brandSiteUrl: process.env.BRAND_SITE_URL || 'https://furniturehouse1.com'
    }
  },

  typescript: {
    strict: false,
    typeCheck: false
  }
})
