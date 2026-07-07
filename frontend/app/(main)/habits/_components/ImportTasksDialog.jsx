'use client'

import { useState } from 'react'
import { PiCheckBold, PiCopySimpleBold } from 'react-icons/pi'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Loader from '@/app/_components/Loader'

import { API_BASE_URL } from '@/lib/api'

// 匯入上週任務：勾選要帶到本週的任務，目標次數可先調整
export default function ImportTasksDialog({
  prevWeekId,
  currentTaskNames = [],
  onImportTasks,
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [items, setItems] = useState([])

  const fetchPrevWeekTasks = async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/habits/weeks/${prevWeekId}/tasks`,
        { credentials: 'include' }
      )
      const data = await res.json()
      if (data.success) {
        const existing = new Set(currentTaskNames)
        setItems(
          data.data.map((task) => ({
            id: task.id,
            name: task.name,
            target_days: String(task.target_days),
            // 本週已有同名任務的預設不勾，避免重複匯入
            checked: !existing.has(task.name),
          }))
        )
      }
    } catch (err) {
      console.error('獲取上週任務錯誤:', err)
      toast.error('載入上週任務失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (next) => {
    setOpen(next)
    if (next) fetchPrevWeekTasks()
  }

  const toggleItem = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    )
  }

  const setItemTarget = (id, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, target_days: value } : item
      )
    )
  }

  const selected = items.filter((item) => item.checked)

  const handleImport = async () => {
    if (selected.length === 0) return
    setSubmitting(true)
    try {
      await onImportTasks(
        selected.map((item) => ({
          name: item.name,
          target_days: Number(item.target_days),
        }))
      )
      setOpen(false)
    } catch {
      // 錯誤訊息由父層 toast 處理，保持對話框開啟讓使用者重試
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="border-border text-muted-foreground hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 flex cursor-pointer items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition active:scale-[0.99] sm:px-5">
          <PiCopySimpleBold />
          <span>匯入上週任務</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>匯入上週任務</DialogTitle>
          <DialogDescription>
            勾選要帶到這一週的任務，目標次數可以先調整。
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            上週沒有任務可以匯入
          </p>
        ) : (
          <ul className="divide-border border-border divide-y rounded-lg border">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={item.checked}
                  aria-label={`匯入 ${item.name}`}
                  onClick={() => toggleItem(item.id)}
                  className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md transition-all ${
                    item.checked
                      ? 'bg-brand-600 dark:text-brand-50 text-white'
                      : 'border-border hover:border-brand-300 border-2'
                  }`}
                >
                  {item.checked && <PiCheckBold className="text-sm" />}
                </button>

                <span
                  className={`min-w-0 flex-1 truncate text-sm font-medium ${
                    item.checked ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.name}
                </span>

                <Select
                  value={item.target_days}
                  onValueChange={(value) => setItemTarget(item.id, value)}
                  disabled={!item.checked}
                >
                  <SelectTrigger className="h-8 w-[104px] shrink-0" size="sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {i + 1} 次
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              取消
            </Button>
          </DialogClose>
          <Button
            onClick={handleImport}
            disabled={submitting || selected.length === 0}
          >
            {submitting ? '匯入中⋯' : `匯入 ${selected.length} 個任務`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
