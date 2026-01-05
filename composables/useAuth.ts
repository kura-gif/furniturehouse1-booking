import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User
} from 'firebase/auth'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import type { User as AppUser } from '~/types'

export const useAuth = () => {
  const { $auth, $db } = useNuxtApp()
  const user = useState<User | null>('auth-user', () => null)
  const appUser = useState<AppUser | null>('app-user', () => null)
  const loading = useState('auth-loading', () => true)
  const initialized = useState('auth-initialized', () => false)

  // 認証状態の監視
  const initAuth = () => {
    // 既に初期化済みの場合はスキップ
    if (initialized.value) {
      console.log('[Auth] Already initialized, skipping')
      return
    }

    console.log('[Auth] initAuth called. Has $auth:', !!$auth)

    if (!$auth) {
      console.warn('[Auth] Firebase Auth is not initialized')
      loading.value = false
      user.value = null
      appUser.value = null
      return
    }

    initialized.value = true

    // タイムアウト設定（10秒後に強制的にloading = false）
    const timeout = setTimeout(() => {
      if (loading.value) {
        console.warn('[Auth] Auth initialization timeout - forcing loading = false')
        loading.value = false
      }
    }, 10000)

    onAuthStateChanged($auth, async (firebaseUser) => {
      clearTimeout(timeout) // 正常に完了したらタイムアウトをクリア
      console.log('[Auth] onAuthStateChanged:', firebaseUser?.email || 'no user')
      user.value = firebaseUser

      if (firebaseUser) {
        console.log('[Auth] Starting user fetch for:', firebaseUser.uid)
        try {
          // サーバーAPIを使ってユーザー情報を取得（クライアントFirestoreの問題を回避）
          const idToken = await firebaseUser.getIdToken()
          console.log('[Auth] Got ID token, fetching user from API...')

          const response = await fetch('/api/auth/user', {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          })

          if (response.ok) {
            const data = await response.json()
            console.log('[Auth] API response:', data)
            if (data.success && data.user) {
              appUser.value = data.user as AppUser
              console.log('[Auth] User loaded:', appUser.value.email, 'Role:', appUser.value.role)
            } else {
              console.warn('[Auth] User not found in database')
              appUser.value = null
            }
          } else {
            const errorText = await response.text()
            console.error('[Auth] API error:', response.status, response.statusText, errorText)
            appUser.value = null
          }
        } catch (error) {
          console.error('[Auth] Failed to load user:', error)
          appUser.value = null
        }
      } else {
        console.log('[Auth] No firebaseUser, skipping user fetch')
        appUser.value = null
      }

      console.log('[Auth] Setting loading to false')
      loading.value = false
    })
  }

  // ログイン
  const login = async (email: string, password: string) => {
    if (!$auth) throw new Error('Firebase Auth is not initialized')

    try {
      const userCredential = await signInWithEmailAndPassword($auth, email, password)
      return userCredential.user
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(getErrorMessage(error.code))
    }
  }

  // サインアップ
  const signup = async (email: string, password: string, displayName: string, role: 'user' | 'admin' = 'user') => {
    if (!$auth || !$db) throw new Error('Firebase is not initialized')

    try {
      const userCredential = await createUserWithEmailAndPassword($auth, email, password)
      const user = userCredential.user

      // Firestoreにユーザー情報を保存
      const now = Timestamp.now()
      const userData: Omit<AppUser, 'id'> = {
        email: user.email!,
        displayName,
        role,
        createdAt: now,
        updatedAt: now
      }

      await setDoc(doc($db, 'users', user.uid), userData)

      return user
    } catch (error: any) {
      console.error('Signup error:', error)
      throw new Error(getErrorMessage(error.code))
    }
  }

  // ログアウト
  const logout = async () => {
    if (!$auth) throw new Error('Firebase Auth is not initialized')

    try {
      await signOut($auth)
      user.value = null
      appUser.value = null
      navigateTo('/')
    } catch (error: any) {
      console.error('Logout error:', error)
      throw new Error('ログアウトに失敗しました')
    }
  }

  // パスワードリセット
  const resetPassword = async (email: string) => {
    if (!$auth) throw new Error('Firebase Auth is not initialized')

    try {
      await sendPasswordResetEmail($auth, email)
    } catch (error: any) {
      console.error('Password reset error:', error)
      throw new Error(getErrorMessage(error.code))
    }
  }

  // エラーメッセージの日本語化
  const getErrorMessage = (errorCode: string): string => {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
      'auth/invalid-email': 'メールアドレスの形式が正しくありません',
      'auth/operation-not-allowed': 'この操作は許可されていません',
      'auth/weak-password': 'パスワードは6文字以上で設定してください',
      'auth/user-disabled': 'このアカウントは無効化されています',
      'auth/user-not-found': 'メールアドレスまたはパスワードが間違っています',
      'auth/wrong-password': 'メールアドレスまたはパスワードが間違っています',
      'auth/invalid-credential': 'メールアドレスまたはパスワードが間違っています',
      'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください',
      'auth/missing-email': 'メールアドレスを入力してください'
    }
    return messages[errorCode] || 'エラーが発生しました'
  }

  // 管理者かどうかをチェック
  const isAdmin = computed(() => appUser.value?.role === 'admin')

  // IDトークンを取得
  const getIdToken = async (): Promise<string | null> => {
    if (!user.value) return null
    try {
      return await user.value.getIdToken()
    } catch (error) {
      console.error('[Auth] Failed to get ID token:', error)
      return null
    }
  }

  // 認証付きfetch
  const fetchWithAuth = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const token = await getIdToken()
    if (!token) {
      throw new Error('認証が必要です')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `HTTP error ${response.status}`)
    }

    return response.json()
  }

  return {
    user,
    appUser,
    loading,
    isAdmin,
    initAuth,
    login,
    signup,
    logout,
    resetPassword,
    getIdToken,
    fetchWithAuth
  }
}
