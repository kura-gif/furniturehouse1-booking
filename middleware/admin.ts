export default defineNuxtRouteMiddleware(async (to, from) => {
  const { user, appUser, loading, isAdmin } = useAuth()

  // 認証状態の読み込み中は待機
  while (loading.value) {
    await new Promise(resolve => setTimeout(resolve, 50))
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
