import Link from 'next/link'
import Image from 'next/image'
import { PiPottedPlant, PiLink, PiTree } from 'react-icons/pi'

export default function Home() {
  return (
    <>
      <nav className="container mx-auto mb-8 flex justify-between px-6 py-6 md:mb-16 xl:px-0">
        <Link href="/" className="flex items-center justify-center gap-3">
          <Image
            src="/icon.svg"
            alt="Treebit Logo"
            width={40}
            height={40}
            className="md:h-[44px] md:w-[44px]"
          />
          <span className="inter text-2xl font-bold md:text-3xl">Treebit</span>
        </Link>

        <ul className="flex items-center gap-2">
          <li>
            <Link
              href="/login"
              className="block rounded-3xl px-4 py-2 text-lg transition hover:bg-[#3D8D7A] hover:font-bold hover:text-white md:px-5 md:py-2 md:text-xl"
            >
              登入
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="block rounded-3xl px-4 py-2 text-lg transition hover:bg-[#3D8D7A] hover:font-bold hover:text-white md:px-5 md:py-2 md:text-xl"
            >
              註冊
            </Link>
          </li>
        </ul>
      </nav>

      <main className="container mx-auto px-6 xl:px-0">
        {/* section-hero */}
        <section className="mb-8 md:mb-20">
          <div className="mx-auto flex flex-col items-center md:w-4/5">
            <h1 className="mb-8 text-center text-2xl font-bold md:mb-12 md:text-4xl lg:text-5xl">
              用 Treebit，把改變種進日常 🪴
            </h1>
            <p className="text-md mb-1 md:text-lg">
              每天一點點，讓生活開出新的枝葉
            </p>
            <p className="text-md mb-12 md:text-lg">
              習慣不是一蹴而就，而是一次又一次的小選擇
            </p>
            <Link
              href="/habits"
              className="mb-6 block rounded-2xl border-2 border-[#3D8D7A] bg-[#3D8D7A] px-10 py-4 text-xl font-semibold text-white transition hover:scale-101 hover:bg-white hover:text-[#3D8D7A] active:scale-99 md:text-2xl lg:mb-12 xl:mb-0"
            >
              立即開始挑戰
            </Link>
          </div>

          <div className="relative h-[300px] w-full md:h-[500px] xl:h-[1000px]">
            <Image
              src="/example.webp"
              alt="Treebit use example"
              fill
              className="object-contain"
            />
          </div>
        </section>

        {/* section-how */}
        <section className="mb-16 lg:mb-32 xl:px-24">
          <div className="mb-12">
            <span className="mb-4 block text-lg font-semibold">
              <span className="inter mr-3 text-[#3D8D7A]">
                HOW IT WORKS &nbsp;&nbsp;|
              </span>
              運作方式
            </span>
            <h2 className="text-3xl font-bold md:text-4xl lg:text-5xl xl:text-6xl">
              從想法到習慣，就這麼簡單
            </h2>
          </div>

          <div className="grid place-items-center gap-12 md:grid-cols-2 md:gap-x-6 md:gap-y-16 lg:gap-16">
            {/* step 1 */}
            {/* 文字 */}
            <div className="order-2 md:order-none">
              <p className="inter mb-2 text-5xl font-bold text-[#ddd] lg:mb-4 lg:text-7xl xl:text-8xl">
                01
              </p>
              <h3 className="mb-5 text-2xl font-bold md:mb-8 lg:text-4xl">
                新增你的第一個習慣
              </h3>
              <p className="text-lg">
                選一件你想改變的事，種下第一顆種子，不需要一次改掉全部，先從一個小習慣開始，輸入名稱、設定週數，Treebit
                就會為你準備好追蹤工具，讓你從今天就能開始養成它。
              </p>
            </div>
            {/* 圖片 */}
            <div className="relative order-1 aspect-[4/3] w-full translate-y-5 md:order-none md:translate-y-0">
              <div className="absolute top-1/2 left-1/2 -z-1 block w-[50%] -translate-1/2 items-center justify-center rounded-full bg-[#c5ddd7] pb-[50%]"></div>

              <Image
                src="/app-screen01.png"
                alt="app screen step1"
                fill
                className="object-contain"
              />

              <div className="absolute top-1/2 left-1/2 -z-2 block w-[65%] -translate-1/2 items-center justify-center rounded-full bg-[#ecf4f2] pb-[65%]"></div>
            </div>

            {/* step 2 */}
            {/* 圖片 */}
            <div className="relative order-3 aspect-[4/3] w-full translate-y-5 md:order-none md:translate-y-0">
              <div className="absolute top-1/2 left-1/2 -z-1 block w-[50%] -translate-1/2 items-center justify-center rounded-full bg-[#c5ddd7] pb-[50%]"></div>

              <Image
                src="/app-screen02.png"
                alt="app screen step2"
                fill
                className="object-contain"
              />

              <div className="absolute top-1/2 left-1/2 -z-2 block w-[65%] -translate-1/2 items-center justify-center rounded-full bg-[#ecf4f2] pb-[65%]"></div>
            </div>
            {/* 文字 */}
            <div className="order-4 md:order-none">
              <p className="inter mb-2 text-5xl font-bold text-[#ddd] lg:mb-4 lg:text-7xl xl:text-8xl">
                02
              </p>
              <h3 className="mb-5 text-2xl font-bold md:mb-8 lg:text-4xl">
                每天完成後打勾
              </h3>
              <p className="text-lg">
                像澆水一樣，讓你的習慣慢慢長大，每天完成任務後，在清單上打個勾，累積連續的天數，看著格子一格格填滿，會讓你更想繼續努力，不知不覺就堅持下來了。
              </p>
            </div>

            {/* step 3 */}
            {/* 文字 */}
            <div className="order-6 md:order-none">
              <p className="inter mb-2 text-5xl font-bold text-[#ddd] lg:mb-4 lg:text-7xl xl:text-8xl">
                03
              </p>
              <h3 className="mb-5 text-2xl font-bold md:mb-8 lg:text-4xl">
                寫下你的每週記事
              </h3>
              <p className="text-lg">
                把過程中的收穫和想法留下來，不只是完成任務，更要記錄感受，每週花幾分鐘回顧，寫下心得、挑戰或小小的突破，幫你看見自己一路走來的改變，讓這段旅程更有意義。
              </p>
            </div>

            {/* 圖片 */}
            <div className="relative order-5 aspect-[4/3] w-full translate-y-5 md:order-none md:translate-y-0">
              <div className="absolute top-1/2 left-1/2 -z-1 block w-[50%] -translate-1/2 items-center justify-center rounded-full bg-[#c5ddd7] pb-[50%]"></div>

              <Image
                src="/app-screen03.png"
                alt="app screen step3"
                fill
                className="object-contain"
              />

              <div className="absolute top-1/2 left-1/2 -z-2 block w-[65%] -translate-1/2 items-center justify-center rounded-full bg-[#ecf4f2] pb-[65%]"></div>
            </div>
          </div>
        </section>

        {/* section feature */}
        <section className="mb-16 lg:mb-32 xl:px-24">
          {/* <div className="text-center">
          <h2 className="mb-3 text-5xl font-bold">
            🌱 簡單又溫暖的習慣養成夥伴
          </h2>
          <p className="text-lg text-[#888]">陪你一點一點，把改變種進生活</p>
        </div> */}

          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <div>
              <div className="mb-4 inline-block rounded-full bg-[#ecf4f2] p-4 md:mb-6 md:p-5">
                <PiPottedPlant className="text-3xl text-[#3D8D7A] md:text-5xl" />
              </div>

              <p className="mb-4 text-2xl font-bold lg:text-3xl">每天一點點</p>
              <p>小小的行動，累積成習慣的養分，幫你實現想要的生活。</p>
            </div>

            <div>
              <div className="mb-4 inline-block rounded-full bg-[#ecf4f2] p-4 md:mb-6 md:p-5">
                <PiLink className="text-3xl text-[#3D8D7A] md:text-5xl" />
              </div>

              <p className="mb-4 text-2xl font-bold lg:text-3xl">
                別讓習慣中斷
              </p>
              <p>每天完成一次，讓習慣的樹苗穩穩長大，不知不覺就走得很遠。</p>
            </div>

            <div>
              <div className="mb-4 inline-block rounded-full bg-[#ecf4f2] p-4 md:mb-6 md:p-5">
                <PiTree className="text-3xl text-[#3D8D7A] md:text-5xl" />
              </div>

              <p className="mb-4 text-2xl font-bold lg:text-3xl">
                看見你的成長
              </p>
              <p>用清楚的視覺，隨時回顧自己的進步和努力。</p>
            </div>
          </div>
        </section>

        {/* section CTA */}
        <section className="mb-16 flex flex-col items-center lg:mb-24 xl:px-24">
          <h2 className="mb-8 text-center text-3xl font-bold lg:text-5xl">
            為你的下一段旅程準備，現在就開始！
          </h2>
          <p className="text-md mb-12 text-center md:text-xl">
            我們相信每個人都能養成讓生活更好的習慣
            <br />而 Treebit，永遠陪你走在路上
          </p>

          <Link
            href="/habits"
            className="mb-6 block rounded-2xl border-2 border-[#3D8D7A] bg-[#3D8D7A] px-10 py-4 text-xl font-semibold text-white transition hover:scale-101 hover:bg-white hover:text-[#3D8D7A] active:scale-99 md:text-2xl lg:mb-12 xl:mb-0"
          >
            開始種下第一顆種子
          </Link>
        </section>
      </main>

      <footer className="bg-[#f2f2f2]">
        <p className="py-6 text-center text-[#666]">
          Treebit © 2025 | Side Project by{' '}
          <a
            href="https://github.com/eatbear25/Treebit"
            className="hover:text-[#333]"
            target="_blank"
          >
            Rachel Chen
          </a>
        </p>
      </footer>
    </>
  )
}
