# メール送信トラブルシューティング

**送信先:** krakra1020@gmail.com
**送信結果:** ✅ 成功（messageId取得済み）
**問題:** メールが届かない

---

## 🔍 確認すべき項目

### 1. Gmailの各フォルダを確認

メールは送信されていますが、以下のフォルダに振り分けられている可能性があります：

#### チェック順序
1. **受信トレイ** - メイン
2. **プロモーション** タブ（Gmailの場合）
3. **ソーシャル** タブ
4. **迷惑メール** フォルダ ⚠️ 最も可能性が高い
5. **すべてのメール** で検索

#### 検索方法
```
Gmailの検索ボックスで:
from:kura@chladni.co.jp
または
subject:家具の家
```

---

## 🚨 迷惑メール判定の可能性（最も高い）

### 原因
Gmail SMTPを使用していますが、送信元アドレス（`kura@chladni.co.jp`）とGmailアカウントのドメインが異なるため、SPF/DKIM認証に失敗している可能性があります。

### 解決策

#### 方法1: 送信元アドレスを変更（即座に実施可能）

`.env`ファイルを編集して、送信元をGmailアドレスに変更:

```bash
# 現在の設定
EMAIL_USER=kura@chladni.co.jp

# これを以下に変更（送信に使用しているGmailアドレス）
# 例: あなたのGmailアドレス
EMAIL_USER=your-gmail-address@gmail.com
```

#### 方法2: SendGridを使用（推奨）

**無料プラン:** 月100通まで無料、SPF/DKIM認証済み

1. SendGridアカウント作成
   https://signup.sendgrid.com/

2. APIキー取得

3. `.env`更新:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
EMAIL_FROM=noreply@furniturehouse1.com
```

4. コード更新（後述）

---

## 🔧 即座にできる対処法

### オプションA: 送信元をGmailアドレスに変更

現在のメール送信設定を確認:

**現在:**
- EMAIL_USER: kura@chladni.co.jp
- EMAIL_PASSWORD: seaezychzxzzcmsa (アプリパスワード)

**問題:**
- Gmail SMTPは、基本的に認証したアカウントのアドレス（@gmail.com）からの送信を想定
- 異なるドメイン（@chladni.co.jp）から送信すると迷惑メール判定される可能性

**解決:**

1. `.env`ファイルを編集
```bash
# このアプリパスワードはどのGmailアカウントのものですか？
# そのGmailアドレスを使用してください

# 例: もし password が your-account@gmail.com のものなら
EMAIL_USER=your-account@gmail.com
```

2. サーバーを再起動

3. 再度テスト送信

---

### オプションB: Gmail設定を確認

もし `kura@chladni.co.jp` が Gmail Workspace（Google Workspace）のアドレスの場合:

1. Gmail Workspaceの管理画面で確認
2. SMTPリレー設定を有効化
3. 送信制限を確認

---

## 📧 テスト送信スクリプト

以下のコマンドで再度テスト送信:

```bash
curl -X POST http://localhost:3000/api/emails/send-booking-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "to": "krakra1020@gmail.com",
    "bookingId": "test-002",
    "bookingReference": "FH1-TEST-0002",
    "bookingToken": "test-token-xyz789",
    "guestName": "倉島洋一",
    "checkInDate": "2025-02-15",
    "checkOutDate": "2025-02-17",
    "totalAmount": 44000
  }'
```

---

## 🎯 推奨される解決策（優先順位順）

### 1. すぐに試す（5分）

**迷惑メールフォルダを確認**
- Gmail → 迷惑メール
- 検索: `from:kura@chladni.co.jp` または `subject:家具の家`

### 2. 送信元を変更（10分）

**EMAIL_USERを実際のGmailアドレスに変更**

`.env`ファイル:
```bash
# アプリパスワード seaezychzxzzcmsa はどのアカウントのもの？
# そのアドレスを使用
EMAIL_USER=[アプリパスワードのGmailアドレス]
EMAIL_PASSWORD=seaezychzxzzcmsa
```

サーバー再起動:
```bash
# Ctrl+C でサーバー停止
npm run dev
```

### 3. SendGridに移行（30分）

**本番環境では推奨**

利点:
- ✅ 高い到達率
- ✅ SPF/DKIM自動設定
- ✅ 送信ログ確認可能
- ✅ 月100通無料

---

## 🔍 ログ確認

サーバーログでエラーがないか確認:

```bash
# サーバーコンソールを確認
# メール送信時に以下のようなエラーが出ていないか？

❌ エラー例:
- "Invalid login"
- "Authentication failed"
- "Sender address rejected"
- "Relay access denied"
```

---

## ✅ 次のステップ

1. **すぐに確認:**
   - [ ] Gmailの迷惑メールフォルダ
   - [ ] 全てのメール で検索

2. **EMAIL_USERを確認:**
   - [ ] アプリパスワード `seaezychzxzzcmsa` はどのGmailアカウントのもの？
   - [ ] そのアドレスに変更

3. **再テスト:**
   - [ ] サーバー再起動
   - [ ] テストメール送信

4. **本番環境対策:**
   - [ ] SendGrid導入を検討

---

## 📞 すぐに確認してほしいこと

**質問1:** アプリパスワード `seaezychzxzzcmsa` はどのGmailアドレスで生成したものですか？
- それを `EMAIL_USER` に設定する必要があります

**質問2:** `kura@chladni.co.jp` は:
- [ ] Gmail Workspaceのアドレス
- [ ] 独自ドメインのメール（Gmail以外）
- [ ] エイリアス

**質問3:** 迷惑メールフォルダは確認しましたか？

---

これらの情報を教えていただければ、具体的な解決策を提示できます。
