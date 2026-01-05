/**
 * ゲストによるセルフキャンセルAPIエンドポイント
 * キャンセルポリシーに基づいて自動返金処理を行う
 *
 * POST /api/bookings/guest-cancel
 * Body: { bookingId: string }
 */

import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'

// キャンセルポリシールール
interface CancellationPolicyRule {
  daysBeforeCheckIn: number
  refundPercentage: number
}

// キャンセルポリシー
interface CancellationPolicy {
  name: string
  rules: CancellationPolicyRule[]
  isActive: boolean
}

// デフォルトポリシー
const defaultPolicy: CancellationPolicy = {
  name: '標準',
  rules: [
    { daysBeforeCheckIn: 5, refundPercentage: 100 },
    { daysBeforeCheckIn: 3, refundPercentage: 50 },
    { daysBeforeCheckIn: 0, refundPercentage: 0 }
  ],
  isActive: true
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)

  try {
    const body = await readBody(event)
    const { bookingId, userId } = body

    if (!bookingId) {
      throw createError({
        statusCode: 400,
        message: '予約IDが必要です',
      })
    }

    const db = getFirestoreAdmin()

    // 1. 予約情報を取得
    const bookingDoc = await db.collection('bookings').doc(bookingId).get()

    if (!bookingDoc.exists) {
      throw createError({
        statusCode: 404,
        message: '予約が見つかりません',
      })
    }

    const booking = bookingDoc.data()!

    // 2. ユーザー権限チェック（ゲスト本人か確認）
    if (userId && booking.userId !== userId) {
      throw createError({
        statusCode: 403,
        message: 'この予約をキャンセルする権限がありません',
      })
    }

    // 3. キャンセル可能かチェック
    if (booking.status === 'cancelled' || booking.status === 'refunded') {
      throw createError({
        statusCode: 400,
        message: 'この予約は既にキャンセル済みです',
      })
    }

    if (booking.status === 'completed') {
      throw createError({
        statusCode: 400,
        message: '完了済みの予約はキャンセルできません',
      })
    }

    // 4. キャンセルポリシーを取得
    let policy = defaultPolicy
    const policiesSnapshot = await db.collection('cancellationPolicies')
      .where('isActive', '==', true)
      .limit(1)
      .get()

    if (!policiesSnapshot.empty) {
      const policyData = policiesSnapshot.docs[0].data() as CancellationPolicy
      policy = policyData
    }

    // 5. チェックイン日までの日数を計算
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    let checkInDate: Date
    if (booking.startDate && booking.startDate.toDate) {
      checkInDate = booking.startDate.toDate()
    } else if (booking.checkInDate && booking.checkInDate.toDate) {
      checkInDate = booking.checkInDate.toDate()
    } else {
      throw createError({
        statusCode: 400,
        message: 'チェックイン日が設定されていません',
      })
    }
    checkInDate.setHours(0, 0, 0, 0)

    const diffTime = checkInDate.getTime() - now.getTime()
    const daysBeforeCheckIn = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // チェックイン後はキャンセル不可
    if (daysBeforeCheckIn < 0) {
      throw createError({
        statusCode: 400,
        message: 'チェックイン後の予約はキャンセルできません',
      })
    }

    // 6. 適用されるルールを取得
    const sortedRules = [...policy.rules].sort((a, b) => b.daysBeforeCheckIn - a.daysBeforeCheckIn)

    let appliedRule = { daysBeforeCheckIn: 0, refundPercentage: 0 }
    for (const rule of sortedRules) {
      if (daysBeforeCheckIn >= rule.daysBeforeCheckIn) {
        appliedRule = rule
        break
      }
    }

    // 7. 返金額を計算
    const totalAmount = booking.totalAmount || 0
    const refundPercentage = appliedRule.refundPercentage
    const refundAmount = Math.floor(totalAmount * (refundPercentage / 100))

    console.log('🔄 Guest self-cancel:', {
      bookingId,
      daysBeforeCheckIn,
      refundPercentage,
      refundAmount,
    })

    // 8. 返金処理（支払い済みの場合）
    let refundResult = null
    if (booking.paymentStatus === 'paid' && booking.stripePaymentIntentId && refundAmount > 0) {
      try {
        // Chargeを取得
        const charges = await stripe.charges.list({
          payment_intent: booking.stripePaymentIntentId,
          limit: 1,
        })

        if (charges.data.length > 0) {
          const charge = charges.data[0]
          const availableForRefund = charge.amount - charge.amount_refunded

          if (refundAmount <= availableForRefund) {
            const refund = await stripe.refunds.create({
              charge: charge.id,
              amount: refundAmount,
              reason: 'requested_by_customer',
              metadata: {
                bookingId,
                bookingReference: booking.bookingReference || '',
                cancelType: 'guest_self_cancel',
                daysBeforeCheckIn: String(daysBeforeCheckIn),
              },
            })

            refundResult = {
              refundId: refund.id,
              amount: refund.amount,
              status: refund.status,
            }

            console.log('✅ Stripe refund created:', refundResult)
          }
        }
      } catch (stripeError: any) {
        console.error('⚠️ Stripe refund error:', stripeError.message)
        // 返金失敗してもキャンセル自体は続行
      }
    }

    // 9. 予約ステータスを更新
    const isFullRefund = refundAmount === totalAmount
    const updateData: any = {
      status: 'cancelled',
      cancelledAt: FieldValue.serverTimestamp(),
      cancelledBy: 'guest',
      cancelReason: 'ゲストによるセルフキャンセル',
      refundPercentage,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (refundResult) {
      updateData.paymentStatus = isFullRefund ? 'refunded' : 'paid'
      updateData.refundAmount = refundAmount
      updateData.refundId = refundResult.refundId
      updateData.refundedAt = FieldValue.serverTimestamp()
    }

    await bookingDoc.ref.update(updateData)

    // 10. キャンセルログを記録
    await db.collection('cancellationLogs').add({
      bookingId,
      bookingReference: booking.bookingReference,
      guestEmail: booking.guestEmail,
      guestName: booking.guestName,
      cancelledBy: 'guest',
      daysBeforeCheckIn,
      refundPercentage,
      refundAmount,
      policyName: policy.name,
      createdAt: FieldValue.serverTimestamp(),
    })

    // 11. キャンセル確認メールを送信
    try {
      const baseUrl = config.public.siteUrl || 'http://localhost:3000'
      if (refundAmount > 0) {
        await $fetch(`${baseUrl}/api/emails/send-refund-confirmation`, {
          method: 'POST',
          headers: {
            'x-internal-secret': config.internalApiSecret,
          },
          body: {
            to: booking.guestEmail,
            bookingReference: booking.bookingReference,
            guestName: booking.guestName,
            refundAmount: refundAmount,
          },
        })
      }
    } catch (emailError: any) {
      console.error('⚠️ Email send error:', emailError.message)
    }

    return {
      success: true,
      message: 'キャンセルが完了しました',
      booking: {
        id: bookingId,
        status: 'cancelled',
      },
      refund: {
        percentage: refundPercentage,
        amount: refundAmount,
        processed: !!refundResult,
      },
      policy: {
        name: policy.name,
        daysBeforeCheckIn,
        appliedRule,
      },
    }
  } catch (error: any) {
    console.error('❌ Guest cancel error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'キャンセル処理に失敗しました',
    })
  }
})
