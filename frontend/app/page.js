import Link from 'next/link'
import Image from 'next/image'
import {
  PiCheckBold,
  PiFlameFill,
  PiChartLineUpBold,
  PiGithubLogoBold,
} from 'react-icons/pi'

// 招牌斜角主按鈕：品牌唯一刻意破格的記憶點（rounded-tl / rounded-br）
const ctaPrimary =
  'inline-flex items-center justify-center gap-2 rounded-tl-2xl rounded-br-2xl bg-brand-700 px-8 py-4 text-base font-semibold text-white shadow-[0_14px_30px_-12px_rgba(60,86,69,0.55)] transition hover:bg-brand-800 active:scale-[0.98] md:text-lg'

const ctaOnDark =
  'inline-flex items-center justify-center gap-2 rounded-tl-2xl rounded-br-2xl bg-white px-8 py-4 text-base font-semibold text-brand-800 transition hover:bg-brand-50 active:scale-[0.98] md:text-lg'

// 英文小標（uppercase + 字距，排版重量）
const kicker =
  'font-outfit text-xs font-semibold uppercase tracking-[0.22em] text-brand-700 md:text-sm'

const stages = [
  { name: '種子', desc: '第一次打卡' },
  { name: '幼苗', desc: '連續幾天' },
  { name: '樹苗', desc: '堅持數週' },
  { name: '大樹', desc: '習慣成形' },
]

const steps = [
  {
    no: '01',
    title: '種下第一個習慣',
    desc: '選一件想改變的事，設定週數，今天就開始。',
  },
  {
    no: '02',
    title: '每天打卡澆水',
    desc: '完成任務後打個勾，看著連續天數一天天累積。',
  },
  {
    no: '03',
    title: '寫下每週記事',
    desc: '每週留幾分鐘記錄心得，回頭就看得見自己的改變。',
  },
]

const features = [
  {
    Icon: PiFlameFill,
    iconClass: 'text-streak',
    title: '連續天數',
    desc: '連續完成越多天，火苗燒得越旺，讓你捨不得中斷。',
  },
  {
    Icon: PiCheckBold,
    iconClass: 'text-brand-600',
    title: '每週打卡格',
    desc: '一格一格打勾，整週進度一眼看完，清楚又有成就感。',
  },
  {
    Icon: PiChartLineUpBold,
    iconClass: 'text-brand-600',
    title: '達成率回顧',
    desc: '用清楚的數據，隨時回顧自己一路走了多遠。',
  },
]

export default function Home() {
  return (
    <>
      <nav className="container mx-auto flex items-center justify-between px-6 py-6 xl:px-0">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="Treebit Logo"
            width={40}
            height={40}
            className="md:h-[44px] md:w-[44px]"
          />
          <span className="font-outfit text-2xl font-bold md:text-3xl">
            Treebit
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-3">
          <Link
            href="/login"
            className="text-foreground/80 hover:text-foreground rounded-full px-4 py-2 text-base font-medium transition md:text-lg"
          >
            登入
          </Link>
          <Link
            href="/register"
            className="bg-brand-700 hover:bg-brand-800 rounded-tl-xl rounded-br-xl px-4 py-2 text-base font-semibold text-white transition active:scale-[0.98] md:px-5 md:text-lg"
          >
            免費開始
          </Link>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(55%_48%_at_50%_12%,rgba(123,161,125,0.2),transparent_70%)]"
          />

          <div className="container mx-auto px-6 pt-14 pb-20 text-center md:pt-24 md:pb-28 xl:px-0">
            <p className={kicker}>養成習慣，從今天開始</p>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl leading-[1.18] font-bold sm:text-5xl md:text-6xl lg:text-7xl">
              每天一點點，
              <br />
              把習慣種成
              <span className="text-brand-700">一棵樹</span>
            </h1>

            <p className="text-muted-foreground mx-auto mt-7 max-w-lg text-base md:text-xl">
              選一件想改變的事，每天打卡，看著它一週週長大。
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <Link href="/register" className={ctaPrimary}>
                免費開始種一棵樹
              </Link>
              <p className="text-muted-foreground text-sm">
                已經有帳號了？{' '}
                <Link
                  href="/login"
                  className="text-brand-700 font-semibold underline-offset-4 hover:underline"
                >
                  登入
                </Link>
              </p>
            </div>

            {/* 手機畫面：透明 PNG 直接浮在背景上，無外框 */}
            <div className="relative mt-16 flex justify-center md:mt-20">
              <div
                aria-hidden
                className="bg-brand-200/45 absolute top-6 left-1/2 -z-10 h-[78%] w-[min(86%,460px)] -translate-x-1/2 rounded-[50%] blur-3xl"
              />
              <Image
                src="/app-screen02.png"
                alt="Treebit 每週打卡介面"
                width={1464}
                height={2978}
                priority
                className="h-auto w-[230px] drop-shadow-[0_44px_70px_rgba(44,63,51,0.26)] sm:w-[270px] md:w-[310px]"
              />
            </div>
          </div>
        </section>

        {/* GROWTH：成長階段（無框，排版式） */}
        <section className="container mx-auto px-6 py-24 text-center md:py-32 xl:px-0">
          <p className={kicker}>How it grows</p>
          <h2 className="mt-4 text-3xl font-bold md:text-5xl">
            習慣，是一天一天長出來的
          </h2>

          <div className="relative mx-auto mt-16 aspect-[480/130] w-full max-w-3xl">
            <Image
              src="/logo-growth-stages.svg"
              alt="習慣成長階段：種子、幼苗、樹苗、大樹"
              fill
              className="object-contain"
            />
          </div>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-4 gap-2">
            {stages.map((s) => (
              <div key={s.name}>
                <p className="text-brand-700 text-base font-bold md:text-lg">
                  {s.name}
                </p>
                <p className="text-muted-foreground mt-1 text-xs md:text-sm">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-foreground/80 mx-auto mt-14 max-w-md text-lg md:text-xl">
            你的每一次完成，都讓這棵樹長大一點。
          </p>
        </section>

        {/* HOW IT WORKS：編號清單（髮絲線分隔，無框） */}
        <section className="container mx-auto px-6 py-12 md:py-20 xl:px-0">
          <div className="mx-auto max-w-3xl">
            <p className={kicker}>How it works</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              從想法到習慣，就這麼簡單
            </h2>

            <ol className="border-border mt-14 border-t">
              {steps.map((step) => (
                <li
                  key={step.no}
                  className="border-border flex items-baseline gap-6 border-b py-8 md:gap-10 md:py-10"
                >
                  <span className="font-outfit tnum text-brand-300 text-3xl leading-none font-bold md:text-5xl">
                    {step.no}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 text-base md:text-lg">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* PROGRESS：看得見的進度（無框三欄，純圖示） */}
        <section className="container mx-auto px-6 py-24 md:py-32 xl:px-0">
          <div className="mx-auto max-w-3xl text-center">
            <p className={kicker}>Stay motivated</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              進步，要看得見才走得下去
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-12 md:grid-cols-3 md:gap-10">
            {features.map(({ Icon, iconClass, title, desc }) => (
              <div key={title} className="text-center md:text-left">
                <Icon className={`text-4xl ${iconClass}`} />
                <h3 className="mt-5 text-xl font-bold md:text-2xl">{title}</h3>
                <p className="text-muted-foreground mt-3">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FINALE：深綠整片 band */}
        <section className="bg-brand-800 dark:bg-brand-100">
          <div className="container mx-auto flex flex-col items-center px-6 py-24 text-center md:py-28 xl:px-0">
            <h2 className="text-3xl font-bold text-white md:text-5xl">
              今天，就種下第一顆種子
            </h2>
            <p className="mt-6 max-w-xl text-base text-white/75 md:text-lg">
              習慣不必一次到位，從一個小目標開始就好。
              <br className="hidden sm:block" />
              Treebit 會一直陪著你，慢慢長成想要的樣子。
            </p>
            <Link href="/register" className={`${ctaOnDark} mt-10`}>
              免費開始種一棵樹
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-border border-t">
        <div className="container mx-auto flex flex-col items-center gap-5 px-6 py-10 md:flex-row md:justify-between xl:px-0">
          <div className="flex items-center gap-2.5">
            <Image src="/icon.svg" alt="" width={26} height={26} />
            <span className="font-outfit text-lg font-bold">Treebit</span>
          </div>

          <p className="text-muted-foreground text-sm">
            每天一點點，把習慣種成一棵樹。
          </p>

          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <a
              href="https://github.com/eatbear25/Treebit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground inline-flex items-center gap-1.5 font-medium transition-colors"
            >
              <PiGithubLogoBold className="text-base" />
              GitHub
            </a>
            <span aria-hidden>·</span>
            <span>© 2026 Treebit</span>
          </div>
        </div>
      </footer>
    </>
  )
}
