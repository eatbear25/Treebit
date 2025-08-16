'use client'

import { Toaster } from 'sonner'
import AuthHeader from './_components/AuthHeader'
import { AuthProvider } from '@/contexts/AuthContext'

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <div className="mx-auto flex min-h-screen flex-col items-center bg-[#F2F2F2] px-6 pt-10">
        <AuthHeader />
        <main className="mx-auto w-full pb-6 md:w-1/2 xl:w-1/3">
          <Toaster position="top-center" richColors />
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
