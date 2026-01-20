# メール設定ガイド

## 概要

`furniturehouse1@chladni.co.jp` をメール送信元として設定する方法を説明します。

---

## 設定手順

### 1. Gmailアプリパスワードを生成

1. **furniturehouse1@chladni.co.jp** でGoogleアカウント設定を開く
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
# SMTP認証用アカウント
EMAIL_USER=furniturehouse1@chladni.co.jp
EMAIL_PASSWORD=abcdefghijklmnop

# 差出人として表示されるアドレス
EMAIL_FROM=furniturehouse1@chladni.co.jp

# 返信先
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp
```

#### 本番環境（Vercel Dashboard）

Vercel Dashboard → Settings → Environment Variables

```
EMAIL_USER=furniturehouse1@chladni.co.jp
EMAIL_PASSWORD=abcdefghijklmnop
EMAIL_FROM=furniturehouse1@chladni.co.jp
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp
```

**環境**: Production

---

## ゲストから見た表示

メールクライアントでの表示:
```
差出人: 家具の家 No.1 <furniturehouse1@chladni.co.jp>
返信先: furniturehouse1@chladni.co.jp
```

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

- **差出人**:
  - 表示名が「家具の家 No.1」になっている
  - メールアドレスが `furniturehouse1@chladni.co.jp`

- **返信テスト**:
  - メールに返信する
  - `furniturehouse1@chladni.co.jp` で受信できる

- **メールフッター**:
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

**解決方法**:
1. アプリパスワードを再生成
2. 2段階認証を有効化
3. 環境変数が正しく設定されているか確認

### 問題: 差出人が正しくない

**原因**: `EMAIL_FROM` が設定されていない

**解決方法**:
```bash
# 環境変数を追加
EMAIL_FROM=furniturehouse1@chladni.co.jp

# Vercelの場合は再デプロイ
vercel --prod
```

---

## まとめ

### 推奨設定

```bash
EMAIL_USER=furniturehouse1@chladni.co.jp    # SMTP認証用
EMAIL_FROM=furniturehouse1@chladni.co.jp    # 差出人
EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp # 返信先
```

**表示**:
- 差出人: 家具の家 No.1 <furniturehouse1@chladni.co.jp>
- 返信先: furniturehouse1@chladni.co.jp

---

**最終更新**: 2026年1月20日
