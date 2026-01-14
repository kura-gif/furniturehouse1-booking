export default defineNuxtRouteMiddleware(() => {
  // サーバーサイドでのみ実行
  if (import.meta.server) {
    const host = useRequestHeaders()['host'] || ''

    // chladni.co.jp の場合（サーバーミドルウェアで処理）
    if (host === 'chladni.co.jp' || host === 'www.chladni.co.jp') {
      return
    }
  }
})
