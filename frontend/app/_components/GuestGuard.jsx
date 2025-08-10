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

  if (!initialized) {
    return (
      <div className="flex justify-center pt-20">
        <Loader />
      </div>
    )
  }

  if (isAuthenticated) return null

  return children
}
