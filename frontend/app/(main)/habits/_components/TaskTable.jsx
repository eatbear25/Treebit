'use client'

import TaskRow from './TaskRow'

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
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const taskSchema = z.object({
  name: z
    .string({ message: '任務名稱為必填欄位' })
    .min(2, { message: '任務名稱至少需 2 個字' }),
  target_days: z
    .string({ message: '目標次數為必填欄位' })
    .min(1, { message: '目標次數為必填欄位' }),
})

export default function TaskTable({
  tasks,
  weekDays,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onEditTask,
}) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const form = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      target_days: '',
    },
  })

  const onSubmit = async (values) => {
    setLoading(true)

    try {
      if (editingTask) {
        // 編輯
        await onEditTask(editingTask.id, values)
      } else {
        // 新增
        await onAddTask(values)
      }

      setOpen(false)
      setEditingTask(null)
      form.reset()
    } catch (err) {
      console.error(err)
      toast.error(editingTask ? '編輯任務失敗' : '新增任務失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8 rounded-lg bg-white shadow-sm">
      <div className="p-5 lg:p-6">
        <h2 className="mb-6 text-xl font-bold text-[#3D8D7A]">每日任務</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="sticky left-0 z-10 w-48 border-r border-gray-200 bg-white p-1 text-left font-bold md:px-4 md:py-3">
                  習慣
                </th>

                {weekDays.map((day, index) => (
                  <th
                    key={index}
                    className="w-16 px-2 py-3 text-center font-medium whitespace-nowrap"
                  >
                    {day}
                  </th>
                ))}
                <th className="w-20 px-2 py-3 text-center font-medium whitespace-nowrap">
                  目標次數
                </th>
                <th className="w-20 px-2 py-3 text-center font-medium whitespace-nowrap">
                  達成次數
                </th>
                <th className="w-24 px-2 py-3 text-center font-medium whitespace-nowrap">
                  本週達成率
                </th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  weekDays={weekDays}
                  onToggleTask={onToggleTask}
                  onDeleteTask={onDeleteTask}
                  onEditTask={(task) => {
                    setEditingTask(task)
                    setOpen(true)
                    form.setValue('name', task.name)
                    form.setValue('target_days', String(task.targetDays))
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="py-8 text-center text-gray-500">尚未新增任務</div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => {
                setEditingTask(null)
                form.reset()
                setOpen(true)
              }}
              className="mt-6 flex cursor-pointer items-center gap-2 rounded-md border border-gray-400 px-4 py-2 transition hover:bg-gray-100 hover:text-gray-700 active:scale-97"
            >
              <span className="text-lg">+</span>
              <span>新增任務</span>
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingTask ? '編輯任務' : '新增任務'}</DialogTitle>
              <DialogDescription>
                {editingTask
                  ? '修改任務資料後，請點擊保存。'
                  : '在這裡新增任務，完成後請點擊新增。'}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>任務名稱</FormLabel>
                      <FormControl>
                        <Input placeholder="請輸入任務名稱" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目標次數</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="請選擇目標次數" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 7 }).map((_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)}>
                                {i + 1} 次
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
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      關閉
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>
                    {loading
                      ? editingTask
                        ? '儲存中...'
                        : '新增中...'
                      : editingTask
                        ? '保存'
                        : '新增'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
