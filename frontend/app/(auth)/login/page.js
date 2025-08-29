'use client'

import Link from 'next/link'

import GuestGuard from '@/app/_components/GuestGuard'
import { LoginForm } from '@/app/(auth)/_components/LoginForm'

export default function TreebitLogin() {
  // const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const API_URL =
    process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

  return (
    <GuestGuard>
      {/* Main Content */}
      <div className="flex flex-col items-center">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            歡迎回到 Treebit{' '}
            <span className="inline-block animate-pulse">🌱</span>
          </h2>
          <p className="text-xl text-gray-600">
            每一次打勾，讓你的習慣樹更茁壯
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full">
          <div className="rounded-2xl bg-white p-7 shadow-xs">
            {/* Social Login Buttons */}
            <div className="mb-6 space-y-4">
              <a
                href={`${API_URL}/api/auth/google`}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700">
                  使用 GOOGLE 帳戶登入
                </span>
              </a>
            </div>

            {/* OR Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 font-medium text-gray-500">
                  OR
                </span>
              </div>
            </div>

            <LoginForm />
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <span className="text-gray-600">還沒有任何帳號嗎？ </span>
            <button className="font-medium text-gray-900 hover:underline">
              <Link href="/register">註冊</Link>
            </button>
          </div>
        </div>
      </div>
    </GuestGuard>
  )
}
