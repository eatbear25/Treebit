import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Treebit</h1>
        <p className="mb-6">每天一點點，長出你的習慣之樹</p>
        <Link
          href="/habits"
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          開始使用
        </Link>
      </div>
    </div>
  )
}
