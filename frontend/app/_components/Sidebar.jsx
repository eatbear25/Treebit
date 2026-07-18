'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PiCheckSquare,
  PiCheckSquareFill,
  PiClockClockwise,
  PiClockClockwiseFill,
  PiUsersThree,
  PiUsersThreeFill,
} from 'react-icons/pi'
import { useAuth } from '@/contexts/AuthContext'
import { useFriendRequests } from '@/contexts/FriendRequestsContext'
import ProfileDialog from './ProfileDialog'
import ThemeToggle from './ThemeToggle'

const navItems = [
  {
    href: '/habits',
    label: '習慣管理',
    Icon: PiCheckSquare,
    ActiveIcon: PiCheckSquareFill,
  },
  {
    href: '/friends',
    label: '好友',
    Icon: PiUsersThree,
    ActiveIcon: PiUsersThreeFill,
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
  const { user } = useAuth()
  const { pendingCount } = useFriendRequests()
  const initial = (user?.username || '?').trim().charAt(0).toUpperCase()

  return (
    <div className="border-border bg-card/95 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:flex lg:flex-col lg:border-none lg:bg-transparent lg:pb-0 lg:backdrop-blur-none">
      <Link href="/" className="mb-8 ml-3 hidden w-10 lg:block">
        <img src="/icon.svg" alt="Treebit Logo" />
      </Link>

      <nav className="flex justify-around lg:flex-col lg:gap-1.5">
        {navItems.map(({ href, label, Icon, ActiveIcon }) => {
          const isActive = pathname.startsWith(href)
          const showDot = href === '/friends' && pendingCount > 0
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-1 px-6 py-3 text-xs font-medium transition active:scale-95 lg:flex-row lg:gap-2.5 lg:rounded-lg lg:px-3 lg:py-2.5 lg:text-base ${
                isActive
                  ? 'text-brand-700 lg:bg-card lg:font-semibold'
                  : 'text-muted-foreground hover:text-foreground lg:hover:bg-brand-50'
              }`}
            >
              <span className="relative text-2xl lg:text-xl">
                {isActive ? <ActiveIcon /> : <Icon />}
                {showDot && (
                  <span className="bg-destructive absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full" />
                )}
              </span>
              <span>{label}</span>
              {showDot && (
                <span className="sr-only">（{pendingCount} 則待確認邀請）</span>
              )}
            </Link>
          )
        })}

        {/* 會員資料：手機當第 4 格「我的」、桌面在導覽下方成頭像列；
            深色模式快切只出現在桌面（手機收進會員資料的「外觀」） */}
        <div className="border-border flex min-w-0 items-center lg:mt-6 lg:gap-1 lg:border-t lg:pt-4">
          <ProfileDialog
            trigger={
              <button
                aria-label="會員資料"
                title={user?.username}
                className="text-muted-foreground hover:text-foreground lg:hover:bg-brand-50 flex min-w-0 cursor-pointer flex-col items-center gap-1 px-6 py-3 text-xs font-medium transition active:scale-95 lg:flex-1 lg:flex-row lg:gap-2.5 lg:rounded-lg lg:px-3 lg:py-2"
              >
                <span className="bg-brand-100 text-brand-800 font-outfit flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold lg:h-8 lg:w-8 lg:text-sm">
                  {initial}
                </span>
                <span className="lg:hidden">我的</span>
                <span className="hidden truncate lg:inline">
                  {user?.username}
                </span>
              </button>
            }
          />
          <ThemeToggle className="hidden h-9 w-9 shrink-0 text-lg lg:flex" />
        </div>
      </nav>
    </div>
  )
}
