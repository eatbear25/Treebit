import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi'

export default function WeekNavigation({
  currentWeek,
  weekRange,
  onPreviousWeek,
  onNextWeek,
  currentWeekIndex,
  totalWeeks,
}) {
  const arrowClass = (disabled) =>
    `flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-base shadow-sm transition ${
      disabled
        ? 'text-muted-foreground/40'
        : 'cursor-pointer text-foreground hover:bg-muted active:scale-95'
    }`

  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-brand-700 font-bold">{currentWeek}</p>
        <p className="font-outfit tnum text-muted-foreground text-sm">
          {weekRange}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onPreviousWeek}
          disabled={currentWeekIndex === 0}
          aria-label="上一週"
          className={arrowClass(currentWeekIndex === 0)}
        >
          <PiCaretLeftBold />
        </button>

        <button
          onClick={onNextWeek}
          disabled={currentWeekIndex === totalWeeks - 1}
          aria-label="下一週"
          className={arrowClass(currentWeekIndex === totalWeeks - 1)}
        >
          <PiCaretRightBold />
        </button>
      </div>
    </div>
  )
}
