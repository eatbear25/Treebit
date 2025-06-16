import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Treebit</h1>
        <p className="mb-6">每天一點點，長出你的習慣之樹</p>
        <Link
          href="/habits"
          className="rounded-lg bg-green-600 px-6 py-3 text-white"
        >
          開始使用
        </Link>
      </div>
    </div>
  )
}
