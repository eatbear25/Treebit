'use client'

import { useState } from 'react'
import { PiCheckBold } from 'react-icons/pi'
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
}) {
  const [openConfirm, setOpenConfirm] = useState(false)

  const getCompletionRate = (task) => {
    return Math.round((task.completedCount / task.targetDays) * 100)
  }

  const handleConfirmDelete = () => {
    onDeleteTask(task.id)
    setOpenConfirm(false)
  }

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="sticky left-0 z-10 max-w-[180px] min-w-[120px] border-r border-gray-200 bg-white p-1 md:p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="break-words whitespace-normal">{task.name}</span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="cursor-pointer rounded p-1 hover:bg-gray-100">
                  ⋯
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => setOpenConfirm(true)}
                  className="cursor-pointer text-red-500"
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
              className={`mx-auto flex h-7 w-7 cursor-pointer items-center justify-center rounded transition-colors ${
                completed
                  ? 'bg-[#317162] text-white'
                  : 'border-2 border-gray-300 hover:border-[#A3D1C6] hover:bg-[#ecf4f2]'
              }`}
            >
              {completed && <PiCheckBold />}
            </button>
          </td>
        ))}
        <td className="px-2 py-4 text-center font-medium whitespace-nowrap text-gray-700">
          {task.targetDays}
        </td>
        <td className="px-2 py-4 text-center font-medium whitespace-nowrap text-gray-700">
          {task.completedCount}
        </td>
        <td className="px-2 py-4 text-center whitespace-nowrap">
          <span
            className={`font-medium ${
              getCompletionRate(task) === 100
                ? 'text-[#3D8D7A]'
                : getCompletionRate(task) >= 50
                  ? 'text-yellow-500'
                  : 'text-red-600'
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
