'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { API_BASE_URL } from '@/lib/api'

// 與 WeeklyNotes 相同的 textarea 樣式（專案未引入 shadcn Textarea）
const textareaClass =
  'w-full rounded-md border border-input bg-card px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-brand-300 focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive'

const editSchema = z.object({
  title: z
    .string({ message: '習慣名稱為必填欄位' })
    .min(2, { message: '習慣名稱至少需 2 個字' }),
  goal: z.string().max(500, { message: '目標最多 500 個字' }).optional(),
})

export default function RenameHabitDialog({
  habitId,
  currentTitle,
  currentGoal,
  open,
  onOpenChange,
  onRenamed,
}) {
  const [saving, setSaving] = useState(false)

  const form = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: { title: currentTitle, goal: currentGoal || '' },
  })

  // 每次開啟都以目前內容重置（取消後再開不殘留上次輸入）
  useEffect(() => {
    if (open) form.reset({ title: currentTitle, goal: currentGoal || '' })
  }, [open, currentTitle, currentGoal, form])

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: values.title.trim(),
          goal: values.goal?.trim() || null,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '更新習慣失敗')
      }

      toast.success(data.message || '習慣已更新')
      onOpenChange(false)
      onRenamed?.()
    } catch (err) {
      console.error('更新習慣錯誤:', err)
      toast.error(err.message || '更新失敗，請重試')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>編輯習慣</DialogTitle>
          <DialogDescription>
            修改「{currentTitle}」的名稱與目標，不影響已建立的任務與打卡紀錄。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>習慣名稱</FormLabel>
                  <FormControl>
                    <Input autoFocus {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目標（選填）</FormLabel>
                  <FormControl>
                    <textarea
                      rows={2}
                      placeholder="例如：8 週後，我要能連續慢跑 5 公里"
                      className={textareaClass}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  取消
                </Button>
              </DialogClose>
              <Button type="submit" disabled={saving}>
                {saving ? '儲存中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
