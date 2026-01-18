# メール設定ガイド - グループメール対応

## 概要

`furniturehouse1@chladni.co.jp` がGoogle グループ（グループメール）の場合の設定方法を説明します。

---

## グループメールの制限事項

### ❌ できないこと

- **グループメールアドレスでGmail認証**: アプリパスワードを生成できません
- **グループメールから直接送信**: SMTP認証に個人アカウントが必要

### ✅ できること

- **グループメールで受信**: メンバー全員にメールが転送されます
- **Reply-Toでグループメール指定**: ゲストの返信をグループ全員が受け取れます

---

## 推奨設定

### 送信の仕組み

```
実際の送信元（認証用）: kura@chladni.co.jp（個人アカウント）
  ↓
表示される差出人: 家具の家 No.1 <kura@chladni.co.jp>
  ↓
返信先: furniturehouse1@chladni.co.jp（グループメール）
```

### ゲストから見た表示

メールクライアントでの表示:
```
差出人: 家具の家 No.1 <kura@chladni.co.jp>
返信先: furniturehouse1@chladni.co.jp
```

**ゲストが返信すると**:
- → `furniturehouse1@chladni.co.jp` に送信されます
- → グループメンバー全員が受信します

---

## 設定手順

### 1. 個人アカウントでGmailアプリパスワードを生成

1. **個人アカウント**（`kura@chladni.co.jp`）でGoogleアカウント設定を開く
   - https://myaccount.google.com/apppasswords
   
2. **2段階認証が有効**になっていることを確認
   - 有効でない場合は先に有効化

3. **アプリパスワードを生成**
   - アプリ: メール
   - デバイス: その他（カスタム名）
   - 名前: 「家具の家予約システム」など

4. **16桁のパスワード**をコピー
   - 例: `abcd efgh ijkl mnop`
   - スペースは削除して保存: `abcdefghijklmnop`

### 2. 環境変数の設定

#### 開発環境（.env）

```bash
# 送信元（個人アカウント、認証用）
EMAIL_USER=kura@chladni.co.jp
EMAIL_PASSWORD=abcdefghijklmnop

# 返信先（グループメール）
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp
```

#### 本番環境（Vercel Dashboard）

Vercel Dashboard → Settings → Environment Variables

```
EMAIL_USER=kura@chladni.co.jp
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp
```

**環境**: Production

---

## テスト方法

### 1. 開発環境でのテスト

```bash
# 開発サーバー起動
npm run dev

# テスト予約を作成
# メールが送信されることを確認
```

### 2. メールの確認ポイント

受信したメール（ゲスト視点）を確認:

✅ **差出人**: 
- 表示名が「家具の家 No.1」になっている
- メールアドレスが `kura@chladni.co.jp`

✅ **返信テスト**:
- メールに返信する
- `furniturehouse1@chladni.co.jp` のメンバー全員が受信できる

✅ **メールフッター**:
```
このメールに関するお問い合わせは、このメールに返信してください。
お問い合わせ先: furniturehouse1@chladni.co.jp
```

---

## トラブルシューティング

### 問題: メール送信に失敗する

**エラー**: `Invalid login: 535-5.7.8 Username and Password not accepted`

**原因**:
- アプリパスワードが間違っている
- 2段階認証が有効でない
- グループメールアドレスで認証しようとしている

**解決方法**:
1. `EMAIL_USER` が**個人アカウント**になっているか確認
2. アプリパスワードを再生成
3. 2段階認証を有効化

### 問題: 返信が個人アカウントに届く

**原因**: `EMAIL_REPLY_TO` が設定されていない

**解決方法**:
```bash
# 環境変数を追加
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp

# Vercelの場合は再デプロイ
vercel --prod
```

### 問題: グループメンバーが受信できない

**原因**: Google グループの設定が正しくない

**解決方法**:
1. Google グループの管理画面を開く
   - https://groups.google.com/
2. `furniturehouse1@chladni.co.jp` の設定を確認
3. メンバーが正しく追加されているか確認
4. 外部からのメール受信が許可されているか確認

---

## 代替案: Gmail「別のアドレスからメールを送信」

より完璧な設定を求める場合、Gmailの「別のアドレスからメールを送信」機能を使用できます。

### メリット

- ✅ 差出人が完全に `furniturehouse1@chladni.co.jp` になる
- ✅ 返信も自動的にグループメールに届く

### デメリット

- ⚠️ 設定が少し複雑
- ⚠️ Gmail側で「代理送信」の確認が必要

### 設定手順

1. **個人Gmail**（`kura@chladni.co.jp`）にログイン

2. **設定** → **アカウントとインポート** → **他のメールアドレスを追加**

3. **情報を入力**:
   - 名前: 家具の家 No.1
   - メールアドレス: furniturehouse1@chladni.co.jp
   - エイリアスとして扱う: チェック

4. **確認メール**がグループに送信される
   - グループメンバーが確認コードを確認
   - 確認コードを入力

5. **デフォルトに設定**（オプション）

この設定後、`EMAIL_USER` を `furniturehouse1@chladni.co.jp` に変更できます。

---

## まとめ

### 推奨設定（シンプル）

```bash
EMAIL_USER=kura@chladni.co.jp          # 個人アカウントで認証
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp  # 返信先はグループ
```

**メリット**:
- ✅ 設定が簡単
- ✅ すぐに使える
- ✅ グループ全員が問い合わせを受け取れる

**表示**:
- 差出人: 家具の家 No.1 <kura@chladni.co.jp>
- 返信先: furniturehouse1@chladni.co.jp

---

**最終更新**: 2025-12-31
