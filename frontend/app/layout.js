import './_styles/globals.css'
import { Noto_Sans_TC, Outfit } from 'next/font/google'

export const metadata = {
  title: 'Treebit | 每天一點點，長出你的習慣之樹',
  description: '每天一點點，長出你的習慣之樹。',
  icons: {
    icon: '/icon.svg',
  },
}

const noto = Noto_Sans_TC({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto',
})

// Latin / 數字顯示字體（幾何、圓潤，搭配 Calm Organic + sage）
const outfit = Outfit({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
})

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${noto.variable} ${outfit.variable} font-noto`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
