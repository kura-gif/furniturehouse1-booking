import { initializeApp, type FirebaseApp } from 'firebase/app'
import { initializeFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { VueFire, VueFireAuth } from 'vuefire'

export default defineNuxtPlugin((nuxtApp): { provide: { firebase: FirebaseApp | null, db: Firestore | null, auth: Auth | null, storage: FirebaseStorage | null } } => {
  // Firebase設定（環境変数から取得）
  const config = useRuntimeConfig()

  const apiKey = (config.public.firebaseApiKey as string | undefined) ?? ''

  // 環境変数チェック
  console.log('[Firebase] Config check:', {
    hasApiKey: !!apiKey,
    hasAuthDomain: !!config.public.firebaseAuthDomain,
    hasProjectId: !!config.public.firebaseProjectId,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'
  })

  // 開発モード判定（ダミー値の場合はスキップ）
  if (!apiKey || apiKey === 'dev-mode-no-firebase') {
    console.warn('[Firebase] Not initialized - missing API key or dev mode')
    return {
      provide: {
        firebase: null,
        db: null,
        auth: null,
        storage: null
      }
    }
  }

  try {
    const firebaseConfig = {
      apiKey: apiKey,
      authDomain: config.public.firebaseAuthDomain || '',
      projectId: config.public.firebaseProjectId || '',
      storageBucket: config.public.firebaseStorageBucket || '',
      messagingSenderId: config.public.firebaseMessagingSenderId || '',
      appId: config.public.firebaseAppId || ''
    }

    // Firebaseアプリを初期化
    const firebaseApp = initializeApp(firebaseConfig)

    // Firestoreとのコネクション（Long Pollingを強制有効化 - WebSocket問題回避）
    const db = initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true
    })
    const auth = getAuth(firebaseApp)
    const storage = getStorage(firebaseApp)

    // VueFireプラグインを登録
    nuxtApp.vueApp.use(VueFire, {
      firebaseApp,
      modules: [VueFireAuth()]
    })

    console.log('[Firebase] 正常に初期化されました')

    // アプリ全体でアクセスできるようにする
    return {
      provide: {
        firebase: firebaseApp,
        db,
        auth,
        storage
      }
    }
  } catch (error) {
    console.error('[Firebase] 初期化エラー:', error)
    return {
      provide: {
        firebase: null,
        db: null,
        auth: null,
        storage: null
      }
    }
  }
})
