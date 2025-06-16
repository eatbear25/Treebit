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
      <div>
        <Link href="/" className="mb-6 ml-3 block w-10">
          <img src="../icon.svg" alt="Treebit Logo" />
        </Link>

        <ul className="flex w-35 flex-col gap-2 text-lg font-[600]">
          <li>
            <Link
              href="/habits"
              className={`flex items-center justify-center gap-2 rounded-lg py-3 transition ${
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
      </div>
    </>
  )
}
