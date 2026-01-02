export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isAdmin } = useAuth()

  // 未認証の場合はログインページへ
  if (!user.value) {
    return navigateTo('/login')
  }

  // 管理者でない場合はホームへリダイレクト
  if (!isAdmin.value) {
    return navigateTo('/')
  }
})
