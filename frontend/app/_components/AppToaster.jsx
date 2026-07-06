'use client'

import { Toaster } from 'sonner'
import { useTheme } from 'next-themes'

// sonner 不會自己跟 .dark class 走，需把 next-themes 的結果餵給 theme prop
export default function AppToaster() {
  const { resolvedTheme } = useTheme()

  return (
    <Toaster
      position="top-center"
      richColors
      theme={resolvedTheme ?? 'light'}
    />
  )
}
