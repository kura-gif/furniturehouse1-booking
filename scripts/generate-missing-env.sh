#!/bin/bash

echo "🔧 不足している環境変数を生成します"
echo ""

# INTERNAL_API_SECRET を生成
echo "1. INTERNAL_API_SECRET を生成中..."
INTERNAL_SECRET=$(openssl rand -base64 32)
echo "INTERNAL_API_SECRET=$INTERNAL_SECRET"
echo ""

# EMAIL設定
echo "2. EMAIL設定"
echo "EMAIL_FROM=furniturehouse1@chladni.co.jp"
echo "EMAIL_REPLY_TO=furniturehouse1@chladni.co.jp"
echo ""

echo "✅ 生成完了！"
echo ""
echo "次の手順:"
echo "1. 上記の値を .env ファイルに追加してください"
echo "2. Firebase Admin SDK の設定が必要です（次のステップで案内します）"
echo "3. STRIPE_WEBHOOK_SECRET は Stripe ダッシュボードから取得してください"
