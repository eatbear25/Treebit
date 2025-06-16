import Link from 'next/link'

export default function AuthHeader() {
  // return (
  //   <header className="flex !max-w-4xl items-center justify-between gap-10 rounded-xl bg-white p-6 shadow-sm md:p-8">
  //     <div className="flex items-center gap-3">
  //       {/* Logo */}
  //       <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600">
  //         <span className="text-lg font-bold text-white">🌳</span>
  //       </div>
  //       <h1 className="text-2xl font-bold text-gray-900">Treebit</h1>
  //     </div>
  //     <button className="rounded-full bg-green-500 px-6 py-2 font-medium text-white transition-colors hover:bg-green-600">
  //       LOGIN
  //     </button>
  //   </header>
  // )

  return (
    <header className="mx-auto mb-10 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm md:w-1/2 xl:w-1/3">
      <div>
        <Link href="/" className="block w-10">
          <img src="../icon.svg" alt="Treebit Logo" />
        </Link>
      </div>
      <h1 className="inter text-2xl font-bold">Treebit</h1>
      <button className="rounded-3xl bg-[#3D8D7A] px-5 py-3 font-bold text-white">
        登入
      </button>
    </header>
  )
}
