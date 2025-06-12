import Sidebar from '../_components/Sidebar'

export default function Layout({ children }) {
  return (
    <>
      <div className="min-h-screen bg-[#F2F2F2] p-6">
        <div className="container mx-auto flex gap-8">
          <Sidebar />
          <main className="w-2/3">{children}</main>
        </div>
      </div>
    </>
  )
}
