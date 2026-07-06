'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

function NavInner() {
  const { user, isAuthenticated, initialized } = useAuth()

  return (
    <header className="border-border/80 bg-surface/85 sticky top-0 z-40 border-b backdrop-blur-md">
      <nav className="container mx-auto flex h-16 items-center justify-between px-6 md:h-[72px] xl:px-0">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/icon.svg"
            alt="Treebit Logo"
            width={36}
            height={36}
            priority
          />
          <span className="font-outfit text-xl font-bold md:text-2xl">
            Treebit
          </span>
        </Link>

        {/* 頁內導覽：帶新手快速找到「怎麼用」與「常見問題」 */}
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/#how-it-works"
            className="text-foreground/80 hover:text-foreground rounded-full px-4 py-2 text-base font-medium transition"
          >
            使用方式
          </Link>
          <Link
            href="/#faq"
            className="text-foreground/80 hover:text-foreground rounded-full px-4 py-2 text-base font-medium transition"
          >
            常見問題
          </Link>
        </div>

        {/* 認證狀態確認前先隱藏，避免登入者閃現「登入 / 免費開始」 */}
        <div
          className={`flex items-center gap-1 transition-opacity duration-300 md:gap-3 ${
            initialized ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isAuthenticated ? (
            <>
              <span className="text-foreground/80 mr-1 hidden max-w-40 truncate text-base font-medium sm:inline">
                嗨，{user?.username}
              </span>
              <Link
                href="/habits"
                className="bg-brand-700 hover:bg-brand-800 rounded-tl-xl rounded-br-xl px-4 py-2 text-base font-semibold text-white transition active:scale-[0.98] md:px-5"
              >
                習慣管理
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-foreground/80 hover:text-foreground rounded-full px-4 py-2 text-base font-medium transition"
              >
                登入
              </Link>
              <Link
                href="/register"
                className="bg-brand-700 hover:bg-brand-800 rounded-tl-xl rounded-br-xl px-4 py-2 text-base font-semibold text-white transition active:scale-[0.98] md:px-5"
              >
                免費開始
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

// 首頁專用導覽列：自帶 AuthProvider，登入後顯示「進入我的習慣」
export default function LandingNav() {
  return (
    <AuthProvider>
      <NavInner />
    </AuthProvider>
  )
}
