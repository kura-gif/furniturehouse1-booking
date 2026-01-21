import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import dotenv from 'dotenv'

dotenv.config()

const FIREBASE_ADMIN_KEY = process.env.FIREBASE_ADMIN_KEY!
if (!getApps().length) {
  const serviceAccount = JSON.parse(Buffer.from(FIREBASE_ADMIN_KEY, 'base64').toString('utf8')) as ServiceAccount
  initializeApp({ credential: cert(serviceAccount) })
}

const db = getFirestore()

async function main() {
  const logs = await db.collection('errorLogs')
    .orderBy('timestamp', 'desc')
    .limit(5)
    .get()

  console.log('Recent error logs:')
  logs.forEach(doc => {
    console.log(doc.id, JSON.stringify(doc.data(), null, 2))
  })
}

main().catch(console.error)
