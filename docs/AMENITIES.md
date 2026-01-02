# アメニティ管理システム

## 概要

アメニティ管理システムは、宿泊施設のアメニティ（設備・備品）をFirebaseで管理し、管理画面から追加・編集・削除できるシステムです。

## 構成

### 1. データ構造

```typescript
interface Amenity {
  id: string
  name: string
  description: string
  category: 'basic' | 'cooking' | 'bathroom' | 'bedroom' | 'entertainment' | 'outdoor' | 'safety'
  icon: string // Heroiconsのアイコン名
  available: boolean // トップページに表示するかどうか
}
```

### 2. ファイル構成

- **[config/amenities.ts](../config/amenities.ts)** - アメニティの型定義とカテゴリ設定
- **[composables/useAmenities.ts](../composables/useAmenities.ts)** - Firebase操作用のcomposable
- **[components/AdminAmenityManagement.vue](../components/AdminAmenityManagement.vue)** - 管理画面コンポーネント
- **[pages/index.vue](../pages/index.vue)** - フロントエンドの表示
- **[scripts/initAmenities.ts](../scripts/initAmenities.ts)** - 初期データ投入スクリプト

## 使い方

### 初期セットアップ

1. Firebaseの設定が完了していることを確認

2. 初期データの投入（初回のみ）:
   ```typescript
   // ブラウザのコンソールまたは管理画面で実行
   import { initializeAmenities } from '~/scripts/initAmenities'
   await initializeAmenities()
   ```

### 管理画面での操作

管理ダッシュボード (`/admin`) にアクセスし、「アメニティ管理」タブを選択します。

#### アメニティの追加
1. 「+ 新規追加」ボタンをクリック
2. 以下の情報を入力:
   - 名前（必須）
   - 説明（任意）
   - カテゴリ（必須）
   - アイコン（必須）
   - トップページに表示（チェックボックス）
3. 「追加」ボタンをクリック

#### アメニティの編集
1. 編集したいアメニティの編集ボタンをクリック
2. 情報を変更
3. 「更新」ボタンをクリック

#### アメニティの削除
1. 削除したいアメニティの削除ボタンをクリック
2. 確認ダイアログで「OK」をクリック

#### 利用可能状態の切り替え
- アメニティの横にあるチェックボックスをクリックすると、トップページでの表示/非表示を切り替えられます

### カテゴリ

アメニティは以下のカテゴリに分類されます:

- **基本設備** (basic) - Wi-Fi、駐車場、エアコンなど
- **キッチン・調理** (cooking) - キッチン、冷蔵庫、電子レンジなど
- **バスルーム** (bathroom) - 浴室、シャンプー、タオルなど
- **寝室・リネン** (bedroom) - 寝具、ハンガー、カーテンなど
- **エンターテインメント** (entertainment) - テレビ、書籍など
- **屋外・景観** (outdoor) - 庭、山の景色など
- **安全設備** (safety) - 火災報知器、消火器、救急箱など

### アイコン

利用可能なアイコン一覧は、Heroicons Outline から選択できます:
- wifi, truck, sun, fire, beaker, cube, square-3-stack-3d, cup
- shopping-bag, home, home-modern, document, bolt
- arrows-up-down, rectangle-stack, tv, book-open
- sparkles, photo, bell-alert, shield-check, heart

## Firebaseコレクション構造

```
amenities/
  {amenityId}/
    name: string
    description: string
    category: string
    icon: string
    available: boolean
    createdAt: Timestamp
    updatedAt: Timestamp
```

## トラブルシューティング

### アメニティが表示されない

1. Firebaseにデータが正しく保存されているか確認
2. ブラウザのコンソールでエラーがないか確認
3. アメニティの `available` フラグが `true` になっているか確認

### 初期データが投入できない

1. Firebase設定が正しいか確認
2. 管理者権限でログインしているか確認
3. Firestoreのルールで書き込み権限があるか確認

## 今後の拡張案

- アメニティの並び順をドラッグ&ドロップで変更
- アメニティにアイコン画像をアップロード可能に
- カテゴリの追加・編集機能
- 複数言語対応
