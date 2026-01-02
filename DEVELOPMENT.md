# 開発ワークフロー

このプロジェクトはブランチ戦略を使用しています。

## ブランチ構成

- **main** - 本番環境（https://booking.furniturehouse1.com）
- **develop** - 開発環境（プレビューURL）
- **feature/xxx** - 新機能開発用

---

## 🚀 開発の始め方

### 1. 現在のブランチを確認
```bash
git branch
```

### 2. 新機能を開発する場合

```bash
# developブランチから新しい機能ブランチを作成
git checkout develop
git pull
git checkout -b feature/機能名

# 例: 料金プラン追加
git checkout -b feature/pricing-plan
```

### 3. コードを編集

```bash
# ローカルでテスト
npm run dev
# ブラウザで http://localhost:3001 を開いて動作確認
```

### 4. 変更をコミット

```bash
git add .
git commit -m "機能の説明"
git push origin feature/機能名
```

→ Vercelが自動的にプレビュー環境を作成します！

### 5. テストOKなら develop にマージ

```bash
git checkout develop
git merge feature/機能名
git push
```

### 6. 本番リリース（慎重に！）

```bash
# developが十分テストされたら
git checkout main
git merge develop
git push

# → 本番環境に自動デプロイ
```

---

## 📋 よく使うコマンド

```bash
# ブランチ一覧を表示
git branch

# ブランチを切り替え
git checkout ブランチ名

# 新しいブランチを作成して切り替え
git checkout -b feature/新機能名

# 最新の変更を取得
git pull

# 変更をコミット
git add .
git commit -m "変更内容"

# GitHubにpush
git push
```

---

## 🔍 Vercelのプレビュー環境

各ブランチは自動的に以下のようなURLでアクセスできます：

- **main** → https://booking.furniturehouse1.com
- **develop** → https://furniturehouse1-booking-git-develop-xxxxx.vercel.app
- **feature/xxx** → https://furniturehouse1-booking-git-feature-xxx-xxxxx.vercel.app

Vercelのダッシュボードで確認できます：
https://vercel.com/yoichi-kurashimas-projects/furniturehouse1-booking

---

## ⚠️ 注意事項

- **main** ブランチに直接pushしない（本番環境に即反映されます）
- 大きな変更は必ず **feature/** ブランチで開発
- ローカルで必ずテスト（`npm run dev`）してからpush
- **develop** でテストしてから **main** にマージ

---

## 🐛 バグ修正の場合

```bash
# 緊急のバグ修正
git checkout main
git checkout -b hotfix/バグ名
# ... 修正 ...
git add .
git commit -m "バグ修正: 説明"
git push origin hotfix/バグ名

# mainとdevelopの両方にマージ
git checkout main
git merge hotfix/バグ名
git push

git checkout develop
git merge hotfix/バグ名
git push
```

---

## 📚 参考リンク

- GitHub Repository: https://github.com/kura-gif/furniturehouse1-booking
- Vercel Dashboard: https://vercel.com/yoichi-kurashimas-projects/furniturehouse1-booking
- 本番サイト: https://booking.furniturehouse1.com
