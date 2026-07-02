// 統計摘要列：全部使用真實資料（本週任務 + /stats API），不放示意數據。
// weekDone / weekTarget 由當週任務即時計算，totalCompleted / totalTarget 來自後端統計。
export default function HabitStats({
  currentWeek,
  totalWeeks,
  weekDone,
  weekTarget,
  totalCompleted,
  totalTarget,
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
      label: '本週打卡',
      value: weekTarget > 0 ? weekDone : '—',
      unit: weekTarget > 0 ? ` / ${weekTarget} 次` : '',
    },
    {
      label: '整體達成率',
      value: overallRate !== null ? overallRate : '—',
      unit: overallRate !== null ? ' %' : '',
    },
    {
      label: '累計完成',
      value: totalCompleted,
      unit: ' 次',
    },
  ]

  return (
    <section className="bg-card mb-8 rounded-2xl px-2 py-1 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="p-4 lg:p-5">
            <p className="text-muted-foreground text-sm">{tile.label}</p>
            <p className="font-outfit mt-1.5 text-2xl font-bold lg:text-3xl">
              {tile.value}
              {tile.unit && (
                <span className="text-muted-foreground text-sm font-semibold">
                  {tile.unit}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
