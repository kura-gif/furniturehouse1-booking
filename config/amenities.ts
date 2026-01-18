/**
 * アメニティ・設備管理設定ファイル
 */

export interface Amenity {
  id: string
  name: string
  description: string
  category: 'basic' | 'cooking' | 'bathroom' | 'bedroom' | 'entertainment' | 'outdoor' | 'safety'
  icon: string // アイコン名（Heroicons使用）
  available: boolean
}

export const amenities: Amenity[] = [
  // 基本設備
  {
    id: 'wifi',
    name: 'Wi-Fi',
    description: '高速インターネット接続',
    category: 'basic',
    icon: 'wifi',
    available: true
  },
  {
    id: 'parking',
    name: '無料駐車場',
    description: '敷地内・2台まで',
    category: 'basic',
    icon: 'truck',
    available: true
  },
  {
    id: 'air-conditioning',
    name: 'エアコン',
    description: '冷暖房完備',
    category: 'basic',
    icon: 'sun',
    available: true
  },
  {
    id: 'heating',
    name: '暖房',
    description: '床暖房・エアコン',
    category: 'basic',
    icon: 'fire',
    available: true
  },

  // キッチン・調理
  {
    id: 'kitchen',
    name: 'キッチン',
    description: 'IHコンロ・調理器具完備',
    category: 'cooking',
    icon: 'beaker',
    available: true
  },
  {
    id: 'refrigerator',
    name: '冷蔵庫',
    description: '大型冷蔵庫',
    category: 'cooking',
    icon: 'cube',
    available: true
  },
  {
    id: 'microwave',
    name: '電子レンジ',
    description: '',
    category: 'cooking',
    icon: 'square-3-stack-3d',
    available: true
  },
  {
    id: 'coffee-maker',
    name: 'コーヒーメーカー',
    description: 'ドリップコーヒー',
    category: 'cooking',
    icon: 'cup',
    available: true
  },
  {
    id: 'dishes',
    name: '食器・カトラリー',
    description: '皿、ボウル、グラス等',
    category: 'cooking',
    icon: 'shopping-bag',
    available: true
  },

  // バスルーム
  {
    id: 'bath',
    name: '浴室',
    description: 'バスタブ付き',
    category: 'bathroom',
    icon: 'home',
    available: true
  },
  {
    id: 'shampoo',
    name: 'シャンプー',
    description: 'ボディソープ・リンス',
    category: 'bathroom',
    icon: 'beaker',
    available: true
  },
  {
    id: 'towels',
    name: 'タオル',
    description: 'バスタオル・フェイスタオル',
    category: 'bathroom',
    icon: 'document',
    available: true
  },
  {
    id: 'hair-dryer',
    name: 'ヘアドライヤー',
    description: '',
    category: 'bathroom',
    icon: 'bolt',
    available: true
  },

  // 寝室・リネン
  {
    id: 'bedding',
    name: '寝具',
    description: '布団・ベッドリネン',
    category: 'bedroom',
    icon: 'home-modern',
    available: true
  },
  {
    id: 'hangers',
    name: 'ハンガー',
    description: 'クローゼット付き',
    category: 'bedroom',
    icon: 'arrows-up-down',
    available: true
  },
  {
    id: 'blackout-curtains',
    name: '遮光カーテン',
    description: '',
    category: 'bedroom',
    icon: 'rectangle-stack',
    available: true
  },

  // エンターテインメント
  {
    id: 'tv',
    name: 'テレビ',
    description: '地上波・衛星放送',
    category: 'entertainment',
    icon: 'tv',
    available: false
  },
  {
    id: 'books',
    name: '書籍',
    description: '建築関連書籍',
    category: 'entertainment',
    icon: 'book-open',
    available: true
  },

  // 屋外・景観
  {
    id: 'garden',
    name: '庭',
    description: '森に囲まれた静かな環境',
    category: 'outdoor',
    icon: 'sparkles',
    available: true
  },
  {
    id: 'mountain-view',
    name: '山の景色',
    description: '富士山・山中湖',
    category: 'outdoor',
    icon: 'photo',
    available: true
  },

  // 安全設備
  {
    id: 'smoke-detector',
    name: '火災報知器',
    description: '',
    category: 'safety',
    icon: 'bell-alert',
    available: true
  },
  {
    id: 'fire-extinguisher',
    name: '消火器',
    description: '',
    category: 'safety',
    icon: 'shield-check',
    available: true
  },
  {
    id: 'first-aid',
    name: '救急箱',
    description: '',
    category: 'safety',
    icon: 'heart',
    available: true
  }
]

export const amenityCategories: Record<string, string> = {
  basic: '基本設備',
  cooking: 'キッチン・調理',
  bathroom: 'バスルーム',
  bedroom: '寝室・リネン',
  entertainment: 'エンターテインメント',
  outdoor: '屋外・景観',
  safety: '安全設備'
}

// 利用可能なアメニティのみ取得
export const getAvailableAmenities = () => {
  return amenities.filter(a => a.available)
}

// カテゴリ別にグループ化
export const getAmenitiesByCategory = () => {
  const grouped: Record<string, Amenity[]> = {}
  amenities.forEach(amenity => {
    if (amenity.available) {
      if (!grouped[amenity.category]) {
        grouped[amenity.category] = []
      }
      grouped[amenity.category].push(amenity)
    }
  })
  return grouped
}
