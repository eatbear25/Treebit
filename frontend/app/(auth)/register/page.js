'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PiEye, PiEyeSlash } from 'react-icons/pi'

export default function TreebitLogin() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  return (
    <>
      {/* Main Content */}
      <div className="flex flex-col items-center">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            保存你的成長進度
          </h2>
          <p className="text-xl text-gray-600">
            每天一點點，讓習慣樹慢慢長大 🌿
          </p>
        </div>

        {/* Login Form */}
        <div className="w-full">
          <div className="rounded-2xl bg-white p-7 shadow-xs">
            {/* Social Login Buttons */}
            <div className="mb-6 space-y-4">
              <button className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-gray-300 px-4 py-3 transition-colors hover:bg-gray-50">
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
                  使用 GOOGLE 帳戶註冊
                </span>
              </button>
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

            {/* Name Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                名稱
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#B3D8A8] focus:outline-none"
                placeholder="是貓熊不是熊貓"
              />
            </div>

            {/* Email Input */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                電子信箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#B3D8A8] focus:outline-none"
                placeholder="cute@cat.com"
              />
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                密碼
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-12 focus:border-transparent focus:ring-2 focus:ring-[#B3D8A8] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 transform text-lg text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <PiEyeSlash /> : <PiEye />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3D8D7A] px-4 py-3 font-bold text-white transition-colors hover:opacity-90">
              註冊
              <span className="text-lg">→</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <span className="text-gray-600">已經有帳號了嗎？ </span>
            <button className="font-medium text-gray-900 hover:underline">
              <Link href="/login">登入</Link>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
