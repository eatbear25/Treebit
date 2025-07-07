'use client'

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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export default function HabitCard({
  title,
  total_weeks,
  percent,
  times,
  id,
  onHabitsChanged,
}) {
  const router = useRouter()

  const handleViewTask = () => {
    router.push(`/habits/${title}`)
  }

  const deleteHabit = async function (habitId) {
    try {
      const res = await fetch(`http://localhost:3001/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || '刪除習慣失敗')
      }

      toast.success(data.message || '刪除成功')
      if (onHabitsChanged) onHabitsChanged() // <-- 新增這行

      return data.message || '刪除成功'
    } catch (err) {
      console.error('刪除習慣失敗', err)
      toast.error(err.message || '刪除失敗')
      throw err
    }
  }

  return (
    // <div className="md:w-max-[400px] relative mb-10 flex h-[300px] w-full flex-col justify-between rounded-md bg-white p-8 shadow-sm">
    <div className="relative mb-10 flex h-[300px] w-full flex-col justify-between rounded-md bg-white p-8 shadow-sm">
      {/* 刪除按鈕 */}
      <AlertDialog>
        <AlertDialogTrigger>
          <PiXBold className="absolute top-4 right-4 cursor-pointer text-2xl text-[#9A9FA5] transition hover:text-[#3D8D7A] md:text-xl" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>您確定要刪除嗎?</AlertDialogTitle>
            <AlertDialogDescription>
              習慣一經刪除後將無法恢復，請確認是否要繼續。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteHabit(id)}>
              刪除 {title}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-6 text-2xl font-bold">{title}</div>

      <ul className="mb-8 flex justify-between text-sm">
        <li className="flex flex-col items-center justify-center">
          <span className="inter text-3xl font-[700]">{total_weeks}</span>
          <span className="text-xl text-[#9A9FA5]">週</span>
        </li>

        <li className="flex flex-col items-center justify-center">
          <span className="inter text-3xl font-[700]">
            {percent}
            <span className="ml-1 text-xl font-[700] text-[#9A9FA5]">%</span>
          </span>
          <span className="text-xl text-[#9A9FA5]">達成率</span>
        </li>

        <li className="flex flex-col items-center justify-center">
          <span className="inter text-3xl font-[700]">{times}</span>
          <span className="text-xl text-[#9A9FA5]">次數</span>
        </li>
      </ul>

      <button
        onClick={handleViewTask}
        className="w-full cursor-pointer rounded-tl-xl rounded-br-xl bg-[#3D8D7A] py-3 text-xl font-[600] text-white shadow-lg transition hover:scale-101 hover:bg-[#509887] active:scale-99"
      >
        查看任務
      </button>

      {/* <button
        onClick={handleViewTask}
        className="w-full cursor-pointer rounded-tl-xl rounded-br-xl py-3 text-xl font-[600] text-white shadow-lg transition hover:scale-101 hover:brightness-110 active:scale-99"
        style={{
          background: 'linear-gradient(135deg, #3D8D7A 0%, #A3D1C6 100%)',
        }}
      >
        查看任務
      </button> */}
    </div>
  )
}
