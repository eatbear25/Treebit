import './globals.css'

import { Noto_Sans_TC, Lato } from 'next/font/google'

const notoSansTraditionalChinese = Noto_Sans_TC({
  weight: ['100', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto',
})

const lato = Lato({
  weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
})

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${notoSansTraditionalChinese.variable} ${lato.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
