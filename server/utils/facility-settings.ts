import { getFirestoreAdmin } from '~/server/utils/firebase-admin'

// デフォルト設定値
export const defaultFacilitySettings = {
  checkInTime: '15:00',
  checkOutTime: '11:00',
  maxGuests: 6
}

/**
 * 施設設定を取得するヘルパー関数
 * サーバーサイドのAPIで使用
 */
export async function getFacilitySettings() {
  try {
    const db = getFirestoreAdmin()
    const settingsDoc = await db.collection('settings').doc('facility').get()

    if (!settingsDoc.exists) {
      return defaultFacilitySettings
    }

    const data = settingsDoc.data()
    return {
      checkInTime: data?.checkInTime || defaultFacilitySettings.checkInTime,
      checkOutTime: data?.checkOutTime || defaultFacilitySettings.checkOutTime,
      maxGuests: data?.maxGuests || defaultFacilitySettings.maxGuests
    }
  } catch (error) {
    console.error('[getFacilitySettings] Error:', error)
    return defaultFacilitySettings
  }
}
