/**
 * ヘルスチェックAPI
 *
 * 外部監視サービス（UptimeRobot, Better Uptime等）から
 * システムの死活監視に使用
 *
 * GET /api/health
 *
 * レスポンス:
 * - 200: 全サービス正常
 * - 503: 一部または全サービスに問題あり
 */

import Stripe from 'stripe'
import { getFirestoreAdmin } from '~/server/utils/firebase-admin'
import { systemLogger } from '~/server/utils/operation-logger'

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency?: number
  message?: string
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  services: {
    firestore: ServiceStatus
    stripe: ServiceStatus
  }
  uptime: number
}

// プロセス起動時刻
const startTime = Date.now()

export default defineEventHandler(async (event): Promise<HealthCheckResponse> => {
  const config = useRuntimeConfig()
  const isProduction = process.env.NODE_ENV === 'production'

  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: isProduction ? 'production' : 'development',
    services: {
      firestore: { status: 'healthy' },
      stripe: { status: 'healthy' }
    },
    uptime: Math.floor((Date.now() - startTime) / 1000)
  }

  // Firestoreチェック
  try {
    const firestoreStart = Date.now()
    const db = getFirestoreAdmin()

    // 軽量な読み取りでFirestoreの接続を確認
    await db.collection('settings').doc('general').get()

    response.services.firestore = {
      status: 'healthy',
      latency: Date.now() - firestoreStart
    }
  } catch (error) {
    response.services.firestore = {
      status: 'unhealthy',
      message: 'Firestore connection failed'
    }
    response.status = 'unhealthy'
  }

  // Stripeチェック
  try {
    const stripeStart = Date.now()
    const stripe = new Stripe(config.stripeSecretKey)

    // 軽量なAPIコールでStripeの接続を確認
    await stripe.balance.retrieve()

    response.services.stripe = {
      status: 'healthy',
      latency: Date.now() - stripeStart
    }
  } catch (error) {
    response.services.stripe = {
      status: 'unhealthy',
      message: 'Stripe connection failed'
    }
    // Stripeが落ちても予約の確認などは可能なのでdegraded
    if (response.status === 'healthy') {
      response.status = 'degraded'
    }
  }

  // 全体ステータスの判定
  const serviceStatuses = Object.values(response.services).map(s => s.status)
  if (serviceStatuses.some(s => s === 'unhealthy')) {
    response.status = 'unhealthy'
  } else if (serviceStatuses.some(s => s === 'degraded')) {
    response.status = 'degraded'
  }

  // ステータスが正常でない場合はログに記録
  if (response.status !== 'healthy') {
    await systemLogger.healthCheck(response.status, {
      firestore: response.services.firestore.status,
      stripe: response.services.stripe.status
    })
  }

  // HTTPステータスコードの設定
  if (response.status === 'unhealthy') {
    setResponseStatus(event, 503)
  }

  return response
})
