#!/usr/bin/env npx tsx
/**
 * 環境変数検証スクリプト
 *
 * デプロイ前に必須の環境変数が設定されているかを確認する
 *
 * 使用方法:
 *   npx tsx scripts/validate-env.ts
 *   npx tsx scripts/validate-env.ts --env=production
 *   npx tsx scripts/validate-env.ts --verbose
 *
 * CI/CDでの使用例:
 *   npx tsx scripts/validate-env.ts --env=production && vercel deploy --prod
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// 引数解析
const args = process.argv.slice(2)
const isProduction = args.includes('--env=production') || process.env.NODE_ENV === 'production'
const isVerbose = args.includes('--verbose')

// .envファイルの読み込み
const envPath = path.resolve(process.cwd(), isProduction ? '.env.production' : '.env')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  if (isVerbose) {
    console.log(`📁 Loading environment from: ${envPath}`)
  }
} else {
  console.log(`⚠️  No ${isProduction ? '.env.production' : '.env'} file found, using system environment variables`)
}

interface EnvVar {
  name: string
  description: string
  required: 'always' | 'production' | 'optional'
  sensitive?: boolean
  validate?: (value: string) => boolean
  hint?: string
}

// 環境変数定義
const envVars: EnvVar[] = [
  // Firebase
  {
    name: 'NUXT_PUBLIC_FIREBASE_PROJECT_ID',
    description: 'Firebase プロジェクトID',
    required: 'always',
    validate: (v) => v.length > 0 && !v.includes(' ')
  },
  {
    name: 'NUXT_PUBLIC_FIREBASE_API_KEY',
    description: 'Firebase API キー',
    required: 'always',
    sensitive: true
  },
  {
    name: 'NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    description: 'Firebase Auth ドメイン',
    required: 'always',
    validate: (v) => v.includes('.firebaseapp.com')
  },
  {
    name: 'NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    description: 'Firebase Storage バケット',
    required: 'always'
  },
  {
    name: 'NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    description: 'Firebase Messaging送信者ID',
    required: 'always'
  },
  {
    name: 'NUXT_PUBLIC_FIREBASE_APP_ID',
    description: 'Firebase アプリID',
    required: 'always'
  },
  {
    name: 'FIREBASE_ADMIN_KEY',
    description: 'Firebase Admin SDK キー（Base64エンコード）',
    required: 'production',
    sensitive: true,
    validate: (v) => {
      try {
        // Base64としてデコードできるか確認
        const decoded = Buffer.from(v, 'base64').toString('utf-8')
        return decoded.includes('"type"') && decoded.includes('service_account')
      } catch {
        return false
      }
    },
    hint: 'サービスアカウントJSONをBase64エンコードした値'
  },

  // Stripe
  {
    name: 'NUXT_PUBLIC_STRIPE_PUBLIC_KEY',
    description: 'Stripe 公開キー',
    required: 'always',
    validate: (v) => v.startsWith('pk_')
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe シークレットキー',
    required: 'always',
    sensitive: true,
    validate: (v) => v.startsWith('sk_')
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    description: 'Stripe Webhook シークレット',
    required: 'production',
    sensitive: true,
    validate: (v) => v.startsWith('whsec_')
  },

  // 内部認証
  {
    name: 'INTERNAL_API_SECRET',
    description: '内部API認証シークレット',
    required: 'always',
    sensitive: true,
    validate: (v) => v.length >= 32,
    hint: '32文字以上のランダムな文字列'
  },
  {
    name: 'CRON_SECRET',
    description: 'Cron認証シークレット',
    required: 'production',
    sensitive: true,
    validate: (v) => v.length >= 16
  },

  // メール
  {
    name: 'EMAIL_USER',
    description: 'メール送信ユーザー（SMTP）',
    required: 'production',
    validate: (v) => v.includes('@')
  },
  {
    name: 'EMAIL_PASSWORD',
    description: 'メール送信パスワード',
    required: 'production',
    sensitive: true
  },
  {
    name: 'EMAIL_FROM',
    description: 'メール送信元アドレス',
    required: 'production',
    validate: (v) => v.includes('@')
  },

  // サイト設定
  {
    name: 'NUXT_PUBLIC_SITE_URL',
    description: 'サイトURL',
    required: 'production',
    validate: (v) => v.startsWith('https://'),
    hint: '本番環境ではhttps://で始まるURL'
  },

  // 監視（オプション）
  {
    name: 'SENTRY_DSN',
    description: 'Sentry DSN（エラー監視）',
    required: 'optional',
    validate: (v) => v.startsWith('https://') && v.includes('@')
  },

  // Redis（オプション）
  {
    name: 'UPSTASH_REDIS_REST_URL',
    description: 'Upstash Redis REST URL（レート制限用）',
    required: 'optional',
    validate: (v) => v.startsWith('https://')
  },
  {
    name: 'UPSTASH_REDIS_REST_TOKEN',
    description: 'Upstash Redis RESTトークン',
    required: 'optional',
    sensitive: true
  }
]

// 検証実行
console.log('🔍 環境変数検証を開始します...')
console.log(`   モード: ${isProduction ? '本番環境' : '開発環境'}`)
console.log('')

const results = {
  passed: [] as string[],
  failed: [] as { name: string; reason: string }[],
  warnings: [] as { name: string; message: string }[]
}

for (const envVar of envVars) {
  const value = process.env[envVar.name]

  // 必須チェック
  if (envVar.required === 'always' || (envVar.required === 'production' && isProduction)) {
    if (!value || value === '') {
      results.failed.push({
        name: envVar.name,
        reason: `未設定: ${envVar.description}${envVar.hint ? ` (${envVar.hint})` : ''}`
      })
      continue
    }
  } else if (!value) {
    // オプションで未設定
    if (isVerbose) {
      results.warnings.push({
        name: envVar.name,
        message: `オプション: ${envVar.description} (未設定)`
      })
    }
    continue
  }

  // バリデーション
  if (value && envVar.validate && !envVar.validate(value)) {
    results.failed.push({
      name: envVar.name,
      reason: `無効な値: ${envVar.description}${envVar.hint ? ` (${envVar.hint})` : ''}`
    })
    continue
  }

  results.passed.push(envVar.name)
  if (isVerbose) {
    const displayValue = envVar.sensitive ? '***' : value.substring(0, 20) + (value.length > 20 ? '...' : '')
    console.log(`  ✅ ${envVar.name}: ${displayValue}`)
  }
}

// 結果出力
console.log('')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('📊 検証結果')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(`  ✅ 成功: ${results.passed.length}件`)
console.log(`  ❌ 失敗: ${results.failed.length}件`)
console.log(`  ⚠️  警告: ${results.warnings.length}件`)
console.log('')

if (results.failed.length > 0) {
  console.log('❌ 以下の環境変数に問題があります:')
  console.log('')
  for (const failure of results.failed) {
    console.log(`  • ${failure.name}`)
    console.log(`    ${failure.reason}`)
    console.log('')
  }

  console.log('💡 ヒント:')
  console.log('  1. .env ファイルに環境変数を設定してください')
  console.log('  2. Vercel の場合は Settings > Environment Variables で設定')
  console.log('  3. 詳細は docs/setup/ENVIRONMENT_VARIABLES.md を参照')
  console.log('')

  process.exit(1)
}

if (results.warnings.length > 0 && isVerbose) {
  console.log('⚠️  以下の環境変数はオプションですが、設定することを推奨します:')
  console.log('')
  for (const warning of results.warnings) {
    console.log(`  • ${warning.name}: ${warning.message}`)
  }
  console.log('')
}

console.log('✅ 環境変数の検証が完了しました。すべての必須変数が設定されています。')
console.log('')

// Vercelデプロイ用チェックリスト出力
if (isProduction) {
  console.log('📋 Vercelデプロイ前チェックリスト:')
  console.log('  □ Stripe Webhook URLを設定済み')
  console.log('  □ Firebase セキュリティルールを適用済み')
  console.log('  □ CORS設定を確認済み')
  console.log('  □ カスタムドメインを設定済み')
  console.log('')
}

process.exit(0)
