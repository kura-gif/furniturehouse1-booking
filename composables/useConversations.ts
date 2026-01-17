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
  serverTimestamp,
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
    if (!$db) throw new Error('Firestore is not initialized')
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
    if (!$db) throw new Error('Firestore is not initialized')
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
    if (!$db) throw new Error('Firestore is not initialized')
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
    if (!$db) throw new Error('Firestore is not initialized')
    const conversationRef = doc($db, 'conversations', conversationId)
    const snapshot = await getDoc(conversationRef)

    if (!snapshot.exists()) {
      return null
    }

    return { id: snapshot.id, ...snapshot.data() } as Conversation
  }

  /**
   * 予約IDから会話を取得
   * guestEmailも条件に含めてFirestoreルールを満たす
   */
  const getConversationByBookingId = async (bookingId: string, guestEmail?: string): Promise<Conversation | null> => {
    if (!$db) throw new Error('Firestore is not initialized')
    const conversationsRef = collection($db, 'conversations')

    // guestEmailが指定されている場合は複合条件でクエリ
    let q
    if (guestEmail) {
      q = query(
        conversationsRef,
        where('bookingId', '==', bookingId),
        where('guestEmail', '==', guestEmail),
        limit(1)
      )
    } else {
      q = query(conversationsRef, where('bookingId', '==', bookingId), limit(1))
    }

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
    if (!$db) throw new Error('Firestore is not initialized')
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
    if (!$db) throw new Error('Firestore is not initialized')
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
   * - ゲストの場合: 既存のAPI経由（server/api/conversations/send-message.post.ts）
   * - 管理者の場合: 管理者用API経由（server/api/conversations/admin-send-message.post.ts）
   *
   * どちらも送信後に相手方へメール通知が送られる
   */
  const sendMessage = async (
    conversationId: string,
    content: string,
    senderType: 'guest' | 'admin',
    senderName: string,
    senderId?: string
  ): Promise<string> => {
    const { $auth } = useNuxtApp()
    if (!$auth) throw new Error('Firebase Auth is not initialized')

    const currentUser = $auth.currentUser
    if (!currentUser) {
      throw new Error('認証が必要です')
    }

    const idToken = await currentUser.getIdToken()

    if (senderType === 'admin') {
      // 管理者の場合は管理者用APIを使用（ゲストへのメール通知付き）
      const response = await $fetch<{ success: boolean; messageId: string }>('/api/conversations/admin-send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: {
          conversationId,
          content,
          senderName
        }
      })
      return response.messageId
    } else {
      // ゲストの場合は既存APIを使用（管理者へのメール通知付き）
      const response = await $fetch<{ success: boolean; messageId: string }>('/api/conversations/send-message', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: {
          conversationId,
          content,
          senderName
        }
      })
      return response.messageId
    }
  }

  /**
   * メッセージを既読にする（管理者用）
   */
  const markAsReadByAdmin = async (conversationId: string): Promise<void> => {
    if (!$db) throw new Error('Firestore is not initialized')
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
    if (!$db) throw new Error('Firestore is not initialized')
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
    if (!$db) throw new Error('Firestore is not initialized')
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
    if (!$db) throw new Error('Firestore is not initialized')
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
    if (!$db) throw new Error('Firestore is not initialized')
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
