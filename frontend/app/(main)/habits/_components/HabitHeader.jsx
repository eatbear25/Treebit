'use client'

import { useLayoutEffect, useState } from 'react'
import { PiTargetBold, PiCaretDownBold } from 'react-icons/pi'
import WeekNavigation from './WeekNavigation'
import GrowthStageIcon, {
  GROWTH_STAGES,
} from '@/app/_components/GrowthStageIcon'

// 目標文字可能超長：預設單行截斷，偵測到溢出才允許點擊展開／收起
function HabitGoal({ goal }) {
  const [textEl, setTextEl] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)

  useLayoutEffect(() => {
    if (!textEl || expanded) return
    const check = () => setClamped(textEl.scrollWidth > textEl.clientWidth)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(textEl)
    return () => observer.disconnect()
  }, [textEl, goal, expanded])

  const toggleable = clamped || expanded

  const content = (
    <>
      <PiTargetBold className="text-brand-700 mt-[3px] shrink-0" />
      <span
        ref={setTextEl}
        className={expanded ? 'min-w-0 break-words' : 'min-w-0 truncate'}
      >
        {goal}
      </span>
      {toggleable && (
        <PiCaretDownBold
          className={`text-muted-foreground/70 mt-1 shrink-0 text-xs transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      )}
    </>
  )

  const baseClass = 'text-muted-foreground mt-1 flex items-start gap-1.5 text-sm'

  if (!toggleable) {
    return <p className={baseClass}>{content}</p>
  }

  return (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      aria-expanded={expanded}
      title={expanded ? '收起' : '展開完整目標'}
      className={`${baseClass} w-full cursor-pointer text-left`}
    >
      {content}
    </button>
  )
}

export default function HabitHeader({
  challengeName,
  // 選填的習慣目標，僅本人詳情頁傳入（好友唯讀頁不顯示）
  goal = null,
  totalWeeks,
  currentWeek,
  weekRange,
  onPreviousWeek,
  onNextWeek,
  canGoPrevious,
  canGoNext,
  currentWeekIndex,
  stage = 0,
  // 標題旁的操作插槽（如「⋯」選單），好友唯讀頁不傳即不顯示
  menu = null,
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        <div
          className="bg-card mt-[3px] flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-2xl shadow-sm"
          title={`成長階段：${GROWTH_STAGES[stage]}`}
        >
          <GrowthStageIcon stage={stage} className="h-12 w-12" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold md:text-3xl">
            {challengeName}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            共 <span className="tnum">{totalWeeks}</span> 週 ·{' '}
            {GROWTH_STAGES[stage]}
          </p>
          {goal && <HabitGoal goal={goal} />}
        </div>
        {menu}
      </div>

      <WeekNavigation
        currentWeek={currentWeek}
        weekRange={weekRange}
        onPreviousWeek={onPreviousWeek}
        onNextWeek={onNextWeek}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        currentWeekIndex={currentWeekIndex}
        totalWeeks={totalWeeks}
      />
    </div>
  )
}
