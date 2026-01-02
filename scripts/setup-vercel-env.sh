#!/bin/bash

# Vercel環境変数設定スクリプト
# 使用方法: ./scripts/setup-vercel-env.sh

set -e

echo "🚀 Setting up Vercel environment variables..."

# .envファイルから環境変数を読み込む
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  exit 1
fi

source .env

# Vercel CLIがインストールされているか確認
if ! command -v vercel &> /dev/null; then
  echo "❌ Error: Vercel CLI is not installed"
  echo "   Install it with: npm install -g vercel"
  exit 1
fi

echo "📝 Setting environment variables for Production and Preview..."

# Firebase公開設定（クライアント・サーバー両方で使用）
vercel env add FIREBASE_API_KEY production preview <<< "$FIREBASE_API_KEY"
vercel env add FIREBASE_AUTH_DOMAIN production preview <<< "$FIREBASE_AUTH_DOMAIN"
vercel env add FIREBASE_PROJECT_ID production preview <<< "$FIREBASE_PROJECT_ID"
vercel env add FIREBASE_STORAGE_BUCKET production preview <<< "$FIREBASE_STORAGE_BUCKET"
vercel env add FIREBASE_MESSAGING_SENDER_ID production preview <<< "$FIREBASE_MESSAGING_SENDER_ID"
vercel env add FIREBASE_APP_ID production preview <<< "$FIREBASE_APP_ID"

# Firebase Admin SDK設定（サーバーサイドのみ）
vercel env add FIREBASE_ADMIN_KEY production preview <<< "$FIREBASE_ADMIN_KEY"

# Stripe設定
vercel env add STRIPE_PUBLIC_KEY production preview <<< "$STRIPE_PUBLIC_KEY"
vercel env add STRIPE_SECRET_KEY production preview <<< "$STRIPE_SECRET_KEY"
vercel env add STRIPE_WEBHOOK_SECRET production preview <<< "$STRIPE_WEBHOOK_SECRET"

# メール送信設定
vercel env add EMAIL_USER production preview <<< "$EMAIL_USER"
vercel env add EMAIL_PASSWORD production preview <<< "$EMAIL_PASSWORD"
vercel env add EMAIL_REPLY_TO production preview <<< "$EMAIL_REPLY_TO"

# 内部API認証
vercel env add INTERNAL_API_SECRET production preview <<< "$INTERNAL_API_SECRET"

# サイト設定
vercel env add SITE_URL production preview <<< "https://booking.furniturehouse1.com"
vercel env add BRAND_SITE_URL production preview <<< "$BRAND_SITE_URL"

echo "✅ All environment variables have been set!"
echo ""
echo "📌 Next steps:"
echo "   1. Run 'vercel env pull' to verify"
echo "   2. Trigger a new deployment to apply changes"
