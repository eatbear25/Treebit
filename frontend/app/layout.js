import './_styles/globals.css'
import { Noto_Sans_TC, Inter } from 'next/font/google'

export const metadata = {
  title: 'Treebit | 每天一點點，長出你的習慣之樹',
  description: '每天一點點，長出你的習慣之樹。',
}

const noto = Noto_Sans_TC({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto',
})

const inter = Inter({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${noto.variable} ${inter.variable} font-noto`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
