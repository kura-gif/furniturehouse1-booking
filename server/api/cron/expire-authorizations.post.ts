/**
 * 定期実行: 与信期限切れ予約の自動処理
 *
 * 毎日実行して、審査待ち（pending_review）状態で72時間以上経過した予約を
 * 自動的にキャンセルし、管理者に通知する
 *
 * Stripeの与信（Authorization Hold）は7日間で期限切れになるため、
 * 余裕を持って72時間で警告、168時間（7日）で強制キャンセル
 *
 * POST /api/cron/expire-authorizations
 * Headers: x-cron-secret: <CRON_SECRET>
 */

import Stripe from 'stripe'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirestoreAdmin } from '~/server/utils/firebase-admin'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Cron認証チェック
  const vercelCronAuth = getHeader(event, 'authorization')
  const cronSecret = getHeader(event, 'x-cron-secret')
  const isVercelCron = vercelCronAuth === `Bearer ${config.cronSecret}`
  const isCustomCron = cronSecret === config.cronSecret

  if (!isVercelCron && !isCustomCron) {
    throw createError({
      statusCode: 401,
      message: '認証が必要です'
    })
  }

  const db = getFirestoreAdmin()
  const stripe = new Stripe(config.stripeSecretKey)

  const results = {
    processed: 0,
    warned: 0,
    cancelled: 0,
    errors: [] as string[]
  }

  try {
    const now = new Date()

    // 72時間前の時刻を計算（警告対象）
    const warningThreshold = new Date(now.getTime() - 72 * 60 * 60 * 1000)

    // 168時間（7日）前の時刻を計算（強制キャンセル対象）
    const cancelThreshold = new Date(now.getTime() - 168 * 60 * 60 * 1000)

    // 審査待ち（pending_review）状態の予約を取得
    const pendingBookings = await db.collection('bookings')
      .where('status', '==', 'pending_review')
      .where('paymentStatus', '==', 'authorized')
      .get()

    console.log(`📋 Found ${pendingBookings.size} pending review bookings`)

    for (const doc of pendingBookings.docs) {
      const booking = doc.data()
      const bookingId = doc.id
      results.processed++

      // 予約作成日時を取得
      const createdAt = booking.createdAt?.toDate?.() || new Date(booking.createdAt)

      try {
        // 7日以上経過：強制キャンセル
        if (createdAt < cancelThreshold) {
          console.log(`❌ Force cancelling expired booking: ${booking.bookingReference}`)

          // Stripeの与信をキャンセル（期限切れの場合は既にキャンセルされている可能性あり）
          if (booking.stripePaymentIntentId) {
            try {
              await stripe.paymentIntents.cancel(booking.stripePaymentIntentId)
            } catch (stripeError: any) {
              // 既にキャンセル済みまたは期限切れの場合はエラーを無視
              if (!stripeError.message?.includes('cannot be canceled')) {
                throw stripeError
              }
              console.log(`ℹ️ PaymentIntent already cancelled or expired: ${booking.stripePaymentIntentId}`)
            }
          }

          // 予約ステータスを更新
          await doc.ref.update({
            status: 'cancelled',
            paymentStatus: 'authorization_expired',
            cancelledAt: FieldValue.serverTimestamp(),
            cancelReason: 'authorization_expired',
            updatedAt: FieldValue.serverTimestamp()
          })

          // 管理者に通知メール
          try {
            await $fetch('/api/emails/send-admin-notification', {
              method: 'POST',
              headers: {
                'x-internal-secret': config.internalApiSecret
              },
              body: {
                subject: `【重要】与信期限切れによる予約自動キャンセル: ${booking.bookingReference}`,
                message: `
以下の予約が与信期限切れにより自動キャンセルされました。

予約番号: ${booking.bookingReference}
ゲスト名: ${booking.guestName}
ゲストEmail: ${booking.guestEmail}
チェックイン: ${booking.checkInDate?.toDate?.()?.toLocaleDateString('ja-JP') || 'N/A'}
作成日時: ${createdAt.toLocaleString('ja-JP')}
経過時間: ${Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))}時間

与信は7日間で期限切れとなるため、審査待ちのまま放置された予約は自動キャンセルされます。
                `.trim()
              }
            })
          } catch (emailError) {
            console.error('Failed to send admin notification:', emailError)
          }

          // ゲストにキャンセル通知
          try {
            await $fetch('/api/emails/send-booking-cancelled', {
              method: 'POST',
              headers: {
                'x-internal-secret': config.internalApiSecret
              },
              body: {
                to: booking.guestEmail,
                bookingReference: booking.bookingReference,
                guestName: booking.guestName,
                reason: '与信期間が経過したため、予約が自動キャンセルされました。再度ご予約をお願いいたします。'
              }
            })
          } catch (emailError) {
            console.error('Failed to send guest cancellation email:', emailError)
          }

          results.cancelled++

        // 72時間以上経過（まだ7日未満）：警告通知
        } else if (createdAt < warningThreshold && !booking.authorizationWarningNotified) {
          console.log(`⚠️ Warning for booking nearing expiration: ${booking.bookingReference}`)

          const hoursElapsed = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
          const hoursRemaining = 168 - hoursElapsed

          // 管理者に警告メール
          try {
            await $fetch('/api/emails/send-admin-notification', {
              method: 'POST',
              headers: {
                'x-internal-secret': config.internalApiSecret
              },
              body: {
                subject: `【警告】審査待ち予約の与信期限が近づいています: ${booking.bookingReference}`,
                message: `
以下の予約が審査待ちのまま72時間以上経過しています。

予約番号: ${booking.bookingReference}
ゲスト名: ${booking.guestName}
ゲストEmail: ${booking.guestEmail}
チェックイン: ${booking.checkInDate?.toDate?.()?.toLocaleDateString('ja-JP') || 'N/A'}
作成日時: ${createdAt.toLocaleString('ja-JP')}
経過時間: ${hoursElapsed}時間
残り時間: 約${hoursRemaining}時間

与信は7日間で期限切れとなります。
期限切れになると予約は自動キャンセルされますので、早めに審査をお願いいたします。

管理画面: ${config.public.siteUrl}/admin/bookings
                `.trim()
              }
            })
          } catch (emailError) {
            console.error('Failed to send warning notification:', emailError)
          }

          // 警告通知済みフラグを設定
          await doc.ref.update({
            authorizationWarningNotified: true,
            authorizationWarningNotifiedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
          })

          results.warned++
        }
      } catch (error: any) {
        results.errors.push(`${booking.bookingReference}: ${error.message}`)
        console.error(`❌ Error processing booking ${booking.bookingReference}:`, error.message)
      }
    }

    console.log(`✅ Authorization expiry check complete: ${results.warned} warned, ${results.cancelled} cancelled`)

    return {
      success: true,
      message: `与信期限チェック完了: ${results.warned}件警告, ${results.cancelled}件キャンセル`,
      results
    }
  } catch (error: any) {
    console.error('❌ Authorization expiry cron error:', error)
    throw createError({
      statusCode: 500,
      message: error.message || '与信期限チェックに失敗しました'
    })
  }
})
