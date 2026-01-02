import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { VueFire, VueFireAuth } from 'vuefire'

export default defineNuxtPlugin((nuxtApp) => {
  // Firebase設定（環境変数から取得）
  const config = useRuntimeConfig()

  // 環境変数が設定されていない場合、または開発モードの場合はFirebaseを初期化しない
  const apiKey = config.public.firebaseApiKey || ''

  // 開発モード判定（ダミー値の場合はスキップ）
  if (!apiKey || apiKey === 'dev-mode-no-firebase') {
    console.log('[開発モード] Firebaseは初期化されていません。本番環境では.envファイルに実際のFirebase設定を追加してください。')
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

    // Firestoreとのコネクション
    const db = getFirestore(firebaseApp)
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
