import { PiTargetBold } from 'react-icons/pi'
import WeekNavigation from './WeekNavigation'
import GrowthStageIcon, {
  GROWTH_STAGES,
} from '@/app/_components/GrowthStageIcon'

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
      <div className="flex min-w-0 items-center gap-4">
        <div
          className="bg-card flex h-14 w-14 shrink-0 items-end justify-center overflow-hidden rounded-2xl shadow-sm"
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
          {goal && (
            <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-sm">
              <PiTargetBold className="text-brand-700 shrink-0" />
              <span className="truncate">{goal}</span>
            </p>
          )}
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
