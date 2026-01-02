#!/bin/bash

# ===================================
# 本番環境デプロイ確認スクリプト
# ===================================
# Phase 2 完了後に実行して、デプロイが正常に完了しているか確認
# 使い方: ./scripts/verify-deployment.sh https://your-domain.vercel.app
# ===================================

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 引数チェック
if [ -z "$1" ]; then
  echo -e "${RED}❌ エラー: デプロイURLを指定してください${NC}"
  echo "使い方: $0 https://your-domain.vercel.app"
  exit 1
fi

DEPLOY_URL=$1
echo -e "${BLUE}🔍 デプロイ確認開始: ${DEPLOY_URL}${NC}"
echo ""

# テスト結果カウンター
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# テスト実行関数
run_test() {
  local test_name=$1
  local test_command=$2
  local expected_pattern=$3

  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "${YELLOW}テスト ${TOTAL_TESTS}: ${test_name}${NC}"

  # テスト実行
  response=$(eval "$test_command" 2>&1)
  exit_code=$?

  # 結果判定
  if [ $exit_code -eq 0 ]; then
    if echo "$response" | grep -q "$expected_pattern"; then
      echo -e "${GREEN}✅ PASS${NC}"
      PASSED_TESTS=$((PASSED_TESTS + 1))
    else
      echo -e "${RED}❌ FAIL: 期待されるパターンが見つかりません${NC}"
      echo -e "${RED}Expected: ${expected_pattern}${NC}"
      echo -e "${RED}Got: ${response}${NC}"
      FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
  else
    echo -e "${RED}❌ FAIL: コマンド実行エラー${NC}"
    echo -e "${RED}${response}${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  echo ""
}

# ===================================
# テスト1: Health Check API
# ===================================
run_test \
  "Health Check API" \
  "curl -s ${DEPLOY_URL}/api/test/health" \
  '"status":"ok"'

# ===================================
# テスト2: Firebase接続確認
# ===================================
run_test \
  "Firebase Admin SDK 初期化確認" \
  "curl -s ${DEPLOY_URL}/api/test/health" \
  '"projectId":"furniture-house-1"'

# ===================================
# テスト3: セキュリティヘッダー - X-Content-Type-Options
# ===================================
run_test \
  "セキュリティヘッダー: X-Content-Type-Options" \
  "curl -sI ${DEPLOY_URL}/" \
  "x-content-type-options: nosniff"

# ===================================
# テスト4: セキュリティヘッダー - X-Frame-Options
# ===================================
run_test \
  "セキュリティヘッダー: X-Frame-Options" \
  "curl -sI ${DEPLOY_URL}/" \
  "x-frame-options: DENY"

# ===================================
# テスト5: セキュリティヘッダー - HSTS
# ===================================
run_test \
  "セキュリティヘッダー: Strict-Transport-Security" \
  "curl -sI ${DEPLOY_URL}/" \
  "strict-transport-security"

# ===================================
# テスト6: HTTPS リダイレクト
# ===================================
if [[ $DEPLOY_URL == https://* ]]; then
  HTTP_URL="${DEPLOY_URL/https:/http:}"
  run_test \
    "HTTP → HTTPS リダイレクト" \
    "curl -sI ${HTTP_URL}/ | head -n 1" \
    "301\|308"
else
  echo -e "${YELLOW}⚠️  スキップ: HTTP URL のため HTTPS リダイレクトテストを実施できません${NC}"
  echo ""
fi

# ===================================
# テスト7: トップページ表示
# ===================================
run_test \
  "トップページ HTML 取得" \
  "curl -s ${DEPLOY_URL}/" \
  "家具の家"

# ===================================
# テスト8: 価格計算API（モック）
# ===================================
run_test \
  "価格計算API（テスト用）" \
  "curl -s -X POST ${DEPLOY_URL}/api/test/calculate-price -H 'Content-Type: application/json' -d '{\"checkInDate\":\"2025-02-15\",\"checkOutDate\":\"2025-02-17\",\"guestCount\":2}'" \
  '"totalAmount":44000'

# ===================================
# テスト9: Stripe Payment Intent作成（モック）
# ===================================
run_test \
  "Stripe Payment Intent作成（テスト用）" \
  "curl -s -X POST ${DEPLOY_URL}/api/test/create-payment-intent-mock -H 'Content-Type: application/json' -d '{\"amount\":44000}'" \
  '"clientSecret"'

# ===================================
# テスト10: レート制限確認
# ===================================
echo -e "${YELLOW}テスト 10: レート制限（連続リクエスト）${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

RATE_LIMIT_TRIGGERED=false
for i in {1..35}; do
  response=$(curl -s -w "\n%{http_code}" ${DEPLOY_URL}/api/test/health)
  http_code=$(echo "$response" | tail -n 1)

  if [ "$http_code" == "429" ]; then
    echo -e "${GREEN}✅ PASS: レート制限が動作しています (${i}回目のリクエストで制限)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    RATE_LIMIT_TRIGGERED=true
    break
  fi

  # 短い待機（レート制限ウィンドウ内で連続リクエスト）
  sleep 0.1
done

if [ "$RATE_LIMIT_TRIGGERED" = false ]; then
  echo -e "${RED}❌ FAIL: 35回リクエストしてもレート制限が発動しませんでした${NC}"
  FAILED_TESTS=$((FAILED_TESTS + 1))
fi
echo ""

# ===================================
# 結果サマリー
# ===================================
echo "====================================="
echo -e "${BLUE}📊 テスト結果サマリー${NC}"
echo "====================================="
echo -e "合計テスト数: ${TOTAL_TESTS}"
echo -e "${GREEN}成功: ${PASSED_TESTS}${NC}"
echo -e "${RED}失敗: ${FAILED_TESTS}${NC}"
echo "====================================="

# 終了コード
if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}🎉 すべてのテストが成功しました！${NC}"
  echo ""
  echo "次のステップ:"
  echo "1. Phase 3 E2Eテストに進む (PHASE3_E2E_TEST_GUIDE.md)"
  echo "2. 実際の予約フローをテスト"
  echo "3. Stripe本番決済テスト（少額）"
  exit 0
else
  echo -e "${RED}❌ 一部のテストが失敗しました${NC}"
  echo ""
  echo "トラブルシューティング:"
  echo "1. Vercel Dashboard でデプロイログを確認"
  echo "2. 環境変数が正しく設定されているか確認"
  echo "3. Firebase Admin SDK の初期化エラーを確認"
  echo "4. PHASE2_VERCEL_DEPLOYMENT.md のトラブルシューティングセクションを参照"
  exit 1
fi
