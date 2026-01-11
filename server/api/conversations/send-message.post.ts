import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import { getFirestoreAdmin, getAuthAdmin } from '~/server/utils/firebase-admin'

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

    const userEmail = decodedToken.email
    const userId = decodedToken.uid

    // リクエストボディを取得
    const body = await readBody(event)
    const { conversationId, content, senderName } = body

    if (!conversationId || !content) {
      throw createError({
        statusCode: 400,
        statusMessage: '会話IDとメッセージ内容が必要です'
      })
    }

    const db = getFirestoreAdmin()

    // 会話を取得してアクセス権を確認
    const conversationDoc = await db.collection('conversations').doc(conversationId).get()
    if (!conversationDoc.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: '会話が見つかりません'
      })
    }

    const conversationData = conversationDoc.data()!

    // アクセス権の確認
    // 1. 会話のguestUserIdまたはguestEmailと一致するか
    // 2. 予約のuserIdまたはguestEmailと一致するか
    let hasAccess =
      conversationData.guestUserId === userId ||
      conversationData.guestEmail === userEmail

    if (!hasAccess && conversationData.bookingId) {
      // 予約経由でのアクセス確認
      const bookingDoc = await db.collection('bookings').doc(conversationData.bookingId).get()
      if (bookingDoc.exists) {
        const bookingData = bookingDoc.data()!
        hasAccess = bookingData.userId === userId || bookingData.guestEmail === userEmail
      }
    }

    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: 'この会話へのアクセス権がありません'
      })
    }

    // メッセージを作成
    const now = Timestamp.now()
    const newMessage = {
      conversationId,
      content,
      senderType: 'guest',
      senderName: senderName || 'ゲスト',
      senderId: userId || null,
      isRead: false,
      createdAt: now
    }

    const messageRef = await db.collection('messages').add(newMessage)

    // 会話を更新
    await db.collection('conversations').doc(conversationId).update({
      lastMessageAt: now,
      lastMessagePreview: content.substring(0, 50),
      updatedAt: now,
      unreadByAdmin: FieldValue.increment(1)
    })

    // 管理者にメール通知を送信（非同期で実行、エラーでもメッセージ送信は成功扱い）
    try {
      const siteUrl = config.public.siteUrl || 'http://localhost:3000'
      console.log('📧 Sending admin notification email...')
      console.log('📧 Site URL:', siteUrl)
      console.log('📧 Has internal secret:', !!config.internalApiSecret)

      await $fetch(`${siteUrl}/api/emails/send-message-notification`, {
        method: 'POST',
        headers: {
          'x-internal-secret': config.internalApiSecret || ''
        },
        body: {
          type: 'guest_to_admin',
          conversationId,
          bookingReference: conversationData.bookingReference || null,
          guestName: conversationData.guestName || senderName || 'ゲスト',
          guestEmail: conversationData.guestEmail || userEmail,
          senderName: senderName || 'ゲスト',
          messageContent: content,
          messagePreview: content.substring(0, 100)
        }
      })
      console.log('✅ Admin notification email sent for new guest message')
    } catch (emailError: any) {
      // メール送信失敗してもメッセージ送信自体は成功とする
      console.error('⚠️ Failed to send admin notification email:', emailError?.message || emailError)
      console.error('⚠️ Error details:', JSON.stringify(emailError?.data || emailError, null, 2))
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
    console.error('メッセージ送信エラー:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'メッセージの送信に失敗しました'
    })
  }
})
