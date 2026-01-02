/**
 * 写真ギャラリーの設定と型定義
 */

export interface Photo {
  id: string
  url: string
  category: PhotoCategory
  title: string
  description?: string
  order: number // 表示順序
  isVisible: boolean // 公開/非公開
  uploadedAt?: Date
}

export type PhotoCategory =
  | 'exterior' // 外観
  | 'living' // リビング
  | 'kitchen' // キッチン
  | 'bedroom' // 寝室
  | 'bathroom' // バスルーム
  | 'view' // 眺望
  | 'outdoor' // 屋外スペース
  | 'detail' // ディテール

export const photoCategories: Record<PhotoCategory, string> = {
  exterior: '外観',
  living: 'リビング',
  kitchen: 'キッチン',
  bedroom: '寝室',
  bathroom: 'バスルーム',
  view: '眺望',
  outdoor: '屋外スペース',
  detail: 'ディテール'
}

// カテゴリの表示順序
export const photoCategoryOrder: PhotoCategory[] = [
  'exterior',
  'living',
  'kitchen',
  'bedroom',
  'bathroom',
  'view',
  'outdoor',
  'detail'
]
