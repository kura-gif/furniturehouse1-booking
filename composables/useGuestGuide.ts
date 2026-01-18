import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  updateDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import type {
  GuestGuideToken,
  GuideAmenityItem,
  GuideAreaSpot,
  GuideFaq,
  GuideRulesAgreement,
  AmenityCategory,
  AreaSpotCategory
} from '~/types'

export const useGuestGuide = () => {
  const { $db } = useNuxtApp()

  // ==================== トークン関連 ====================

  /**
   * トークンでゲストガイドアクセス情報を取得
   */
  const getGuideAccessByToken = async (token: string): Promise<GuestGuideToken | null> => {
    if (!$db) throw new Error('Database not initialized')
    const tokensRef = collection($db, 'guestGuideTokens')
    const q = query(
      tokensRef,
      where('token', '==', token),
      where('isActive', '==', true)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const docData = snapshot.docs[0]
    const data = docData.data() as GuestGuideToken

    if (data.expiresAt?.toDate() < new Date()) {
      return null
    }

    return {
      ...data,
      id: docData.id
    }
  }

  /**
   * 予約IDからトークンを取得
   */
  const getGuideTokenByBookingId = async (bookingId: string): Promise<GuestGuideToken | null> => {
    if (!$db) throw new Error('Database not initialized')
    const tokensRef = collection($db, 'guestGuideTokens')
    const q = query(
      tokensRef,
      where('bookingId', '==', bookingId),
      where('isActive', '==', true)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const docData = snapshot.docs[0]
    return {
      id: docData.id,
      ...docData.data()
    } as GuestGuideToken
  }

  /**
   * ゲストガイドトークンを作成（予約確定時に呼び出し）
   */
  const createGuideToken = async (
    bookingId: string,
    bookingReference: string,
    guestName: string,
    guestEmail: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<string> => {
    if (!$db) throw new Error('Database not initialized')

    const existingToken = await getGuideTokenByBookingId(bookingId)
    if (existingToken?.id) {
      await deactivateToken(existingToken.id)
    }

    const token = generateSecureToken()

    const expiresAt = new Date(checkOutDate)
    expiresAt.setDate(expiresAt.getDate() + 7)

    const tokensRef = collection($db, 'guestGuideTokens')
    const docRef = await addDoc(tokensRef, {
      bookingId,
      bookingReference,
      token,
      guestName,
      guestEmail,
      checkInDate: Timestamp.fromDate(checkInDate),
      checkOutDate: Timestamp.fromDate(checkOutDate),
      isActive: true,
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return token
  }

  /**
   * トークンを無効化
   */
  const deactivateToken = async (tokenId: string): Promise<void> => {
    if (!$db) throw new Error('Database not initialized')
    const tokenRef = doc($db, 'guestGuideTokens', tokenId)
    await updateDoc(tokenRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    })
  }

  /**
   * アクセス日時を記録
   */
  const recordAccess = async (tokenId: string): Promise<void> => {
    if (!$db) throw new Error('Database not initialized')
    const tokenRef = doc($db, 'guestGuideTokens', tokenId)
    await updateDoc(tokenRef, {
      accessedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
  }

  // ==================== アメニティ関連 ====================

  /**
   * アメニティ一覧を取得
   */
  const getAmenities = async (category?: AmenityCategory): Promise<GuideAmenityItem[]> => {
    if (!$db) throw new Error('Database not initialized')
    const amenitiesRef = collection($db, 'guideAmenities')
    let q = query(
      amenitiesRef,
      where('isActive', '==', true),
      orderBy('order', 'asc')
    )

    if (category) {
      q = query(
        amenitiesRef,
        where('isActive', '==', true),
        where('category', '==', category),
        orderBy('order', 'asc')
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GuideAmenityItem[]
  }

  // ==================== 周辺スポット関連 ====================

  /**
   * 周辺スポット一覧を取得
   */
  const getAreaSpots = async (category?: AreaSpotCategory): Promise<GuideAreaSpot[]> => {
    if (!$db) throw new Error('Database not initialized')
    const spotsRef = collection($db, 'guideAreaSpots')
    let q = query(
      spotsRef,
      where('isActive', '==', true),
      orderBy('order', 'asc')
    )

    if (category) {
      q = query(
        spotsRef,
        where('isActive', '==', true),
        where('category', '==', category),
        orderBy('order', 'asc')
      )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GuideAreaSpot[]
  }

  /**
   * おすすめスポットを取得
   */
  const getRecommendedSpots = async (): Promise<GuideAreaSpot[]> => {
    if (!$db) throw new Error('Database not initialized')
    const spotsRef = collection($db, 'guideAreaSpots')
    const q = query(
      spotsRef,
      where('isActive', '==', true),
      where('isRecommended', '==', true),
      orderBy('order', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GuideAreaSpot[]
  }

  // ==================== FAQ関連 ====================

  /**
   * FAQ一覧を取得
   */
  const getFaqs = async (): Promise<GuideFaq[]> => {
    if (!$db) throw new Error('Database not initialized')
    const faqsRef = collection($db, 'guideFaqs')
    const q = query(
      faqsRef,
      where('isActive', '==', true),
      orderBy('order', 'asc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GuideFaq[]
  }

  // ==================== ハウスルール同意関連 ====================

  /**
   * ハウスルール同意を記録
   */
  const recordRulesAgreement = async (
    tokenId: string,
    bookingId: string,
    bookingReference: string,
    guestName: string,
    guestEmail: string
  ): Promise<string> => {
    if (!$db) throw new Error('Database not initialized')
    const agreementsRef = collection($db, 'guideRulesAgreements')
    const docRef = await addDoc(agreementsRef, {
      tokenId,
      bookingId,
      bookingReference,
      guestName,
      guestEmail,
      agreedAt: serverTimestamp()
    })

    const tokenRef = doc($db, 'guestGuideTokens', tokenId)
    await updateDoc(tokenRef, {
      rulesAgreedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    return docRef.id
  }

  /**
   * 同意記録を確認
   */
  const checkRulesAgreement = async (bookingId: string): Promise<GuideRulesAgreement | null> => {
    if (!$db) throw new Error('Database not initialized')
    const agreementsRef = collection($db, 'guideRulesAgreements')
    const q = query(agreementsRef, where('bookingId', '==', bookingId))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const docData = snapshot.docs[0]
    return {
      id: docData.id,
      ...docData.data()
    } as GuideRulesAgreement
  }

  // ==================== ユーティリティ ====================

  /**
   * セキュアなトークンを生成
   */
  const generateSecureToken = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    const randomValues = new Uint8Array(32)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < 32; i++) {
      token += chars[randomValues[i] % chars.length]
    }
    return token
  }

  /**
   * ガイドブックURLを生成
   */
  const generateGuideUrl = (token: string): string => {
    const baseUrl = process.client ? window.location.origin : ''
    return `${baseUrl}/guide?token=${token}`
  }

  return {
    // トークン
    getGuideAccessByToken,
    getGuideTokenByBookingId,
    createGuideToken,
    deactivateToken,
    recordAccess,
    // アメニティ
    getAmenities,
    // 周辺スポット
    getAreaSpots,
    getRecommendedSpots,
    // FAQ
    getFaqs,
    // ハウスルール同意
    recordRulesAgreement,
    checkRulesAgreement,
    // ユーティリティ
    generateGuideUrl
  }
}
