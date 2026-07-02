'use client'

import { useState } from 'react'
import { PiCheckBold, PiDotsThreeBold } from 'react-icons/pi'
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

export default function TaskRow({
  task,
  weekDays,
  onToggleTask,
  onDeleteTask,
  onEditTask,
}) {
  const [openConfirm, setOpenConfirm] = useState(false)

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
      <tr className="border-border hover:bg-muted/50 border-b">
        <td className="border-border bg-card sticky left-0 z-10 max-w-[180px] min-w-[120px] border-r p-1 md:p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="break-words whitespace-normal">{task.name}</span>

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
          </div>
        </td>
        {task.completedDays.map((completed, dayIndex) => (
          <td key={dayIndex} className="px-5 py-4 text-center md:px-3">
            <button
              onClick={() => onToggleTask(task.id, dayIndex)}
              aria-label={`${task.name}：${weekDays[dayIndex]} ${completed ? '已完成' : '未完成'}`}
              aria-pressed={completed}
              className={`focus-visible:ring-ring/50 mx-auto flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-all outline-none focus-visible:ring-[3px] active:scale-90 ${
                completed
                  ? 'bg-brand-600 text-white shadow-[0_4px_10px_-4px_rgba(79,111,88,0.6)]'
                  : 'border-border hover:border-brand-300 hover:bg-brand-50 border-2'
              }`}
            >
              {completed && <PiCheckBold />}
            </button>
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
