import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import { getFirestoreAdmin, getAuthAdmin } from '~/server/utils/firebase-admin'

/**
 * 管理者用メッセージ送信API
 *
 * メッセージ送信後、ゲストにメール通知を送信
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  try {
    // 認証チェック
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証が必要です'
      })
    }

    const idToken = authHeader.substring(7)
    const auth = getAuthAdmin()

    let decodedToken
    try {
      decodedToken = await auth.verifyIdToken(idToken)
    } catch {
      throw createError({
        statusCode: 401,
        statusMessage: '無効なトークンです'
      })
    }

    const userId = decodedToken.uid

    const db = getFirestoreAdmin()

    // ユーザーが管理者かどうか確認
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      throw createError({
        statusCode: 403,
        statusMessage: 'ユーザーが見つかりません'
      })
    }

    const userData = userDoc.data()!
    if (userData.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: '管理者権限が必要です'
      })
    }

    // リクエストボディを取得
    const body = await readBody(event)
    const { conversationId, content, senderName } = body

    if (!conversationId || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: '会話IDとメッセージ内容が必要です'
      })
    }

    // 会話を取得
    const conversationDoc = await db.collection('conversations').doc(conversationId).get()
    if (!conversationDoc.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: '会話が見つかりません'
      })
    }

    const conversationData = conversationDoc.data()!

    // メッセージを作成
    const now = Timestamp.now()
    const newMessage = {
      conversationId,
      content,
      senderType: 'admin',
      senderName: senderName || '管理者',
      senderId: userId,
      isRead: false,
      createdAt: now
    }

    const messageRef = await db.collection('messages').add(newMessage)

    // 会話を更新
    await db.collection('conversations').doc(conversationId).update({
      lastMessageAt: now,
      lastMessagePreview: content.substring(0, 50),
      updatedAt: now,
      unreadByGuest: FieldValue.increment(1)
    })

    // ゲストにメール通知を送信（非同期で実行、エラーでもメッセージ送信は成功扱い）
    if (conversationData.guestEmail) {
      try {
        const siteUrl = config.public.siteUrl || 'http://localhost:3000'
        await $fetch(`${siteUrl}/api/emails/send-message-notification`, {
          method: 'POST',
          headers: {
            'x-internal-secret': config.internalApiSecret || ''
          },
          body: {
            type: 'admin_to_guest',
            conversationId,
            bookingReference: conversationData.bookingReference || null,
            guestName: conversationData.guestName || 'ゲスト',
            guestEmail: conversationData.guestEmail,
            senderName: senderName || '管理者',
            messageContent: content,
            messagePreview: content.substring(0, 100)
          }
        })
        console.log('✅ Guest notification email sent for new admin message')
      } catch (emailError) {
        // メール送信失敗してもメッセージ送信自体は成功とする
        console.error('⚠️ Failed to send guest notification email:', emailError)
      }
    } else {
      console.log('⚠️ No guest email found, skipping notification')
    }

    return {
      success: true,
      messageId: messageRef.id,
      message: {
        id: messageRef.id,
        ...newMessage
      }
    }
  } catch (error: any) {
    console.error('管理者メッセージ送信エラー:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'メッセージの送信に失敗しました'
    })
  }
})
