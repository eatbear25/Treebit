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
const loginSchema = z.object({
  email: z
    .string({ message: '電子郵件欄為必填欄位' })
    .email('請輸入有效的電子郵件'),
  password: z
    .string({ message: '密碼為必填欄位' })
    .min(6, { message: '密碼至少需 6 個字' })
    .max(20, { message: '密碼最多 20 個字' }),
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
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    console.log('onSubmit called')
    setLoading(true)
    setError('')

    try {
      const res = await loginApi(values.email, values.password)
      // 假設回傳格式為 { data: { user: {...} } }
      await login(res.data)
      toast.success('登入成功')
      router.push('/habits') // 登入成功導回首頁或其他頁
    } catch (err) {
      setError(err.message || '登入失敗')
      toast.error(err.message || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
          className="flex w-full cursor-pointer items-center justify-center gap-2"
        >
          登入
          <span className="text-lg">→</span>
        </Button>
      </form>
    </Form>
  )
}
