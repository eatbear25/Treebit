'use client'

import { useRouter } from 'next/navigation'
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

export default function HabitCard({
  title,
  total_weeks,
  created_at,
  first_start_date,
  completed_logs,
  total_target_days,
  weeks_with_tasks,
  current_streak,
  goal,
  id,
  onHabitsChanged,
  visibility,
  // 唯讀模式：好友頁重用（隱藏操作選單，按鈕改為前往 detailHref）
  readOnly = false,
  detailHref,
}) {
  const router = useRouter()

  // 起始日以第一週 start_date 為準（DATE 字串）；舊資料缺值時退回 created_at
  const startYMD = first_start_date
    ? formatDateToLocalYMD(first_start_date)
    : formatTimestampToTaiwanYMD(created_at)

  const currentWeek = getCurrentWeekNumber(
    first_start_date || startYMD,
    total_weeks
  )
  const weekPercent = Math.round((currentWeek / total_weeks) * 100)

  // 目標達成率 = 已完成打卡 / 所有任務目標次數總和；尚未建立任務時不顯示
  const completedCount = Number(completed_logs) || 0
  const targetTotal = Number(total_target_days) || 0
  const streak = Number(current_streak) || 0
  const completionRate =
    targetTotal > 0
      ? Math.min(100, Math.round((completedCount / targetTotal) * 100))
      : null

  // 樹的成長階段：每一次完成都讓樹長大一點（以整趟旅程估算，非只算已建任務的週）
  const stage = getGrowthStage(
    completedCount,
    targetTotal,
    Number(weeks_with_tasks) || 0,
    total_weeks
  )

  const handleViewTask = () => {
    router.push(detailHref || `/habits/${id}`)
  }

  return (
    <div className="group bg-card flex h-full flex-col rounded-2xl p-6 shadow-[0_10px_30px_-14px_rgba(79,111,88,0.25)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-16px_rgba(79,111,88,0.38)] md:p-7 dark:ring-1 dark:ring-white/10">
      {/* 標題列：成長階段 + 名稱 + 選單 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className="bg-brand-50 dark:bg-brand-100 flex h-12 w-12 shrink-0 items-end justify-center overflow-hidden rounded-xl"
            title={`成長階段：${GROWTH_STAGES[stage]}`}
          >
            <GrowthStageIcon stage={stage} className="h-10 w-10" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold md:text-2xl">{title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              <span className="font-outfit tnum">{startYMD}</span> 開始 · 共{' '}
              <span className="tnum">{total_weeks}</span> 週
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {visibility === 'friends' && !readOnly && (
            <span
              title="好友可見"
              className="bg-brand-50 text-brand-700 flex h-8 w-8 items-center justify-center rounded-full text-lg"
            >
              <PiUsersThree />
            </span>
          )}

          {!readOnly && (
            <HabitActionsMenu
              id={id}
              title={title}
              goal={goal}
              visibility={visibility}
              onHabitsChanged={onHabitsChanged}
              className="-mt-1 -mr-1"
            />
          )}
        </div>
      </div>

      {/* 週進度 */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between text-sm">
          <span>
            <span className="text-brand-700 font-semibold">
              第 <span className="tnum">{currentWeek}</span> 週
            </span>
            <span className="text-muted-foreground">
              {' '}
              · {GROWTH_STAGES[stage]}
            </span>
          </span>
          <span className="font-outfit tnum text-muted-foreground">
            {currentWeek} / {total_weeks} 週
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={currentWeek}
          aria-valuemin={1}
          aria-valuemax={total_weeks}
          aria-label="週數進度"
          className="bg-brand-100 mt-2 h-2 overflow-hidden rounded-full"
        >
          <div
            className="bg-brand-500 h-full rounded-full transition-[width] duration-500"
            style={{ width: `${weekPercent}%` }}
          />
        </div>
      </div>

      {/* 累積數據 */}
      <dl className="mt-6 mb-7 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-muted-foreground text-sm">目標達成率</dt>
          <dd className="font-outfit mt-1 text-2xl font-bold md:text-3xl">
            {completionRate !== null ? (
              <>
                {completionRate}
                <span className="text-muted-foreground ml-0.5 text-base font-semibold">
                  %
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-base font-medium">
                尚未設定任務
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground text-sm">連續達標</dt>
          <dd className="font-outfit mt-1 flex items-center gap-1.5 text-2xl font-bold md:text-3xl">
            <PiFlameFill
              className={`text-xl ${streak > 0 ? 'text-streak' : 'text-muted-foreground/40'}`}
            />
            {streak}
            <span className="text-muted-foreground text-base font-semibold">
              週
            </span>
          </dd>
        </div>
      </dl>

      <button
        onClick={handleViewTask}
        className="bg-brand-700 hover:bg-brand-800 dark:text-brand-50 mt-auto w-full cursor-pointer rounded-tl-xl rounded-br-xl py-3 text-base font-semibold text-white shadow-[0_8px_20px_-8px_rgba(60,86,69,0.5)] transition active:scale-[0.99]"
      >
        {readOnly ? '查看' : '查看任務'}
      </button>
    </div>
  )
}
