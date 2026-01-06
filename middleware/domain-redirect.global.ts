export default defineNuxtRouteMiddleware((to) => {
  // サーバーサイドでのみ実行
  if (import.meta.server) {
    const host = useRequestHeaders()['host'] || ''

    // furniturehouse1.com (booking以外) でルートにアクセスした場合、/site にリダイレクト
    if (host === 'furniturehouse1.com' || host === 'www.furniturehouse1.com') {
      if (to.path === '/') {
        return navigateTo('/site', { redirectCode: 302 })
      }
    }

    // booking.furniturehouse1.com で /site にアクセスした場合、/ にリダイレクト
    if (host === 'booking.furniturehouse1.com') {
      if (to.path.startsWith('/site')) {
        return navigateTo('/', { redirectCode: 302 })
      }
    }

    // chladni.co.jp でルートにアクセスした場合、/chladni にリダイレクト
    if (host === 'chladni.co.jp' || host === 'www.chladni.co.jp') {
      if (to.path === '/') {
        return navigateTo('/chladni', { redirectCode: 302 })
      }
      // /chladni 以外のパスにアクセスした場合も /chladni にリダイレクト
      if (!to.path.startsWith('/chladni')) {
        return navigateTo('/chladni', { redirectCode: 302 })
      }
    }
  }
})
