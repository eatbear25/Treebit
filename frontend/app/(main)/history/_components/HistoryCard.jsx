'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PiDotsThreeBold } from 'react-icons/pi'
import { formatDateToLocalYMD, formatTimestampToTaiwanYMD } from '@/lib/utils'

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

export default function HistoryCard({
  title,
  total_weeks,
  created_at,
  updated_at,
  first_start_date,
  completed_logs,
  total_target_days,
  id,
  onRestore,
  onDelete,
}) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)

  const startYMD = first_start_date
    ? formatDateToLocalYMD(first_start_date)
    : formatTimestampToTaiwanYMD(created_at)
  const archivedYMD = formatTimestampToTaiwanYMD(updated_at)

  const completedCount = Number(completed_logs) || 0
  const targetTotal = Number(total_target_days) || 0
  const completionRate =
    targetTotal > 0
      ? Math.min(100, Math.round((completedCount / targetTotal) * 100))
      : null

  const handleConfirmDelete = async () => {
    await onDelete(id)
    setShowDeleteDialog(false)
  }

  const handleConfirmRestore = async () => {
    await onRestore(id)
    setShowRestoreDialog(false)
  }

  return (
    <>
      <div className="bg-card flex h-full flex-col rounded-2xl p-6 shadow-[0_10px_30px_-14px_rgba(79,111,88,0.25)] transition-shadow duration-300 hover:shadow-[0_18px_40px_-16px_rgba(79,111,88,0.38)] md:p-7">
        {/* 標題列 + 選單 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold md:text-2xl">{title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">
              <span className="font-outfit tnum">{startYMD}</span> –{' '}
              <span className="font-outfit tnum">{archivedYMD}</span> · 共{' '}
              <span className="tnum">{total_weeks}</span> 週
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="更多操作"
                className="text-muted-foreground hover:bg-muted hover:text-foreground -mt-1 -mr-1 shrink-0 cursor-pointer rounded-lg p-2 text-xl transition"
              >
                <PiDotsThreeBold />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setShowRestoreDialog(true)}
              >
                取消封存
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => setShowDeleteDialog(true)}
              >
                刪除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 成果數據 */}
        <dl className="mt-6 mb-7 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-muted-foreground text-sm">目標達成率</dt>
            <dd className="font-outfit mt-1 text-2xl font-bold md:text-3xl">
              {completionRate !== null ? (
                <>
                  {completionRate}
                  <span className="text-muted-foreground ml-0.5 text-base font-semibold">
                    %
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground text-base font-medium">
                  無任務紀錄
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">累計打卡</dt>
            <dd className="font-outfit mt-1 text-2xl font-bold md:text-3xl">
              {completedCount}
              <span className="text-muted-foreground ml-1 text-base font-semibold">
                次
              </span>
            </dd>
          </div>
        </dl>

        <button
          onClick={() => router.push(`/history/${id}`)}
          className="bg-brand-100 text-brand-800 hover:bg-brand-200 mt-auto w-full cursor-pointer rounded-tl-xl rounded-br-xl py-3 text-base font-semibold transition active:scale-[0.99]"
        >
          查看紀錄
        </button>
      </div>

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

      {/* 取消封存確認對話框 */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>要取消封存「{title}」嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              取消封存後，這個習慣會移回「習慣管理」，可以繼續打卡。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore}>
              取消封存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
