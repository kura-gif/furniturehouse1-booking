export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || ''

  // booking.furniturehouse1.com の場合、トップページのみ /booking にリダイレクト
  if (host === 'booking.furniturehouse1.com') {
    const path = event.node.req.url || '/'

    // 除外パス: admin, login, api, _nuxt などはリダイレクトしない
    const excludePaths = ['/admin', '/login', '/api', '/_nuxt', '/booking', '/mypage']
    const shouldExclude = excludePaths.some(p => path.startsWith(p))

    // トップページ（/）のみリダイレクト
    if (path === '/' && !shouldExclude) {
      return sendRedirect(event, '/booking', 301)
    }
  }
})
