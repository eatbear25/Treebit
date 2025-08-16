'use client'

import { register as registerApi } from '@/utils/auth'
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
        className="absolute top-1/2 right-4 -translate-y-1/2 transform text-lg text-gray-400 hover:text-gray-600"
        tabIndex={-1}
      >
        {showPassword ? <PiEyeSlash /> : <PiEye />}
      </button>
    </div>
  )
})
PasswordInput.displayName = 'PasswordInput'

// 定義 zod schema
const registerSchema = z
  .object({
    username: z
      .string({ message: '使用者名稱為必填欄位' })
      .min(2, { message: '使用者名稱至少需 2 個字' }),
    email: z
      .string({ message: '電子郵件欄為必填欄位' })
      .email('請輸入有效的電子郵件'),
    password: z
      .string({ message: '密碼為必填欄位' })
      .min(6, { message: '密碼至少需 6 個字' })
      .max(20, { message: '密碼最多 20 個字' }),
    confirmPassword: z.string({ message: '請再次輸入密碼' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '兩次輸入的密碼不一致',
    path: ['confirmPassword'],
  })

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values) => {
    console.log('送出資料:', values)
    setLoading(true)
    setError('')

    try {
      await registerApi(values.username, values.email, values.password)

      toast.success('註冊成功')
      router.push('/login')

      return
    } catch (err) {
      const msg = err.message || '註冊失敗'
      setError(msg)
      toast.error(msg)
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 使用者名稱 */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">使用者名稱</FormLabel>
              <FormControl>
                <Input
                  className="py-5"
                  placeholder="請輸入使用者名稱"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 電子郵件 */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">電子郵件</FormLabel>
              <FormControl>
                <Input
                  className="py-5"
                  placeholder="請輸入電子郵件"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 密碼 */}
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

        {/* 確認密碼 */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="mb-2">確認密碼</FormLabel>
              <FormControl>
                <PasswordInput
                  className="py-5"
                  placeholder="請再次輸入密碼"
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
          註冊
          <span className="text-lg">→</span>
        </Button>
      </form>
    </Form>
  )
}
