/**
 * ゲストガイドのトークン認証ミドルウェア
 *
 * トークンが必要なページで使用:
 * - トークンがURLパラメータにある場合、検証してstateに保存
 * - トークンがない or 無効な場合、公開コンテンツのみ表示
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // サーバーサイドではスキップ
  if (import.meta.server) {
    return
  }

  const guideState = useGuideState()
  const { getGuideAccessByToken, recordAccess } = useGuestGuide()

  // URLからトークンを取得
  const token = to.query.token as string | undefined

  // トークンがある場合は検証
  if (token) {
    try {
      const tokenData = await getGuideAccessByToken(token)

      if (tokenData) {
        // 有効なトークン - stateに保存
        guideState.value = {
          isAuthenticated: true,
          token: token,
          tokenData: tokenData,
          guestName: tokenData.guestName,
          bookingReference: tokenData.bookingReference,
          checkInDate: tokenData.checkInDate.toDate(),
          checkOutDate: tokenData.checkOutDate.toDate(),
          rulesAgreed: !!tokenData.rulesAgreedAt
        }

        // アクセス記録
        await recordAccess(tokenData.id)
      } else {
        // 無効なトークン
        guideState.value = {
          isAuthenticated: false,
          token: null,
          tokenData: null
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      guideState.value = {
        isAuthenticated: false,
        token: null,
        tokenData: null
      }
    }
  } else {
    // トークンなし - 既存のstateを維持（セッション中に保持）
    if (!guideState.value) {
      guideState.value = {
        isAuthenticated: false,
        token: null,
        tokenData: null
      }
    }
  }
})

/**
 * ゲストガイドの状態を管理するcomposable
 */
export const useGuideState = () => {
  return useState<GuideState | null>('guideState', () => null)
}

interface GuideState {
  isAuthenticated: boolean
  token: string | null
  tokenData: any | null
  guestName?: string
  bookingReference?: string
  checkInDate?: Date
  checkOutDate?: Date
  rulesAgreed?: boolean
}
