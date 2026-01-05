/**
 * オプション更新API
 * PUT /api/admin/options/:id
 */

import { FieldValue } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  try {
    const optionId = getRouterParam(event, 'id')
    if (!optionId) {
      throw createError({
        statusCode: 400,
        message: 'オプションIDが必要です'
      })
    }

    const body = await readBody(event)
    const { name, description, price, imageUrl, dailyLimit, isActive, order } = body

    const db = getFirestoreAdmin()

    // オプションの存在確認
    const optionRef = db.collection('bookingOptions').doc(optionId)
    const optionDoc = await optionRef.get()

    if (!optionDoc.exists) {
      throw createError({
        statusCode: 404,
        message: 'オプションが見つかりません'
      })
    }

    // 更新データを構築
    const updateData: Record<string, any> = {
      updatedAt: FieldValue.serverTimestamp()
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        throw createError({
          statusCode: 400,
          message: 'オプション名は必須です'
        })
      }
      updateData.name = name.trim()
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || ''
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        throw createError({
          statusCode: 400,
          message: '料金は0以上の数値で入力してください'
        })
      }
      updateData.price = Math.floor(price)
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl || null
    }

    if (dailyLimit !== undefined) {
      if (typeof dailyLimit !== 'number' || dailyLimit < 1) {
        throw createError({
          statusCode: 400,
          message: '1日あたりの予約可能数は1以上で入力してください'
        })
      }
      updateData.dailyLimit = Math.floor(dailyLimit)
    }

    if (isActive !== undefined) {
      updateData.isActive = !!isActive
    }

    if (order !== undefined) {
      updateData.order = typeof order === 'number' ? order : 0
    }

    await optionRef.update(updateData)

    return {
      success: true,
      message: 'オプションを更新しました'
    }
  } catch (error: any) {
    console.error('オプション更新エラー:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'オプションの更新に失敗しました'
    })
  }
})
