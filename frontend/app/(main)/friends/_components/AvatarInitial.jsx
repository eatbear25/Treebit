// 好友頭像：以顯示名稱第一個字當縮寫（同 ProfileDialog 的做法）
export default function AvatarInitial({ name, className = 'h-10 w-10' }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase()
  return (
    <div
      aria-hidden
      className={`bg-brand-100 text-brand-800 flex shrink-0 items-center justify-center rounded-full text-base font-semibold ${className}`}
    >
      {initial}
    </div>
  )
}
