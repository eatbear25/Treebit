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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth 必須在 AuthProvider 內使用')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()

  // 初始化認證狀態
  const initializeAuth = useCallback(async () => {
    if (initialized) return

    try {
      const userData = await getCurrentUser()
      setUser(userData.data.user)
    } catch (error) {
      // 處理認證錯誤
      if (
        error.message === '請先登入以繼續使用' ||
        error.status === 401 ||
        error.message.includes('未授權') ||
        error.message.includes('token')
      ) {
        console.log('用戶未登入')
      } else {
        console.error('初始化認證時發生意外錯誤:', error)
      }
      setUser(null)
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [initialized])

  // 初始化效果
  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const login = useCallback(
    async (userData) => {
      setUser(userData.user)
      if (!initialized) {
        setInitialized(true)
      }
    },
    [initialized]
  )

  const logout = useCallback(async () => {
    try {
      await authLogout()
    } catch (error) {
      console.error('登出請求失敗:', error)
    } finally {
      setUser(null)
      // 登出後導向登入頁面
      router.replace('/login')
    }
  }, [router])

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData.data.user)
      return userData.data.user
    } catch (error) {
      console.error('刷新用戶資料失敗:', error)
      setUser(null)
      throw error
    }
  }, [])

  const value = {
    user,
    login,
    logout,
    refreshUser,
    loading,
    initialized,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
