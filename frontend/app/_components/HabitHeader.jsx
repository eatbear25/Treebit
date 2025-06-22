'use client'
import { logout as logoutApi } from '@/utils/auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { PiGearBold } from 'react-icons/pi'

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

export default function HabitHeader() {
  const router = useRouter()

  const handleLogout = async (values) => {
    console.log('按下登出')
    try {
      await logoutApi()
      toast.success('登出成功')
      router.push('/')
    } catch (err) {
      toast.error(err.message || '登出失敗')
    }
  }

  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-1 text-xl font-bold">
        2個習慣
        <button className="cursor-pointer rounded-lg px-3 py-1 text-3xl transition hover:bg-[#C8CACD] active:scale-95">
          +
        </button>
      </div>

      <div>
        <AlertDialog>
          <AlertDialogTrigger>
            <PiGearBold className="cursor-pointer rounded-lg p-2 text-5xl transition hover:bg-[#C8CACD] active:scale-95" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>待完工區域</AlertDialogTitle>
              <AlertDialogDescription>親愛的歡迎你!</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>關閉</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>登出</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
