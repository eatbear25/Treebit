'use client'

import Sidebar from '../_components/Sidebar'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'

export default function Layout({ children }) {
  return (
    <>
      <AuthProvider>
        <div className="min-h-screen bg-[#F2F2F2] px-2 pt-8 md:px-20 md:pt-12">
          <div className="container mx-auto lg:flex lg:gap-8">
            {/* 大螢幕時顯示在左邊的 Sidebar */}
            <div className="hidden lg:block lg:w-38 lg:flex-shrink-0">
              <Sidebar />
            </div>

            {/* 主要內容區域，底部留出空間給 Sidebar */}
            <main className="w-full max-w-6xl pb-20 lg:pb-8">
              {children}
              <Toaster position="top-center" richColors />
            </main>
          </div>
        </div>

        {/* 手機版固定在底部的 Sidebar */}
        <div className="fixed right-0 bottom-0 left-0 z-50 lg:hidden">
          <Sidebar />
        </div>
      </AuthProvider>
    </>
  )
}
