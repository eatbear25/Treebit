import { PiFlameFill } from 'react-icons/pi'

// 統計摘要列：全部使用真實資料（本週任務 + /stats API），不放示意數據。
// 「本週達成」以各任務目標次數封頂，超打不灌水；
// 「連續達標」由後端計算：週執行率達 85% 即算該週達標（《The 12 Week Year》標準）。
export default function HabitStats({
  currentWeek,
  totalWeeks,
  weekDone,
  weekTarget,
  totalCompleted,
  totalTarget,
  currentStreak,
}) {
  const overallRate =
    totalTarget > 0
      ? Math.min(100, Math.round((totalCompleted / totalTarget) * 100))
      : null

  const tiles = [
    {
      label: '週次進度',
      value: currentWeek,
      unit: ` / ${totalWeeks} 週`,
    },
    {
      label: '本週達成',
      value: weekTarget > 0 ? weekDone : '—',
      unit: weekTarget > 0 ? ` / ${weekTarget} 次` : '',
    },
    {
      label: '整體達成率',
      value: overallRate !== null ? overallRate : '—',
      unit: overallRate !== null ? ' %' : '',
    },
    {
      label: '連續達標',
      value: currentStreak,
      unit: ' 週',
      flame: true,
    },
  ]

  return (
    <section className="bg-card mb-8 rounded-2xl px-2 py-1 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="p-4 lg:p-5">
            <p className="text-muted-foreground text-sm">{tile.label}</p>
            <p className="font-outfit mt-1.5 flex items-center gap-1.5 text-2xl font-bold lg:text-3xl">
              {tile.flame && (
                <PiFlameFill
                  className={`text-xl ${
                    tile.value > 0 ? 'text-streak' : 'text-muted-foreground/40'
                  }`}
                />
              )}
              <span>
                {tile.value}
                {tile.unit && (
                  <span className="text-muted-foreground text-sm font-semibold">
                    {tile.unit}
                  </span>
                )}
              </span>
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
