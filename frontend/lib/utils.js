import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// 日期格式工具
export function formatDateToLocalYMD(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date)) return '無效日期'

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${yyyy}/${mm}/${dd}`
}
