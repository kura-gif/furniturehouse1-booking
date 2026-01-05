const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// .envファイルを読み込む
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const serviceAccount = JSON.parse(Buffer.from(envVars.FIREBASE_ADMIN_KEY, 'base64').toString());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'furniture-house-1'
});

const db = admin.firestore();

async function checkUsers() {
  const snapshot = await db.collection('users').get();
  console.log('ユーザー一覧:');
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log('ID:', doc.id, '| Email:', data.email, '| Role:', data.role);
  });
  process.exit(0);
}

checkUsers().catch(err => {
  console.error('エラー:', err.message);
  process.exit(1);
});
