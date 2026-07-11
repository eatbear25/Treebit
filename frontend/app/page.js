import Link from 'next/link'
import Image from 'next/image'
import {
  PiCheckBold,
  PiFlameFill,
  PiChartLineUpBold,
  PiUsersThreeBold,
  PiPlusBold,
} from 'react-icons/pi'
import LandingNav from './_components/LandingNav'
import Reveal from './_components/Reveal'
import BackToTopButton from './_components/BackToTopButton'
import HeroAppPreview from './_components/HeroAppPreview'
import GrowthStageIcon from './_components/GrowthStageIcon'

// 招牌斜角主按鈕：品牌唯一刻意破格的記憶點（rounded-tl / rounded-br）
const ctaPrimary =
  'inline-flex items-center justify-center gap-2 rounded-tl-2xl rounded-br-2xl bg-brand-700 px-8 py-4 text-base font-semibold text-white shadow-[0_14px_30px_-12px_rgba(60,86,69,0.55)] transition hover:bg-brand-800 active:scale-[0.98] md:text-lg dark:text-brand-50'

const ctaOnDark =
  'inline-flex items-center justify-center gap-2 rounded-tl-2xl rounded-br-2xl bg-white px-8 py-4 text-base font-semibold text-brand-800 transition hover:bg-brand-50 active:scale-[0.98] md:text-lg dark:text-brand-100 dark:hover:bg-brand-900'

// 英文小標（uppercase + 字距，排版重量）
const kicker =
  'font-outfit text-xs font-semibold uppercase tracking-[0.22em] text-brand-700 md:text-sm'

const stages = [
  { name: '種子', desc: '第一次打卡' },
  { name: '幼苗', desc: '持續了幾天' },
  { name: '樹苗', desc: '堅持了幾週' },
  { name: '大樹', desc: '習慣成形' },
]

const steps = [
  {
    no: '01',
    title: '種下一個習慣',
    desc: '選一件想改變的事，決定要陪它走幾週。例如：八週的「規律運動」。',
  },
  {
    no: '02',
    title: '安排這週的任務',
    desc: '把習慣拆成做得到的小行動，替每個任務設定一週要完成幾次。狀態好的週多排一點，忙碌的週就放輕，也可以一鍵匯入上週的任務。',
  },
  {
    no: '03',
    title: '每天打卡澆水',
    desc: '做到了就打個勾。連續天數與達成率自動累積，你的樹也跟著長大。',
  },
  {
    no: '04',
    title: '寫下每週記事',
    desc: '週末留幾分鐘，記下這一週的心得。幾週後回頭看，改變清清楚楚。',
  },
]

const features = [
  {
    Icon: PiFlameFill,
    iconClass: 'text-streak',
    title: '連續天數',
    desc: '每多堅持一天，火苗就燒得更旺。那種捨不得中斷的感覺，就是習慣正在生根。',
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
    desc: '每一週、每個習慣的達成率自動算好，隨時回顧自己走了多遠。',
  },
  {
    Icon: PiUsersThreeBold,
    iconClass: 'text-brand-600',
    title: '和好友一起種',
    desc: '把習慣設為好友可見，互相看看彼此的樹。一個人容易放棄，有伴走得遠。',
  },
]

const faqs = [
  {
    q: 'Treebit 是什麼？',
    a: 'Treebit 是一個習慣養成網站。選一件想改變的事、決定要走幾週，每天打卡記錄進度——你的堅持會化成一棵慢慢長大的樹，看得見，也捨不得中斷。',
  },
  {
    q: '適合拿來養成哪些習慣？',
    a: '只要是想長期累積的事都適合：規律運動、閱讀、早睡、寫作、練英文……訣竅是把它拆成每週做得到的小任務，一步一步來。',
  },
  {
    q: '「習慣」和「任務」有什麼不同？',
    a: '習慣是你想達成的多週目標，例如八週的「規律運動」；任務是每一週實際執行的小行動，例如「慢跑 30 分鐘」。每週的任務可以單獨調整，狀態好就加量，忙碌的週就放輕。',
  },
  {
    q: '忘記打卡怎麼辦？',
    a: '回到那一週，把漏掉的格子補上就好。數據以實際完成為準，不會因為晚了一天按，努力就不算數。',
  },
  {
    q: '可以同時養成幾個習慣？',
    a: '數量沒有限制，不過建議從一、兩個開始。等第一棵樹站穩了，再種下一棵。',
  },
  {
    q: '週數走完之後呢？',
    a: '可以把習慣封存，它會收進「歷史紀錄」，完整保留每週的打卡數據與記事，隨時回顧這趟旅程。然後——種下一棵新的。',
  },
  {
    q: '別人看得到我的習慣嗎？',
    a: '預設只有你自己看得到。你可以把個別習慣設為「好友可見」，加了好友之後就能互相查看進度、互相打氣。',
  },
  {
    q: '手機能用嗎？要下載 App 嗎？',
    a: '不用下載。Treebit 是響應式網站，手機瀏覽器打開就能打卡，體驗和電腦上一樣順。',
  },
]

export default function Home() {
  return (
    <>
      <LandingNav />

      <main>
        {/* HERO */}
        <section className="relative">
          <div className="container mx-auto px-6 pt-14 pb-24 text-center md:pt-24 md:pb-32 xl:px-0">
            <p className={`${kicker} animate-rise`}>小小累積，慢慢成林</p>

            <h1
              className="animate-rise mx-auto mt-6 max-w-4xl text-4xl leading-[1.18] font-bold sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ animationDelay: '100ms' }}
            >
              每天一點點，
              <br />
              把習慣種成
              <span className="text-brand-700">一棵樹</span>
            </h1>

            <p
              className="text-muted-foreground animate-rise mx-auto mt-7 max-w-xl text-base md:text-xl"
              style={{ animationDelay: '220ms' }}
            >
              選一件想改變的事，拆成每週做得到的小任務。
              <br className="hidden sm:block" />
              每天打個勾，看著它從一顆種子，慢慢長成大樹。
            </p>

            <div
              className="animate-rise mt-10 flex flex-col items-center gap-4"
              style={{ animationDelay: '340ms' }}
            >
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

            {/* app 畫面示意：以 design token 直接刻，不再用會過期的截圖 */}
            <div
              className="animate-rise mt-20 md:mt-24"
              style={{ animationDelay: '460ms' }}
            >
              <HeroAppPreview />
            </div>
          </div>
        </section>

        {/* GROWTH：成長階段（無框，排版式） */}
        <section className="container mx-auto px-6 py-24 text-center md:py-32 xl:px-0">
          <Reveal>
            <p className={kicker}>How it grows</p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              習慣，是一天一天長出來的
            </h2>
          </Reveal>

          <Reveal delay={150}>
            {/* 用元件而非靜態 SVG 檔：顏色走 token，深色模式自動適應 */}
            <div
              role="img"
              aria-label="習慣成長階段：種子、幼苗、樹苗、大樹"
              className="relative mx-auto mt-16 aspect-[480/130] w-full max-w-3xl"
            >
              <GrowthStageIcon full className="h-full w-full" />
            </div>
          </Reveal>

          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-4 gap-2">
            {stages.map((s, i) => (
              <Reveal key={s.name} delay={250 + i * 90}>
                <p className="text-brand-700 text-base font-bold md:text-lg">
                  {s.name}
                </p>
                <p className="text-muted-foreground mt-1 text-xs md:text-sm">
                  {s.desc}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <p className="text-foreground/80 mx-auto mt-14 max-w-md text-lg md:text-xl">
              每一次打卡，樹就長大一點。
              <br />
              它現在的樣子，就是你堅持的樣子。
            </p>
          </Reveal>
        </section>

        {/* HOW IT WORKS：新手上路四步驟（髮絲線分隔，無框） */}
        <section
          id="how-it-works"
          className="container mx-auto scroll-mt-24 px-6 py-12 md:py-20 xl:px-0"
        >
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <p className={kicker}>How it works</p>
              <h2 className="mt-4 text-3xl font-bold md:text-5xl">
                從想法到習慣，只要四步
              </h2>
            </Reveal>

            <ol className="border-border mt-14 border-t">
              {steps.map((step, i) => (
                <li key={step.no} className="border-border border-b">
                  <Reveal
                    delay={i * 120}
                    className="flex items-baseline gap-6 py-8 md:gap-10 md:py-10"
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
                  </Reveal>
                </li>
              ))}
            </ol>

            <Reveal delay={200}>
              <p className="text-muted-foreground mt-10 text-base md:text-lg">
                就這樣。沒有複雜的設定，習慣是陪自己走，不是逼自己撐。
              </p>
            </Reveal>
          </div>
        </section>

        {/* PROGRESS：看得見的進度（無框四欄，純圖示） */}
        <section className="container mx-auto px-6 py-24 md:py-32 xl:px-0">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className={kicker}>Stay motivated</p>
              <h2 className="mt-4 text-3xl font-bold md:text-5xl">
                進步，要看得見才走得下去
              </h2>
            </Reveal>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-12 sm:grid-cols-2 md:gap-10 lg:grid-cols-4">
            {features.map(({ Icon, iconClass, title, desc }, i) => (
              <Reveal
                key={title}
                delay={i * 120}
                className="text-center sm:text-left"
              >
                <Icon className={`text-4xl ${iconClass}`} />
                <h3 className="mt-5 text-xl font-bold md:text-2xl">{title}</h3>
                <p className="text-muted-foreground mt-3">{desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ：常見問題（原生 details/summary，無需 JS） */}
        <section
          id="faq"
          className="container mx-auto scroll-mt-24 px-6 py-12 pb-24 md:py-20 md:pb-32 xl:px-0"
        >
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <p className={kicker}>FAQ</p>
              <h2 className="mt-4 text-3xl font-bold md:text-5xl">常見問題</h2>
            </Reveal>

            <Reveal delay={150}>
              <div className="border-border mt-12 border-t">
                {faqs.map((faq) => (
                  <details key={faq.q} className="group border-border border-b">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-lg font-bold md:text-xl [&::-webkit-details-marker]:hidden">
                      {faq.q}
                      <PiPlusBold
                        aria-hidden
                        className="text-brand-700 shrink-0 text-xl transition-transform duration-300 group-open:rotate-45"
                      />
                    </summary>
                    <p className="text-muted-foreground -mt-1 max-w-2xl pb-7 text-base leading-relaxed md:text-lg">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* FINALE：深綠整片 band */}
        <section className="bg-brand-800 dark:bg-brand-100">
          <div className="container mx-auto px-6 py-24 text-center md:py-28 xl:px-0">
            <Reveal className="flex flex-col items-center">
              <h2 className="text-3xl font-bold text-white md:text-5xl">
                今天，就種下第一顆種子
              </h2>
              <p className="mt-6 max-w-xl text-base text-white/75 md:text-lg">
                不必一次改變所有事，先從一個小目標開始。
                <br className="hidden sm:block" />
                Treebit 會陪著你，一天一點，長成你想要的樣子。
              </p>
              <Link href="/register" className={`${ctaOnDark} mt-10`}>
                免費開始種一棵樹
              </Link>
            </Reveal>
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

          <p className="text-muted-foreground text-sm">© 2026 Treebit</p>
        </div>
      </footer>

      <BackToTopButton />
    </>
  )
}
