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
      <div className="bg-white lg:flex lg:flex-col lg:justify-between lg:bg-transparent">
        <Link href="/" className="mb-6 ml-3 hidden w-10 lg:block">
          <img src="/icon.svg" alt="Treebit Logo" />
        </Link>

        <div className="flex justify-around border-t text-lg font-[600] lg:w-35 lg:flex-col lg:gap-4 lg:border-none">
          <Link
            href="/habits"
            className={`flex items-center justify-center gap-2 rounded-lg p-5 transition lg:flex-row lg:px-0 lg:py-3 ${
              pathname === '/habits'
                ? 'lg:bg-[#C8CACD]'
                : 'lg:hover:bg-[#C8CACD]'
            } active:scale-95`}
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
            className={`flex items-center justify-center gap-2 rounded-lg p-5 transition lg:flex-row lg:px-0 lg:py-3 ${
              pathname === '/history'
                ? 'lg:bg-[#C8CACD]'
                : 'lg:hover:bg-[#C8CACD]'
            } active:scale-95`}
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
