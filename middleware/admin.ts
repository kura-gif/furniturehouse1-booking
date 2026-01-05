export default defineNuxtRouteMiddleware(async (to, from) => {
  // SSR時はスキップ（クライアント側で処理）
  if (import.meta.server) {
    return
  }

  const { user, appUser, loading, isAdmin, initAuth } = useAuth()

  // 初期化を確実に行う
  initAuth()

  console.log('[Admin Middleware] Starting auth check, loading:', loading.value)

  // 認証状態の読み込み中は待機（最大15秒）
  let loadingAttempts = 0
  const maxAttempts = 300 // 15秒
  while (loading.value && loadingAttempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 50))
    loadingAttempts++
  }

  console.log('[Admin Middleware] Auth state after wait:', {
    user: user.value?.email,
    appUser: appUser.value?.email,
    role: appUser.value?.role,
    isAdmin: isAdmin.value,
    loading: loading.value,
    attempts: loadingAttempts
  })

  // 未認証の場合はログインページへ
  if (!user.value) {
    console.log('[Admin Middleware] No user, redirecting to login')
    return navigateTo('/login')
  }

  // appUserの読み込みを待つ（最大10秒）
  let attempts = 0
  const maxAppUserAttempts = 200 // 10秒
  while (!appUser.value && attempts < maxAppUserAttempts) {
    await new Promise(resolve => setTimeout(resolve, 50))
    attempts++
  }

  console.log('[Admin Middleware] AppUser state:', {
    appUser: appUser.value?.email,
    role: appUser.value?.role,
    attempts
  })

  // 管理者でない場合はホームへリダイレクト
  if (!isAdmin.value) {
    console.warn('[Admin Middleware] Access denied: User is not admin', {
      email: user.value?.email,
      role: appUser.value?.role
    })
    return navigateTo('/')
  }

  console.log('[Admin Middleware] Access granted for:', user.value?.email)
})
