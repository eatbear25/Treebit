'use client'

import { useState, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { logout as logoutApi } from '@/utils/auth'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HabitForm } from './HabitForm'
import {
  PiGearBold,
  PiNotePencilBold,
  PiArrowBendUpLeft,
  PiEye,
  PiEyeSlash,
} from 'react-icons/pi'
import { cn } from '@/lib/utils'

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

const PasswordInput = forwardRef(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={cn('pr-12', className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute top-1/2 right-4 -translate-y-1/2 transform text-lg text-muted-foreground transition-colors hover:text-foreground"
        tabIndex={-1}
      >
        {showPassword ? <PiEyeSlash /> : <PiEye />}
      </button>
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'

export default function HabitHeader({ habitsNum, onHabitAdded }) {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const isGoogle = user?.provider === 'google'

  const [isEditing, setIsEditing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  // 基本資料（僅顯示名稱可修改）
  const formSchema = z.object({
    username: z
      .string()
      .min(2, { message: '顯示名稱至少需 2 個字' })
      .optional(),
  })

  // 改密碼（只有 local 才會顯示）
  const passwordSchema = z
    .object({
      currentPassword: z.string().min(6, { message: '請輸入當前密碼' }),
      newPassword: z
        .string()
        .min(6, { message: '密碼至少需 6 個字' })
        .max(20, { message: '密碼最多 20 個字' }),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: '兩次輸入的密碼不一致',
      path: ['confirmPassword'],
    })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username || '',
    },
  })

  const handleLogout = async () => {
    try {
      await logoutApi()
      toast.success('登出成功')
      router.push('/')
    } catch (err) {
      toast.error(err.message || '登出失敗')
    }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // 僅可修改顯示名稱
      const payload = {
        ...(values.username ? { username: values.username.trim() } : {}),
      }

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      const result = await res.json()

      if (!res.ok) {
        if (result.errors) {
          result.errors.forEach((e) =>
            form.setError(e.path[0], { message: e.message })
          )
        }
        throw new Error(result.message || '更新失敗')
      }

      toast.success('更新成功')
      await refreshUser()
      setIsEditing(false)
    } catch (err) {
      toast.error(err.message || '更新失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (values) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          oldPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.message)
      toast.success('密碼更新成功，請重新登入')
      await logoutApi()
      router.push('/')
    } catch (err) {
      toast.error(err.message || '密碼更新失敗')
    }
  }

  return (
    <div className="mb-6 flex h-12 items-center justify-between">
      <div className="flex items-center gap-1 text-xl font-bold">
        {habitsNum} 個習慣
        <HabitForm onHabitAdded={onHabitAdded} />
      </div>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <PiGearBold className="cursor-pointer rounded-lg p-2 text-5xl transition hover:bg-muted active:scale-95" />
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center justify-between border-b border-border pb-3 text-2xl text-foreground">
              <span>{isEditing ? '編輯會員資料' : '會員資料'}</span>
              {isEditing ? (
                <PiArrowBendUpLeft
                  onClick={() => setIsEditing(false)}
                  className="cursor-pointer rounded-lg p-2 text-5xl transition hover:bg-muted"
                />
              ) : (
                <PiNotePencilBold
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer rounded-lg p-2 text-5xl transition hover:bg-muted"
                />
              )}
            </AlertDialogTitle>
          </AlertDialogHeader>

          {isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>顯示名稱</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="請輸入顯示名稱" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <Button type="submit" disabled={loading}>
                    {loading ? '儲存中...' : '儲存'}
                  </Button>
                </AlertDialogFooter>
              </form>
            </Form>
          ) : (
            <ul className="flex flex-col gap-5">
              <li>
                <p className="font-bold text-primary">顯示名稱</p>
                <p>{user?.username}</p>
              </li>
              <li>
                <p className="font-bold text-primary">
                  {isGoogle ? '電子郵件' : '帳號'}
                </p>
                <p>{isGoogle ? user?.email || '—' : user?.account || '—'}</p>
              </li>

              {/* 只有本地帳號顯示「修改密碼」；Google 顯示提示 */}
              {!isGoogle ? (
                <li>
                  <Dialog
                    open={passwordDialogOpen}
                    onOpenChange={setPasswordDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <p className="cursor-pointer font-bold text-primary hover:opacity-90">
                        點此修改密碼
                      </p>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>修改密碼</DialogTitle>
                      </DialogHeader>
                      <Form {...passwordForm}>
                        <form
                          onSubmit={passwordForm.handleSubmit(
                            handleChangePassword
                          )}
                          className="space-y-4"
                        >
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>當前密碼</FormLabel>
                                <FormControl>
                                  <PasswordInput
                                    {...field}
                                    placeholder="請輸入目前密碼"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>新密碼</FormLabel>
                                <FormControl>
                                  <PasswordInput
                                    {...field}
                                    placeholder="請輸入新密碼"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>確認新密碼</FormLabel>
                                <FormControl>
                                  <PasswordInput
                                    {...field}
                                    placeholder="請再次輸入新密碼"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <AlertDialogFooter>
                            <Button type="submit">更新密碼</Button>
                          </AlertDialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </li>
              ) : (
                <li className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                  您是使用 <b>Google</b> 登入。
                </li>
              )}
            </ul>
          )}

          {!isEditing && (
            <AlertDialogFooter>
              <AlertDialogCancel>關閉</AlertDialogCancel>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button>登出</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>登出</AlertDialogTitle>
                    <AlertDialogDescription>
                      您即將登出，確定要繼續嗎？
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>關閉</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>
                      確定登出
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
