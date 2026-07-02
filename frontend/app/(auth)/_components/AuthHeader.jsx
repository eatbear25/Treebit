import Link from 'next/link'

export default function AuthHeader() {
  return (
    <header className="mb-12 pt-4 md:mb-14">
      <Link href="/" className="flex items-center gap-2.5">
        <img src="/icon.svg" alt="Treebit Logo" className="w-9" />
        <span className="font-outfit text-2xl font-bold">Treebit</span>
      </Link>
    </header>
  )
}
