import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import type { User as AppUser } from '~/types'

export const useAuth = () => {
  const { $auth, $db } = useNuxtApp()
  const user = useState<User | null>('auth-user', () => null)
  const appUser = useState<AppUser | null>('app-user', () => null)
  const loading = useState('auth-loading', () => true)

  // 認証状態の監視
  const initAuth = () => {
    if (!$auth) {
      console.warn('[Auth] Firebase Auth is not initialized')
      loading.value = false
      user.value = null
      appUser.value = null
      return
    }

    onAuthStateChanged($auth, async (firebaseUser) => {
      user.value = firebaseUser

      if (firebaseUser && $db) {
        try {
          // Firestoreからユーザー情報を取得
          const userDoc = await getDoc(doc($db, 'users', firebaseUser.uid))
          if (userDoc.exists()) {
            appUser.value = {
              id: userDoc.id,
              uid: firebaseUser.uid,
              ...userDoc.data()
            } as AppUser
            console.log('[Auth] User loaded:', appUser.value.email, 'Role:', appUser.value.role)
          } else {
            console.warn('[Auth] User document not found in Firestore:', firebaseUser.uid)
            appUser.value = null
          }
        } catch (error) {
          console.error('[Auth] Failed to load user from Firestore:', error)
          appUser.value = null
        }
      } else {
        appUser.value = null
      }

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
      'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく待ってから再試行してください'
    }
    return messages[errorCode] || 'エラーが発生しました'
  }

  // 管理者かどうかをチェック
  const isAdmin = computed(() => appUser.value?.role === 'admin')

  return {
    user,
    appUser,
    loading,
    isAdmin,
    initAuth,
    login,
    signup,
    logout
  }
}
