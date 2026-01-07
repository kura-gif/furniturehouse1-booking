export default defineEventHandler((event) => {
  const host = getHeader(event, 'host') || ''
  const path = event.path || '/'

  // chladni.co.jp でルートにアクセスした場合、内部的に /chladni にリライト
  if (host === 'chladni.co.jp' || host === 'www.chladni.co.jp') {
    if (path === '/') {
      event.node.req.url = '/chladni'
      event._path = '/chladni'
    }
  }
})
