# 実装済み機能一覧

## 概要

このドキュメントでは、家具の家 No.1 予約システムの実装済み機能を説明します。

**最終更新**: 2026年1月19日
**開発Phase**: Phase 2.5 完了（Phase 3 本番公開準備中）

---

## フェーズ2〜2.5で実装した機能

### 主要機能（Airbnbライクな予約体験）

---

## 1. ゲスト側の予約キャンセル機能 ✅

### 概要
ゲストがマイページから予約をキャンセルできる機能です。

### 実装内容
- **ファイル**: [pages/mypage.vue](pages/mypage.vue#L127-L132)
- **Composable**: `useBookings().cancelBooking()`

### 使い方
1. マイページにログイン
2. 予約一覧で「予約をキャンセル」ボタンをクリック
3. 確認ダイアログで「OK」を選択

### ステータス
- `pending`（予約待ち）または`confirmed`（予約確定）の予約のみキャンセル可能
- キャンセル後、ステータスは`cancelled`に変更されます

---

## 2. レビュー投稿機能 ✅

### 概要
宿泊完了後にゲストがレビューを投稿できる機能です。

### 実装内容
- **型定義**: [types/index.ts](types/index.ts#L317-L343)
- **Composable**: [composables/useReviews.ts](composables/useReviews.ts)
- **UI**: [pages/mypage.vue](pages/mypage.vue#L157-L261)
- **Firestore Collection**: `reviews`

### 機能詳細
1. **評価システム**: 1〜5つ星の評価
2. **旅行タイプ選択**: 家族旅行、カップル旅行、友人旅行、一人旅、ビジネス
3. **コメント投稿**: 最大1000文字
4. **公開/非公開制御**: 管理者が公開/非公開を切り替え可能
5. **管理者返信**: 管理者がレビューに返信可能

### 使い方（ゲスト）
1. マイページで`completed`（完了）ステータスの予約を確認
2. 「レビューを書く」ボタンをクリック
3. 星評価を選択（必須）
4. 旅行の目的を選択（任意）
5. レビュー本文を入力（必須）
6. 「レビューを投稿」ボタンをクリック

### 使い方（管理者）
管理画面の「レビュー」タブから:
- レビュー一覧の確認
- 返信の投稿
- 公開/非公開の切り替え

### データ構造
```typescript
interface Review {
  id: string
  bookingId: string
  userId: string
  userName: string
  rating: number // 1-5
  comment: string
  stayType?: string
  isVisible: boolean
  adminReply?: string
  adminRepliedAt?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 3. ウィッシュリスト（お気に入り）機能 ✅

### 概要
ユーザーが物件をお気に入りに追加・削除できる機能です。

### 実装内容
- **型定義**: [types/index.ts](types/index.ts#L345-L354)
- **Composable**: [composables/useFavorites.ts](composables/useFavorites.ts)
- **UI**: [pages/index.vue](pages/index.vue#L23-L43)
- **Firestore Collection**: `favorites`

### 機能詳細
1. **お気に入りボタン**: ハートアイコンで視覚的に表示
2. **認証チェック**: 未ログインユーザーにはログインを促す
3. **トグル機能**: ワンクリックで追加/削除
4. **状態管理**: リアルタイムで状態を更新

### 使い方
1. トップページのタイトル横にあるハートアイコンをクリック
2. 未ログインの場合: ログインページへ誘導
3. ログイン済みの場合: お気に入りに追加/削除

### データ構造
```typescript
interface Favorite {
  id: string
  userId: string
  propertyId: string
  propertyName: string
  createdAt: Timestamp
}
```

### 今後の拡張
- マイページにお気に入り一覧ページを追加
- 複数物件対応時の検索・フィルタリング

---

## 4. メール通知機能 ✅

### 概要
予約確定時などに自動でメール通知を送信する機能です。

### 実装内容
- **Server API**: [server/api/emails/send-booking-confirmation.post.ts](server/api/emails/send-booking-confirmation.post.ts)
- **Composable**: [composables/useEmail.ts](composables/useEmail.ts)
- **統合**: [composables/useBookings.ts](composables/useBookings.ts#L48-L60)
- **依存関係**: `nodemailer` パッケージ

### メール種類
1. **予約確定メール**: 予約作成時に自動送信
2. **キャンセル通知**: 予約キャンセル時（実装可能）
3. **チェックインリマインダー**: チェックイン前日など（実装可能）

### 環境設定
`.env`ファイルに以下を設定してください:

```bash
# Gmailを使用する場合
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmailアプリパスワード
SITE_URL=http://localhost:3000
```

**重要**: Gmailの場合、通常のパスワードではなく「アプリパスワード」を生成してください。
- [Googleアプリパスワード生成ページ](https://myaccount.google.com/apppasswords)

### メールテンプレート
- レスポンシブデザイン対応
- ブランドカラー統合
- 予約内容の詳細表示
- マイページへのリンク

### セットアップ手順
1. `npm install` を実行してnodemailerをインストール
2. `.env`ファイルにメール設定を追加
3. Gmailの場合は2段階認証を有効化してアプリパスワードを生成
4. サーバーを再起動

### 使い方
予約作成時に自動で送信されます。手動で送信する場合:

```typescript
const { sendBookingConfirmationEmail } = useEmail()
await sendBookingConfirmationEmail('guest@example.com', {
  bookingId: 'xxx',
  guestName: '山田太郎',
  checkInDate: '2025/12/28',
  checkOutDate: '2025/12/30',
  totalAmount: 50000
})
```

---

## セットアップとインストール

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
`.env.example`を参考に`.env`ファイルを作成してください:

```bash
cp .env.example .env
```

### 3. Firebase設定
Firestoreに以下のコレクションが作成されます:
- `reviews` - レビュー
- `favorites` - お気に入り

### 4. 開発サーバーの起動
```bash
npm run dev
```

---

## 実装状況

### 完成済み（Phase 2.5まで）

#### 予約・決済機能

- ✅ ゲスト側の予約キャンセルUI
- ✅ **決済機能（Stripe統合）** - 与信確保→審査→確定方式
- ✅ 管理者審査フロー（予約承認/却下）
- ✅ キャンセルポリシー連動の返金処理
- ✅ クーポン機能

#### コンテンツ機能

- ✅ レビュー投稿機能
- ✅ ウィッシュリスト機能
- ✅ ゲストガイド（WiFi、設備、周辺情報）
- ✅ メッセージ機能（ゲスト-管理者）

#### 管理機能

- ✅ 清掃タスク管理
- ✅ サポーター管理
- ✅ 動的料金設定

#### 通知機能

- ✅ メール通知（各種自動メール）
- ✅ メール送信リトライ機能（指数バックオフ）

#### セキュリティ・信頼性（Phase 2.5追加）

- ✅ 予約並行処理競合対策（楽観的ロック）
- ✅ 与信期限管理（自動Cronジョブ）
- ✅ Stripe idempotencyKey追加（二重課金防止）
- ✅ 環境変数バリデーション
- ✅ エラー詳細マスク
- ✅ ログ基盤統一（PIIマスキング）

### 今後の改善予定（Phase 3以降）

- 予約変更機能（日程・人数の直接変更）
- 多言語対応の強化（英語翻訳追加）
- カレンダー上の料金表示
- Googleカレンダー連携
- LINE通知
- Sentry導入（エラー監視）
- レート制限のRedis移行

---

## トラブルシューティング

### メールが送信されない
1. `.env`ファイルの設定を確認
2. Gmailの場合、アプリパスワードを使用しているか確認
3. サーバーログでエラーメッセージを確認

### レビューが表示されない
1. Firestoreの`reviews`コレクションを確認
2. `isVisible: true`になっているか確認
3. コンソールでエラーを確認

### お気に入りが保存されない
1. ログイン状態を確認
2. Firestoreの`favorites`コレクションを確認
3. ブラウザのコンソールでエラーを確認

---

## 貢献

機能追加や改善の提案は、GitHubのIssueまたはPull Requestでお願いします。

---

**最終更新**: 2026年1月19日
