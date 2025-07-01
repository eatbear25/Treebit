'use client'

import Sidebar from '../_components/Sidebar'
import { AuthProvider } from '@/contexts/AuthContext'

export default function Layout({ children }) {
  return (
    <>
      <AuthProvider>
        <div className="min-h-screen bg-[#F2F2F2] px-2 pt-8 md:px-6 md:pt-12">
          <div className="container mx-auto flex flex-col gap-8 lg:flex-row">
            <Sidebar />
            {/* lg:w-2/3 */}
            <main className="w-full max-w-6xl">{children}</main>
          </div>
        </div>
      </AuthProvider>
    </>
  )
}
