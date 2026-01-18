# Firebase Cloud Functions セットアップガイド

## 概要

自動メール配信システムは Firebase Cloud Functions を使用して、毎日 9:00 JST にスケジュールメールを送信します。

## 前提条件

- Firebase プロジェクトが作成済み
- Firebase CLI がインストール済み（`npm install -g firebase-tools`）
- Gmail アカウントとアプリパスワードが設定済み

---

## セットアップ手順

### 1. Firebase にログイン

```bash
firebase login
```

### 2. Functions ディレクトリで依存関係をインストール

```bash
cd functions
npm install
```

### 3. 環境変数の設定

Cloud Functions で使用する環境変数を設定します。

#### 方法1: Firebase CLI でシークレットを設定（推奨）

```bash
# メール送信用のGmail認証情報
firebase functions:secrets:set EMAIL_USER
# プロンプトでメールアドレスを入力: your_email@gmail.com

firebase functions:secrets:set EMAIL_PASSWORD
# プロンプトでGmailアプリパスワードを入力

firebase functions:secrets:set EMAIL_REPLY_TO
# プロンプトで返信先メールアドレスを入力: furniturehouse1@chladni.co.jp
```

#### 方法2: firebase.json に環境変数を設定

**⚠️ 注意: この方法はセキュリティ上推奨されません。シークレット情報を含めないでください。**

```json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs18",
    "env": {
      "EMAIL_REPLY_TO": "furniturehouse1@chladni.co.jp"
    }
  }
}
```

### 4. TypeScript のビルド

```bash
npm run build
```

### 5. ローカルでのテスト（オプション）

```bash
# エミュレーターを起動
npm run serve
```

エミュレーターが起動したら、別のターミナルで以下のコマンドでスケジュール関数を手動実行できます：

```bash
firebase functions:shell
> sendScheduledEmails()
```

### 6. デプロイ

```bash
cd ..  # プロジェクトルートに戻る
firebase deploy --only functions
```

または、特定の関数のみデプロイ：

```bash
firebase deploy --only functions:sendScheduledEmails
```

---

## 環境変数一覧

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `EMAIL_USER` | Gmail アカウント（SMTP認証用） | ✅ | `your_email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail アプリパスワード | ✅ | `xxxx xxxx xxxx xxxx` |
| `EMAIL_REPLY_TO` | 返信先メールアドレス | ✅ | `furniturehouse1@chladni.co.jp` |

### Gmail アプリパスワードの取得方法

1. Google アカウントにログイン
2. https://myaccount.google.com/apppasswords にアクセス
3. 「アプリを選択」→「その他（カスタム名）」を選択
4. 名前を入力（例: Firebase Functions）
5. 「生成」をクリック
6. 表示された16桁のパスワードをコピー

---

## スケジュール関数の仕様

### sendScheduledEmails

- **実行頻度**: 毎日 9:00 JST
- **タイムゾーン**: Asia/Tokyo
- **リージョン**: asia-northeast1

#### 処理フロー

1. 有効な emailSchedules を取得（`enabled: true`）
2. 各スケジュールについて：
   - 対象日付を計算（チェックイン ± N日）
   - 対象予約を取得（`status` と `checkInDate` でフィルタ）
   - 各予約にメール送信：
     - 重複送信チェック（`sentEmails` コレクション）
     - テンプレート取得
     - 変数置換
     - メール送信
     - 送信ログ記録

#### 使用するコレクション

- **読み取り**:
  - `emailSchedules` - メール送信スケジュール
  - `emailTemplates` - メールテンプレート
  - `bookings` - 予約情報
  - `sentEmails` - 重複チェック用

- **書き込み**:
  - `sentEmails` - 送信ログ

---

## トラブルシューティング

### デプロイエラー: "Failed to configure secret"

**原因**: 環境変数が設定されていない

**解決方法**:
```bash
firebase functions:secrets:set EMAIL_USER
firebase functions:secrets:set EMAIL_PASSWORD
firebase functions:secrets:set EMAIL_REPLY_TO
```

### メール送信エラー: "Invalid login"

**原因**: Gmail アプリパスワードが間違っている、または2段階認証が有効になっていない

**解決方法**:
1. Gmail の2段階認証を有効化
2. アプリパスワードを再生成
3. 環境変数を再設定

### スケジュール関数が実行されない

**原因**: Blaze プラン（従量課金）に移行していない

**解決方法**:
```bash
firebase projects:list  # プロジェクトIDを確認
firebase billing:link <PROJECT_ID>  # Blazeプランに移行
```

### ログの確認

```bash
# 最新のログを表示
firebase functions:log

# 特定の関数のログを表示
firebase functions:log --only sendScheduledEmails

# リアルタイムでログをストリーム
firebase functions:log --only sendScheduledEmails --follow
```

---

## デプロイ後の確認

### 1. Firebase Console でスケジュール確認

1. https://console.firebase.google.com/ にアクセス
2. プロジェクトを選択
3. 「Functions」→「sendScheduledEmails」を確認
4. スケジュール設定が `0 9 * * *` (毎日9:00 JST) になっていることを確認

### 2. テスト実行

Firebase Console から手動実行してテスト：

1. Functions ページで「sendScheduledEmails」を選択
2. 「テスト」タブをクリック
3. 「関数を実行」をクリック

または CLI から：

```bash
firebase functions:shell
> sendScheduledEmails()
```

### 3. ログ確認

```bash
firebase functions:log --only sendScheduledEmails --limit 50
```

以下のようなログが出力されることを確認：

```
✅ スケジュールメール送信開始
✅ 有効なスケジュール数: 2
✅ スケジュール処理中: 1週間前リマインダー
✅ 対象予約数: 3
✅ メール送信成功: guest@example.com (FH1-XXX-XXXX)
✅ スケジュールメール送信完了
```

---

## コスト

### Cloud Functions の料金

- **無料枠**: 月200万回の呼び出し、40万GB秒のコンピューティング時間
- **推定コスト**: 1日1回の実行で、予約が100件の場合
  - 呼び出し回数: 30回/月（無料枠内）
  - 実行時間: 約10秒/回 → 300秒/月（無料枠内）
  - **月額: $0**（無料枠内で収まる）

### Gmail SMTP の制限

- **送信制限**: 500通/日
- **レート制限**: 100通/時

スケジュールメールは1日1回の実行なので、500通以内に収まる場合は問題ありません。

---

## セキュリティ

### 重複送信防止

`sentEmails` コレクションで `bookingId` と `scheduleId` の組み合わせをチェックし、同じメールを2回送信しないようにしています。

### Firebase Admin SDK

Cloud Functions は Firebase Admin SDK を使用して Firestore にアクセスします。サービスアカウントは自動的に設定されます。

### 環境変数の保護

Firebase Functions Secrets を使用することで、環境変数は暗号化されて保存され、コードには含まれません。

---

## 次のステップ

1. ✅ Cloud Functions をデプロイ
2. ✅ 環境変数を設定
3. ✅ テスト実行して動作確認
4. ⏳ デフォルトメールテンプレートを投入（`npm run seed:email-templates`）
5. ⏳ 管理画面でスケジュールを作成
6. ⏳ 翌日 9:00 に自動送信されることを確認

---

## 参考リンク

- [Firebase Cloud Functions ドキュメント](https://firebase.google.com/docs/functions)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env)
- [Firebase Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)
- [Gmail SMTP設定](https://support.google.com/a/answer/176600)
