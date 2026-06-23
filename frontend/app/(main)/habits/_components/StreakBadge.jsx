import { PiFlameFill } from 'react-icons/pi'

// Streak 徽章（連續天數）。目前為 placeholder：傳入 days 即顯示。
// 之後接上真實 streak 計算時，把 days 換成後端回傳值即可。
export default function StreakBadge({ days = 0, preview = false, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-streak/15 px-3 py-1 text-sm font-semibold text-streak-foreground ${className}`}
    >
      <PiFlameFill className="text-streak" />
      <span className="tnum">{days}</span> 天連續
      {preview && (
        <span className="ml-1 rounded bg-streak/25 px-1 text-[10px] font-medium tracking-wide">
          示意
        </span>
      )}
    </span>
  )
}
