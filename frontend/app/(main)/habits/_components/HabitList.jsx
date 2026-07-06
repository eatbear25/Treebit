'use client'

import { useEffect, useState } from 'react'
import {
  PiCaretLeftBold,
  PiCaretRightBold,
  PiListBold,
  PiSquaresFourBold,
} from 'react-icons/pi'
import HabitCard from './HabitCard'
import HabitRow from './HabitRow'

// 卡片檢視資訊量大、一頁 4 張；條列檢視較精簡、一頁 8 行
const PAGE_SIZE = { card: 4, list: 8 }
const VIEW_STORAGE_KEY = 'treebit-habits-view'

const VIEW_OPTIONS = [
  { value: 'card', label: '卡片檢視', Icon: PiSquaresFourBold },
  { value: 'list', label: '條列檢視', Icon: PiListBold },
]

export default function HabitList({ habits, onHabitsChanged }) {
  const [view, setView] = useState('card')
  const [page, setPage] = useState(1)

  // 檢視偏好記在 localStorage；首次 render 用預設值，避免 SSR hydration 不一致
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_STORAGE_KEY)
    if (saved === 'card' || saved === 'list') setView(saved)
  }, [])

  const switchView = (next) => {
    setView(next)
    setPage(1)
    localStorage.setItem(VIEW_STORAGE_KEY, next)
  }

  // 刪除／封存後頁數變少時，自動退回最後一頁
  const pageSize = PAGE_SIZE[view]
  const totalPages = Math.max(1, Math.ceil(habits.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageHabits = habits.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <>
      {/* 檢視切換 */}
      <div className="mb-4 flex justify-end">
        <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
          {VIEW_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              title={label}
              aria-pressed={view === value}
              onClick={() => switchView(value)}
              className={`cursor-pointer rounded-md p-1.5 text-lg transition ${
                view === value
                  ? 'bg-card text-brand-700'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {pageHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              {...habit}
              onHabitsChanged={onHabitsChanged}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card divide-border divide-y overflow-hidden rounded-2xl shadow-sm">
          {pageHabits.map((habit) => (
            <HabitRow
              key={habit.id}
              {...habit}
              onHabitsChanged={onHabitsChanged}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="習慣分頁"
          className="mt-8 flex items-center justify-center gap-1.5"
        >
          <button
            type="button"
            aria-label="上一頁"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-2 transition disabled:pointer-events-none disabled:opacity-40"
          >
            <PiCaretLeftBold />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === currentPage ? 'page' : undefined}
              onClick={() => setPage(n)}
              className={`tnum h-9 w-9 cursor-pointer rounded-lg text-sm transition ${
                n === currentPage
                  ? 'bg-card text-brand-700 font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            aria-label="下一頁"
            disabled={currentPage === totalPages}
            onClick={() => setPage(currentPage + 1)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-2 transition disabled:pointer-events-none disabled:opacity-40"
          >
            <PiCaretRightBold />
          </button>
        </nav>
      )}
    </>
  )
}
