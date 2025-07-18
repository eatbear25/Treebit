'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PiXBold } from 'react-icons/pi'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

export default function HabitCard({
  title,
  total_weeks,
  percent,
  times,
  id,
  onHabitsChanged,
}) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleViewTask = () => {
    router.push(`/habits/${id}`)
  }

  const deleteHabit = async function (habitId) {
    try {
      const res = await fetch(`http://localhost:3001/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '刪除習慣失敗')
      }

      toast.success(data.message || '刪除成功')
      if (onHabitsChanged) onHabitsChanged()

      return data.message || '刪除成功'
    } catch (err) {
      console.error('刪除習慣失敗', err)
      toast.error(err.message || '刪除失敗')
      throw err
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    await deleteHabit(id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="relative mb-10 flex h-[300px] w-full flex-col justify-between rounded-md bg-white p-8 shadow-sm">
        {/* 下拉選單 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-4 right-4 cursor-pointer rounded p-1 hover:bg-gray-100">
              <span className="text-gray-400">⋯</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">封存</DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-red-500"
              onClick={handleDeleteClick}
            >
              刪除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mb-6 text-2xl font-bold">{title}</div>

        <ul className="mb-8 flex justify-between text-sm">
          <li className="flex flex-col items-center justify-center">
            <span className="inter text-3xl font-[700]">{total_weeks}</span>
            <span className="text-xl text-[#9A9FA5]">週</span>
          </li>

          <li className="flex flex-col items-center justify-center">
            <span className="inter text-3xl font-[700]">
              {percent}
              <span className="ml-1 text-xl font-[700] text-[#9A9FA5]">%</span>
            </span>
            <span className="text-xl text-[#9A9FA5]">達成率</span>
          </li>

          <li className="flex flex-col items-center justify-center">
            <span className="inter text-3xl font-[700]">{times}</span>
            <span className="text-xl text-[#9A9FA5]">次數</span>
          </li>
        </ul>

        <button
          onClick={handleViewTask}
          className="w-full cursor-pointer rounded-tl-xl rounded-br-xl bg-[#3D8D7A] py-3 text-xl font-[600] text-white shadow-lg transition hover:scale-101 hover:bg-[#509887] active:scale-99"
        >
          查看任務
        </button>
      </div>

      {/* 刪除確認對話框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>您確定要刪除嗎?</AlertDialogTitle>
            <AlertDialogDescription>
              習慣一經刪除後將無法恢復，請確認是否要繼續。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              刪除 {title}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
