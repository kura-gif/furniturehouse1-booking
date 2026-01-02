# 画像管理ガイド

このドキュメントでは、サイト内の画像を簡単に入れ替える方法を説明します。

## 概要

すべての画像パスは [`config/images.ts`](../config/images.ts) で一元管理されています。画像を入れ替える際は、以下の2つの方法があります。

## 方法1: 画像ファイルを上書きする（推奨）

最も簡単な方法です。既存のファイル名と同じ名前で画像を置き換えるだけです。

### 手順

1. `public/images/` フォルダに移動
2. 既存の画像ファイルを新しい画像で上書き
3. ファイル名は変更しない（例: `hero-background.jpg` → `hero-background.jpg`）
4. ブラウザをリロードすると新しい画像が表示されます

### 必要な画像ファイル一覧

```
public/images/
├── hero-background.jpg       # トップページのメインビジュアル (1920x1080px以上推奨)
├── gallery-1.jpg             # ギャラリー画像1 (800x800px以上推奨)
├── gallery-2.jpg             # ギャラリー画像2 (800x800px以上推奨)
├── gallery-3.jpg             # ギャラリー画像3 (800x800px以上推奨)
├── gallery-4.jpg             # ギャラリー画像4 (800x800px以上推奨)
├── gallery-5.jpg             # ギャラリー画像5 (800x800px以上推奨)
├── gallery-6.jpg             # ギャラリー画像6 (800x800px以上推奨)
├── ogp-image.jpg             # SNSシェア用サムネイル (1200x630px推奨)
├── booking-background.jpg    # 予約ページ背景（オプション）
└── workshop-background.jpg   # ワークショップページ背景（オプション）
```

## 方法2: ファイル名を変更する場合

異なるファイル名を使いたい場合や、画像の枚数を増やしたい場合は、設定ファイルを編集します。

### 手順

1. `public/images/` に新しい画像を配置
2. [`config/images.ts`](../config/images.ts) を開く
3. 該当する画像パスを変更

#### 例1: ヒーロー画像のファイル名を変更

```typescript
// config/images.ts
export const images = {
  hero: {
    background: '/images/my-hero-image.jpg',  // ← ここを変更
    alt: '家具の家 No.1 外観'
  },
  // ...
}
```

#### 例2: ギャラリー画像を追加

```typescript
// config/images.ts
export const images = {
  // ...
  gallery: [
    {
      src: '/images/gallery-1.jpg',
      alt: '家具の家 No.1 全景',
      category: '外観'
    },
    {
      src: '/images/gallery-2.jpg',
      alt: '家具の家 内部構造',
      category: '内観'
    },
    // 新しい画像を追加
    {
      src: '/images/gallery-new.jpg',
      alt: '新しい角度からの外観',
      category: '外観'
    }
  ]
}
```

## 画像サイズと最適化のガイドライン

### 推奨画像サイズ

| 用途 | 推奨サイズ | 最大ファイルサイズ |
|------|-----------|------------------|
| ヒーロー背景 | 1920x1080px以上 | 500KB |
| ギャラリー画像 | 800x800px以上（正方形） | 300KB |
| OGP画像 | 1200x630px | 300KB |

### 画像フォーマット

- **推奨**: WebP（高品質で軽量）
- **代替**: JPG（互換性が高い）
- **OGP画像のみ**: JPG または PNG

### 画像の最適化方法

画像ファイルサイズが大きい場合は、以下のツールで最適化してください。

#### オンラインツール
- [TinyPNG](https://tinypng.com/) - JPG/PNG圧縮
- [Squoosh](https://squoosh.app/) - WebP変換・圧縮

#### コマンドラインツール（上級者向け）
```bash
# ImageMagickを使用してリサイズと圧縮
convert input.jpg -resize 1920x1080 -quality 85 output.jpg

# WebPに変換
cwebp -q 85 input.jpg -o output.webp
```

## トラブルシューティング

### 画像が表示されない場合

1. **ファイル名のスペルチェック**
   - `config/images.ts` のパスと実際のファイル名が一致しているか確認

2. **ファイルの配置場所を確認**
   - 画像が `public/images/` フォルダ内にあるか確認

3. **ブラウザキャッシュをクリア**
   - 強制リロード: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

4. **開発サーバーを再起動**
   ```bash
   npm run dev
   ```

### 画像が歪んで表示される場合

- ギャラリー画像は正方形（1:1）の比率にしてください
- ヒーロー画像は16:9の比率が推奨です

## よくある質問

### Q: 画像を何枚でも追加できますか？
A: はい。`config/images.ts` の `gallery` 配列に要素を追加するだけで、自動的にギャラリーに表示されます。

### Q: 動画は使えますか？
A: 現在の実装では静止画のみですが、HTMLの `<video>` タグを使用することで動画も配置可能です。

### Q: 外部URLの画像を使えますか？
A: はい。`config/images.ts` で外部URLを指定できます。
```typescript
hero: {
  background: 'https://example.com/my-image.jpg',
  alt: '外部画像'
}
```

## まとめ

- **簡単な入れ替え**: 同じファイル名で上書き
- **カスタマイズ**: `config/images.ts` を編集
- **画像最適化**: WebP形式、適切なサイズと圧縮率を推奨

困った時は、開発チームにお問い合わせください。
