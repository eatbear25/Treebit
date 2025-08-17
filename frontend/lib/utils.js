import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDateSimple(dateString) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date)) return '無效日期'

    // 直接使用 toLocaleDateString
    return date
      .toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '-')
  } catch (error) {
    console.error('日期格式化錯誤:', error)
    return '日期錯誤'
  }
}
