'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { PiSunBold, PiMoonBold, PiDesktopBold } from 'react-icons/pi'
import { cn } from '@/lib/utils'

// 主題尚未 mount 前不知道 resolvedTheme（避免 SSR hydration 不一致），
// 先渲染同尺寸的佔位，mount 後再換成正確的 icon。
function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}

// 快速切換鈕（淺色 ↔ 深色）：導覽列用的圓形 icon button
export default function ThemeToggle({ className }) {
  const mounted = useMounted()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={isDark ? '切換為淺色模式' : '切換為深色模式'}
      title={isDark ? '切換為淺色模式' : '切換為深色模式'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'text-muted-foreground hover:text-foreground hover:bg-muted flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xl transition active:scale-95',
        className
      )}
    >
      {mounted ? isDark ? <PiSunBold /> : <PiMoonBold /> : null}
    </button>
  )
}

const THEME_OPTIONS = [
  { value: 'light', label: '淺色', Icon: PiSunBold },
  { value: 'dark', label: '深色', Icon: PiMoonBold },
  { value: 'system', label: '系統', Icon: PiDesktopBold },
]

// 三段式外觀選擇（淺色 / 深色 / 系統）：樣式同檢視切換鈕慣例
// （bg-muted p-1 容器、選中＝白卡浮起），用於 ProfileDialog
export function ThemeOptions() {
  const mounted = useMounted()
  const { theme, setTheme } = useTheme()

  return (
    <div className="bg-muted flex rounded-lg p-1">
      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const isActive = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setTheme(value)}
            className={cn(
              'flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition active:scale-95',
              isActive
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="text-sm" />
            {label}
          </button>
        )
      })}
    </div>
  )
}
