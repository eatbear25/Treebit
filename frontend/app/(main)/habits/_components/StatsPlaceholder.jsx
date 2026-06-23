import { PiChartLineUpBold, PiTrophyFill } from 'react-icons/pi'
import StreakBadge from './StreakBadge'

// 統計區塊 placeholder。圖表 / streak 真實邏輯開發中，
// 這裡先用示意資料佔位，並預留 props 介面（weeklyRates / currentStreak / bestStreak）。
export default function StatsPlaceholder({
  weeklyRates = [40, 65, 50, 80, 55, 92, 70], // 示意：每日達成率 %
  currentStreak = 5, // 示意
  bestStreak = 12, // 示意
}) {
  return (
    <div className="mb-8 rounded-2xl bg-card p-5 shadow-sm lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
          <PiChartLineUpBold />
          數據統計
        </h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          即將推出
        </span>
      </div>

      {/* 重點數據 */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StreakBadge days={currentStreak} preview />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          <PiTrophyFill className="text-brand-500" />
          最佳 <span className="tnum">{bestStreak}</span> 天
          <span className="ml-1 rounded bg-brand-100 px-1 text-[10px] font-medium tracking-wide">
            示意
          </span>
        </span>
      </div>

      {/* 迷你長條圖（示意骨架） */}
      <div className="flex h-36 items-end gap-2 rounded-xl bg-brand-50/60 p-4">
        {weeklyRates.map((rate, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-md bg-brand-400"
                style={{ height: `${rate}%`, opacity: 0.35 + (rate / 100) * 0.5 }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        完成趨勢、連續天數與每週達成率（示意資料，實際統計開發中）
      </p>
    </div>
  )
}
