'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PiDotsThreeBold } from 'react-icons/pi'
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import RenameHabitDialog from './RenameHabitDialog'

import { API_BASE_URL } from '@/lib/api'

// 習慣的「⋯」操作選單（編輯／分享／封存／刪除），卡片與條列檢視共用
export default function HabitActionsMenu({
  id,
  title,
  goal,
  visibility,
  onHabitsChanged,
  className = '',
}) {
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showArchiveDialog, setShowArchiveDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isShared = visibility === 'friends'

  const deleteHabit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '刪除習慣失敗')
      }

      toast.success(data.message || '刪除成功')
      if (onHabitsChanged) onHabitsChanged()
    } catch (err) {
      console.error('刪除習慣失敗', err)
      toast.error(err.message || '刪除失敗')
      throw err
    }
  }

  const archiveHabit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${id}/archive`, {
        method: 'PATCH',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '封存習慣失敗')
      }

      toast.success(data.message || '封存成功')
      if (onHabitsChanged) onHabitsChanged()
    } catch (err) {
      console.error('封存習慣失敗', err)
      toast.error(err.message || '封存失敗')
      throw err
    }
  }

  const toggleVisibility = async () => {
    const next = isShared ? 'private' : 'friends'
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ visibility: next }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '更新可見性失敗')
      }

      toast.success(data.message)
      if (onHabitsChanged) onHabitsChanged()
    } catch (err) {
      console.error('更新可見性失敗', err)
      toast.error(err.message || '更新可見性失敗')
    }
  }

  const handleConfirmDelete = async () => {
    await deleteHabit()
    setShowDeleteDialog(false)
  }

  const handleConfirmArchive = async () => {
    await archiveHabit()
    setShowArchiveDialog(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="更多操作"
            className={`text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-2 text-xl transition ${className}`}
          >
            <PiDotsThreeBold />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setShowRenameDialog(true)}
          >
            編輯
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={toggleVisibility}
          >
            {isShared ? '取消分享' : '分享給好友'}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => setShowArchiveDialog(true)}
          >
            封存
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive cursor-pointer"
            onClick={() => setShowDeleteDialog(true)}
          >
            刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 編輯習慣對話框（名稱＋目標） */}
      <RenameHabitDialog
        habitId={id}
        currentTitle={title}
        currentGoal={goal}
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        onRenamed={onHabitsChanged}
      />

      {/* 刪除確認對話框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要刪除「{title}」嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              刪除後，這個習慣的所有任務與打卡紀錄將一併移除，無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              確定刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 封存確認對話框 */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>要封存「{title}」嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              封存後會移到「歷史紀錄」保存成果，隨時可以取消封存繼續進行。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmArchive}>
              確定封存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
