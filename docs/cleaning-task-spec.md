# サポーター管理機能 仕様書

## 概要

「家具の家 No.1」の清掃・メンテナンス業務を担当するサポーターを管理する機能です。
管理者がサポーターを登録・編集・有効/無効化でき、サポーターは専用ダッシュボードから清掃タスクを確認・完了報告できます。

---

## 実装状況

| 機能 | 状態 | 備考 |
|-----|------|------|
| サポーター登録・編集 | ✅ 完了 | `/admin/supporters` |
| サポーター専用ダッシュボード | ✅ 完了 | `/supporter/` |
| 清掃タスク管理 | ✅ 完了 | `/admin/cleaning-tasks` |
| タスク割り当て・変更・解除 | ✅ 完了 | 管理者画面から操作 |
| 作業開始・完了報告 | ✅ 完了 | サポーター画面から操作 |
| チェックリスト管理 | ✅ 完了 | カスタム項目追加可 |
| 写真アップロード | ✅ 完了 | 管理者からの追加依頼機能付き |
| 報酬計算・月次レポート | ✅ 完了 | `/admin/compensation-report` |
| CSV出力 | ✅ 完了 | 月次レポートからダウンロード |

---

## データ構造

サポーターの情報は **2つのコレクション** に分けて保存されます。

### 1. `users` コレクション（認証・基本情報）

すべてのユーザー（管理者・サポーター・ゲスト）が入るコレクションです。

| フィールド名 | 型 | 説明 |
|------------|-----|------|
| uid | string | Firebase Authentication のユーザーID |
| email | string | メールアドレス |
| displayName | string | 表示名（氏名） |
| phone | string | 電話番号 |
| role | string | ユーザー種別（`admin` / `supporter` / `user`） |
| isActive | boolean | アカウントが有効かどうか |
| hourlyRate | number | 時給（円）※サポーターのみ |
| transportationFee | number | 交通費（円）※サポーターのみ |
| createdAt | timestamp | 作成日時 |
| updatedAt | timestamp | 更新日時 |

### 2. `supporters` コレクション（サポーター固有情報）

サポーター特有の情報（報酬関連）を保存するコレクションです。

| フィールド名 | 型 | 説明 |
|------------|-----|------|
| uid | string | Firebase Authentication のユーザーID |
| userId | string | `users` コレクションのドキュメントID |
| email | string | メールアドレス |
| name | string | 氏名 |
| phone | string | 電話番号 |
| hourlyRate | number | 時給（円） |
| transportationFee | number | 交通費（円） |
| isActive | boolean | アクティブ状態 |
| createdAt | timestamp | 作成日時 |
| updatedAt | timestamp | 更新日時 |

### 3. `cleaningTasks` コレクション（清掃タスク）

| フィールド名 | 型 | 説明 |
|------------|-----|------|
| id | string | タスクID |
| bookingId | string | 関連する予約ID |
| bookingReference | string | 予約参照番号 |
| taskType | string | タスク種別（`pre_checkin` / `post_checkout`） |
| status | string | ステータス（下記参照） |
| scheduledDate | timestamp | 予定日 |
| estimatedDuration | number | 予定作業時間（分） |
| actualDuration | number | 実際の作業時間（分） |
| actualHours | number | 実際の作業時間（時間） |
| guestCount | number | 宿泊人数 |
| assignedTo | string | 担当サポーターID |
| assignedToName | string | 担当サポーター名 |
| startedAt | timestamp | 作業開始日時 |
| completedAt | timestamp | 作業完了日時 |
| checklist | array | チェックリスト項目 |
| photos | array | 清掃写真 |
| photoRequestedByAdmin | boolean | 管理者から写真追加依頼 |
| suppliesUsed | array | 使用した備品 |
| notes | string | サポーターメモ |
| adminNotes | string | 管理者メモ |
| compensation | object | 報酬情報 |
| createdAt | timestamp | 作成日時 |
| updatedAt | timestamp | 更新日時 |

#### タスクステータス

| ステータス | 説明 |
|-----------|------|
| `pending` | 未割当（サポーター未定） |
| `assigned` | 割当済（サポーター確定） |
| `in_progress` | 作業中 |
| `completed` | 完了 |
| `cancelled` | キャンセル |

#### 報酬情報（compensation）

| フィールド名 | 型 | 説明 |
|------------|-----|------|
| hourlyRate | number | 時給 |
| hoursWorked | number | 作業時間 |
| transportationFee | number | 交通費 |
| totalAmount | number | 合計報酬 |
| isPaid | boolean | 支払い済みか |
| paidAt | timestamp | 支払日時 |

---

## 画面一覧

### 管理者向け

| 画面 | パス | 説明 |
|-----|------|------|
| サポーター管理 | `/admin/supporters` | サポーターの登録・編集・一覧 |
| 清掃タスク管理 | `/admin/cleaning-tasks` | タスク一覧・割り当て・完了確認 |
| 報酬計算・月次レポート | `/admin/compensation-report` | 報酬集計・支払い管理・CSV出力 |

### サポーター向け

| 画面 | パス | 説明 |
|-----|------|------|
| ダッシュボード | `/supporter/` | タスク一覧・作業開始・完了報告 |
| タスク詳細 | `/supporter/task/[id]` | チェックリスト・写真・備品管理 |

---

## 機能詳細

### 1. サポーター管理（管理者）

**画面：** `/admin/supporters`

**機能：**
- サポーター一覧表示
- 新規サポーター登録（Firebase Auth + Firestore同時作成）
- サポーター情報編集（時給・交通費・有効/無効）
- アクティブ状態の切り替え

### 2. 清掃タスク管理（管理者）

**画面：** `/admin/cleaning-tasks`

**機能：**
- 予約確定時に自動でタスク生成（チェックイン前清掃）
- タスク一覧表示（ステータス・日付でフィルタ可能）
- サポーター割り当て・変更・解除
- 完了確認・写真追加依頼
- 報酬の支払い済みマーク

### 3. 報酬計算・月次レポート（管理者）

**画面：** `/admin/compensation-report`

**機能：**
- 期間選択（月単位）
- サポーター別の報酬集計
  - 完了タスク数
  - 合計作業時間
  - 報酬合計（時給×時間＋交通費）
  - 支払い済み/未払い
- CSV出力（サポーター別・タスク別）
- 一括支払い済みマーク

### 4. サポーターダッシュボード

**画面：** `/supporter/`

**機能：**
- 自分に割り当てられたタスク一覧
- 本日のタスク表示
- 今後のタスク表示
- 完了したタスク履歴
- 報酬履歴の確認

### 5. タスク詳細・作業報告（サポーター）

**画面：** `/supporter/task/[id]`

**機能：**
- 作業開始ボタン（ステータスを`in_progress`に変更）
- チェックリスト項目のチェック
- カスタムチェック項目の追加
- 清掃写真のアップロード
- 使用備品の記録
- メモの入力
- 作業完了ボタン（ステータスを`completed`に変更）

---

## API仕様

### POST `/api/admin/create-supporter`

サポーターを新規作成します。

**リクエスト：**
```json
{
  "email": "supporter@example.com",
  "password": "password123",
  "displayName": "山田太郎",
  "phone": "09012345678",
  "hourlyRate": 1500,
  "transportationFee": 500,
  "isActive": true
}
```

**レスポンス（成功）：**
```json
{
  "success": true,
  "userId": "firebase-auth-uid",
  "userDocId": "users-collection-doc-id",
  "supporterDocId": "supporters-collection-doc-id"
}
```

### POST `/api/emails/send-task-assignment`

タスク割り当て通知メールを送信します。

**リクエスト：**
```json
{
  "taskId": "task-id",
  "supporterEmail": "supporter@example.com",
  "supporterName": "山田太郎",
  "scheduledDate": "2025-01-15",
  "taskType": "pre_checkin"
}
```

### POST `/api/emails/send-cleaning-completed`

清掃完了通知メールを管理者に送信します。

**リクエスト：**
```json
{
  "taskId": "task-id",
  "supporterName": "山田太郎",
  "completedAt": "2025-01-15T10:30:00"
}
```

---

## セキュリティ

### 認証ミドルウェア

#### `/middleware/admin.ts`
- 管理者（`role === 'admin'`）のみアクセス可能
- 未認証・権限不足の場合はリダイレクト

#### `/middleware/supporter.ts`
- サポーター（`role === 'supporter'`）または管理者のみアクセス可能
- 未認証・権限不足の場合はリダイレクト

### CSRF対策

```typescript
// nuxt.config.ts
nitro: {
  routeRules: {
    '/api/admin/**': { csurf: false }, // 管理者認証で保護
    '/api/emails/**': { csurf: false }
  }
}
```

### Firestore セキュリティルール

```javascript
// supporters コレクション
match /supporters/{supporterId} {
  allow read: if isAdmin() || isSupporterOwner(supporterId);
  allow write: if isAdmin();
}

// cleaningTasks コレクション
match /cleaningTasks/{taskId} {
  allow read: if isAdmin() || isAssignedSupporter(taskId);
  allow create: if isAdmin();
  allow update: if isAdmin() || isAssignedSupporter(taskId);
  allow delete: if isAdmin();
}
```

---

## ファイル構成

```
furniturehouse1/
├── pages/
│   ├── admin/
│   │   ├── supporters.vue           # サポーター管理画面
│   │   ├── cleaning-tasks.vue       # 清掃タスク管理画面
│   │   └── compensation-report.vue  # 報酬計算・月次レポート
│   └── supporter/
│       ├── index.vue                # サポーターダッシュボード
│       └── task/
│           └── [id].vue             # タスク詳細・作業報告
├── components/
│   └── TaskCard.vue                 # タスクカードコンポーネント
├── composables/
│   └── useCleaningTasks.ts          # 清掃タスク管理ロジック
├── middleware/
│   ├── admin.ts                     # 管理者認証ミドルウェア
│   └── supporter.ts                 # サポーター認証ミドルウェア
├── server/
│   └── api/
│       ├── admin/
│       │   └── create-supporter.post.ts
│       └── emails/
│           ├── send-task-assignment.post.ts
│           └── send-cleaning-completed.post.ts
├── types/
│   └── index.ts                     # 型定義
└── docs/
    └── cleaning-task-spec.md        # 本仕様書
```

---

## 型定義（抜粋）

```typescript
// types/index.ts

export type UserRole = 'admin' | 'user' | 'supporter'

export type CleaningTaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'

export type CleaningTaskType = 'pre_checkin' | 'post_checkout'

export interface CleaningTask {
  id: string
  bookingId: string
  bookingReference?: string
  taskType: CleaningTaskType
  status: CleaningTaskStatus
  scheduledDate: Timestamp
  estimatedDuration: number
  actualDuration?: number
  actualHours?: number
  guestCount?: number
  assignedTo?: string
  assignedToName?: string
  startedAt?: Timestamp
  completedAt?: Timestamp
  checklist: ChecklistItem[]
  photos?: CleaningPhoto[]
  photoRequestedByAdmin?: boolean
  suppliesUsed?: UsedSupply[]
  notes?: string
  adminNotes?: string
  compensation?: Compensation
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Compensation {
  hourlyRate: number
  hoursWorked?: number
  transportationFee: number
  totalAmount: number
  isPaid: boolean
  paidAt?: Timestamp
}
```

---

## 運用フロー

### 1. 清掃タスクの流れ

```
[予約確定]
    ↓ 自動
[タスク生成] status: pending
    ↓ 管理者操作
[サポーター割り当て] status: assigned
    ↓ 通知メール送信
[サポーター確認]
    ↓ サポーター操作
[作業開始] status: in_progress
    ↓ チェックリスト・写真・備品記録
[作業完了] status: completed
    ↓ 通知メール送信
[管理者確認]
    ↓ 管理者操作
[報酬支払い] compensation.isPaid: true
```

### 2. 報酬計算フロー

```
[月次レポート画面]
    ↓ 期間選択
[完了タスク集計]
    ↓ サポーター別に集計
[報酬計算] 時給 × 作業時間 + 交通費
    ↓ 確認
[CSV出力] or [支払い済みマーク]
```

---

## 今後の拡張予定

1. **サポーターへのプッシュ通知**
   - タスク割り当て時の即座の通知

2. **写真自動分析**
   - AIによる清掃品質チェック

3. **スケジュール調整機能**
   - サポーターの空き状況カレンダー
   - 自動割り当て提案

4. **備品在庫管理連携**
   - 使用備品からの在庫自動減算
   - 発注アラート
