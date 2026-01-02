#!/bin/bash

# Vercel環境変数設定スクリプト
# 使い方: ./scripts/setup-env.sh

set -e

echo "🔧 Vercel環境変数を設定します..."

# .envファイルが存在するか確認
if [ ! -f .env ]; then
    echo "❌ .envファイルが見つかりません"
    exit 1
fi

# Vercel CLIがインストールされているか確認
if ! command -v vercel &> /dev/null
then
    echo "📦 Vercel CLIをインストールしています..."
    npm install --global vercel@latest
fi

echo "📝 .envファイルから環境変数を読み込んでVercelに設定します..."

# .envファイルを読み込んで各行をVercelに設定
while IFS='=' read -r key value || [ -n "$key" ]; do
    # コメント行と空行をスキップ
    if [[ $key =~ ^#.*$ ]] || [[ -z $key ]]; then
        continue
    fi

    # クォートを削除
    value=$(echo "$value" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

    echo "Setting $key..."
    vercel env add "$key" production <<< "$value" 2>/dev/null || \
    vercel env rm "$key" production -y && vercel env add "$key" production <<< "$value"
done < .env

echo "✅ 環境変数の設定が完了しました！"
echo "📌 次のコマンドで確認できます: vercel env ls"
