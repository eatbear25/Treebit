import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// lib/utils.js
export function formatDateToLocalYMD(dateString, timezone = 'Asia/Taipei') {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date)) return '無效日期'

    // 使用 Intl.DateTimeFormat 處理時區
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .format(date)
      .replace(/\//g, '-')
  } catch (error) {
    console.error('日期格式化錯誤:', error)
    return '日期錯誤'
  }
}
