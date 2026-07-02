'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PiCheckSquare,
  PiCheckSquareFill,
  PiClockClockwise,
  PiClockClockwiseFill,
} from 'react-icons/pi'

const navItems = [
  {
    href: '/habits',
    label: '習慣管理',
    Icon: PiCheckSquare,
    ActiveIcon: PiCheckSquareFill,
  },
  {
    href: '/history',
    label: '歷史紀錄',
    Icon: PiClockClockwise,
    ActiveIcon: PiClockClockwiseFill,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="border-border bg-card/95 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:flex lg:flex-col lg:border-none lg:bg-transparent lg:pb-0 lg:backdrop-blur-none">
      <Link href="/" className="mb-8 ml-3 hidden w-10 lg:block">
        <img src="/icon.svg" alt="Treebit Logo" />
      </Link>

      <nav className="flex justify-around lg:flex-col lg:gap-1.5">
        {navItems.map(({ href, label, Icon, ActiveIcon }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 px-6 py-3 text-xs font-medium transition active:scale-95 lg:flex-row lg:gap-2.5 lg:rounded-lg lg:px-3 lg:py-2.5 lg:text-base ${
                isActive
                  ? 'text-brand-700 lg:bg-brand-100 lg:font-semibold'
                  : 'text-muted-foreground hover:text-foreground lg:hover:bg-brand-50'
              }`}
            >
              <span className="text-2xl lg:text-xl">
                {isActive ? <ActiveIcon /> : <Icon />}
              </span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
