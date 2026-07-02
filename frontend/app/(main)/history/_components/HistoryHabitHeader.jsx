import WeekNavigation from '../../habits/_components/WeekNavigation'

export default function HistoryHabitHeader({
  challengeName,
  totalWeeks,
  currentWeek,
  weekRange,
  onPreviousWeek,
  onNextWeek,
  canGoPrevious,
  canGoNext,
  currentWeekIndex,
}) {
  return (
    <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <h1 className="truncate text-2xl font-bold md:text-3xl">
            {challengeName}
          </h1>
          <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-3 py-1 text-xs font-medium">
            已封存
          </span>
        </div>
        <p className="text-muted-foreground mt-1.5 text-sm">
          共 <span className="tnum">{totalWeeks}</span> 週 · 唯讀紀錄
        </p>
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
