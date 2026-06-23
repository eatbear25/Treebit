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
import { formatTimestampToTaiwanYMD } from '@/lib/utils'

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

export default function HabitCard({
  title,
  total_weeks,
  created_at,
  id,
  onHabitsChanged,
}) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)

  const handleViewTask = () => {
    router.push(`/habits/${id}`)
  }

  const deleteHabit = async function (habitId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
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
  const archiveHabit = async function (habitId) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}/archive`, {
        method: 'PATCH',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '封存習慣失敗')
      }

      toast.success(data.message || '封存成功')
      if (onHabitsChanged) onHabitsChanged()

      return data.message || '封存成功'
    } catch (err) {
      console.error('封存習慣失敗', err)
      toast.error(err.message || '封存失敗')
      throw err
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleArchiveClick = () => {
    setShowArchiveDialog(true)
  }

  const handleConfirmDelete = async () => {
    await deleteHabit(id)
    setShowDeleteDialog(false)
  }

  const handleConfirmArchive = async () => {
    await archiveHabit(id)
    setShowArchiveDialog(false)
  }

  return (
    <>
      <div className="relative mb-10 flex h-[300px] w-full flex-col justify-between rounded-2xl bg-card p-8 shadow-[0_10px_30px_-14px_rgba(79,111,88,0.25)]">
        {/* 下拉選單 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="absolute top-4 right-4 cursor-pointer rounded-lg p-1 transition hover:bg-muted">
              <span className="text-muted-foreground">⋯</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={handleArchiveClick}
            >
              封存
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={handleDeleteClick}
            >
              刪除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="mb-6 text-2xl font-bold">{title}</div>

        <ul className="mb-8 flex justify-around text-sm">
          <li className="flex flex-col items-center justify-center">
            <span className="font-outfit tnum text-3xl font-[700]">
              {total_weeks}
            </span>
            <span className="text-xl text-muted-foreground">總週數</span>
          </li>

          <li className="flex flex-col items-center justify-center">
            <span className="font-outfit tnum text-3xl font-[700]">
              {formatTimestampToTaiwanYMD(created_at)}
            </span>
            <span className="text-xl text-muted-foreground">創立時間</span>
          </li>
        </ul>

        <button
          onClick={handleViewTask}
          className="w-full cursor-pointer rounded-tl-xl rounded-br-xl bg-primary py-3 text-xl font-[600] text-primary-foreground shadow-[0_8px_20px_-8px_rgba(79,111,88,0.5)] transition hover:scale-101 hover:bg-brand-600 active:scale-99"
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
            <AlertDialogTitle>您確定要封存嗎?</AlertDialogTitle>
            <AlertDialogDescription>
              封存後的習慣將移至歷史頁面，您可以隨時恢復。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmArchive}>
              封存 {title}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
