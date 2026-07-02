'use client'

import Sidebar from '../_components/Sidebar'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'sonner'

export default function Layout({ children }) {
  return (
    <>
      <AuthProvider>
        <div className="bg-surface min-h-screen px-4 pt-8 md:px-10 md:pt-12 xl:px-20">
          <div className="container mx-auto lg:flex lg:gap-10">
            {/* 大螢幕時顯示在左邊的 Sidebar */}
            <div className="hidden lg:block lg:w-44 lg:flex-shrink-0">
              <Sidebar />
            </div>

            {/* 主要內容區域，手機底部留空間給固定導覽列 */}
            <main className="w-full max-w-6xl pb-28 lg:pb-12">
              {children}
              <Toaster position="top-center" richColors />
            </main>
          </div>
        </div>

        {/* 手機版固定在底部的導覽列 */}
        <div className="fixed right-0 bottom-0 left-0 z-50 lg:hidden">
          <Sidebar />
        </div>
      </AuthProvider>
    </>
  )
}
