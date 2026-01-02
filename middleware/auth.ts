export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

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
