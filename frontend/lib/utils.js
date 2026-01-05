import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDateToLocalYMD(dateString) {
  if (!dateString) return ''

  try {
    // 直接擷取 YYYY-MM-DD 部分，避免時區轉換問題
    const dateStr = dateString.split('T')[0]
    // 驗證格式是否正確 (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return '無效日期'
    }
    return dateStr
  } catch (error) {
    console.error('日期格式化錯誤:', error)
    return '日期錯誤'
  }
}
