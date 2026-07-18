import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useAuth } from './AuthContext'
import { API_BASE_URL } from '@/lib/api'

const FriendRequestsContext = createContext()

export const useFriendRequests = () => {
  const ctx = useContext(FriendRequestsContext)
  if (!ctx)
    throw new Error('useFriendRequests 必須在 FriendRequestsProvider 內使用')
  return ctx
}

// 待確認好友邀請：掛在 (main) layout，讓 Sidebar 紅點與好友頁共用同一份資料
export function FriendRequestsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [requests, setRequests] = useState([])

  const refreshRequests = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/requests`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) setRequests(data.data)
    } catch (err) {
      console.error('取得邀請列表錯誤:', err)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      refreshRequests()
    } else {
      setRequests([])
    }
  }, [isAuthenticated, refreshRequests])

  const value = {
    requests,
    pendingCount: requests.length,
    refreshRequests,
  }

  return (
    <FriendRequestsContext.Provider value={value}>
      {children}
    </FriendRequestsContext.Provider>
  )
}
