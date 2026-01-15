/**
 * セキュアな予約作成API
 * - トランザクションによる同時予約防止
 * - サーバーサイド金額検証
 * - 入力値の厳格なバリデーション
 */

import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import type { CreateBookingInput } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  let rawBody: any = null

  try {
    // 1. リクエストボディを取得
    rawBody = await readBody(event)

    // 2. 入力検証
    const validatedData = validateInput(createBookingSchema, rawBody)

    // 3. Firebase Admin初期化
    const db = getFirestoreAdmin()

    // 4. 料金設定を取得
    const pricingDoc = await db.collection('pricing').doc('default').get()
    const pricingRule = pricingDoc.exists
      ? (pricingDoc.data() as PricingRule)
      : DEFAULT_PRICING

    // 5. クーポン割引を計算
    let couponDiscount = 0
    let couponId = ''
    if (validatedData.couponCode) {
      const couponSnapshot = await db
        .collection('coupons')
        .where('code', '==', validatedData.couponCode)
        .where('isActive', '==', true)
        .limit(1)
        .get()

      if (!couponSnapshot.empty) {
        const coupon = couponSnapshot.docs[0].data()
        couponId = couponSnapshot.docs[0].id

        // クーポン有効期限チェック
        if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
          throw createError({
            statusCode: 400,
            message: 'クーポンの有効期限が切れています',
          })
        }

        // 使用回数制限チェック
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          throw createError({
            statusCode: 400,
            message: 'クーポンの使用回数が上限に達しています',
          })
        }

        couponDiscount = coupon.discountAmount || 0
      } else {
        throw createError({
          statusCode: 400,
          message: '無効なクーポンコードです',
        })
      }
    }

    // 6. サーバーサイドで金額を再計算
    const calculatedAmount = calculateBookingAmount(
      new Date(validatedData.checkInDate),
      new Date(validatedData.checkOutDate),
      validatedData.guestCount,
      pricingRule,
      couponDiscount
    )

    // 7. クライアントから送信された金額と検証（改ざん防止）
    if (validatedData.amount && !validateAmount(calculatedAmount, validatedData.amount)) {
      console.error('金額の不一致:', {
        calculated: calculatedAmount,
        client: validatedData.amount,
      })
      throw createError({
        statusCode: 400,
        message: '金額の検証に失敗しました。ページを再読み込みしてください。',
      })
    }

    // 8. トランザクションで予約を作成（同時予約防止）
    const result = await db.runTransaction(async (transaction) => {
      const checkInDate = Timestamp.fromDate(new Date(validatedData.checkInDate))
      const checkOutDate = Timestamp.fromDate(new Date(validatedData.checkOutDate))

      // 8-1. 同じ期間の予約を検索
      const conflictingBookingsRef = db
        .collection('bookings')
        .where('status', 'in', ['pending', 'confirmed'])
        .where('checkInDate', '<', checkOutDate)
        .where('checkOutDate', '>', checkInDate)

      const conflictingBookings = await transaction.get(conflictingBookingsRef)

      // 8-2. 重複があればエラー
      if (!conflictingBookings.empty) {
        throw new Error('この期間は既に予約されています。別の日程をお選びください。')
      }

      // 8-3. 予約データを作成
      const bookingRef = db.collection('bookings').doc()
      const bookingData = {
        checkInDate,
        checkOutDate,
        guestName: validatedData.guestName,
        guestEmail: validatedData.guestEmail,
        guestPhone: validatedData.guestPhone,
        guestCount: validatedData.guestCount,
        notes: validatedData.notes || '',

        // 金額情報
        totalAmount: calculatedAmount,
        baseAmount: calculatedAmount + couponDiscount - pricingRule.cleaningFee,
        cleaningFee: pricingRule.cleaningFee,
        couponDiscount,
        couponId,
        couponCode: validatedData.couponCode || '',

        // ステータス
        status: 'pending',
        paymentStatus: 'pending',

        // 審査ステータス（与信確保後に審査開始）
        reviewStatus: 'pending_review',
        reviewDeadline: Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000)), // 48時間後

        // システム情報
        bookingReference: generateBookingReference(),
        bookingToken: generateSecureToken(),
        stripePaymentIntentId: '', // 後で設定

        // タイムスタンプ
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }

      transaction.set(bookingRef, bookingData)

      // クーポン使用回数を増加
      if (couponId) {
        const couponRef = db.collection('coupons').doc(couponId)
        transaction.update(couponRef, {
          usedCount: FieldValue.increment(1),
        })
      }

      return {
        bookingId: bookingRef.id,
        bookingReference: bookingData.bookingReference,
        amount: calculatedAmount,
      }
    })

    // 9. 管理者に新規予約通知メールを送信
    try {
      const checkIn = new Date(validatedData.checkInDate)
      const checkOut = new Date(validatedData.checkOutDate)

      await $fetch('/api/emails/send-admin-notification', {
        method: 'POST',
        headers: {
          'x-internal-secret': config.internalApiSecret,
        },
        body: {
          type: 'new_booking_request',
          bookingId: result.bookingId,
          bookingReference: result.bookingReference,
          guestName: validatedData.guestName,
          guestEmail: validatedData.guestEmail,
          guestPhone: validatedData.guestPhone || '',
          checkInDate: `${checkIn.getFullYear()}年${checkIn.getMonth() + 1}月${checkIn.getDate()}日`,
          checkOutDate: `${checkOut.getFullYear()}年${checkOut.getMonth() + 1}月${checkOut.getDate()}日`,
          guestCount: validatedData.guestCount,
          totalAmount: calculatedAmount,
          notes: validatedData.notes || '',
        },
      })
      console.log('✅ 管理者通知メール送信成功')
    } catch (emailError) {
      // メール送信失敗は予約作成の成功に影響させない
      console.error('⚠️ 管理者通知メール送信失敗:', emailError)
    }

    // 10. 成功レスポンス
    console.log('✅ 予約作成成功:', result)

    return {
      success: true,
      bookingId: result.bookingId,
      bookingReference: result.bookingReference,
      amount: result.amount,
    }
  } catch (error: any) {
    console.error('❌ 予約作成エラー:', error)

    // エラーログをFirestoreに記録（オプション）
    try {
      const db = getFirestoreAdmin()
      await db.collection('errorLogs').add({
        type: 'booking_creation_failed',
        error: error.message,
        stack: error.stack,
        timestamp: FieldValue.serverTimestamp(),
        requestBody: rawBody,
      })
    } catch (logError) {
      console.error('エラーログ記録失敗:', logError)
    }

    // クライアントへのエラーレスポンス
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || '予約の作成に失敗しました',
    })
  }
})
