'use client'

import { PiPlusBold } from 'react-icons/pi'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const habitsSchema = z.object({
  title: z
    .string({ message: '習慣名稱為必填欄位' })
    .min(2, { message: '習慣名稱至少需 2 個字' }),
  total_weeks: z.string().min(1, { message: '總週數為必填欄位' }),
  goal: z.string().max(500, { message: '目標最多 500 個字' }).optional(),
})

export function HabitForm({ onHabitAdded }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(habitsSchema),
    defaultValues: {
      title: '',
      total_weeks: '',
      goal: '',
    },
  })

  const onSubmit = async (values) => {
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/habits`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          total_weeks: Number(values.total_weeks),
          goal: values.goal?.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '新增習慣失敗')
      }

      // 成功處理
      toast.success(data.message || '新增習慣成功！')
      setOpen(false)
      form.reset()

      // 通知父組件更新習慣列表
      if (onHabitAdded) {
        onHabitAdded()
      }
    } catch (err) {
      console.error('新增習慣錯誤:', err)
      toast.error(err.message || '新增失敗，請重試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="bg-brand-700 hover:bg-brand-800 dark:text-brand-50 flex cursor-pointer items-center gap-1.5 rounded-tl-xl rounded-br-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98] md:px-5 md:text-base">
          <PiPlusBold />
          新增習慣
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新增習慣</DialogTitle>
          <DialogDescription>
            取個名稱、決定要持續幾週，也可以寫下想達成的目標；之後再逐週安排任務。
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
                    <Input placeholder="例如：規律運動" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="total_weeks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>總週數</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="請選擇週數" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }).map((_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>
                            {i + 1} 週
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? '新增中...' : '新增'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
