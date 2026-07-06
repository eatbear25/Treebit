// 習慣成長階段：與首頁 public/logo-growth-stages.svg 同一套品牌視覺，
// 這裡以 viewBox 裁切出單一階段，讓「每一次完成都讓樹長大一點」在 app 內看得見。

export const GROWTH_STAGES = ['種子', '幼苗', '樹苗', '大樹']

// 依「已完成打卡 / 整趟旅程的估計總目標」推算階段：
// 還沒打卡＝種子；之後每完成 1/3 進度長大一階。
// 分母不能只算「已建任務的週」——任務逐週建立時，第二週打滿分母也只有兩週的量，
// 樹會直接變大樹。改以「有建任務週的平均每週目標 × 總週數」估整趟旅程。
export function getGrowthStage(
  completedCount,
  totalTargetDays,
  weeksWithTasks,
  totalWeeks
) {
  if (!completedCount || completedCount <= 0) return 0
  if (!totalTargetDays || !weeksWithTasks) return 1

  const avgWeeklyTarget = totalTargetDays / weeksWithTasks
  const estimatedFullTarget = avgWeeklyTarget * (totalWeeks || weeksWithTasks)
  const ratio = completedCount / estimatedFullTarget

  if (ratio < 1 / 3) return 1
  if (ratio < 2 / 3) return 2
  return 3
}

// 顏色走 CSS 變數（深色模式時 brand 色階反轉，圖自動適應）；
// full 模式渲染整條四階段（首頁「成長階段」區使用，取代顏色固定的靜態 SVG 檔）
export default function GrowthStageIcon({
  stage = 0,
  className = '',
  full = false,
}) {
  const index = Math.min(Math.max(stage, 0), 3)

  return (
    <svg
      viewBox={full ? '0 10 480 110' : `${index * 120} 10 120 110`}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* stage 1: seed */}
      <g>
        <path
          d="M40 104 H80"
          stroke="var(--brand-700)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
        />
        <ellipse
          cx="60"
          cy="90"
          rx="13"
          ry="9"
          transform="rotate(-20 60 90)"
          fill="var(--brand-200)"
        />
      </g>
      {/* stage 2: sprout */}
      <g>
        <path
          d="M160 104 H200"
          stroke="var(--brand-700)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M180 100 C180 86 180 78 180 68"
          stroke="var(--brand-500)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M180 80 C193 78 205 68 208 54 C192 53 178 62 180 80 Z"
          fill="var(--brand-200)"
        />
      </g>
      {/* stage 3: sapling */}
      <g>
        <path
          d="M280 104 H320"
          stroke="var(--brand-700)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M300 100 C300 80 300 64 300 46"
          stroke="var(--brand-500)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M300 70 C286 72 273 64 270 50 C285 46 299 55 300 70 Z"
          fill="var(--brand-300)"
        />
        <path
          d="M300 58 C314 56 327 46 330 32 C313 30 298 40 300 58 Z"
          fill="var(--brand-200)"
        />
      </g>
      {/* stage 4: tree */}
      <g>
        <path
          d="M400 104 H440"
          stroke="var(--brand-700)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M420 100 V58"
          stroke="#8A6D4F"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <circle cx="420" cy="42" r="26" fill="var(--brand-500)" />
        <circle cx="402" cy="52" r="16" fill="var(--brand-300)" />
        <circle cx="438" cy="52" r="16" fill="var(--brand-200)" />
      </g>
    </svg>
  )
}
