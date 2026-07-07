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

const renameSchema = z.object({
  title: z
    .string({ message: '習慣名稱為必填欄位' })
    .min(2, { message: '習慣名稱至少需 2 個字' }),
})

export default function RenameHabitDialog({
  habitId,
  currentTitle,
  open,
  onOpenChange,
  onRenamed,
}) {
  const [saving, setSaving] = useState(false)

  const form = useForm({
    resolver: zodResolver(renameSchema),
    defaultValues: { title: currentTitle },
  })

  // 每次開啟都以目前名稱重置（取消後再開不殘留上次輸入）
  useEffect(() => {
    if (open) form.reset({ title: currentTitle })
  }, [open, currentTitle, form])

  const onSubmit = async (values) => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: values.title.trim() }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '更新習慣名稱失敗')
      }

      toast.success(data.message || '習慣名稱已更新')
      onOpenChange(false)
      onRenamed?.()
    } catch (err) {
      console.error('更新習慣名稱錯誤:', err)
      toast.error(err.message || '更新失敗，請重試')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>重新命名</DialogTitle>
          <DialogDescription>
            幫「{currentTitle}」取個新名字，不影響已建立的任務與打卡紀錄。
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
