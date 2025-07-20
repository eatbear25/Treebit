'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PiXBold } from 'react-icons/pi'
import { formatDateToLocalYMD } from '@/lib/utils'

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

export default function HistoryCard({
  title,
  total_weeks,
  created_at,
  updated_at,
  id,
  onHabitsChanged,
  onRestore,
  onDelete,
}) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  // TODO: 點進封存頁面
  const handleViewTask = () => {
    router.push(`/habits/${id}`)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    await onDelete(id)
    setShowDeleteDialog(false)
  }

  const handleArchiveClick = () => {
    setShowArchiveDialog(true)
  }

  const handleConfirmArchive = async () => {
    await onRestore(id)
    setShowArchiveDialog(false)
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
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleArchiveClick}
            >
              取消封存
            </DropdownMenuItem>
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
            <span className="inter text-2xl font-[700]">
              <div>{formatDateToLocalYMD(created_at)}</div>
            </span>
            <span className="text-xl text-[#9A9FA5]">開始日期</span>
          </li>

          <li className="flex flex-col items-center justify-center">
            <span className="inter text-2xl font-[700]">
              <div>{formatDateToLocalYMD(updated_at)}</div>
            </span>
            <span className="text-xl text-[#9A9FA5]">封存日期</span>
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

      {/* 封存確認對話框 */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>您確定要取消封存嗎?</AlertDialogTitle>
            <AlertDialogDescription>
              取消封存後的習慣將移至習慣管理頁面，您可以隨時恢復。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>關閉</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmArchive}>
              取消封存 {title}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
