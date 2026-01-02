#!/bin/bash

echo "🚀 本番環境緊急デプロイスクリプト"
echo "================================"
echo ""

# 1. Firestore Indexesのデプロイ
echo "📝 Step 1: Firestore Indexesをデプロイ中..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore Indexes デプロイ成功"
else
    echo "❌ Firestore Indexes デプロイ失敗"
    exit 1
fi

echo ""

# 2. Gitコミット
echo "📝 Step 2: コードをコミット中..."
git add .
git commit -m "fix: 本番環境緊急修正 - フィールド名統一、Indexes修正、環境変数対応

- stripePaymentIntentIdフィールド名を統一
- 古いstartDateインデックスを削除
- 内部API認証をinternalApiSecretに変更
- Webhook型定義を修正
"

if [ $? -eq 0 ]; then
    echo "✅ Git コミット成功"
else
    echo "⚠️ コミット済みまたはエラー（続行します）"
fi

echo ""

# 3. Gitプッシュ
echo "📝 Step 3: コードをプッシュ中..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Git プッシュ成功"
    echo "✅ Vercelが自動デプロイを開始します"
else
    echo "❌ Git プッシュ失敗"
    exit 1
fi

echo ""
echo "================================"
echo "🎉 デプロイ完了！"
echo ""
echo "⚠️ 次のステップ（手動で実行してください）:"
echo ""
echo "1. Vercel環境変数を設定:"
echo "   https://vercel.com/kurashimayouichis-projects/furniturehouse1/settings/environment-variables"
echo ""
echo "   以下を追加:"
echo "   STRIPE_WEBHOOK_SECRET=<Stripe Dashboardから取得>"
echo "   INTERNAL_API_SECRET=<STRIPE_WEBHOOK_SECRETと同じ値>"
echo ""
echo "2. Vercelで再デプロイ:"
echo "   vercel --prod"
echo ""
echo "詳細な手順は PRODUCTION_URGENT_FIXES.md を参照してください"
