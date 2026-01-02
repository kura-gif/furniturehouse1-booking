# 組織ポリシー解除依頼 - 詳細資料

## 概要

プロジェクト `furniture-house-1` でFirebase Admin SDKを使用するため、組織ポリシー `iam.disableServiceAccountKeyCreation` の例外設定が必要です。

## 現在の状況

### エラー詳細
- **制約ID**: `iam.disableServiceAccountKeyCreation`
- **エラーメッセージ**: 「サービス アカウント キーの作成が無効になっています」
- **追跡番号**: c5856708447980302
- **影響範囲**: Firebase Admin SDK の初期化が不可能

### 対象リソース
- **プロジェクト**: furniture-house-1
- **サービスアカウント**: firebase-adminsdk-fbsvc@furniture-house-1.iam.gserviceaccount.com
- **プロジェクトID**: furniture-house-1

## 必要な対応

### 推奨方法: プロジェクト単位の例外設定

1. **組織ポリシーページにアクセス**
   ```
   https://console.cloud.google.com/iam-admin/orgpolicies/iam-disableServiceAccountKeyCreation
   ```

2. **ポリシーをカスタマイズ**
   - 「MANAGE POLICY」をクリック
   - 「Customize」を選択

3. **プロジェクト例外を追加**
   - 「Add rule」をクリック
   - **Policy enforcement**: `Not enforced`
   - **Condition**:
     ```
     resource.matchProjects("projects/furniture-house-1")
     ```

4. **保存**
   - 「SET POLICY」をクリック

### 代替方法: 一時的な無効化

1. 組織全体のポリシーを一時的に「Not enforced」に設定
2. サービスアカウントキーを作成
3. 作成後、ポリシーを再度「Enforced」に戻す

## 使用用途

### Firebase Admin SDK の必要性

以下のサーバーサイド機能で使用します:

1. **予約システム** (`server/api/bookings/create-secure.post.ts`)
   - サーバーサイドでの予約データ作成・更新
   - クライアント側からの直接操作を防ぐセキュリティ対策

2. **Stripe Webhook処理** (`server/api/stripe/webhook.post.ts`)
   - 決済完了時の予約ステータス自動更新
   - 決済失敗時のデータクリーンアップ

3. **管理者機能** (`server/api/admin/*`)
   - 管理者招待システム
   - メールテンプレート管理
   - メールスケジュール管理
   - ユーザー管理

### セキュリティ対策

1. **鍵の保存方法**
   - Base64エンコードしてVercel環境変数に保存
   - `.gitignore` でGit管理から除外
   - ローカル開発環境の `.env` ファイルも除外

2. **アクセス制限**
   - サービスアカウントは必要最小限の権限のみ付与
   - 本番環境でのみ使用（開発環境では不要）

3. **監査ログ**
   - Google Cloud の監査ログで使用状況を追跡可能

## 技術的背景

### なぜFirebase Admin SDKが必要か

Firebase Client SDKのみでは以下が実現できません:

1. **サーバーサイドでの認証なしアクセス**
   - Webhookはユーザー認証情報を持たない
   - Admin SDKは管理者権限でアクセス可能

2. **トランザクション保証**
   - 決済とデータベース更新の整合性確保

3. **セキュリティルールのバイパス**
   - 管理者操作はクライアント側のセキュリティルール制約を受けない

### 代替手段の検討

以下の代替手段を検討しましたが、いずれも適切ではありません:

1. **Workload Identity Federation**
   - 設定が非常に複雑
   - Vercel環境での実装例が少ない
   - 開発・保守コストが高い

2. **Firebase Authenticationのみ使用**
   - Webhookでの認証が不可能
   - サーバーサイド処理が実装できない

3. **Firebaseルールの緩和**
   - セキュリティリスクが高い
   - クライアント側からの不正操作を防げない

## 影響範囲

### ポリシー解除の影響

- **このプロジェクトのみ**: 他のプロジェクトには影響なし
- **期間**: 永続的（ただしキー自体は定期的にローテーション推奨）
- **セキュリティ**: 適切な鍵管理により最小限に抑制

### ポリシー未解除の場合の影響

以下の機能が使用不可能:
- ❌ 予約システム（完全に動作不可）
- ❌ Stripe決済連携（Webhook処理不可）
- ❌ 管理者機能全般

## 参考資料

- [Firebase Admin SDK - 公式ドキュメント](https://firebase.google.com/docs/admin/setup)
- [組織のポリシー制約 - Google Cloud](https://cloud.google.com/resource-manager/docs/organization-policy/org-policy-constraints)
- [サービスアカウントキーの代替手段](https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys)

## お願い

本番環境のデプロイに必須のため、早急にご対応いただけますと幸いです。

何かご不明点がございましたら、お気軽にお問い合わせください。

---

**作成日**: 2026-01-02
**プロジェクト**: furniture-house-1
**連絡先**: kura@chladni.co.jp
