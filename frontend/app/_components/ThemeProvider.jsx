'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

// 深色模式：以 class 切換（globals.css 的 .dark token），預設跟隨系統
export default function ThemeProvider({ children }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
