'use client'

import Link from 'next/link'
import Sidebar from '../_components/Sidebar'
import AppToaster from '../_components/AppToaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { FriendRequestsProvider } from '@/contexts/FriendRequestsContext'

export default function Layout({ children }) {
  return (
    <>
      <AuthProvider>
        <FriendRequestsProvider>
          <div className="bg-surface min-h-screen px-4 pt-8 md:px-10 md:pt-12 xl:px-20">
            <div className="container mx-auto lg:flex lg:gap-10">
              {/* 大螢幕時顯示在左邊的 Sidebar */}
              <div className="hidden lg:block lg:w-44 lg:flex-shrink-0">
                <Sidebar />
              </div>

              {/* 手機／平板：頂部 logo，可導回首頁（桌面由 Sidebar 的 logo 負責） */}
              <div className="mb-6 lg:hidden">
                <Link href="/" className="inline-flex items-center gap-2">
                  <img src="/icon.svg" alt="Treebit Logo" className="w-8" />
                  <span className="font-outfit text-lg font-bold">Treebit</span>
                </Link>
              </div>

              {/* 主要內容區域，手機底部留空間給固定導覽列 */}
              <main className="w-full max-w-6xl pb-28 lg:pb-12">
                {children}
                <AppToaster />
              </main>
            </div>
          </div>

          {/* 手機版固定在底部的導覽列 */}
          <div className="fixed right-0 bottom-0 left-0 z-50 lg:hidden">
            <Sidebar />
          </div>
        </FriendRequestsProvider>
      </AuthProvider>
    </>
  )
}
