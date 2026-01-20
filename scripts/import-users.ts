/**
 * ユーザー一括インポートスクリプト
 *
 * CSVファイルからユーザーを一括作成します。
 *
 * 使用方法:
 *   1. scripts/users.csv にユーザー情報を記載
 *   2. 本番用の環境変数を設定
 *   3. npx tsx scripts/import-users.ts --env=production
 *
 * CSV形式:
 *   email,displayName,role,password
 *   admin@example.com,管理者太郎,admin,Password123!
 */

import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as readline from 'readline'

// コマンドライン引数を解析
const args = process.argv.slice(2)
const isProduction = args.includes('--env=production')
const isDryRun = args.includes('--dry-run')
const csvPath = args.find(arg => arg.startsWith('--csv='))?.replace('--csv=', '') || 'scripts/users.csv'

// 環境変数を読み込み
if (isProduction) {
  // 本番用の環境変数ファイルがあれば読み込み
  dotenv.config({ path: '.env.production.local' })
  dotenv.config({ path: '.env.production' })
} else {
  dotenv.config({ path: '.env.local' })
  dotenv.config({ path: '.env' })
}

interface UserRow {
  email: string
  displayName: string
  role: 'admin' | 'supporter' | 'user'
  password: string
}

interface ImportResult {
  email: string
  success: boolean
  uid?: string
  error?: string
}

async function initFirebase(): Promise<{ auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore> }> {
  // 既存のアプリがあれば削除
  const apps = getApps()
  for (const app of apps) {
    await deleteApp(app)
  }

  const adminKey = process.env.FIREBASE_ADMIN_KEY

  if (!adminKey) {
    throw new Error('FIREBASE_ADMIN_KEY が設定されていません')
  }

  // Base64デコード
  const serviceAccount = JSON.parse(Buffer.from(adminKey, 'base64').toString('utf-8'))

  console.log(`\n📁 Firebase Project: ${serviceAccount.project_id}`)

  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  })

  return {
    auth: getAuth(app),
    db: getFirestore(app)
  }
}

async function readCSV(filePath: string): Promise<UserRow[]> {
  return new Promise((resolve, reject) => {
    const users: UserRow[] = []

    createReadStream(path.resolve(filePath))
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row: UserRow) => {
        // バリデーション
        if (!row.email || !row.displayName || !row.role || !row.password) {
          console.warn(`⚠️  スキップ: 必須項目が不足 - ${JSON.stringify(row)}`)
          return
        }
        if (!['admin', 'supporter', 'user'].includes(row.role)) {
          console.warn(`⚠️  スキップ: 無効なrole "${row.role}" - ${row.email}`)
          return
        }
        users.push(row)
      })
      .on('end', () => resolve(users))
      .on('error', reject)
  })
}

async function confirmExecution(users: UserRow[], projectId: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  console.log('\n========================================')
  console.log('インポート対象ユーザー:')
  console.log('========================================')
  users.forEach((u, i) => {
    console.log(`  ${i + 1}. ${u.email} (${u.displayName}) - ${u.role}`)
  })
  console.log('========================================')
  console.log(`合計: ${users.length}人`)
  console.log(`対象プロジェクト: ${projectId}`)
  console.log('========================================\n')

  return new Promise((resolve) => {
    rl.question('実行しますか？ (yes/no): ', (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y')
    })
  })
}

async function importUsers(users: UserRow[], auth: ReturnType<typeof getAuth>, db: ReturnType<typeof getFirestore>): Promise<ImportResult[]> {
  const results: ImportResult[] = []

  for (const user of users) {
    console.log(`\n処理中: ${user.email}...`)

    try {
      // 1. Firebase Authentication にユーザー作成
      const userRecord = await auth.createUser({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        emailVerified: true // 管理者が作成するため検証済みとする
      })

      console.log(`  ✅ Auth作成: ${userRecord.uid}`)

      // 2. Firestore にユーザードキュメント作成
      const now = Timestamp.now()
      await db.collection('users').doc(userRecord.uid).set({
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        createdAt: now,
        updatedAt: now
      })

      console.log(`  ✅ Firestore作成完了`)

      results.push({
        email: user.email,
        success: true,
        uid: userRecord.uid
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log(`  ❌ エラー: ${errorMessage}`)

      results.push({
        email: user.email,
        success: false,
        error: errorMessage
      })
    }
  }

  return results
}

async function main() {
  console.log('==========================================')
  console.log('  ユーザー一括インポートスクリプト')
  console.log('==========================================')
  console.log(`環境: ${isProduction ? '🔴 本番 (Production)' : '🟢 開発 (Development)'}`)
  console.log(`モード: ${isDryRun ? 'Dry Run (実際には作成しない)' : '実行'}`)
  console.log(`CSVファイル: ${csvPath}`)

  try {
    // CSV読み込み
    console.log('\n📄 CSVファイルを読み込み中...')
    const users = await readCSV(csvPath)

    if (users.length === 0) {
      console.log('❌ インポート対象のユーザーがありません')
      process.exit(1)
    }

    // Firebase初期化
    console.log('\n🔥 Firebase初期化中...')
    const { auth, db } = await initFirebase()

    // プロジェクトID取得
    const projectId = process.env.FIREBASE_PROJECT_ID || 'unknown'

    // 確認
    const confirmed = await confirmExecution(users, projectId)

    if (!confirmed) {
      console.log('\n❌ キャンセルされました')
      process.exit(0)
    }

    if (isDryRun) {
      console.log('\n🔍 Dry Runモード: 実際の作成はスキップ')
      process.exit(0)
    }

    // インポート実行
    console.log('\n🚀 インポート開始...')
    const results = await importUsers(users, auth, db)

    // 結果サマリー
    const succeeded = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    console.log('\n==========================================')
    console.log('  インポート結果')
    console.log('==========================================')
    console.log(`✅ 成功: ${succeeded.length}件`)
    console.log(`❌ 失敗: ${failed.length}件`)

    if (failed.length > 0) {
      console.log('\n失敗したユーザー:')
      failed.forEach(f => {
        console.log(`  - ${f.email}: ${f.error}`)
      })
    }

    if (succeeded.length > 0) {
      console.log('\n作成されたユーザー:')
      succeeded.forEach(s => {
        console.log(`  - ${s.email} (UID: ${s.uid})`)
      })
    }

    console.log('\n==========================================')
    console.log('  完了')
    console.log('==========================================')

    process.exit(failed.length > 0 ? 1 : 0)
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

main()
