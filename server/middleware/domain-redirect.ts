export default defineEventHandler((event) => {
  const host = getRequestHeader(event, 'host') || ''

  // booking.furniturehouse1.com の場合、/booking にリダイレクト
  if (host === 'booking.furniturehouse1.com') {
    const path = event.node.req.url || '/'

    // すでに /booking パスにいる場合は何もしない
    if (!path.startsWith('/booking')) {
      return sendRedirect(event, '/booking', 301)
    }
  }
})
