# Firebase Storage セットアップ手順

写真ギャラリー機能を使用するには、Firebase Storageを有効化する必要があります。

## 手順

### 1. Firebase Consoleでストレージを有効化

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `furniture-house-1` を選択
3. 左メニューから「ビルド」→「Storage」を選択
4. 「始める」ボタンをクリック
5. セキュリティルールの設定：
   - 「本番環境モードで開始」を選択
   - 「次へ」をクリック
6. ロケーションの選択：
   - `asia-northeast1 (Tokyo)` を選択（推奨）
   - 「完了」をクリック

### 2. セキュリティルールの設定

Firebase Consoleの「Storage」→「ルール」タブで、以下のルールを設定します：

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // 写真フォルダへのアクセスルール
    match /photos/{photoId} {
      // 読み取りは誰でもOK（公開写真）
      allow read: if true;

      // 書き込み・削除は認証済みユーザーのみ
      allow write, delete: if request.auth != null;
    }

    // その他のファイルへのアクセス
    match /{allPaths=**} {
      // デフォルトは認証済みユーザーのみアクセス可能
      allow read, write: if request.auth != null;
    }
  }
}
```

または、プロジェクトルートにある `storage.rules` ファイルを使用して、Firebase CLIでデプロイすることもできます：

```bash
firebase deploy --only storage
```

### 3. 環境変数の確認

`.env` ファイルに `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET` が設定されていることを確認してください：

```env
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=furniture-house-1.appspot.com
```

### 4. アプリケーションの再起動

設定を反映させるため、開発サーバーを再起動してください：

```bash
# 開発サーバーを停止（Ctrl+C）
# 再起動
npm run dev
```

## トラブルシューティング

### エラー: "Storage is not initialized"

**原因**: Firebase Storageが初期化されていません。

**解決策**:
1. Firebase Consoleでストレージが有効化されているか確認
2. `.env` ファイルに `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET` が設定されているか確認
3. アプリケーションを再起動

### エラー: "FirebaseError: Permission denied"

**原因**: Storageのセキュリティルールが正しく設定されていません。

**解決策**:
1. Firebase Consoleの「Storage」→「ルール」タブを確認
2. 上記のセキュリティルールが正しく設定されているか確認
3. ルールを公開（Publish）しているか確認

### 写真のアップロードに失敗する

**原因**: 認証されていないか、ファイルサイズが大きすぎる可能性があります。

**解決策**:
1. 管理者としてログインしているか確認
2. アップロードする画像ファイルのサイズを確認（推奨: 5MB以下）
3. 画像形式がJPG/PNGであることを確認

## 使用方法

### 写真のアップロード

1. `/admin` にアクセス
2. 「写真ギャラリー」タブを選択
3. 「+ 写真を追加」ボタンをクリック
4. 写真ファイルを選択
5. タイトル、カテゴリ、説明を入力
6. 「追加」ボタンをクリック

### 写真の管理

- **編集**: 写真にマウスオーバーして、編集アイコンをクリック
- **削除**: 写真にマウスオーバーして、削除アイコンをクリック
- **公開/非公開**: 写真の公開状態バッジをクリック
- **カテゴリフィルタ**: 上部のカテゴリタブでフィルタリング

## 参考リンク

- [Firebase Storage ドキュメント](https://firebase.google.com/docs/storage)
- [Firebase Storage セキュリティルール](https://firebase.google.com/docs/storage/security)
