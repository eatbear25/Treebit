import Sidebar from '../_components/Sidebar'

export default function Layout({ children }) {
  return (
    <>
      <div className="min-h-screen bg-[#F2F2F2] px-6 pt-12">
        <div className="container mx-auto flex flex-col gap-8 lg:flex-row">
          <Sidebar />
          <main className="w-full lg:w-2/3">{children}</main>
        </div>
      </div>
    </>
  )
}
