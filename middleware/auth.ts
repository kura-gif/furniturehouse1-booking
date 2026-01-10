export default defineNuxtRouteMiddleware(async (to, from) => {
  // クライアントサイドでのみ実行
  if (import.meta.server) {
    return
  }

  const { user, loading, initAuth } = useAuth()

  // 認証を初期化（まだ初期化されていない場合）
  initAuth()

  // 認証状態の読み込みが完了するまで待機（最大5秒）
  if (loading.value) {
    let waitTime = 0
    const maxWait = 5000
    const interval = 100

    while (loading.value && waitTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, interval))
      waitTime += interval
    }
  }

  // 認証が必要なページで未認証の場合はログインページへリダイレクト
  if (!user.value) {
    // ログイン後に元のページに戻れるようにリダイレクトURLを保存
    const redirectUrl = to.fullPath
    return navigateTo({
      path: '/login',
      query: { redirect: redirectUrl }
    })
  }
})
