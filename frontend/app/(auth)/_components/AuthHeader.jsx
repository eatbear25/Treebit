'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AuthHeader() {
  const pathname = usePathname()

  return (
    <header className="mx-auto mb-18 flex w-full items-center justify-between rounded-2xl bg-card px-4 py-2 shadow-sm md:w-1/2 xl:w-1/3">
      <div>
        <Link href="/" className="block w-9">
          <img src="/icon.svg" alt="Treebit Logo" />
        </Link>
      </div>

      <h1 className="font-outfit text-2xl font-bold">Treebit</h1>
      <button className="rounded-full bg-primary px-5 py-2 font-bold text-primary-foreground transition active:scale-[0.98]">
        {pathname === '/login' ? '登入' : '註冊'}
      </button>
    </header>
  )
}
