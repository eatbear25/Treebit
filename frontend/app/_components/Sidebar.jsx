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
      {/* <div className="gap-20 bg-amber-600 lg:flex lg:justify-between">
        <Link href="/" className="mb-6 ml-3 hidden w-10 lg:block">
          <img src="/icon.svg" alt="Treebit Logo" />
        </Link>

        <ul className="flex w-4/5 justify-center gap-2 bg-red-50 text-lg font-[600] lg:w-35 lg:flex-col">
          <li>
            <Link
              href="/habits"
              className={`flex items-center justify-around gap-2 rounded-lg p-3 transition lg:flex-row lg:px-0 lg:py-3 ${
                pathname === '/habits' ? 'bg-[#C8CACD]' : 'hover:bg-[#C8CACD]'
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
          </li>
          <li>
            <Link
              href="/history"
              className={`flex items-center justify-center gap-2 rounded-lg py-3 transition ${
                pathname === '/history' ? 'bg-[#C8CACD]' : 'hover:bg-[#C8CACD]'
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
          </li>
        </ul>
      </div> */}

      <div className="lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="mb-6 ml-3 hidden w-10 lg:block">
          <img src="/icon.svg" alt="Treebit Logo" />
        </Link>

        <div className="flex justify-around border-t text-lg font-[600] lg:w-35 lg:flex-col lg:gap-4">
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
