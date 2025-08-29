'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

const habitsSchema = z.object({
  title: z
    .string({ message: '習慣名稱為必填欄位' })
    .min(2, { message: '習慣名稱至少需 2 個字' }),
  total_weeks: z.string().min(1, { message: '總週數為必填欄位' }),
})

export function HabitForm({ onHabitAdded }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm({
    resolver: zodResolver(habitsSchema),
    defaultValues: {
      title: '',
      total_weeks: '',
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
        <Button variant="addHabit" className="cursor-pointer text-3xl">
          +
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>新增習慣</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>習慣名稱</FormLabel>
                  <FormControl>
                    <Input placeholder="請輸入習慣名稱" {...field} />
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
                  <FormLabel>總週數</FormLabel>
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
