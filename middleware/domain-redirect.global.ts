export default defineNuxtRouteMiddleware((to) => {
  // サーバーサイドでのみ実行
  if (import.meta.server) {
    const host = useRequestHeaders()['host'] || ''

    // booking.furniturehouse1.com の場合、/booking にナビゲート
    if (host === 'booking.furniturehouse1.com') {
      // すでに /booking パスにいる場合は何もしない
      if (!to.path.startsWith('/booking')) {
        return navigateTo('/booking')
      }
      return
    }

    // chladni.co.jp の場合（サーバーミドルウェアで処理）
    if (host === 'chladni.co.jp' || host === 'www.chladni.co.jp') {
      return
    }
  }
})
