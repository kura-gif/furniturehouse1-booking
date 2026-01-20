# 施設サポート管理機能 - 実装ドキュメント

## 概要

家具の家 No.1の施設サポート（清掃・メンテナンス）業務を効率的に管理するためのシステムです。
パート従業員（施設サポーター）とのスケジュール調整、タスク割当、報酬計算、コミュニケーションを一元管理します。

## 用語の統一

| 旧称 | 新称 | 理由 |
|------|------|------|
| 清掃員 | 施設サポーター | 業務の多様性を表現 |
| 清掃 | 施設サポート | サービスの幅広さを示す |
| 清掃スケジュール | 施設サポートスケジュール | 統一された呼称 |

---

## 機能一覧

### 1. サポーター管理

#### 1.1 サポーター登録・編集
- **機能**: 施設サポーターの基本情報を登録・管理
- **情報項目**:
  - 名前
  - メールアドレス（通知用）
  - 電話番号
  - 時給設定（個別設定可能）
  - 交通費（往復、距離に応じたガソリン代）
  - アクティブ/非アクティブステータス

#### 1.2 サポーター一覧表示
- アクティブなサポーターの一覧
- 今月の稼働時間・回数
- 今月の報酬（時給 × 稼働時間 + 交通費 × 回数）

**実装ファイル**:
- `composables/useSupport.ts` - `createSupporter()`, `updateSupporter()`, `getAllSupporters()`

---

### 2. スケジュール管理

#### 2.1 利用可能状況カレンダー
- **目的**: サポーターが事前にOK日/NG日を登録
- **機能**:
  - カレンダー形式での日付選択
  - OK日（利用可能）: 緑色表示
  - NG日（利用不可）: 赤色表示
  - 未設定: グレー表示
  - 時間帯指定も可能（例: 9:00-15:00のみOK）
  - メモ欄（理由など）

**データ構造**:
```typescript
interface SupporterAvailability {
  supporterId: string
  date: Timestamp
  isAvailable: boolean  // true: OK日, false: NG日
  timeSlots?: {
    start: string  // "09:00"
    end: string    // "15:00"
  }[]
  notes?: string
}
```

**実装ファイル**:
- `composables/useSupport.ts` - `getSupporterAvailability()`, `setSupporterAvailability()`

#### 2.2 サポータータスク作成
- **トリガー**: 予約確定時に自動生成、または管理者が手動作成
- **設定項目**:
  - 予約ID（関連予約）
  - 予定日時（通常はチェックアウト日）
  - 予定時間（2時間/3時間/4時間から選択）
  - サポーター割当（未割当も可）

**データ構造**:
```typescript
interface SupportTask {
  bookingId: string
  supporterId?: string  // 未割当の場合はundefined
  scheduledDate: Timestamp
  scheduledDuration: 2 | 3 | 4  // 時間
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  checklistCompleted: {
    linenChange: boolean
    bathroom: boolean
    kitchen: boolean
    garbageCollection: boolean
    floor: boolean
    windows: boolean
  }
}
```

---

### 3. タスク実行・報告

#### 3.1 チェックリスト
サポーターが完了した作業をチェック:
- ✅ リネン交換
- ✅ バスルーム清掃
- ✅ キッチン清掃
- ✅ ゴミ回収
- ✅ 床清掃
- ✅ 窓清掃

#### 3.2 実績時間入力
- **開始時間**: サポーターが入力
- **終了時間**: サポーターが入力
- **実働時間**: 自動計算（分単位）

**データ構造**:
```typescript
interface SupportTask {
  actualStartTime?: Timestamp
  actualEndTime?: Timestamp
  actualDuration?: number  // 分単位
}
```

#### 3.3 報酬自動計算
```typescript
// 計算式
laborCost = hourlyRate × (actualDuration / 60)
totalCost = laborCost + transportationFee

// 例: 時給1,300円、3時間、交通費600円
// laborCost = 1,300 × 3 = 3,900円
// totalCost = 3,900 + 600 = 4,500円
```

**実装ファイル**:
- `composables/useSupport.ts` - `calculateTaskCost()`

---

### 4. コミュニケーション機能

#### 4.1 タスク別チャット
- **参加者**: 管理者 ⇔ サポーター
- **機能**:
  - リアルタイムメッセージング
  - 既読/未読管理
  - メール通知（新規メッセージ時）

**データ構造**:
```typescript
interface SupportMessage {
  taskId: string
  senderId: string
  senderType: 'admin' | 'supporter'
  senderName: string
  message: string
  isRead: boolean
  createdAt: Timestamp
}
```

**実装ファイル**:
- `composables/useSupport.ts` - `getSupportMessages()`, `sendSupportMessage()`, `markMessageAsRead()`

#### 4.2 メール通知
- **トリガー**:
  - タスク割当時 → サポーターに通知
  - 新規メッセージ → 相手に通知
  - スケジュール変更 → サポーターに通知

**実装予定**: Cloud Functions + SendGrid

---

## 管理画面UI構成

### タブ構造
```
施設サポート
├── スケジュール
│   ├── サポートタスク一覧
│   ├── 未割当タスク
│   └── 完了済みタスク
├── サポーター管理
│   ├── サポーター一覧
│   ├── 今月の稼働状況
│   └── 報酬サマリー
└── 利用可能状況
    ├── サポーター選択
    ├── カレンダー表示
    └── OK/NG日設定
```

### アクセス権限
- **管理者**: 全機能にアクセス可能
- **サポーター**:
  - 自分のタスクのみ閲覧・更新
  - 自分の利用可能スケジュールのみ編集
  - タスクチャットのみ使用可能

---

## ワークフロー

### 1. 予約確定時の自動タスク生成
```
予約確定
  ↓
サポートタスク自動作成
  - 予定日: チェックアウト日
  - 予定時間: 3時間（デフォルト）
  - ステータス: scheduled
  - サポーター: 未割当
  ↓
管理者が利用可能状況を確認
  ↓
サポーター割当
  ↓
サポーターにメール通知
```

### 2. サポーター作業フロー
```
タスク通知受信（メール）
  ↓
利用可能状況確認
  ↓
OK/NG返信（カレンダーまたはチャット）
  ↓
【作業当日】
開始時間入力
  ↓
チェックリスト実行
  ↓
終了時間入力
  ↓
タスク完了
  ↓
報酬自動計算
```

### 3. 管理者承認フロー
```
サポータータスク完了
  ↓
管理者確認
  ↓
チェックリスト確認
  ↓
実働時間確認
  ↓
報酬確定
  ↓
月次サマリー生成
```

---

## データベース設計

### Firestoreコレクション

#### 1. `supporters`
```
supporters/{supporterId}
  - name: string
  - email: string
  - phone: string
  - hourlyRate: number
  - transportationFee: number
  - isActive: boolean
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

#### 2. `supportTasks`
```
supportTasks/{taskId}
  - bookingId: string
  - supporterId: string (nullable)
  - scheduledDate: Timestamp
  - scheduledDuration: 2 | 3 | 4
  - actualStartTime: Timestamp (nullable)
  - actualEndTime: Timestamp (nullable)
  - actualDuration: number (nullable)
  - status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  - checklistCompleted: {
      linenChange: boolean
      bathroom: boolean
      kitchen: boolean
      garbageCollection: boolean
      floor: boolean
      windows: boolean
    }
  - notes: string
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

#### 3. `supporterAvailability`
```
supporterAvailability/{availabilityId}
  - supporterId: string
  - date: Timestamp
  - isAvailable: boolean
  - timeSlots: [{ start: string, end: string }]
  - notes: string
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

#### 4. `supportMessages`
```
supportMessages/{messageId}
  - taskId: string
  - senderId: string
  - senderType: 'admin' | 'supporter'
  - senderName: string
  - message: string
  - isRead: boolean
  - createdAt: Timestamp
```

---

## セキュリティルール

```javascript
// 管理者: 全アクセス
// サポーター本人: 自分のデータのみ読み取り・更新

match /supporters/{supporterId} {
  allow read, write: if isAdmin();
  allow read: if request.auth.uid == supporterId;
}

match /supportTasks/{taskId} {
  allow read, write: if isAdmin();
  allow read: if resource.data.supporterId == request.auth.uid;
  allow update: if resource.data.supporterId == request.auth.uid
    && onlyUpdating(['actualStartTime', 'actualEndTime', 'actualDuration', 'status', 'checklistCompleted']);
}

match /supporterAvailability/{availabilityId} {
  allow read, write: if isAdmin();
  allow read, write: if resource.data.supporterId == request.auth.uid;
  allow create: if request.resource.data.supporterId == request.auth.uid;
}

match /supportMessages/{messageId} {
  allow read, write: if isAdmin();
  allow read: if request.auth.uid == resource.data.senderId;
  allow create: if request.auth.uid == request.resource.data.senderId;
  allow update: if onlyUpdating(['isRead']);
}
```

---

## 今後の拡張機能

### Phase 1（実装済み）
- ✅ サポーター管理
- ✅ タスク管理基本機能
- ✅ 利用可能スケジュールUI
- ✅ 報酬自動計算

### Phase 2（実装予定）
- 🚧 LINEとの連携（通知）
- 🚧 メール自動送信
- 🚧 リアルタイムチャット実装
- 🚧 サポーター専用ページ作成

### Phase 3（将来的に）
- 📋 月次レポート自動生成
- 📋 給与明細PDF出力
- 📋 稼働統計グラフ
- 📋 パフォーマンス評価システム
- 📋 複数施設対応

---

## 実装ファイル一覧

```
types/index.ts
  - Supporter
  - SupportTask
  - SupporterAvailability
  - SupportMessage
  - SupportDuration
  - SupportStatus

composables/useSupport.ts
  - サポーター管理関数
  - タスク管理関数
  - スケジュール管理関数
  - チャット管理関数
  - 報酬計算関数

pages/admin/index.vue
  - 施設サポートタブ（3サブタブ）
    - スケジュール
    - サポーター管理
    - 利用可能状況

firestore.rules
  - supporters コレクションルール
  - supportTasks コレクションルール
  - supporterAvailability コレクションルール
  - supportMessages コレクションルール

firestore.indexes.json
  - supportTasks インデックス
  - supporterAvailability インデックス
  - supportMessages インデックス
```

---

## 使用方法

### 1. サポーター登録
```typescript
const { createSupporter } = useSupport()

await createSupporter({
  name: '田中 花子',
  email: 'tanaka@example.com',
  phone: '090-1234-5678',
  hourlyRate: 1300,
  transportationFee: 600,
  isActive: true
})
```

### 2. タスク作成
```typescript
const { createSupportTask } = useSupport()

await createSupportTask({
  bookingId: 'booking-123',
  scheduledDate: Timestamp.fromDate(new Date('2025-02-01')),
  scheduledDuration: 3,
  status: 'scheduled',
  checklistCompleted: {
    linenChange: false,
    bathroom: false,
    kitchen: false,
    garbageCollection: false,
    floor: false,
    windows: false
  }
})
```

### 3. サポーター割当
```typescript
const { assignSupporter } = useSupport()

await assignSupporter('task-123', 'supporter-456')
```

### 4. 報酬計算
```typescript
const { calculateTaskCost } = useSupport()

const supporter = {
  hourlyRate: 1300,
  transportationFee: 600
}

const cost = calculateTaskCost(supporter, 180) // 180分 = 3時間
// { laborCost: 3900, transportationFee: 600, totalCost: 4500 }
```

---

## まとめ

施設サポート管理機能により、以下が実現されます：

1. **効率的なスケジュール調整**: LINEでの都度確認が不要
2. **透明な報酬管理**: 時給と交通費の自動計算
3. **タスクの可視化**: 誰が・いつ・何をするか明確
4. **コミュニケーション履歴**: チャットで記録が残る
5. **スケーラビリティ**: サポーターの増減に柔軟に対応

**最終更新**: 2026年1月19日
**バージョン**: 1.0.0
