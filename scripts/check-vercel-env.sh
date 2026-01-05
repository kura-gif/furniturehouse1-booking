#!/bin/bash

# Vercel環境変数チェックスクリプト
# 本番環境に必要な環境変数が設定されているか確認

echo "=========================================="
echo " Vercel 環境変数チェック"
echo "=========================================="
echo ""

# 必須環境変数リスト
REQUIRED_VARS=(
  "FIREBASE_API_KEY"
  "FIREBASE_AUTH_DOMAIN"
  "FIREBASE_PROJECT_ID"
  "FIREBASE_STORAGE_BUCKET"
  "FIREBASE_MESSAGING_SENDER_ID"
  "FIREBASE_APP_ID"
  "FIREBASE_ADMIN_KEY"
  "STRIPE_PUBLIC_KEY"
  "STRIPE_SECRET_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "EMAIL_USER"
  "EMAIL_PASSWORD"
  "EMAIL_REPLY_TO"
  "INTERNAL_API_SECRET"
  "SITE_URL"
)

# Vercelにログインしているか確認
if ! vercel whoami > /dev/null 2>&1; then
  echo "❌ Vercelにログインしていません"
  echo "   実行: vercel login"
  exit 1
fi

echo "✅ Vercelログイン確認済み"
echo ""

# プロジェクトにリンクされているか確認
if [ ! -f ".vercel/project.json" ]; then
  echo "❌ Vercelプロジェクトにリンクされていません"
  echo "   実行: vercel link"
  exit 1
fi

echo "✅ プロジェクトリンク確認済み"
echo ""

# 環境変数を取得
echo "環境変数を確認中..."
echo ""

VERCEL_ENV=$(vercel env ls 2>/dev/null)

MISSING=()
CONFIGURED=()

for VAR in "${REQUIRED_VARS[@]}"; do
  if echo "$VERCEL_ENV" | grep -q "$VAR"; then
    CONFIGURED+=("$VAR")
  else
    MISSING+=("$VAR")
  fi
done

# 結果表示
echo "=========================================="
echo " 結果"
echo "=========================================="
echo ""

if [ ${#CONFIGURED[@]} -gt 0 ]; then
  echo "✅ 設定済み (${#CONFIGURED[@]}/${#REQUIRED_VARS[@]}):"
  for VAR in "${CONFIGURED[@]}"; do
    echo "   - $VAR"
  done
  echo ""
fi

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "❌ 未設定 (${#MISSING[@]}/${#REQUIRED_VARS[@]}):"
  for VAR in "${MISSING[@]}"; do
    echo "   - $VAR"
  done
  echo ""
  echo "=========================================="
  echo " 未設定の環境変数を追加してください"
  echo "=========================================="
  echo ""
  echo "方法1: Vercel Dashboard"
  echo "  https://vercel.com → プロジェクト → Settings → Environment Variables"
  echo ""
  echo "方法2: Vercel CLI"
  for VAR in "${MISSING[@]}"; do
    echo "  vercel env add $VAR"
  done
  echo ""
  exit 1
else
  echo "=========================================="
  echo " ✅ 全ての環境変数が設定されています！"
  echo "=========================================="
  echo ""

  # 本番キーの確認
  echo "【重要】以下を確認してください："
  echo ""
  echo "1. STRIPE_PUBLIC_KEY が pk_live_ で始まること"
  echo "   （テスト環境: pk_test_）"
  echo ""
  echo "2. STRIPE_SECRET_KEY が sk_live_ で始まること"
  echo "   （テスト環境: sk_test_）"
  echo ""
  echo "3. STRIPE_WEBHOOK_SECRET が本番用であること"
  echo "   Stripe Dashboard → Webhooks → 本番エンドポイント → 署名シークレット"
  echo ""
fi
