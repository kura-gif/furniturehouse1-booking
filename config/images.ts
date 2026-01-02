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
        src: 'https://storage.googleapis.com/production-os-assets/assets/ee624b9f-8615-4f77-a680-72fbc0876d71',
        alt: '家具の家 No.1 外観'
      },
      {
        src: 'https://storage.googleapis.com/production-os-assets/assets/d955ed6d-17a4-4e0d-b901-58361a841aab',
        alt: '家具の家 内部構造'
      },
      {
        src: 'https://storage.googleapis.com/production-os-assets/assets/44af6465-ab0c-4e37-b0ab-b526dcb50484',
        alt: '家具の家 構造詳細'
      }
    ]
  },

  // 建築紹介セクション画像
  about: {
    main: 'https://storage.googleapis.com/production-os-assets/assets/d955ed6d-17a4-4e0d-b901-58361a841aab',
    alt: '家具の家 内部構造'
  },

  // ギャラリーセクション画像
  gallery: [
    {
      src: 'https://storage.googleapis.com/production-os-assets/assets/ee624b9f-8615-4f77-a680-72fbc0876d71',
      alt: '家具の家 No.1 全景',
      category: '外観'
    },
    {
      src: 'https://storage.googleapis.com/production-os-assets/assets/d955ed6d-17a4-4e0d-b901-58361a841aab',
      alt: '家具の家 内部構造',
      category: '内観'
    },
    {
      src: 'https://storage.googleapis.com/production-os-assets/assets/44af6465-ab0c-4e37-b0ab-b526dcb50484',
      alt: '家具の家 構造詳細',
      category: '詳細'
    },
    {
      src: 'https://storage.googleapis.com/production-os-assets/assets/ee624b9f-8615-4f77-a680-72fbc0876d71',
      alt: '家具の家 外観',
      category: '外観'
    },
    {
      src: 'https://storage.googleapis.com/production-os-assets/assets/d955ed6d-17a4-4e0d-b901-58361a841aab',
      alt: 'リビングスペース',
      category: 'リビング'
    },
    {
      src: 'https://storage.googleapis.com/production-os-assets/assets/44af6465-ab0c-4e37-b0ab-b526dcb50484',
      alt: '寝室',
      category: '寝室'
    }
  ],

  // OGP画像（SNSシェア時に表示される画像）
  ogp: 'https://storage.googleapis.com/production-os-assets/assets/d955ed6d-17a4-4e0d-b901-58361a841aab',

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
