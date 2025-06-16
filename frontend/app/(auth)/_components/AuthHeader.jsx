'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AuthHeader() {
  const pathname = usePathname()

  return (
    <header className="mx-auto mb-18 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-2 shadow-xs md:w-1/2 xl:w-1/3">
      <div>
        <Link href="/" className="block w-8">
          <img src="../icon.svg" alt="Treebit Logo" />
        </Link>
      </div>

      <h1 className="inter text-2xl font-bold">Treebit</h1>
      <button className="rounded-3xl bg-[#3D8D7A] px-5 py-2 font-bold text-white">
        {pathname === '/login' ? '登入' : '註冊'}
      </button>
    </header>
  )
}
