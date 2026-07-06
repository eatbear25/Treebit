'use client'

import AuthHeader from './_components/AuthHeader'
import AppToaster from '../_components/AppToaster'
import { AuthProvider } from '@/contexts/AuthContext'

export default function AuthLayout({ children }) {
  return (
    <AuthProvider>
      <div className="bg-surface mx-auto flex min-h-screen flex-col items-center px-6 pt-10">
        <AuthHeader />
        <main className="mx-auto w-full pb-6 md:w-1/2 xl:w-1/3">
          <AppToaster />
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
