/**
 * 画像管理設定ファイル
 *
 * このファイルで全ての画像パスを一元管理します。
 * 画像を入れ替える際は、このファイルのパスを変更するだけでOKです。
 */

export const images = {
  // ヒーローセクション背景画像（スライドショー用）
  hero: {
    slides: [
      {
        src: '/images/hero/01.webp',
        alt: '家具の家 No.1 外観'
      },
      {
        src: '/images/hero/02.webp',
        alt: '家具の家 内部構造'
      },
      {
        src: '/images/hero/03.webp',
        alt: '家具の家 構造詳細'
      }
    ]
  },

  // 建築紹介セクション画像
  about: {
    main: '/images/hero/02.webp',
    alt: '家具の家 内部構造'
  },

  // ギャラリーセクション画像（Vercel CDN経由で配信）
  gallery: [
    {
      src: '/images/hero/01.webp',
      alt: '家具の家 No.1 全景',
      category: '外観'
    },
    {
      src: '/images/hero/02.webp',
      alt: '家具の家 内部構造',
      category: '内観'
    },
    {
      src: '/images/hero/03.webp',
      alt: '家具の家 構造詳細',
      category: '詳細'
    },
    {
      src: '/images/hero/04.webp',
      alt: '家具の家 外観',
      category: '外観'
    },
    {
      src: '/images/hero/05.webp',
      alt: 'リビングスペース',
      category: 'リビング'
    },
    {
      src: '/images/hero/06.webp',
      alt: '寝室',
      category: '寝室'
    }
  ],

  // OGP画像（SNSシェア時に表示される画像）
  ogp: '/images/hero/02.webp',

  // その他のページ用画像
  booking: {
    background: '/images/booking-background.jpg',
    alt: '予約ページ背景'
  },

  workshop: {
    background: '/images/workshop-background.jpg',
    alt: 'ワークショップページ背景'
  }
}

// 画像の説明とサイズガイドライン
export const imageSpecs = {
  hero: {
    description: 'ヒーローセクションの背景画像',
    recommendedSize: '1920x1080px以上',
    format: 'JPG, WebP推奨',
    maxFileSize: '500KB'
  },
  gallery: {
    description: 'ギャラリーに表示される画像',
    recommendedSize: '800x800px以上（正方形）',
    format: 'JPG, WebP推奨',
    maxFileSize: '300KB'
  },
  ogp: {
    description: 'SNSシェア時のサムネイル画像',
    recommendedSize: '1200x630px',
    format: 'JPG, PNG',
    maxFileSize: '300KB'
  }
}
