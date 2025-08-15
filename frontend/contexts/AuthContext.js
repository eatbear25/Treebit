import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { getCurrentUser, logout as authLogout } from '../utils/auth'
import { useRouter } from 'next/navigation'

const AuthContext = createContext()
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必須在 AuthProvider 內使用')
  return ctx
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  // 先宣告 refreshUser，其他 hooks 再依賴它
  const refreshUser = useCallback(async () => {
    try {
      const res = await getCurrentUser()
      const u = res?.data?.user || null
      setUser(u)
      return u
    } catch (err) {
      setUser(null)
      throw err
    }
  }, [])

  const initializeAuth = useCallback(async () => {
    if (initialized) return
    try {
      await refreshUser()
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [initialized, refreshUser])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  // 登入後呼叫 refreshUser 取得 /me 狀態
  const login = useCallback(async () => {
    await refreshUser()
    if (!initialized) setInitialized(true)
  }, [initialized, refreshUser])

  const logout = useCallback(async () => {
    try {
      await authLogout()
    } catch (e) {
      console.error('登出失敗:', e)
    } finally {
      setUser(null)
      router.replace('/login')
    }
  }, [router])

  const value = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
