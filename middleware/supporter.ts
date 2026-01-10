export default defineNuxtRouteMiddleware(async (to, from) => {
  // SSR時はスキップ（クライアント側で処理）
  if (import.meta.server) {
    return
  }

  const { user, appUser, loading, isAdmin, initAuth } = useAuth()

  // 初期化を確実に行う
  initAuth()

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

  // 未認証の場合はログインページへ
  if (!user.value) {
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

  // サポーターまたは管理者でない場合はホームへリダイレクト
  const isSupporter = appUser.value?.role === 'supporter'
  if (!isSupporter && !isAdmin.value) {
    console.warn('Access denied: User is not supporter or admin', {
      email: user.value?.email,
      role: appUser.value?.role
    })
    return navigateTo('/')
  }
})
