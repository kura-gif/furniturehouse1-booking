# サンプルデータ投入ガイド（手動版）

Firebase Consoleから手動でサンプルデータを追加する手順です。

## 1. Firebase Consoleを開く

https://console.firebase.google.com/project/furniture-house-1/firestore/databases/-default-/data

## 2. ゲストユーザーを作成（Authentication）

### Authenticationページを開く
https://console.firebase.google.com/project/furniture-house-1/authentication/users

「ユーザーを追加」をクリックして、以下の3名を作成：

#### ユーザー1
- メールアドレス: `tanaka@example.com`
- パスワード: `password123`

#### ユーザー2
- メールアドレス: `suzuki@example.com`
- パスワード: `password123`

#### ユーザー3
- メールアドレス: `yamada@example.com`
- パスワード: `password123`

**作成後、各ユーザーのUID（ユーザー識別子）をメモしてください。**

---

## 3. Firestoreにデータを追加

### 3-1. usersコレクションにユーザー情報を追加

Firestoreページ: https://console.firebase.google.com/project/furniture-house-1/firestore/databases/-default-/data

1. 「コレクションを開始」または「users」コレクションを選択
2. 以下の3つのドキュメントを追加（ドキュメントIDは上記でメモしたUID）

#### ドキュメント1（田中太郎）
```
ドキュメントID: [田中太郎のUID]
フィールド:
  email (string): tanaka@example.com
  displayName (string): 田中太郎
  role (string): user
  createdAt (timestamp): 今日の日時
```

#### ドキュメント2（鈴木花子）
```
ドキュメントID: [鈴木花子のUID]
フィールド:
  email (string): suzuki@example.com
  displayName (string): 鈴木花子
  role (string): user
  createdAt (timestamp): 今日の日時
```

#### ドキュメント3（山田次郎）
```
ドキュメントID: [山田次郎のUID]
フィールド:
  email (string): yamada@example.com
  displayName (string): 山田次郎
  role (string): user
  createdAt (timestamp): 今日の日時
```

---

### 3-2. supportersコレクションを作成

#### サポーター1（佐藤美咲）
```
ドキュメントID: 自動ID
フィールド:
  name (string): 佐藤美咲
  email (string): sato@support.example.com
  phone (string): 090-1234-5678
  specialties (array): ["清掃", "設備点検"]
  isActive (boolean): true
  createdAt (timestamp): 今日の日時
```

#### サポーター2（伊藤健一）
```
ドキュメントID: 自動ID
フィールド:
  name (string): 伊藤健一
  email (string): ito@support.example.com
  phone (string): 090-9876-5432
  specialties (array): ["メンテナンス", "緊急対応"]
  isActive (boolean): true
  createdAt (timestamp): 今日の日時
```

**作成後、各サポーターのドキュメントIDをメモしてください。**

---

### 3-3. bookingsコレクションを作成

#### 予約1（田中太郎 - 本日チェックイン）
```
ドキュメントID: 自動ID
フィールド:
  userId (string): [田中太郎のUID]
  guestName (string): 田中太郎
  guestEmail (string): tanaka@example.com
  guestPhone (string): 080-1111-2222
  guestCount (number): 4
  startDate (timestamp): 今日
  endDate (timestamp): 今日から2日後
  totalPrice (number): 45000
  status (string): confirmed
  paymentStatus (string): paid
  specialRequests (string): 小さな子供がいるので、ベビーベッドを用意していただけると助かります。
  createdAt (timestamp): 今日の日時
```

#### 予約2（鈴木花子 - 来週）
```
ドキュメントID: 自動ID
フィールド:
  userId (string): [鈴木花子のUID]
  guestName (string): 鈴木花子
  guestEmail (string): suzuki@example.com
  guestPhone (string): 080-3333-4444
  guestCount (number): 2
  startDate (timestamp): 7日後
  endDate (timestamp): 10日後
  totalPrice (number): 60000
  status (string): confirmed
  paymentStatus (string): paid
  specialRequests (string):
  createdAt (timestamp): 今日の日時
```

#### 予約3（山田次郎 - 明日チェックアウト）
```
ドキュメントID: 自動ID
フィールド:
  userId (string): [山田次郎のUID]
  guestName (string): 山田次郎
  guestEmail (string): yamada@example.com
  guestPhone (string): 080-5555-6666
  guestCount (number): 3
  startDate (timestamp): 7日前
  endDate (timestamp): 明日
  totalPrice (number): 120000
  status (string): confirmed
  paymentStatus (string): paid
  specialRequests (string): Wi-Fiが必須です。仕事で使用します。
  createdAt (timestamp): 14日前
```

**作成後、各予約のドキュメントIDをメモしてください。**

---

### 3-4. guestMessagesコレクションを作成

#### メッセージ1（田中太郎→管理者）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約1のID]
  senderId (string): [田中太郎のUID]
  senderType (string): guest
  senderName (string): 田中太郎
  message (string): こんにちは。本日チェックインの田中です。到着時間が少し遅れそうなのですが、19時頃でも大丈夫でしょうか？
  isRead (boolean): true
  createdAt (timestamp): 2時間前
```

#### メッセージ2（管理者→田中太郎）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約1のID]
  senderId (string): admin
  senderType (string): admin
  senderName (string): 管理者
  message (string): ご連絡ありがとうございます。19時のチェックインでも問題ございません。鍵はキーボックスにございますので、暗証番号「1234」でお開けください。
  isRead (boolean): true
  createdAt (timestamp): 1.5時間前
```

#### メッセージ3（田中太郎→管理者）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約1のID]
  senderId (string): [田中太郎のUID]
  senderType (string): guest
  senderName (string): 田中太郎
  message (string): ありがとうございます！了解しました。よろしくお願いいたします。
  isRead (boolean): false
  createdAt (timestamp): 1時間前
```

#### メッセージ4（山田次郎→管理者）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約3のID]
  senderId (string): [山田次郎のUID]
  senderType (string): guest
  senderName (string): 山田次郎
  message (string): お世話になっております。エアコンのリモコンが見当たらないのですが、どこにありますでしょうか？
  isRead (boolean): true
  createdAt (timestamp): 12時間前
```

#### メッセージ5（管理者→山田次郎）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約3のID]
  senderId (string): admin
  senderType (string): admin
  senderName (string): 管理者
  message (string): ご不便をおかけして申し訳ございません。リモコンはテレビ台の引き出しの中にございます。ご確認いただけますでしょうか。
  isRead (boolean): true
  createdAt (timestamp): 11.5時間前
```

#### メッセージ6（山田次郎→管理者）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約3のID]
  senderId (string): [山田次郎のUID]
  senderType (string): guest
  senderName (string): 山田次郎
  message (string): 見つかりました！ありがとうございます。快適に過ごさせていただいています。
  isRead (boolean): true
  createdAt (timestamp): 11時間前
```

---

### 3-5. supportTasksコレクションを作成

#### タスク1（チェックイン前清掃 - 完了）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約1のID]
  title (string): チェックイン前清掃
  description (string): 本日チェックイン予定の田中様のお部屋の清掃をお願いします。ベビーベッドの設置もお願いします。
  type (string): cleaning
  status (string): completed
  priority (string): high
  scheduledDate (timestamp): 3時間前
  supporterId (string): [佐藤美咲のID]
  supporterName (string): 佐藤美咲
  createdAt (timestamp): 1日前
  completedAt (timestamp): 2時間前
```

#### タスク2（チェックアウト後清掃 - 保留中）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約3のID]
  title (string): チェックアウト後清掃
  description (string): 明日チェックアウト予定の山田様のお部屋の清掃。次の予約が2日後なので余裕があります。
  type (string): cleaning
  status (string): pending
  priority (string): medium
  scheduledDate (timestamp): 明日の14時
  supporterId (string): [佐藤美咲のID]
  supporterName (string): 佐藤美咲
  createdAt (timestamp): 今日の日時
```

#### タスク3（設備点検 - 進行中）
```
ドキュメントID: 自動ID
フィールド:
  bookingId (string): [予約2のID]
  title (string): 設備点検
  description (string): 来週チェックイン予定のお部屋の設備点検。エアコン、給湯器、Wi-Fiの動作確認をお願いします。
  type (string): maintenance
  status (string): in_progress
  priority (string): medium
  scheduledDate (timestamp): 6日後
  supporterId (string): [伊藤健一のID]
  supporterName (string): 伊藤健一
  createdAt (timestamp): 今日の日時
```

---

### 3-6. couponsコレクションを作成

#### クーポン1（新規ユーザー歓迎）
```
ドキュメントID: 自動ID
フィールド:
  code (string): WELCOME2025
  name (string): 新規ユーザー歓迎クーポン
  description (string): 初めてのご利用で5,000円割引
  discountType (string): fixed
  discountValue (number): 5000
  minPurchaseAmount (number): 30000
  maxUses (number): 100
  usedCount (number): 23
  isActive (boolean): true
  startDate (timestamp): 2025-01-01
  endDate (timestamp): 2025-12-31
  createdAt (timestamp): 今日の日時
```

#### クーポン2（夏季限定）
```
ドキュメントID: 自動ID
フィールド:
  code (string): SUMMER20
  name (string): 夏季限定20%オフ
  description (string): 夏季限定で全予約20%オフ
  discountType (string): percentage
  discountValue (number): 20
  minPurchaseAmount (number): 0
  maxUses (number): 50
  usedCount (number): 15
  isActive (boolean): true
  startDate (timestamp): 2025-06-01
  endDate (timestamp): 2025-08-31
  createdAt (timestamp): 今日の日時
```

#### クーポン3（長期滞在割引）
```
ドキュメントID: 自動ID
フィールド:
  code (string): LONGSTAY
  name (string): 長期滞在割引
  description (string): 7泊以上で10,000円割引
  discountType (string): fixed
  discountValue (number): 10000
  minPurchaseAmount (number): 100000
  maxUses (number): 20
  usedCount (number): 3
  isActive (boolean): true
  startDate (timestamp): 2025-01-01
  endDate (timestamp): 2025-12-31
  createdAt (timestamp): 今日の日時
```

#### クーポン4（期限切れ・テスト用）
```
ドキュメントID: 自動ID
フィールド:
  code (string): EXPIRED2024
  name (string): 期限切れクーポン（テスト用）
  description (string): 期限切れクーポンのサンプル
  discountType (string): percentage
  discountValue (number): 30
  minPurchaseAmount (number): 0
  maxUses (number): 100
  usedCount (number): 100
  isActive (boolean): false
  startDate (timestamp): 2024-01-01
  endDate (timestamp): 2024-12-31
  createdAt (timestamp): 2024-01-01
```

---

## 完了！

すべてのデータを追加したら、管理画面で確認してください：
http://localhost:3000/admin

各タブで以下が確認できます：
- 📊 ダッシュボード：本日のチェックイン/チェックアウト
- 📅 予約管理：3件の予約
- 💬 メッセージ：ゲストとの会話履歴
- 🔧 施設サポート：清掃・メンテナンスタスク
- 🎫 クーポン管理：4件のクーポン
