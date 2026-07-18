'use client'

import { useEffect, useRef, useState } from 'react'
import {
  PiCheckBold,
  PiDotsThreeBold,
  PiDotsSixVerticalBold,
} from 'react-icons/pi'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import CheckBurst from './CheckBurst'

export default function TaskRow({
  task,
  weekDays,
  onToggleTask,
  onDeleteTask,
  onEditTask,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnter,
  onDragEnd,
  // 唯讀模式：好友查看用（打卡格純顯示、無操作選單）
  readOnly = false,
}) {
  const [openConfirm, setOpenConfirm] = useState(false)
  // 只有從把手按下才允許拖曳整列，避免誤拖文字或按鈕
  const [dragArmed, setDragArmed] = useState(false)
  // 打卡慶祝特效：記錄剛打勾的那一格（{ day, id }），動畫結束後清掉
  const [burst, setBurst] = useState(null)
  const burstTimerRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(burstTimerRef.current)
  }, [])

  const handleToggle = (dayIndex, completed) => {
    // 只在「未完成 → 完成」時噴彩帶；取消打卡不慶祝
    if (!completed) {
      clearTimeout(burstTimerRef.current)
      setBurst({ day: dayIndex, id: Date.now() })
      burstTimerRef.current = setTimeout(() => setBurst(null), 800)
    }
    onToggleTask(task.id, dayIndex)
  }

  const getCompletionRate = (task) => {
    return Math.min(
      100,
      Math.round((task.completedCount / task.targetDays) * 100)
    )
  }

  const handleConfirmDelete = () => {
    onDeleteTask(task.id)
    setOpenConfirm(false)
  }

  return (
    <>
      <tr
        draggable={dragArmed}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', String(task.id))
          onDragStart?.(task.id)
        }}
        onDragEnter={() => onDragEnter?.(task.id)}
        onDragOver={(e) => e.preventDefault()}
        onDragEnd={() => {
          setDragArmed(false)
          onDragEnd?.()
        }}
        className={`border-border hover:bg-muted/50 border-b transition-opacity ${
          isDragging ? 'opacity-40' : ''
        }`}
      >
        <td className="border-border bg-card sticky left-0 z-10 max-w-[200px] min-w-[130px] border-r p-1 shadow-[6px_0_8px_-6px_rgba(46,50,46,0.35)] md:p-4 md:pl-2 dark:shadow-[6px_0_8px_-6px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between gap-2">
            {draggable && (
              <span
                aria-hidden
                onMouseDown={() => setDragArmed(true)}
                onMouseUp={() => setDragArmed(false)}
                onTouchStart={() => setDragArmed(true)}
                onTouchEnd={() => setDragArmed(false)}
                title="拖曳調整順序"
                className="text-muted-foreground/50 hover:text-foreground shrink-0 cursor-grab active:cursor-grabbing"
              >
                <PiDotsSixVerticalBold />
              </span>
            )}
            <span className="flex-1 break-words whitespace-normal">
              {task.name}
            </span>

            {readOnly ? null : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="任務操作"
                    className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-1.5 transition"
                  >
                    <PiDotsThreeBold />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => onEditTask(task)}
                    className="cursor-pointer"
                  >
                    編輯
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setOpenConfirm(true)}
                    className="text-destructive cursor-pointer"
                  >
                    刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </td>
        {task.completedDays.map((completed, dayIndex) => (
          <td key={dayIndex} className="px-5 py-4 text-center md:px-3">
            {readOnly ? (
              <span
                aria-label={`${task.name}：${weekDays[dayIndex]} ${completed ? '已完成' : '未完成'}`}
                className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${
                  completed
                    ? 'bg-brand-600 dark:text-brand-50 text-white shadow-[0_4px_10px_-4px_rgba(79,111,88,0.6)]'
                    : 'border-border border-2'
                }`}
              >
                {completed && <PiCheckBold />}
              </span>
            ) : (
              <span className="relative mx-auto flex h-8 w-8">
                <button
                  onClick={() => handleToggle(dayIndex, completed)}
                  aria-label={`${task.name}：${weekDays[dayIndex]} ${completed ? '已完成' : '未完成'}`}
                  aria-pressed={completed}
                  className={`focus-visible:ring-ring/50 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all outline-none focus-visible:ring-[3px] active:scale-90 ${
                    completed
                      ? 'bg-brand-600 dark:text-brand-50 text-white shadow-[0_4px_10px_-4px_rgba(79,111,88,0.6)]'
                      : 'border-border hover:border-brand-300 hover:bg-brand-50 border-2'
                  }`}
                >
                  {completed && (
                    <PiCheckBold
                      className={
                        burst?.day === dayIndex ? 'animate-check-pop' : ''
                      }
                    />
                  )}
                </button>
                {burst?.day === dayIndex && <CheckBurst key={burst.id} />}
              </span>
            )}
          </td>
        ))}
        <td className="tnum text-muted-foreground px-2 py-4 text-center font-medium whitespace-nowrap">
          {task.targetDays}
        </td>
        <td className="tnum text-foreground px-2 py-4 text-center font-medium whitespace-nowrap">
          {task.completedCount}
        </td>
        <td className="px-2 py-4 text-center whitespace-nowrap">
          <span
            className={`tnum ${
              getCompletionRate(task) === 100
                ? 'text-brand-700 font-semibold'
                : 'text-foreground font-medium'
            }`}
          >
            {getCompletionRate(task)}%
          </span>
        </td>
      </tr>

      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>確定要刪除這個任務嗎？</DialogTitle>
            <DialogDescription>刪除後無法恢復。</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpenConfirm(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmDelete}>確定刪除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
