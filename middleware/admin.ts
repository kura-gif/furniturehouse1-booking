export default defineNuxtRouteMiddleware(async (to, from) => {
  // SSR時はスキップ（クライアント側で処理）
  if (import.meta.server) {
    return
  }

  const { user, appUser, loading, isAdmin, initAuth } = useAuth()

  // 初期化を確実に行う
  initAuth()

  console.log('[Admin Middleware] Starting auth check, loading:', loading.value)

  // 認証状態の読み込み中は待機（watchを使用して非ブロッキング）
  if (loading.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(loading, (newLoading) => {
        if (!newLoading) {
          unwatch()
          resolve()
        }
      }, { immediate: true })
      // タイムアウト（5秒）
      setTimeout(() => {
        unwatch()
        resolve()
      }, 5000)
    })
  }

  console.log('[Admin Middleware] Auth state after wait:', {
    user: user.value?.email,
    appUser: appUser.value?.email,
    role: appUser.value?.role,
    isAdmin: isAdmin.value,
    loading: loading.value
  })

  // 未認証の場合はログインページへ
  if (!user.value) {
    console.log('[Admin Middleware] No user, redirecting to login')
    return navigateTo('/login')
  }

  // appUserの読み込みを待つ（watchを使用して非ブロッキング）
  if (!appUser.value) {
    await new Promise<void>((resolve) => {
      const unwatch = watch(appUser, (newAppUser) => {
        if (newAppUser) {
          unwatch()
          resolve()
        }
      }, { immediate: true })
      // タイムアウト（3秒）
      setTimeout(() => {
        unwatch()
        resolve()
      }, 3000)
    })
  }

  console.log('[Admin Middleware] AppUser state:', {
    appUser: appUser.value?.email,
    role: appUser.value?.role
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
