# バックアップ設定ガイド

## 概要

Firestoreデータのバックアップは、データ損失を防ぐために重要です。
本番環境では定期的なバックアップを設定してください。

## 1. Google Cloud Storage バケットの作成

### 1.1 GCPコンソールでバケット作成

1. https://console.cloud.google.com にアクセス
2. プロジェクト「furniture-house-1」を選択
3. Cloud Storage → バケット → 作成

設定値：

| 項目 | 値 |
|------|-----|
| バケット名 | `furniturehouse1-backups` |
| ロケーション | `asia-northeast1`（東京） |
| ストレージクラス | Nearline（月1回以下のアクセス向け） |
| アクセス制御 | 均一 |

### 1.2 Firebase Service AccountにStorage権限を付与

1. IAM & Admin → IAM
2. Firebase Admin SDK サービスアカウントを検索
3. 「編集」→ ロール追加 → 「Storage オブジェクト管理者」

## 2. 手動バックアップ

### 2.1 Firebase CLIを使用

```bash
# Firebaseにログイン
firebase login

# エクスポート実行
firebase firestore:export gs://furniturehouse1-backups/manual-$(date +%Y%m%d-%H%M%S)
```

### 2.2 gcloudコマンドを使用

```bash
# 認証
gcloud auth login
gcloud config set project furniture-house-1

# エクスポート
gcloud firestore export gs://furniturehouse1-backups/manual-$(date +%Y%m%d-%H%M%S)
```

## 3. 自動バックアップ（スケジュール設定）

### 3.1 Cloud Scheduler + Cloud Functionsを使用

1. Cloud Functions を作成：

```javascript
// functions/backup.js
const { Firestore } = require('@google-cloud/firestore');
const firestore = new Firestore();

exports.scheduledFirestoreBackup = async (event, context) => {
  const projectId = 'furniture-house-1';
  const bucketName = 'furniturehouse1-backups';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  const client = new Firestore.v1.FirestoreAdminClient();
  const databaseName = client.databasePath(projectId, '(default)');

  const [response] = await client.exportDocuments({
    name: databaseName,
    outputUriPrefix: `gs://${bucketName}/scheduled-${timestamp}`,
    collectionIds: [] // 全コレクション
  });

  console.log(`Backup started: ${response.name}`);
  return response;
};
```

2. Cloud Scheduler でスケジュール設定：

| 項目 | 値 |
|------|-----|
| 名前 | firestore-daily-backup |
| 頻度 | `0 3 * * *`（毎日午前3時） |
| タイムゾーン | Asia/Tokyo |
| ターゲット | Cloud Functions |
| 関数 | scheduledFirestoreBackup |

### 3.2 簡易版：cron + gcloud

サーバーがある場合、cronで定期実行：

```bash
# /etc/cron.d/firestore-backup
0 3 * * * root /usr/bin/gcloud firestore export gs://furniturehouse1-backups/daily-$(date +\%Y\%m\%d) --project=furniture-house-1
```

## 4. バックアップからの復元

### 4.1 インポート手順

```bash
# バックアップ一覧を確認
gsutil ls gs://furniturehouse1-backups/

# 特定のバックアップをインポート
gcloud firestore import gs://furniturehouse1-backups/manual-20250106-120000
```

**注意**: インポートは既存データを上書きします。

### 4.2 部分復元

特定のコレクションのみ復元：

```bash
gcloud firestore import gs://furniturehouse1-backups/manual-20250106-120000 \
  --collection-ids=bookings,users
```

## 5. バックアップの検証

### 5.1 テスト復元

本番データベースに影響を与えずにバックアップを検証：

1. テスト用Firestoreデータベースを作成
2. そこにバックアップをインポート
3. データの整合性を確認
4. テストデータベースを削除

### 5.2 チェックリスト

- [ ] バックアップファイルが作成されているか
- [ ] ファイルサイズが妥当か（急激な減少は異常）
- [ ] 主要コレクションが含まれているか
  - bookings
  - users
  - enhancedPricingSettings
  - coupons
  - reviews

## 6. バックアップ保持ポリシー

### 6.1 推奨保持期間

| バックアップ種類 | 保持期間 |
|-----------------|----------|
| 日次バックアップ | 7日間 |
| 週次バックアップ | 4週間 |
| 月次バックアップ | 12ヶ月 |

### 6.2 ライフサイクル設定

GCPコンソール → Cloud Storage → バケット → ライフサイクル

```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 90,
          "matchesPrefix": ["daily-"]
        }
      }
    ]
  }
}
```

## 7. 緊急時の対応

### データ損失が発生した場合

1. **即座に現状を保存**
   ```bash
   gcloud firestore export gs://furniturehouse1-backups/emergency-$(date +%Y%m%d-%H%M%S)
   ```

2. **直近のバックアップを確認**
   ```bash
   gsutil ls -l gs://furniturehouse1-backups/ | sort -k2 | tail -10
   ```

3. **復元を実行**
   ```bash
   gcloud firestore import gs://furniturehouse1-backups/[選択したバックアップ]
   ```

4. **アプリケーションを確認**
   - 予約データの整合性
   - ユーザーデータ
   - 設定データ

## 8. コスト見積もり

### Cloud Storage料金（概算）

| 項目 | 月額目安 |
|------|----------|
| Nearline Storage (100GB) | 約$1.00 |
| エクスポート操作 | 約$0.10 |
| 合計 | 約$1.10/月 |

※データ量により変動

## 9. 関連コマンドまとめ

```bash
# バックアップ作成
gcloud firestore export gs://furniturehouse1-backups/backup-$(date +%Y%m%d)

# バックアップ一覧
gsutil ls gs://furniturehouse1-backups/

# バックアップ詳細
gsutil ls -l gs://furniturehouse1-backups/backup-20250106/

# 復元
gcloud firestore import gs://furniturehouse1-backups/backup-20250106

# 古いバックアップ削除
gsutil -m rm -r gs://furniturehouse1-backups/backup-20241201
```
