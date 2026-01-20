# ゲストメッセージ機能 - セットアップガイド

**最終更新**: 2026年1月20日

## 概要

予約ごとにゲストと管理者がリアルタイムでメッセージをやり取りできる機能です。
新着メッセージがあると、自動的にメール通知が送信されます。

## 実装済み機能

### ✅ フロントエンド

1. **管理画面のメッセージタブ** (`pages/admin/index.vue`)
   - 予約一覧からメッセージを選択
   - リアルタイムチャット
   - クイック返信テンプレート
   - 自動既読処理

2. **ゲスト用メッセージページ** (`pages/messages/[id].vue`)
   - 予約ごとのメッセージページ
   - リアルタイムチャット
   - 自動既読処理
   - マイページからアクセス可能

3. **useMessaging composable** (`composables/useMessaging.ts`)
   - メッセージ送受信
   - リアルタイム監視
   - 既読管理
   - 未読カウント

### ✅ バックエンド

1. **Firestoreセキュリティルール**
   - 管理者: 全メッセージアクセス可能
   - ゲスト: 自分の予約のメッセージのみアクセス可能
   - 既読フラグの更新は誰でも可能

2. **Firestoreインデックス**
   - メッセージ一覧取得用
   - 未読カウント用

3. **Cloud Functions** (要セットアップ)
   - 新着メッセージのメール通知
   - SendGrid統合

## セットアップ手順

### 1. Firestoreルールとインデックスのデプロイ

```bash
# Firestoreルールとインデックスをデプロイ
firebase deploy --only firestore:rules,firestore:indexes
```

### 2. SendGridの設定

1. [SendGrid](https://sendgrid.com/)でアカウントを作成
2. API Keyを取得
3. 送信元メールアドレスを認証

### 3. Firebase Cloud Functionsのセットアップ

```bash
# functionsディレクトリに移動
cd functions

# 依存関係をインストール
npm install

# SendGrid API Keyを設定
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"

# 管理者メールアドレスを設定
firebase functions:config:set admin.email="admin@example.com"

# Functionsをデプロイ
firebase deploy --only functions
```

### 4. 環境変数の設定（ローカル開発用）

`functions/.env` ファイルを作成:

```
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY
ADMIN_EMAIL=admin@example.com
```

### 5. 動作確認

1. ブラウザで `http://localhost:3000/mypage` を開く
2. 予約の「メッセージ」ボタンをクリック
3. メッセージを送信
4. 管理画面（`http://localhost:3000/admin`）のメッセージタブで確認
5. 管理者から返信
6. メール通知が届くことを確認

## 使用方法

### ゲスト側

1. マイページから予約を選択
2. 「メッセージ」ボタンをクリック
3. メッセージを入力して送信
4. 管理者からの返信はリアルタイムで表示される
5. 新着メッセージがあるとメール通知が届く

### 管理者側

1. 管理画面の「メッセージ」タブを開く
2. 左側の予約一覧からメッセージを選択
3. メッセージを入力するか、クイック返信を使用
4. 送信すると、ゲストにメール通知が送られる

## メール通知の仕組み

### ゲスト → 管理者

1. ゲストがメッセージを送信
2. Firestoreに`guestMessages`ドキュメントが作成される
3. Cloud Functionが`onCreate`トリガーで起動
4. 管理者にメール通知が送信される

### 管理者 → ゲスト

1. 管理者がメッセージを送信
2. Firestoreに`guestMessages`ドキュメントが作成される
3. Cloud Functionが`onCreate`トリガーで起動
4. ゲストにメール通知が送信される

## カスタマイズ

### クイック返信テンプレートの編集

`pages/admin/index.vue` の `quickReplies` 配列を編集:

```typescript
const quickReplies = [
  'ご予約ありがとうございます。チェックインは15時からとなります。',
  '鍵はキーボックスにて受け渡しとなります。暗証番号は前日にご連絡いたします。',
  // カスタムメッセージを追加
  'お待ちしております！'
]
```

### メールテンプレートの編集

`functions/src/index.ts` の `sendEmailToAdmin` と `sendEmailToGuest` 関数を編集してください。

## トラブルシューティング

### メール通知が届かない

1. SendGrid API Keyが正しく設定されているか確認
   ```bash
   firebase functions:config:get
   ```

2. Cloud Functionsのログを確認
   ```bash
   firebase functions:log
   ```

3. SendGridの送信履歴を確認

### メッセージが表示されない

1. Firestoreのセキュリティルールを確認
2. ブラウザのコンソールでエラーを確認
3. Firestoreインデックスが作成されているか確認

### リアルタイム更新が動作しない

1. Firestoreのリアルタイムリスナーが正しく設定されているか確認
2. ブラウザのネットワークタブでWebSocket接続を確認
3. ページをリロードしてみる

## データ構造

### guestMessages コレクション

```typescript
{
  id: string
  bookingId: string              // 予約ID
  senderId: string               // 送信者ID
  senderType: 'admin' | 'guest'  // 送信者タイプ
  senderName: string             // 送信者名
  message: string                // メッセージ内容
  isRead: boolean                // 既読フラグ
  createdAt: Timestamp           // 作成日時
}
```

## セキュリティ

- すべてのメッセージはFirestoreセキュリティルールで保護されています
- ゲストは自分の予約に関するメッセージのみアクセス可能
- 管理者は全メッセージにアクセス可能
- メール通知は認証済みユーザーのみ送信可能

## 今後の拡張案

- [ ] 画像・ファイル添付機能
- [ ] メッセージの検索機能
- [ ] 定型文の管理画面
- [ ] プッシュ通知（PWA対応）
- [ ] メッセージの既読未読表示の改善
- [ ] メッセージの削除機能
- [ ] メッセージのアーカイブ機能

---

**最終更新**: 2026年1月19日
**バージョン**: 1.0.0
