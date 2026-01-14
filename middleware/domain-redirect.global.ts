export default defineNuxtRouteMiddleware((to) => {
  // サーバーサイドでのみ実行
  if (import.meta.server) {
    const host = useRequestHeaders()['host'] || ''

    // booking.furniturehouse1.com でルート以外のパスにアクセスした場合、何もしない
    if (host === 'booking.furniturehouse1.com') {
      // /booking 以外のパスにいる場合は /booking にリダイレクト
      if (!to.path.startsWith('/booking') && !to.path.startsWith('/api')) {
        return navigateTo('/booking', { redirectCode: 301 })
      }
    }

    // chladni.co.jp の場合（サーバーミドルウェアで処理）
    if (host === 'chladni.co.jp' || host === 'www.chladni.co.jp') {
      return
    }
  }
})
