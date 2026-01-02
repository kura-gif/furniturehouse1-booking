import { getAuth } from 'firebase-admin/auth'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirestoreAdmin } from '~/server/utils/firebase-admin'
import { isInvitationExpired } from '~/server/utils/invitation'

/**
 * 管理者招待受諾API
 *
 * トークンを検証し、新しい管理者アカウントを作成
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { token, email, password, displayName } = body

  // 入力検証
  if (!token || !email || !password || !displayName) {
    throw createError({
      statusCode: 400,
      message: '必須項目が不足しています'
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'パスワードは6文字以上にしてください'
    })
  }

  const db = getFirestoreAdmin()

  // 1. トークンで招待を検索
  const invitationsSnapshot = await db
    .collection('adminInvitations')
    .where('token', '==', token)
    .limit(1)
    .get()

  if (invitationsSnapshot.empty) {
    throw createError({
      statusCode: 404,
      message: '招待が見つかりません'
    })
  }

  const invitationDoc = invitationsSnapshot.docs[0]
  const invitation = invitationDoc.data()

  // 2. メールアドレスの一致確認
  if (invitation.email !== email) {
    throw createError({
      statusCode: 400,
      message: 'メールアドレスが招待と一致しません'
    })
  }

  // 3. ステータス確認
  if (invitation.status !== 'pending') {
    throw createError({
      statusCode: 400,
      message: 'この招待は既に使用されているか、無効です'
    })
  }

  // 4. 有効期限チェック
  const expiresAt = invitation.expiresAt?.toDate?.() || new Date(invitation.expiresAt)
  if (isInvitationExpired(expiresAt)) {
    // 有効期限切れの場合、ステータスを更新
    await invitationDoc.ref.update({
      status: 'expired',
      updatedAt: FieldValue.serverTimestamp()
    })

    throw createError({
      statusCode: 400,
      message: '招待の有効期限が切れています'
    })
  }

  try {
    // 5. Firebase Authでユーザー作成
    const auth = getAuth()
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: true // 招待経由なので自動的にメール認証済みとする
    })

    // 6. Firestoreにユーザー情報を保存（role='admin'）
    const userRef = db.collection('users').doc(userRecord.uid)
    await userRef.set({
      email,
      displayName,
      role: 'admin',
      invitedBy: invitation.invitedBy,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastLoginAt: FieldValue.serverTimestamp()
    })

    // 7. 招待ステータスを 'accepted' に更新
    await invitationDoc.ref.update({
      status: 'accepted',
      acceptedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })

    console.log('✅ 管理者アカウント作成成功:', email)

    return {
      success: true,
      message: '管理者アカウントが作成されました',
      uid: userRecord.uid
    }
  } catch (error: any) {
    console.error('❌ 管理者アカウント作成エラー:', error)

    // Firebase Authのエラーメッセージを日本語化
    let errorMessage = 'アカウント作成に失敗しました'
    if (error.code === 'auth/email-already-exists') {
      errorMessage = 'このメールアドレスは既に使用されています'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = '無効なメールアドレスです'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'パスワードが弱すぎます'
    }

    throw createError({
      statusCode: 400,
      message: errorMessage
    })
  }
})
