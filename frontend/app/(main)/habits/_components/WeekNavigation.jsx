import { PiArrowLeft, PiArrowRight } from 'react-icons/pi'

export default function WeekNavigation({
  currentWeek,
  weekRange,
  onPreviousWeek,
  onNextWeek,
  canGoPrevious,
  canGoNext,
  currentWeekIndex,
  totalWeeks,
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-bold text-brand-700">{currentWeek}</span>
      <span className="font-outfit tnum mr-3 font-[600]">{weekRange}</span>
      <div className="flex items-center gap-4">
        <button
          onClick={onPreviousWeek}
          disabled={currentWeekIndex === 0}
          className={`h-14 w-14 rounded-full bg-card shadow-sm transition-colors ${
            currentWeekIndex === 0
              ? 'text-muted-foreground/40'
              : 'cursor-pointer hover:scale-105 hover:bg-muted active:scale-95'
          }`}
        >
          <span className="flex items-center justify-center text-xl">
            <PiArrowLeft />
          </span>
        </button>

        <button
          onClick={onNextWeek}
          disabled={currentWeekIndex === totalWeeks - 1}
          className={`h-14 w-14 rounded-full bg-card shadow-sm transition-colors ${
            currentWeekIndex === totalWeeks - 1
              ? 'text-muted-foreground/40'
              : 'cursor-pointer hover:scale-105 hover:bg-muted active:scale-95'
          }`}
        >
          <span className="flex items-center justify-center text-xl">
            <PiArrowRight />
          </span>
        </button>
      </div>
    </div>
  )
}
