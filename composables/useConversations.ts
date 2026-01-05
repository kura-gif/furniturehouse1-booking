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
  onSnapshot,
  Timestamp,
  serverTimestamp,
  increment,
  limit
} from 'firebase/firestore'
import type { Conversation, Message } from '~/types'

export const useConversations = () => {
  const { $db } = useNuxtApp()

  /**
   * 予約に紐づく会話を取得または作成
   */
  const getOrCreateConversation = async (
    bookingId: string,
    bookingReference: string,
    guestName: string,
    guestEmail: string,
    guestUserId?: string
  ): Promise<Conversation> => {
    const conversationsRef = collection($db, 'conversations')

    // 既存の会話を検索
    const q = query(conversationsRef, where('bookingId', '==', bookingId), limit(1))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() } as Conversation
    }

    // 新規作成
    const newConversation = {
      bookingId,
      bookingReference,
      guestName,
      guestEmail,
      guestUserId: guestUserId || null,
      status: 'open',
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: '',
      unreadByAdmin: 0,
      unreadByGuest: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(conversationsRef, newConversation)
    return { id: docRef.id, ...newConversation } as unknown as Conversation
  }

  /**
   * 会話一覧を取得（管理者用）
   */
  const getAllConversations = async (): Promise<Conversation[]> => {
    const conversationsRef = collection($db, 'conversations')
    const q = query(conversationsRef, orderBy('lastMessageAt', 'desc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conversation[]
  }

  /**
   * ゲストの会話一覧を取得
   */
  const getGuestConversations = async (guestUserId: string): Promise<Conversation[]> => {
    const conversationsRef = collection($db, 'conversations')
    const q = query(
      conversationsRef,
      where('guestUserId', '==', guestUserId),
      orderBy('lastMessageAt', 'desc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conversation[]
  }

  /**
   * 会話を取得
   */
  const getConversation = async (conversationId: string): Promise<Conversation | null> => {
    const conversationRef = doc($db, 'conversations', conversationId)
    const snapshot = await getDoc(conversationRef)

    if (!snapshot.exists()) {
      return null
    }

    return { id: snapshot.id, ...snapshot.data() } as Conversation
  }

  /**
   * 予約IDから会話を取得
   */
  const getConversationByBookingId = async (bookingId: string): Promise<Conversation | null> => {
    const conversationsRef = collection($db, 'conversations')
    const q = query(conversationsRef, where('bookingId', '==', bookingId), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const docSnap = snapshot.docs[0]
    return { id: docSnap.id, ...docSnap.data() } as Conversation
  }

  /**
   * メッセージ一覧を取得
   */
  const getMessages = async (conversationId: string): Promise<Message[]> => {
    const messagesRef = collection($db, 'messages')
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[]
  }

  /**
   * メッセージをリアルタイムで監視
   */
  const subscribeToMessages = (
    conversationId: string,
    callback: (messages: Message[]) => void
  ) => {
    const messagesRef = collection($db, 'messages')
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    )

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      callback(messages)
    })
  }

  /**
   * メッセージを送信
   */
  const sendMessage = async (
    conversationId: string,
    content: string,
    senderType: 'guest' | 'admin',
    senderName: string,
    senderId?: string
  ): Promise<string> => {
    const messagesRef = collection($db, 'messages')
    const conversationRef = doc($db, 'conversations', conversationId)

    // メッセージを作成
    const newMessage = {
      conversationId,
      content,
      senderType,
      senderName,
      senderId: senderId || null,
      isRead: false,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(messagesRef, newMessage)

    // 会話を更新
    const updateData: any = {
      lastMessageAt: serverTimestamp(),
      lastMessagePreview: content.substring(0, 50),
      updatedAt: serverTimestamp()
    }

    // 未読カウントを増加
    if (senderType === 'guest') {
      updateData.unreadByAdmin = increment(1)
    } else {
      updateData.unreadByGuest = increment(1)
    }

    await updateDoc(conversationRef, updateData)

    return docRef.id
  }

  /**
   * メッセージを既読にする（管理者用）
   */
  const markAsReadByAdmin = async (conversationId: string): Promise<void> => {
    const conversationRef = doc($db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
      unreadByAdmin: 0,
      updatedAt: serverTimestamp()
    })

    // メッセージを既読にする
    const messagesRef = collection($db, 'messages')
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      where('senderType', '==', 'guest'),
      where('isRead', '==', false)
    )
    const snapshot = await getDocs(q)

    const updates = snapshot.docs.map(docSnap =>
      updateDoc(doc($db, 'messages', docSnap.id), { isRead: true })
    )
    await Promise.all(updates)
  }

  /**
   * メッセージを既読にする（ゲスト用）
   */
  const markAsReadByGuest = async (conversationId: string): Promise<void> => {
    const conversationRef = doc($db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
      unreadByGuest: 0,
      updatedAt: serverTimestamp()
    })

    // メッセージを既読にする
    const messagesRef = collection($db, 'messages')
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      where('senderType', '==', 'admin'),
      where('isRead', '==', false)
    )
    const snapshot = await getDocs(q)

    const updates = snapshot.docs.map(docSnap =>
      updateDoc(doc($db, 'messages', docSnap.id), { isRead: true })
    )
    await Promise.all(updates)
  }

  /**
   * 会話をクローズ
   */
  const closeConversation = async (conversationId: string): Promise<void> => {
    const conversationRef = doc($db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
      status: 'closed',
      updatedAt: serverTimestamp()
    })
  }

  /**
   * 会話をリオープン
   */
  const reopenConversation = async (conversationId: string): Promise<void> => {
    const conversationRef = doc($db, 'conversations', conversationId)
    await updateDoc(conversationRef, {
      status: 'open',
      updatedAt: serverTimestamp()
    })
  }

  /**
   * 未読会話数を取得（管理者用）
   */
  const getUnreadCount = async (): Promise<number> => {
    const conversationsRef = collection($db, 'conversations')
    const q = query(conversationsRef, where('unreadByAdmin', '>', 0))
    const snapshot = await getDocs(q)
    return snapshot.size
  }

  return {
    getOrCreateConversation,
    getAllConversations,
    getGuestConversations,
    getConversation,
    getConversationByBookingId,
    getMessages,
    subscribeToMessages,
    sendMessage,
    markAsReadByAdmin,
    markAsReadByGuest,
    closeConversation,
    reopenConversation,
    getUnreadCount
  }
}
