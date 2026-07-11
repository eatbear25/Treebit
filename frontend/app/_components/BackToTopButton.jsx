'use client'

import { useEffect, useState } from 'react'
import { PiArrowUpBold } from 'react-icons/pi'

// 回到頂端浮動按鈕：捲過一段距離才出現，避免一進頁面就搶視線。
// 尊重 prefers-reduced-motion：直接跳回頂端、不做平滑捲動。
export default function BackToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="回到頂端"
      className={`bg-brand-700 hover:bg-brand-800 dark:text-brand-50 fixed right-6 bottom-6 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_10px_24px_-10px_rgba(60,86,69,0.55)] transition-[opacity,transform,background-color] duration-300 hover:cursor-pointer active:scale-[0.95] md:right-8 md:bottom-8 ${
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <PiArrowUpBold className="text-xl" />
    </button>
  )
}
