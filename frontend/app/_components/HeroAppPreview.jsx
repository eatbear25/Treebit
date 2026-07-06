import { PiCheckBold, PiFlameFill } from 'react-icons/pi'
import GrowthStageIcon from './GrowthStageIcon'

// Hero 的 app 畫面示意：直接以 JSX + design token 刻出目前的產品長相，
// 取代會過期的 PNG 截圖——之後 UI 改版，這裡跟著 token 一起變。
// 打卡格、白卡陰影、streak 火苗皆對齊 app 內實際樣式（TaskRow / HabitCard）。

const DAYS = ['一', '二', '三', '四', '五', '六', '日']
const TODAY_INDEX = 3 // 示意「本週進行到週四」

const TASKS = [
  { name: '慢跑 30 分鐘', days: [1, 1, 0, 1, 0, 0, 0] },
  { name: '伸展 10 分鐘', days: [1, 1, 1, 1, 0, 0, 0] },
  { name: '11 點前睡覺', days: [1, 0, 1, 1, 0, 0, 0] },
]

const rowGrid =
  'grid grid-cols-[minmax(0,1.6fr)_repeat(7,minmax(0,1fr))] items-center'

export default function HeroAppPreview() {
  return (
    <div
      role="img"
      aria-label="Treebit 打卡畫面示意：習慣「規律運動」進行到第 3 週，三個每週任務的打卡格、連續打卡 12 天、成長階段為樹苗"
      className="relative mx-auto w-full max-w-xl select-none"
    >
      <div aria-hidden className="pointer-events-none">
        {/* Hero 唯一的 sage 焦點光暈 */}
        <div className="bg-brand-200/40 absolute inset-x-6 top-8 -z-10 h-[85%] rounded-[50%] blur-3xl" />

        {/* 主卡：本週打卡 */}
        <div className="animate-float bg-card rounded-2xl p-5 text-left shadow-[0_24px_60px_-24px_rgba(60,86,69,0.45)] sm:p-7">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-lg font-bold sm:text-xl">規律運動</p>
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className="text-brand-700 font-semibold">第 3 週</span>
              <span className="font-outfit tnum"> · 3 / 8 週</span>
            </p>
          </div>

          <div className="bg-brand-100 mt-3 h-1.5 overflow-hidden rounded-full">
            <div className="bg-brand-500 h-full w-[37%] rounded-full" />
          </div>

          {/* 一週打卡格（樣式對齊 TaskRow） */}
          <div className="divide-border mt-6 divide-y">
            <div className={`${rowGrid} pb-2`}>
              <span className="text-muted-foreground text-xs font-semibold">
                任務
              </span>
              {DAYS.map((d, i) => (
                <span
                  key={d}
                  className={`text-center text-xs ${
                    i === TODAY_INDEX
                      ? 'text-brand-700 font-bold'
                      : 'text-muted-foreground font-medium'
                  }`}
                >
                  {d}
                </span>
              ))}
            </div>

            {TASKS.map((task) => (
              <div key={task.name} className={`${rowGrid} py-2.5`}>
                <span className="truncate pr-2 text-xs font-medium sm:text-sm">
                  {task.name}
                </span>
                {task.days.map((done, i) => (
                  <span
                    key={i}
                    className={`mx-auto flex h-6 w-6 items-center justify-center rounded-md text-xs sm:h-8 sm:w-8 sm:rounded-lg sm:text-sm ${
                      done
                        ? 'bg-brand-600 text-white shadow-[0_4px_10px_-4px_rgba(79,111,88,0.6)]'
                        : 'border-border border-2'
                    }`}
                  >
                    {done ? <PiCheckBold /> : null}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <div className="border-border text-muted-foreground mt-5 flex items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs sm:text-sm">
            <span className="text-sm leading-none">＋</span>
            <span>新增任務</span>
          </div>
        </div>

        {/* 浮動小卡：連續打卡（streak 暖色僅此處使用） */}
        <div
          className="animate-float bg-card absolute -top-9 -right-1 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_18px_40px_-18px_rgba(60,86,69,0.5)] sm:-top-10 sm:-right-8 sm:px-5 sm:py-4"
          style={{ animationDelay: '-2.5s' }}
        >
          <PiFlameFill className="text-streak text-2xl sm:text-3xl" />
          <div className="text-left">
            <p className="text-muted-foreground text-[10px] sm:text-xs">
              連續打卡
            </p>
            <p className="font-outfit text-lg leading-tight font-bold sm:text-2xl">
              12{' '}
              <span className="text-muted-foreground text-xs font-semibold">
                天
              </span>
            </p>
          </div>
        </div>

        {/* 浮動小卡：成長階段 */}
        <div
          className="animate-float bg-card absolute -bottom-9 -left-1 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_18px_40px_-18px_rgba(60,86,69,0.5)] sm:-bottom-10 sm:-left-8 sm:px-5 sm:py-4"
          style={{ animationDelay: '-5s' }}
        >
          <div className="bg-brand-50 flex h-10 w-10 items-end justify-center overflow-hidden rounded-xl sm:h-12 sm:w-12">
            <GrowthStageIcon stage={2} className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <div className="text-left">
            <p className="text-muted-foreground text-[10px] sm:text-xs">
              成長階段
            </p>
            <p className="text-sm leading-tight font-bold sm:text-base">
              樹苗
              <span className="text-muted-foreground font-medium">
                {' '}
                · 離大樹又近一步
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
