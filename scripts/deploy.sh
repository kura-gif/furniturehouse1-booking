#!/bin/bash

# 本番環境へのデプロイスクリプト
# 使い方: ./scripts/deploy.sh

set -e

echo "🚀 本番環境へのデプロイを開始します..."

# Vercel CLIがインストールされているか確認
if ! command -v vercel &> /dev/null
then
    echo "📦 Vercel CLIをインストールしています..."
    npm install --global vercel@latest
fi

# ビルド前のクリーンアップ
echo "🧹 ビルドキャッシュをクリア..."
rm -rf .nuxt .output .vercel

# Vercelプロジェクト情報を取得
echo "📥 Vercelプロジェクト情報を取得..."
vercel pull --yes --environment=production

# ビルド
echo "🔨 プロジェクトをビルド..."
vercel build --prod

# デプロイ
echo "🚢 本番環境にデプロイ..."
vercel deploy --prebuilt --prod

echo "✅ デプロイ完了！"
