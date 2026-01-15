# Firebase Admin SDK セットアップ手順

## 🔑 サービスアカウントキーの取得

### 1. Firebase Consoleにアクセス
https://console.firebase.google.com/project/furniture-house-1/settings/serviceaccounts/adminsdk

### 2. 新しい秘密鍵を生成
1. 「新しい秘密鍵の生成」ボタンをクリック
2. 確認ダイアログで「キーを生成」をクリック
3. JSONファイルがダウンロードされる（`furniture-house-1-xxxxx.json`）

### 3. JSONファイルをBase64エンコード

#### macOS/Linux:
```bash
cd /Users/kurashimayouichi/Documents/furniturehouse1
cat furniture-house-1-*.json | base64 | tr -d '\n' > firebase-admin-base64.txt
```

#### 生成された Base64 文字列を確認:
```bash
cat firebase-admin-base64.txt
```

### 4. .env ファイルに追加

`.env`ファイルを開いて、Firebase Admin SDK設定セクションに以下を追加:

```bash
# Firebase Admin SDK設定
FIREBASE_ADMIN_KEY=（Base64エンコードされた文字列をここに貼り付け）
```

### 5. JSONファイルを削除（セキュリティ）

```bash
rm furniture-house-1-*.json
rm firebase-admin-base64.txt
```

---

## 🚀 完了後

`.env`ファイルが更新されたら、次のステップ（Vercel環境変数設定）に進めます。
