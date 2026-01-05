import { getFirestoreAdmin } from '~/server/utils/firebase-admin'

// デフォルト設定値
const defaultSettings = {
  // 基本設定
  checkInTime: '15:00',
  checkOutTime: '11:00',
  maxGuests: 6,

  // ハウスルール詳細ページ用
  houseRules: '',
  houseRulesProhibited: '- 建物内・敷地内全面禁煙（電子タバコ含む）\n- ペット同伴不可\n- パーティー・騒音を伴うイベント禁止\n- 商用目的の撮影は事前許可が必要',
  houseRulesNoise: '22:00〜翌8:00',
  houseRulesGarbage: '- 燃えるゴミ・燃えないゴミ・資源ゴミに分別\n- ペットボトル・缶は洗ってからお捨てください\n- 大量のゴミが出る場合は事前にご相談ください',
  houseRulesCheckout: '- 使用した食器類は軽く洗って元の場所にお戻しください\n- タオル・リネン類は脱衣所の所定の場所にまとめてください\n- エアコン・照明・水道の元栓を確認してください\n- 窓・ドアの施錠を確認してください\n- 鍵を所定の場所にお戻しください',

  // キャンセルポリシー詳細ページ用
  cancelPolicyFree: '利用日の3日前まで',
  cancelPolicyFreeDesc: '無料',
  cancelPolicyPartial: '利用日の2日前〜当日',
  cancelPolicyPartialDesc: '利用料金の100%（清掃料等を含む）',
  cancelPolicyNoShow: '無断キャンセル（不泊）',
  cancelPolicyNoShowDesc: '利用料金の100%',
  cancelPolicyProcedure: '予約サイトからキャンセル\nご予約時にご利用いただいた予約サイトにログインし、「予約の管理」または「キャンセル」メニューからお手続きください。',
  cancelPolicyExceptions: '- 悪天候や自然災害等で当社が施設の利用が危険と判断した場合\n- 施設の設備故障等により利用が不可能となった場合\n- その他、やむを得ない事由により当社が利用不可と判断した場合',
  cancelPolicyNotes: '- キャンセル料の計算は、施設利用日を基準とします\n- キャンセル料には、基本利用料金および清掃料等の追加料金が含まれます\n- 返金処理には、決済方法により数日〜数週間かかる場合があります',

  // 周辺情報詳細ページ用
  restaurants: '',
  attractions: '',
  convenience: '',
  accessByCar: '駐車場をご利用いただけます。駐車場の詳細は予約確認メールをご確認ください。',
  accessByPublicTransport: '詳細なアクセス方法は予約確認メールでご案内いたします。',
  nearbyHospital: '急な体調不良の際は、お近くの病院・クリニックをご利用ください。'
}

/**
 * 公開設定を取得するAPI（認証不要）
 * 詳細ページのコンテンツ含む
 */
export default defineEventHandler(async () => {
  try {
    const db = getFirestoreAdmin()
    const settingsDoc = await db.collection('settings').doc('facility').get()

    if (!settingsDoc.exists) {
      return {
        success: true,
        settings: defaultSettings
      }
    }

    const data = settingsDoc.data()

    // 公開用に必要な情報のみ返す（機密情報は除外）
    return {
      success: true,
      settings: {
        // 基本設定
        checkInTime: data?.checkInTime || defaultSettings.checkInTime,
        checkOutTime: data?.checkOutTime || defaultSettings.checkOutTime,
        maxGuests: data?.maxGuests || defaultSettings.maxGuests,

        // ハウスルール
        houseRules: data?.houseRules || defaultSettings.houseRules,
        houseRulesProhibited: data?.houseRulesProhibited || defaultSettings.houseRulesProhibited,
        houseRulesNoise: data?.houseRulesNoise || defaultSettings.houseRulesNoise,
        houseRulesGarbage: data?.houseRulesGarbage || defaultSettings.houseRulesGarbage,
        houseRulesCheckout: data?.houseRulesCheckout || defaultSettings.houseRulesCheckout,

        // キャンセルポリシー
        cancelPolicyFree: data?.cancelPolicyFree || defaultSettings.cancelPolicyFree,
        cancelPolicyFreeDesc: data?.cancelPolicyFreeDesc || defaultSettings.cancelPolicyFreeDesc,
        cancelPolicyPartial: data?.cancelPolicyPartial || defaultSettings.cancelPolicyPartial,
        cancelPolicyPartialDesc: data?.cancelPolicyPartialDesc || defaultSettings.cancelPolicyPartialDesc,
        cancelPolicyNoShow: data?.cancelPolicyNoShow || defaultSettings.cancelPolicyNoShow,
        cancelPolicyNoShowDesc: data?.cancelPolicyNoShowDesc || defaultSettings.cancelPolicyNoShowDesc,
        cancelPolicyProcedure: data?.cancelPolicyProcedure || defaultSettings.cancelPolicyProcedure,
        cancelPolicyExceptions: data?.cancelPolicyExceptions || defaultSettings.cancelPolicyExceptions,
        cancelPolicyNotes: data?.cancelPolicyNotes || defaultSettings.cancelPolicyNotes,

        // 周辺情報
        restaurants: data?.restaurants || defaultSettings.restaurants,
        attractions: data?.attractions || defaultSettings.attractions,
        convenience: data?.convenience || defaultSettings.convenience,
        accessByCar: data?.accessByCar || defaultSettings.accessByCar,
        accessByPublicTransport: data?.accessByPublicTransport || defaultSettings.accessByPublicTransport,
        nearbyHospital: data?.nearbyHospital || defaultSettings.nearbyHospital
      }
    }
  } catch (error: any) {
    console.error('[API /public/settings] Error:', error.message)
    return {
      success: true,
      settings: defaultSettings
    }
  }
})
