export default defineNuxtRouteMiddleware(async (to, from) => {
  // SSR時はスキップ（クライアント側で処理）
  if (import.meta.server) {
    return
  }

  const { user, appUser, loading, isAdmin } = useAuth()

  // 認証状態の読み込み中は待機（最大10秒）
  let loadingAttempts = 0
  while (loading.value && loadingAttempts < 200) {
    await new Promise(resolve => setTimeout(resolve, 50))
    loadingAttempts++
  }

  // 未認証の場合はログインページへ
  if (!user.value) {
    return navigateTo('/login')
  }

  // appUserの読み込みを待つ（最大5秒）
  let attempts = 0
  while (!appUser.value && attempts < 100) {
    await new Promise(resolve => setTimeout(resolve, 50))
    attempts++
  }

  // 管理者でない場合はホームへリダイレクト
  if (!isAdmin.value) {
    console.warn('Access denied: User is not admin', {
      email: user.value?.email,
      role: appUser.value?.role
    })
    return navigateTo('/')
  }
})
