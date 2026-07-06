// components/GuestGuard.jsx

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Loader from './Loader'

export default function GuestGuard({ children }) {
  const { isAuthenticated, initialized } = useAuth()
  const router = useRouter()

  // ✅ 只在 initialized 完成後再跳轉
  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace('/habits')
    }
  }, [initialized, isAuthenticated, router])

  // 尚未確認登入狀態，或已登入正在導向 /habits：都顯示 loading，
  // 避免已登入者造訪 /login 時看到一片空白
  if (!initialized || isAuthenticated) {
    return (
      <div className="flex flex-col items-center gap-4 pt-20">
        <Loader />
        {initialized && isAuthenticated && (
          <p className="text-muted-foreground text-sm">
            你已登入，正在前往習慣管理⋯
          </p>
        )}
      </div>
    )
  }

  return children
}
