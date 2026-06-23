'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PiCheckSquare,
  PiCheckSquareFill,
  PiClockClockwise,
  PiClockClockwiseDuotone,
} from 'react-icons/pi'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      <div className="bg-card lg:flex lg:flex-col lg:justify-between lg:bg-transparent">
        <Link href="/" className="mb-6 ml-3 hidden w-10 lg:block">
          <img src="/icon.svg" alt="Treebit Logo" />
        </Link>

        <div className="flex justify-around border-t border-border text-lg font-[600] lg:w-35 lg:flex-col lg:gap-2 lg:border-none">
          <Link
            href="/habits"
            className={`flex items-center justify-center gap-2 rounded-lg p-5 transition active:scale-95 lg:flex-row lg:px-0 lg:py-3 ${
              pathname === '/habits'
                ? 'text-primary lg:bg-brand-100'
                : 'text-muted-foreground hover:text-foreground lg:hover:bg-brand-50'
            }`}
          >
            <span className="text-2xl">
              {pathname === '/habits' ? (
                <PiCheckSquareFill />
              ) : (
                <PiCheckSquare />
              )}
            </span>
            <span>習慣管理</span>
          </Link>

          <Link
            href="/history"
            className={`flex items-center justify-center gap-2 rounded-lg p-5 transition active:scale-95 lg:flex-row lg:px-0 lg:py-3 ${
              pathname === '/history'
                ? 'text-primary lg:bg-brand-100'
                : 'text-muted-foreground hover:text-foreground lg:hover:bg-brand-50'
            }`}
          >
            <span className="text-2xl">
              {pathname === '/history' ? (
                <PiClockClockwiseDuotone />
              ) : (
                <PiClockClockwise />
              )}
            </span>
            <span>歷史紀錄</span>
          </Link>
        </div>
      </div>
    </>
  )
}
