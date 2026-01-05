/**
 * オプション作成API
 * POST /api/admin/options
 */

import { FieldValue } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { name, description, price, imageUrl, dailyLimit, isActive, order } = body

    // バリデーション
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw createError({
        statusCode: 400,
        message: 'オプション名は必須です'
      })
    }

    if (typeof price !== 'number' || price < 0) {
      throw createError({
        statusCode: 400,
        message: '料金は0以上の数値で入力してください'
      })
    }

    if (typeof dailyLimit !== 'number' || dailyLimit < 1) {
      throw createError({
        statusCode: 400,
        message: '1日あたりの予約可能数は1以上で入力してください'
      })
    }

    const db = getFirestoreAdmin()

    const optionData = {
      name: name.trim(),
      description: description?.trim() || '',
      price: Math.floor(price),
      imageUrl: imageUrl || null,
      dailyLimit: Math.floor(dailyLimit),
      isActive: isActive ?? true,
      order: typeof order === 'number' ? order : 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }

    const docRef = await db.collection('bookingOptions').add(optionData)

    return {
      success: true,
      optionId: docRef.id,
      message: 'オプションを作成しました'
    }
  } catch (error: any) {
    console.error('オプション作成エラー:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'オプションの作成に失敗しました'
    })
  }
})
