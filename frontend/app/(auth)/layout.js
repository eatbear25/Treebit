import AuthHeader from './_components/AuthHeader'

export default function AuthLayout({ children }) {
  return (
    <div className="mx-auto flex min-h-screen flex-col items-center bg-[#F2F2F2] px-6 pt-6">
      {/* Header */}
      <AuthHeader />

      <main className="mx-auto w-full pb-6 md:w-1/2 xl:w-1/3">{children}</main>
    </div>
  )
}
