import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, logout as authLogout } from '../utils/auth'

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

  // 初始化時檢查登入狀態
  useEffect(() => {
    initializeAuth()
  }, [])

  async function initializeAuth() {
    try {
      // 如果是登入/註冊頁面，跳過驗證
      const currentPath = window.location.pathname
      const isAuthPage =
        currentPath === '/login' ||
        currentPath === '/register' ||
        currentPath.startsWith('/auth')

      if (isAuthPage) {
        setUser(null)
        setLoading(false)
        return
      }

      const userData = await getCurrentUser()
      setUser(userData.data.user)
    } catch (error) {
      if (
        error.message === '請先登入以繼續使用' ||
        error.status === 401 ||
        error.message.includes('未授權') ||
        error.message.includes('token')
      ) {
        console.log('用戶未登入，設為未登入狀態')
      } else {
        console.error('初始化認證時發生意外錯誤:', error)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (userData) => {
    // 登入成功後更新狀態，token 已經存在 httpOnly cookie 中
    setUser(userData.user)
  }

  const logout = async () => {
    try {
      await authLogout()
    } catch (error) {
      console.error('登出請求失敗:', error)
    } finally {
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData.data.user)
    } catch (error) {
      console.error('刷新用戶資料失敗:', error)
      setUser(null)
    }
  }

  const value = {
    user,
    login,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
