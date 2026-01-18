# Vercel 本番環境セットアップガイド

## 問題: ログインボタンが表示されない、管理画面にアクセスできない

この問題は、Vercel本番環境にFirebase環境変数が設定されていないことが原因です。

## 解決方法

### オプション1: Vercel CLIを使用（推奨）

1. Vercel CLIをインストール:
```bash
npm install -g vercel
```

2. Vercelにログイン:
```bash
vercel login
```

3. プロジェクトとリンク:
```bash
vercel link
```

4. 環境変数を自動設定:
```bash
./scripts/setup-vercel-env.sh
```

5. 新しいデプロイをトリガー:
```bash
git commit --allow-empty -m "Trigger deployment with env vars"
git push origin main
```

### オプション2: Vercelダッシュボードから手動設定

1. https://vercel.com にアクセス
2. プロジェクト "furniturehouse1" を選択
3. "Settings" → "Environment Variables" に移動
4. .envファイルの内容を参考に、全ての環境変数を **Production** と **Preview** の両方に追加

## 確認方法

環境変数が正しく設定されているか確認:
- ブラウザのコンソールで `[Firebase] Config check` ログを確認
- `[Firebase] 正常に初期化されました` が表示されることを確認

## トラブルシューティング

### ログインボタンが表示されない
- ブラウザコンソールで `[Firebase] Not initialized` エラーを確認
- Vercelの環境変数設定を確認
- 再デプロイを実行

### 管理画面にアクセスできない
- ブラウザコンソールで `[Auth]` ログを確認
- Firestoreに管理者ユーザーが存在するか確認
- ユーザーの `role` フィールドが `"admin"` になっているか確認
