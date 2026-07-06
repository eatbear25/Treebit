'use client'

import Link from 'next/link'
import { PiFlameFill, PiUsersThree } from 'react-icons/pi'
import GrowthStageIcon, {
  GROWTH_STAGES,
  getGrowthStage,
} from '@/app/_components/GrowthStageIcon'
import {
  formatDateToLocalYMD,
  formatTimestampToTaiwanYMD,
  getCurrentWeekNumber,
} from '@/lib/utils'
import HabitActionsMenu from './HabitActionsMenu'

// 條列檢視的單行（數據運算同 HabitCard）
export default function HabitRow({
  title,
  total_weeks,
  created_at,
  first_start_date,
  completed_logs,
  total_target_days,
  weeks_with_tasks,
  current_streak,
  id,
  onHabitsChanged,
  visibility,
}) {
  const startYMD = first_start_date
    ? formatDateToLocalYMD(first_start_date)
    : formatTimestampToTaiwanYMD(created_at)

  const currentWeek = getCurrentWeekNumber(
    first_start_date || startYMD,
    total_weeks
  )

  const completedCount = Number(completed_logs) || 0
  const targetTotal = Number(total_target_days) || 0
  const streak = Number(current_streak) || 0
  const completionRate =
    targetTotal > 0
      ? Math.min(100, Math.round((completedCount / targetTotal) * 100))
      : null

  const stage = getGrowthStage(
    completedCount,
    targetTotal,
    Number(weeks_with_tasks) || 0,
    total_weeks
  )

  return (
    <div className="flex items-center gap-3 p-4 md:px-6">
      <Link
        href={`/habits/${id}`}
        className="group flex min-w-0 flex-1 items-center gap-4"
      >
        <div
          className="bg-brand-50 flex h-11 w-11 shrink-0 items-end justify-center overflow-hidden rounded-xl"
          title={`成長階段：${GROWTH_STAGES[stage]}`}
        >
          <GrowthStageIcon stage={stage} className="h-9 w-9" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="group-hover:text-brand-700 flex items-center gap-2 font-semibold transition-colors">
            <span className="truncate">{title}</span>
            {visibility === 'friends' && (
              <PiUsersThree
                title="好友可見"
                className="text-brand-700 shrink-0"
              />
            )}
          </p>
          <p className="text-muted-foreground mt-0.5 text-sm">
            第 <span className="tnum">{currentWeek}</span> /{' '}
            <span className="tnum">{total_weeks}</span> 週 ·{' '}
            {GROWTH_STAGES[stage]}
          </p>
        </div>

        <div className="hidden w-20 shrink-0 text-right sm:block">
          <p className="text-muted-foreground text-xs">目標達成率</p>
          <p className="font-outfit mt-0.5 text-lg font-bold">
            {completionRate !== null ? (
              <>
                {completionRate}
                <span className="text-muted-foreground text-sm font-semibold">
                  %
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm font-medium">
                未設定
              </span>
            )}
          </p>
        </div>

        <div className="hidden w-20 shrink-0 text-right sm:block">
          <p className="text-muted-foreground text-xs">連續打卡</p>
          <p className="font-outfit mt-0.5 flex items-center justify-end gap-1 text-lg font-bold">
            <PiFlameFill
              className={`text-base ${streak > 0 ? 'text-streak' : 'text-muted-foreground/40'}`}
            />
            {streak}
            <span className="text-muted-foreground text-sm font-semibold">
              天
            </span>
          </p>
        </div>
      </Link>

      <HabitActionsMenu
        id={id}
        title={title}
        visibility={visibility}
        onHabitsChanged={onHabitsChanged}
        className="shrink-0"
      />
    </div>
  )
}
