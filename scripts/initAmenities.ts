/**
 * Firebaseにアメニティの初期データを投入するスクリプト
 *
 * 実行方法:
 * 1. Firebaseの設定が完了していることを確認
 * 2. このスクリプトを実行してFirestoreにデータを投入
 *
 * 注意: このスクリプトは既存のアメニティデータを削除しません。
 * 既存のデータと重複する可能性があるため、初回のみ実行してください。
 */

import { amenities } from '~/config/amenities'

export async function initializeAmenities() {
  try {
    console.log('アメニティデータの初期化を開始します...')

    const { createAmenity } = useAmenities()

    for (const amenity of amenities) {
      const { id, ...amenityData } = amenity
      await createAmenity(amenityData)
      console.log(`✓ ${amenity.name} を追加しました`)
    }

    console.log(`\n✅ ${amenities.length}件のアメニティを初期化しました`)
  } catch (error) {
    console.error('❌ アメニティの初期化に失敗しました:', error)
    throw error
  }
}

/**
 * 使用方法:
 *
 * 管理画面のコンソールで以下を実行:
 *
 * import { initializeAmenities } from '~/scripts/initAmenities'
 * await initializeAmenities()
 *
 * または、管理画面に初期化ボタンを追加して実行することもできます。
 */
