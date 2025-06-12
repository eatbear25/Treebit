export default function Header() {
  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
          {/* Logo */}
        </div>
        <p>這裡是頭部</p>
      </div>
      <button>⚙️</button>
    </header>
  )
}
