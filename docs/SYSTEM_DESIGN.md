# 家具の家 No.1 - 新システム設計書（オプションD完全版）

## 📐 設計哲学

### 3つの原則
1. **シンプル第一** → 複雑な処理は避け、標準機能を活用
2. **エラー耐性** → フォールバック、リトライ、詳細ログ
3. **保守性重視** → コードは最小限、設定で管理

---

## 🎯 システム構成

```
┌──────────────────────────────────────────┐
│         GitHub Repository                │
│    (git push → 自動デプロイ)              │
└────────────┬─────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────┐
│    Firebase Hosting + Cloud Functions    │
│    • Nuxt 3 SSR (Functions Gen 2)        │
│    • 静的アセット配信                      │
└────────────┬─────────────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
┌─────────┐    ┌──────────┐
│Firestore│    │Firebase  │
│  (DB)   │    │  Auth    │
└─────────┘    └──────────┘
    │
    ▼
┌──────────────────────┐
│ Firebase Extensions  │
│ • Send Email         │
│ • Stripe Payments    │
└──────────────────────┘
    │
    ▼
┌─────────┐
│ Stripe  │
└─────────┘
```

---

## 📦 プロジェクト構造（新規）

```
furniture-house-booking/
├── .github/
│   └── workflows/
│       ├── deploy-preview.yml    # PR時のプレビュー
│       └── deploy-prod.yml       # mainブランチへの本番デプロイ
│
├── src/                          # Nuxtアプリケーション
│   ├── assets/
│   ├── components/
│   │   ├── booking/
│   │   ├── admin/
│   │   ├── common/
│   │   └── messaging/
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useBooking.ts
│   │   ├── useMessaging.ts
│   │   └── useAdmin.ts
│   ├── layouts/
│   ├── pages/
│   ├── plugins/
│   │   └── firebase.client.ts
│   ├── public/
│   └── server/
│       └── api/                  # 最小限のAPI
│
├── functions/                    # Firebase Functions
│   ├── src/
│   │   ├── index.ts             # メインエントリー
│   │   ├── triggers/            # Firestoreトリガー
│   │   └── scheduled/           # スケジュール実行
│   └── package.json
│
├── firestore/                    # Firestore設定
│   ├── firestore.rules          # セキュリティルール
│   └── firestore.indexes.json   # インデックス
│
├── firebase.json                 # Firebase設定
├── .firebaserc                   # プロジェクト設定
├── nuxt.config.ts
└── package.json
```

---

## 🗄️ データベース設計（シンプル化）

### Firestoreコレクション構造

```
firestore/
├── users/                        # ユーザー情報
│   └── {userId}/
│       ├── role: 'admin' | 'guest'
│       ├── email: string
│       ├── displayName: string
│       └── createdAt: timestamp
│
├── bookings/                     # 予約
│   └── {bookingId}/
│       ├── userId: string (nullable - ゲスト予約対応)
│       ├── guestEmail: string
│       ├── guestName: string
│       ├── startDate: timestamp
│       ├── endDate: timestamp
│       ├── nights: number
│       ├── guests: number
│       ├── totalPrice: number
│       ├── status: 'pending' | 'confirmed' | 'cancelled'
│       ├── stripePaymentIntentId: string
│       ├── accessToken: string (ゲストアクセス用)
│       └── createdAt: timestamp
│
├── messages/                     # メッセージ（統一）
│   └── {messageId}/
│       ├── bookingId: string
│       ├── senderId: string
│       ├── senderType: 'admin' | 'guest'
│       ├── content: string
│       ├── isRead: boolean
│       ├── createdAt: timestamp
│       └── metadata: object (自動送信フラグなど)
│
├── calendar/                     # カレンダー（キャッシュ）
│   └── {YYYY-MM-DD}/
│       ├── isBlocked: boolean
│       ├── bookingId: string (nullable)
│       └── reason: string (nullable)
│
├── settings/                     # システム設定
│   └── pricing/
│       ├── basePrice: number
│       ├── weekendSurcharge: number
│       ├── longStayDiscount: object
│       └── updatedAt: timestamp
│
├── email_templates/              # メールテンプレート
│   └── {templateId}/
│       ├── name: string
│       ├── subject: string
│       ├── bodyHtml: string
│       ├── bodyText: string
│       └── variables: string[]
│
└── admin_invitations/            # 管理者招待
    └── {invitationId}/
        ├── email: string
        ├── token: string
        ├── status: 'pending' | 'accepted' | 'expired'
        ├── expiresAt: timestamp
        └── createdAt: timestamp
```

### 削除したコレクション（シンプル化）
- ❌ `guestMessages` / `supportMessages` → `messages` に統一
- ❌ `supporters` / `supportTasks` → 必要になったら追加
- ❌ `sentEmails` → Firebase Extensions が自動管理
- ❌ `emailSchedules` → Cloud Scheduler で管理
- ❌ `photos` / `amenities` / `reviews` → 必要になったら追加

---

## 🔐 セキュリティ設計

### Firebase Security Rules（シンプル版）

#### 基本ルール
1. **管理者**: 全データへのアクセス可能
2. **認証ユーザー**: 自分のデータのみアクセス可能
3. **ゲスト**: accessToken でのみ予約データアクセス可能

#### 主要なルール実装
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ヘルパー関数
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isAuthenticated() {
      return request.auth != null;
    }

    // ユーザー
    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow write: if isAdmin();
    }

    // 予約
    match /bookings/{bookingId} {
      allow read: if isAdmin() ||
                     (isAuthenticated() && resource.data.userId == request.auth.uid) ||
                     (request.query.token == resource.data.accessToken);
      allow create: if request.resource.data.guestEmail is string;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // メッセージ
    match /messages/{messageId} {
      allow read: if isAdmin() ||
                     (isAuthenticated() && resource.data.senderId == request.auth.uid);
      allow create: if isAuthenticated() || request.resource.data.senderType == 'guest';
      allow update: if isAdmin() ||
                       (isAuthenticated() && resource.data.senderId == request.auth.uid);
    }

    // カレンダー（公開読み取り）
    match /calendar/{date} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 設定（管理者のみ）
    match /settings/{doc} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

---

## 🔧 環境変数（4個のみ）

```env
# Firebase（自動取得可能）
FIREBASE_PROJECT_ID=furniture-house-1

# Stripe
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx

# メール（Firebase Extensions経由）
SMTP_CONNECTION_URI=smtps://user:pass@smtp.gmail.com:465
```

---

## 📋 実装計画（15フェーズ）

### フェーズ1: プロジェクト初期化（0.5日）
- 新しいディレクトリ作成
- Firebase プロジェクト初期化
- Nuxt 3 セットアップ

### フェーズ2: Firebase設定（0.5日）
- Firebase Hosting 設定
- Cloud Functions 設定
- Firestore ルール作成

### フェーズ3: 基本レイアウト（1日）
- ヘッダー、フッター
- レスポンシブデザイン
- Tailwind CSS設定

### フェーズ4: 認証システム（1日）
- Firebase Auth 統合
- ログイン/サインアップ画面
- 管理者招待システム

### フェーズ5: データモデル（0.5日）
- TypeScript型定義
- Firestore スキーマ確定
- バリデーション設定

### フェーズ6: 予約カレンダー（2日）
- カレンダー表示
- 空き状況確認
- 日付選択UI

### フェーズ7: 料金計算（1日）
- 料金設定システム
- 自動計算ロジック
- 割引適用

### フェーズ8: Stripe決済（1.5日）
- Firebase Extensions インストール
- Payment Intent 作成
- 決済フロー実装

### フェーズ9: 予約管理（1.5日）
- 予約作成
- 予約一覧
- 予約詳細表示

### フェーズ10: メッセージング（1.5日）
- リアルタイムチャット
- 未読管理
- 通知機能

### フェーズ11: メール自動送信（1日）
- Firebase Extensions 設定
- テンプレート作成
- トリガー設定

### フェーズ12: 管理画面（2日）
- 予約管理
- ユーザー管理
- 設定画面

### フェーズ13: CI/CD（0.5日）
- GitHub Actions 設定
- 自動デプロイ

### フェーズ14: データ移行（1日）
- 既存データエクスポート
- 新システムへインポート
- データ整合性確認

### フェーズ15: テスト・本番切替（1日）
- 総合テスト
- パフォーマンステスト
- DNS切替

**合計: 約16日間**

---

## 🚀 デプロイフロー

### 開発フロー
```bash
# 1. ローカル開発
npm run dev

# 2. ブランチ作成
git checkout -b feature/new-feature

# 3. コミット・プッシュ
git commit -m "Add new feature"
git push origin feature/new-feature

# 4. Pull Request作成
# → GitHub Actions が自動でプレビュー環境を作成

# 5. レビュー後、main にマージ
# → 自動で本番デプロイ
```

### デプロイコマンド（手動時）
```bash
# ビルド
npm run build

# Firebase デプロイ
firebase deploy
```

---

## 💰 月額コスト見積もり（円換算）

| サービス | 無料枠 | 予想使用量 | コスト |
|---------|--------|-----------|-------|
| Firebase Hosting | 10GB/月 | ~1GB | ¥0 |
| Cloud Functions | 200万回/月 | ~10万回 | ¥0 |
| Firestore | 50K読取/日 | ~5K/日 | ¥0 |
| Firebase Storage | 5GB | ~1GB | ¥0 |
| Firebase Auth | 無制限 | ~100ユーザー | ¥0 |
| Stripe | - | 3.6%手数料 | 売上の3.6% |
| **合計** | - | - | **¥0** |

※月間予約30件程度まで完全無料

---

## 🎯 システムの特徴

### シンプルさ
- ✅ ファイル数が半分以下
- ✅ 環境変数が4個だけ
- ✅ デプロイが自動化

### 安定性
- ✅ Googleの信頼性
- ✅ 自動スケーリング
- ✅ 詳細なエラーログ

### 保守性
- ✅ Extensions で自動化
- ✅ 明確な構造
- ✅ TypeScript 完全対応

---

## 📚 技術スタック

### フロントエンド
- Nuxt 3.15+
- Vue 3
- Tailwind CSS 4
- TypeScript 5

### バックエンド
- Firebase Hosting
- Cloud Functions Gen 2
- Firestore
- Firebase Auth
- Firebase Extensions

### 決済
- Stripe
- Firebase Stripe Extension

### CI/CD
- GitHub Actions
- Firebase Hosting GitHub Action

---

## 次のステップ

このドキュメントを確認後、実装を開始します。
