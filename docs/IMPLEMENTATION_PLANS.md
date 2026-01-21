# 実装計画書

**最終更新**: 2026年1月19日
**ステータス**: Phase 3準備中（本番公開: 2/6予定）

---

## 実装優先度

| 項目 | 優先度 | ステータス | 予定時期 |
|------|--------|-----------|---------|
| レート制限 Redis移行 | 中 | ⬜ 未着手 | Phase 3以降 |
| Sentry導入 | 高 | ⬜ 未着手 | 公開後1週間 |
| 予約変更機能 | 中 | ⬜ 未着手 | Q1 |
| アクセシビリティ改善 | 低 | ⬜ 未着手 | Q1 |

---

## 1. レート制限 Redis移行計画

### 現状
- インメモリストアを使用（`server/middleware/rate-limit.ts`）
- Vercel Serverless環境では各インスタンスが独立したメモリを持つため、レート制限が分散される

### 課題
- サーバーレス環境ではインスタンス間でレート制限状態が共有されない
- 高負荷時に効果的なレート制限ができない可能性

### 移行計画

#### Phase 1: Upstash Redis導入（推奨）
Vercel + Upstash Redisの組み合わせは公式推奨

**必要な作業:**
1. Upstash アカウント作成・Redis インスタンス作成
2. 環境変数追加:
   ```
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   ```
3. `@upstash/redis` パッケージインストール
4. `server/middleware/rate-limit.ts` の書き換え

**コード例:**
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const multi = redis.multi()
  multi.incr(key)
  multi.expire(key, Math.ceil(windowMs / 1000))
  const results = await multi.exec()
  const count = results[0] as number
  return count <= limit
}
```

#### Phase 2: 既存コードの移行
1. インメモリストアをRedisクライアントに置き換え
2. フォールバック機能追加（Redis障害時はレート制限スキップ）
3. テスト環境での検証

### コスト見積もり
- Upstash Free tier: 10,000 requests/day（多くの場合十分）
- Pay as you go: $0.2 per 100,000 commands

### タイムライン
- Phase 1: 2-3時間
- Phase 2: 1-2時間
- テスト: 1時間

---

## 2. Sentry導入計画

### 目的
- エラーの自動収集と通知
- パフォーマンスモニタリング
- 本番環境の問題の迅速な検知

### 導入計画

#### Phase 1: 基本セットアップ
1. Sentryアカウント作成、プロジェクト作成
2. パッケージインストール:
   ```bash
   npm install @sentry/nuxt
   ```
3. 環境変数追加:
   ```
   SENTRY_DSN=
   SENTRY_AUTH_TOKEN=
   SENTRY_ORG=
   SENTRY_PROJECT=
   ```

4. `nuxt.config.ts` 設定:
   ```typescript
   export default defineNuxtConfig({
     modules: ['@sentry/nuxt/module'],
     sentry: {
       dsn: process.env.SENTRY_DSN,
       environment: process.env.NODE_ENV,
       tracesSampleRate: 0.1, // パフォーマンス10%サンプリング
     }
   })
   ```

#### Phase 2: サーバーサイド統合
1. `server/plugins/sentry.ts` 作成:
   ```typescript
   import * as Sentry from '@sentry/node'

   export default defineNitroPlugin(() => {
     Sentry.init({
       dsn: process.env.SENTRY_DSN,
       environment: process.env.NODE_ENV,
     })
   })
   ```

2. エラーハンドラー統合:
   ```typescript
   // server/utils/error-handling.ts に追加
   export function captureException(error: unknown): void {
     if (process.env.NODE_ENV === 'production') {
       Sentry.captureException(error)
     }
   }
   ```

#### Phase 3: アラート設定
1. Slack/メール通知設定
2. エラー発生頻度アラート設定
3. パフォーマンス劣化アラート設定

### コスト見積もり
- Sentry Developer (Free): 5,000 errors/month
- Team: $26/month（50,000 errors/month）

### タイムライン
- Phase 1: 1時間
- Phase 2: 1時間
- Phase 3: 30分

---

## 3. 予約変更機能計画

### 機能要件
- ゲストが予約詳細ページから日程変更をリクエスト
- 管理者が変更リクエストを承認/却下
- 日程変更時の金額差分計算
- 追加決済または一部返金の処理

### 技術設計

#### API設計
```
POST /api/bookings/request-modification
  - bookingId
  - newCheckInDate
  - newCheckOutDate
  - reason

POST /api/bookings/approve-modification
  - bookingId
  - modificationRequestId

POST /api/bookings/reject-modification
  - bookingId
  - modificationRequestId
  - reason
```

#### データモデル
```typescript
interface ModificationRequest {
  id: string
  bookingId: string
  originalCheckIn: Timestamp
  originalCheckOut: Timestamp
  newCheckIn: Timestamp
  newCheckOut: Timestamp
  priceDifference: number // 正: 追加料金, 負: 返金
  status: 'pending' | 'approved' | 'rejected'
  reason: string
  createdAt: Timestamp
  processedAt?: Timestamp
}
```

#### 決済フロー
1. 追加料金の場合:
   - 新規Payment Intent作成
   - ゲストに決済リンク送信
   - 決済完了後に予約更新

2. 返金の場合:
   - 差額を計算
   - Stripe Refund API で一部返金
   - 予約更新

### タイムライン
- 設計: 2時間
- API実装: 4-6時間
- フロントエンド: 4-6時間
- テスト: 2-3時間

---

## 4. アクセシビリティ改善計画

### 現状分析
- 基本的なセマンティックHTML使用
- フォームラベル対応
- カラーコントラスト一部不足の可能性

### 改善項目

#### 優先度: 高
1. **キーボードナビゲーション**
   - すべてのインタラクティブ要素にフォーカス可能
   - フォーカスインジケーターの視認性改善
   - モーダル内でのフォーカストラップ

2. **スクリーンリーダー対応**
   - 適切なaria-label追加
   - 動的コンテンツのaria-live設定
   - ボタンのアクセシブルな名前

3. **フォームアクセシビリティ**
   - エラーメッセージとフィールドの関連付け
   - 必須フィールドの明示
   - 入力支援テキスト

#### 優先度: 中
4. **カラーコントラスト**
   - WCAG AA基準（4.5:1）の確認
   - グレーテキストの改善

5. **レスポンシブ対応**
   - 200%ズームでのレイアウト確認
   - タッチターゲットサイズ（44x44px以上）

### 実装方法
```vue
<!-- 例: ボタンのアクセシビリティ改善 -->
<button
  type="button"
  :aria-label="予約を確定する"
  :aria-busy="isLoading"
  :disabled="isLoading"
>
  <span v-if="isLoading" aria-hidden="true">...</span>
  <span v-else>予約を確定</span>
</button>
```

### タイムライン
- 監査: 2時間
- 高優先度改善: 4-6時間
- 中優先度改善: 2-4時間
- テスト: 2時間
