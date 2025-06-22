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
      // 直接向伺服器確認 token 是否有效（httpOnly cookie 會自動送出）
      const userData = await getCurrentUser()
      setUser(userData.data.user)
    } catch (error) {
      console.error('初始化認證失敗:', error)
      // 如果驗證失敗，設為未登入狀態
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
      // 清除前端狀態，httpOnly cookie 會由後端清除
      setUser(null)
    }
  }

  // 刷新用戶資料的方法
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
