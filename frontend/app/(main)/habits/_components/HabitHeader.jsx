import WeekNavigation from './WeekNavigation'

export default function HabitHeader({
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
    <div className="mb-8 flex flex-col items-center justify-between md:flex-row">
      <div className="mb-6 flex items-center gap-4 md:mb-0">
        <span className="text-muted-foreground">
          共 <span className="tnum">{totalWeeks}</span> 週
        </span>
        <h1 className="text-xl font-bold text-brand-700">{challengeName}</h1>
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
