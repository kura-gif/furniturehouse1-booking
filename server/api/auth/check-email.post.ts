import { getAuthAdmin } from '~/server/utils/firebase-admin'
import { z } from 'zod'

const checkEmailSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください')
})

/**
 * メールアドレスが既に登録されているかチェックするAPI
 * ゲストユーザーが予約時に既存アカウントのメールを使用することを防ぐ
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // バリデーション
    const result = checkEmailSchema.safeParse(body)
    if (!result.success) {
      throw createError({
        statusCode: 400,
        message: result.error.errors[0]?.message || '無効なメールアドレスです'
      })
    }

    const { email } = result.data

    const auth = getAuthAdmin()

    try {
      // Firebase Authでメールアドレスが登録されているかチェック
      await auth.getUserByEmail(email)

      // ユーザーが見つかった場合、既に登録済み
      return {
        exists: true,
        message: 'このメールアドレスは既に登録されています。ログインしてください。'
      }
    } catch (error: any) {
      // ユーザーが見つからない場合はエラーがスローされる
      if (error.code === 'auth/user-not-found') {
        return {
          exists: false,
          message: ''
        }
      }

      // その他のエラー
      console.error('[API /auth/check-email] Error:', error)
      throw createError({
        statusCode: 500,
        message: 'メールアドレスの確認中にエラーが発生しました'
      })
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('[API /auth/check-email] Unexpected error:', error)
    throw createError({
      statusCode: 500,
      message: 'サーバーエラーが発生しました'
    })
  }
})
