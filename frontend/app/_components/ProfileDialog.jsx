'use client'

import { useState, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/contexts/AuthContext'
import { logout as logoutApi } from '@/utils/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  PiNotePencilBold,
  PiLockKeyBold,
  PiCaretRightBold,
  PiEye,
  PiEyeSlash,
  PiPaletteBold,
} from 'react-icons/pi'
import { ThemeOptions } from '@/app/_components/ThemeToggle'

import { Input } from '@/components/ui/input'
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

import { API_BASE_URL } from '@/lib/api'

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
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-4 -translate-y-1/2 transform text-lg transition-colors"
        tabIndex={-1}
      >
        {showPassword ? <PiEyeSlash /> : <PiEye />}
      </button>
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'

const nameSchema = z.object({
  username: z.string().min(2, { message: '顯示名稱至少需 2 個字' }),
})

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

// 設定列共用樣式（編輯名稱 / 修改密碼）
const rowClass =
  'flex w-full cursor-pointer items-center gap-3 p-4 text-sm font-medium transition hover:bg-muted/60'

// trigger：開啟對話框的元素（由呼叫端決定樣式，例如 Sidebar 的頭像列）
export default function ProfileDialog({ trigger }) {
  const router = useRouter()
  const { user, refreshUser } = useAuth()
  const isGoogle = user?.provider === 'google'

  const [open, setOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [saving, setSaving] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)

  const initial = (user?.username || '?').trim().charAt(0).toUpperCase()

  const nameForm = useForm({
    resolver: zodResolver(nameSchema),
    values: { username: user?.username || '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
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

  const handleSaveName = async (values) => {
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: values.username.trim() }),
        credentials: 'include',
      })
      const result = await res.json()

      if (!res.ok) {
        if (result.errors) {
          result.errors.forEach((e) =>
            nameForm.setError(e.path[0], { message: e.message })
          )
        }
        throw new Error(result.message || '更新失敗')
      }

      toast.success('顯示名稱已更新')
      await refreshUser()
      setIsEditingName(false)
    } catch (err) {
      toast.error(err.message || '更新失敗')
    } finally {
      setSaving(false)
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

  const handleOpenChange = (next) => {
    setOpen(next)
    if (!next) setIsEditingName(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>會員資料</DialogTitle>
          <DialogDescription className="sr-only">
            查看與編輯你的會員資料
          </DialogDescription>
        </DialogHeader>

        {/* 個人資訊 */}
        <div className="flex items-center gap-4 py-2">
          <div className="bg-brand-100 text-brand-700 font-outfit flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{user?.username}</p>
            <p className="text-muted-foreground truncate text-sm">
              {isGoogle ? user?.email || '—' : user?.account || '—'}
            </p>
          </div>
          <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2.5 py-1 text-xs font-medium">
            {isGoogle ? 'Google 帳號' : '一般帳號'}
          </span>
        </div>

        {/* 設定列表 */}
        <div className="border-border divide-border divide-y overflow-hidden rounded-lg border">
          {isEditingName ? (
            <Form {...nameForm}>
              <form
                onSubmit={nameForm.handleSubmit(handleSaveName)}
                className="space-y-3 p-4"
              >
                <FormField
                  control={nameForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>顯示名稱</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="請輸入顯示名稱"
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingName(false)}
                  >
                    取消
                  </Button>
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? '儲存中⋯' : '儲存'}
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingName(true)}
              className={rowClass}
            >
              <PiNotePencilBold className="text-muted-foreground text-lg" />
              編輯顯示名稱
              <PiCaretRightBold className="text-muted-foreground/60 ml-auto" />
            </button>
          )}

          {!isGoogle && (
            <Dialog
              open={passwordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <button type="button" className={rowClass}>
                  <PiLockKeyBold className="text-muted-foreground text-lg" />
                  修改密碼
                  <PiCaretRightBold className="text-muted-foreground/60 ml-auto" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>修改密碼</DialogTitle>
                  <DialogDescription>
                    更新後需要重新登入一次。
                  </DialogDescription>
                </DialogHeader>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required>當前密碼</FormLabel>
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
                          <FormLabel required>新密碼</FormLabel>
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
                          <FormLabel required>確認新密碼</FormLabel>
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
                    <DialogFooter className="pt-2">
                      <DialogClose asChild>
                        <Button variant="outline" type="button">
                          取消
                        </Button>
                      </DialogClose>
                      <Button type="submit">更新密碼</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          {/* 外觀（淺色 / 深色 / 系統） */}
          <div className="flex w-full items-center gap-3 p-4 text-sm font-medium">
            <PiPaletteBold className="text-muted-foreground text-lg" />
            外觀
            <div className="ml-auto">
              <ThemeOptions />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 sm:justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              >
                登出
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>確定要登出嗎？</AlertDialogTitle>
                <AlertDialogDescription>
                  登出後隨時可以再回來，你的紀錄都會保留。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  確定登出
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <DialogClose asChild>
            <Button variant="outline">關閉</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
