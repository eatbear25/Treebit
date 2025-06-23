'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Loader from './Loader'

// 未登入才可以看的頁面
export default function GuestGuard({ children }) {
  const { isAuthenticated, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.replace('/')
    }
  }, [initialized, isAuthenticated, router])

  if (!initialized || isAuthenticated) {
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    )
  }

  return children
}
