import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// 純日期（DATE 欄位，如 start_date、打卡 date）：直接擷取 YYYY-MM-DD，
// 不經過 new Date() 轉換，避免時區位移。
export function formatDateToLocalYMD(dateString) {
  if (!dateString) return ''

  // 純日期欄位（DATE）後端已回傳 YYYY-MM-DD 字串，這裡直接取用、不經 new Date()，
  // 避免任何時區位移；若帶有時間部分（ISO 字串）則只取日期段。
  const dateStr = String(dateString).split('T')[0]
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return '無效日期'
  return dateStr
}

// 時間戳（TIMESTAMP 欄位，如 created_at、updated_at）：以台灣時區顯示為 YYYY-MM-DD。
// 與純日期不同，這裡需要做時區轉換才能正確反映台灣當天。
export function formatTimestampToTaiwanYMD(timestamp) {
  if (!timestamp) return ''

  const dt = new Date(timestamp)
  if (Number.isNaN(dt.getTime())) return '無效日期'

  // en-CA 的格式即為 YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(dt)
}

// 將 YYYY-MM-DD 加上指定天數，回傳新的 YYYY-MM-DD（以 UTC 計算純日期，避免位移）
export function addDaysToYMD(ymd, days) {
  const [year, month, day] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(year, month - 1, day))
  dt.setUTCDate(dt.getUTCDate() + days)

  const yy = dt.getUTCFullYear()
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

// 台灣時區的今天（YYYY-MM-DD），與後端 utils/date.js 的 getTaiwanTodayYMD 對齊
export function getTaiwanTodayYMD() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

// 兩個純日期字串（YYYY-MM-DD）相差的天數（b - a），以 UTC 午夜相減避免時區位移
export function diffDaysYMD(a, b) {
  const toUTC = (ymd) => {
    const [y, m, d] = ymd.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((toUTC(b) - toUTC(a)) / 86400000)
}

// 由第一週起始日推算「今天是第幾週」（1 起算，夾在 1..totalWeeks 之間）
export function getCurrentWeekNumber(firstStartDate, totalWeeks) {
  const start = formatDateToLocalYMD(firstStartDate)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return 1
  const week = Math.floor(diffDaysYMD(start, getTaiwanTodayYMD()) / 7) + 1
  return Math.min(Math.max(week, 1), totalWeeks || 1)
}

// 由該週起始日（YYYY-MM-DD）產生 7 天的日期陣列：
// short 用於表頭顯示 (M/D)，full 用於對應打卡記錄 (YYYY-MM-DD)。
export function getWeekDates(startDate) {
  if (!startDate) return []

  const start = formatDateToLocalYMD(startDate)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return []

  return Array.from({ length: 7 }, (_, i) => {
    const full = addDaysToYMD(start, i)
    const [, m, d] = full.split('-').map(Number)
    return { short: `${m}/${d}`, full }
  })
}
