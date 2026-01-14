export default defineNuxtRouteMiddleware(() => {
  // サーバーサイドでのみ実行
  if (import.meta.server) {
    const host = useRequestHeaders()['host'] || ''

    // booking.furniturehouse1.com の場合、リダイレクトしない
    if (host === 'booking.furniturehouse1.com') {
      return
    }

    // chladni.co.jp の場合（サーバーミドルウェアで処理）
    if (host === 'chladni.co.jp' || host === 'www.chladni.co.jp') {
      return
    }
  }
})
