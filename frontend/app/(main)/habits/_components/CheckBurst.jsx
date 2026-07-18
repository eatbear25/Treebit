'use client'

import { useMemo } from 'react'

// 打卡慶祝特效：從打勾按鈕中心向外噴出的小彩帶
// 顏色取品牌 sage 色階 + streak 暖色，維持整體視覺一致
const COLORS = [
  'var(--brand-300)',
  'var(--brand-400)',
  'var(--brand-600)',
  'var(--streak)',
]

const PIECE_COUNT = 10

export default function CheckBurst() {
  // 每次 mount 隨機產生一組彈道，讓每次噴發都不太一樣
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }, (_, i) => {
        // 以按鈕為圓心均分角度，再加一點隨機擾動
        const angle =
          (i / PIECE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.6
        const distance = 22 + Math.random() * 14
        return {
          tx: `${Math.round(Math.cos(angle) * distance)}px`,
          ty: `${Math.round(Math.sin(angle) * distance)}px`,
          rot: `${Math.round((Math.random() - 0.5) * 260)}deg`,
          size: 4 + Math.random() * 3,
          color: COLORS[i % COLORS.length],
          isDot: i % 3 === 0,
          delay: `${Math.round(Math.random() * 60)}ms`,
        }
      }),
    []
  )

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="burst-piece"
          style={{
            '--tx': p.tx,
            '--ty': p.ty,
            '--rot': p.rot,
            width: p.size,
            height: p.isDot ? p.size : p.size * 1.8,
            borderRadius: p.isDot ? '9999px' : '2px',
            backgroundColor: p.color,
            animationDelay: p.delay,
          }}
        />
      ))}
    </span>
  )
}
