'use client'

import { login as loginApi } from '@/utils/auth'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { forwardRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PiEye, PiEyeSlash } from 'react-icons/pi'
import { cn } from '@/lib/utils'

// 自定義 PasswordInput 組件
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
        onClick={() => setShowPassword(!showPassword)}
        className="absolute top-1/2 right-4 -translate-y-1/2 transform text-lg text-muted-foreground transition-colors hover:text-foreground"
        tabIndex={-1}
      >
        {showPassword ? <PiEyeSlash /> : <PiEye />}
      </button>
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'

// 定義 zod schema
const loginSchema = z.object({
  account: z
    .string({ message: '帳號為必填欄位' })
    .min(1, { message: '請輸入帳號' }),
  password: z
    .string({ message: '密碼為必填欄位' })
    .min(1, { message: '請輸入密碼' }),
})

// 定義表單
export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      account: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    setLoading(true)
    setError('')

    try {
      const res = await loginApi(values.account, values.password)
      login(res.data)
      toast.success('登入成功')
      router.push('/habits') // 登入成功導回首頁或其他頁
    } catch (err) {
      const msg = err.message || '登入失敗'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="account"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">帳號</FormLabel>
              <FormControl>
                <Input className="py-5" placeholder="請輸入帳號" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">密碼</FormLabel>
              <FormControl>
                <PasswordInput
                  className="py-5"
                  placeholder="請輸入密碼"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="treebit"
          disabled={loading}
          className={cn(
            'flex w-full items-center justify-center gap-2',
            loading && 'cursor-not-allowed opacity-50'
          )}
        >
          登入
          <span className="text-lg">→</span>
        </Button>
      </form>
    </Form>
  )
}
