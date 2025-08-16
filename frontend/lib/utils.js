import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// lib/utils.js
export function formatDateToLocalYMD(dateString, offsetHours = 8) {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date)) return '無效日期'

  // 時區補正
  date.setHours(date.getHours() + offsetHours)

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}
