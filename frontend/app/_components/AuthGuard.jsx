'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Loader from './Loader'

// 登入才能看的頁面
export default function AuthGuard({ children }) {
  const { isAuthenticated, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace('/login')
    }
  }, [initialized, isAuthenticated, router])

  if (!initialized || !isAuthenticated) {
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    )
  }

  return children
}
