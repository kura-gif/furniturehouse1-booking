/**
 * Firebase Admin SDK ユーティリティ
 * サーバーサイドでFirestoreにアクセスするための設定
 */

import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

let adminApp: any = null

/**
 * Firebase Admin SDKを初期化
 */
export const initializeFirebaseAdmin = () => {
  // 既に初期化済みの場合はスキップ
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const config = useRuntimeConfig()

  try {
    // 環境変数からサービスアカウントキーを取得
    // 本番環境: Base64エンコードされたJSON
    // 開発環境: JSONファイルのパス
    const serviceAccount = getServiceAccountFromEnv(config)

    // サービスアカウントがない場合（開発環境）
    if (!serviceAccount) {
      console.warn('⚠️ Firebase Admin SDK not initialized (no credentials)')
      return null
    }

    adminApp = initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket || 'furniture-house-1.firebasestorage.app',
    })

    console.log('✅ Firebase Admin SDK initialized')
    return adminApp
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error)
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    return null
  }
}

/**
 * 環境変数からサービスアカウント情報を取得
 */
const getServiceAccountFromEnv = (config: any): any => {
  // 方法1: FIREBASE_ADMIN_KEYからBase64デコード（本番環境推奨）
  if (process.env.FIREBASE_ADMIN_KEY) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_ADMIN_KEY, 'base64').toString('utf-8')
      return JSON.parse(decoded)
    } catch (error) {
      console.error('Failed to decode FIREBASE_ADMIN_KEY:', error)
    }
  }

  // 方法2: 個別の環境変数から構築（開発環境用）
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    return {
      projectId: config.public.firebaseProjectId,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }

  // 方法3: ローカル開発用（JSONファイルパス）
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    } catch (error) {
      console.error('Failed to load service account from file:', error)
    }
  }

  // 開発環境では警告のみ
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️ Firebase Admin credentials not found. Running without Firebase Admin SDK.')
    console.warn('   To enable Firebase Admin features, set one of:')
    console.warn('   - GOOGLE_APPLICATION_CREDENTIALS (path to JSON file)')
    console.warn('   - FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL')
    console.warn('   - FIREBASE_ADMIN_KEY (Base64 encoded JSON)')
    return null
  }

  // 本番環境でも一時的にnullを返す（Firebase Admin SDK なしで動作）
  console.warn('⚠️ Firebase Admin credentials not found in production. Some features may be limited.')
  return null
}

/**
 * Firestoreインスタンスを取得
 */
export const getFirestoreAdmin = () => {
  if (!adminApp) {
    const app = initializeFirebaseAdmin()
    if (!app) {
      throw new Error('Firebase Admin SDK is not initialized. Please configure credentials.')
    }
  }
  return getFirestore()
}

/**
 * Firebase Authインスタンスを取得
 */
export const getAuthAdmin = () => {
  if (!adminApp) {
    const app = initializeFirebaseAdmin()
    if (!app) {
      throw new Error('Firebase Admin SDK is not initialized. Please configure credentials.')
    }
  }
  return getAuth()
}

/**
 * Firebase Storageバケットを取得
 */
export const getStorageAdmin = () => {
  if (!adminApp) {
    const app = initializeFirebaseAdmin()
    if (!app) {
      throw new Error('Firebase Admin SDK is not initialized. Please configure credentials.')
    }
  }
  return getStorage().bucket()
}

/**
 * ユニークな予約番号を生成
 * フォーマット: FH1-[TIMESTAMP]-[RANDOM]
 */
export const generateBookingReference = (): string => {
  const prefix = 'FH1'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * セキュアなトークンを生成
 */
export const generateSecureToken = (): string => {
  const crypto = require('crypto')
  return crypto.randomBytes(32).toString('hex')
}
