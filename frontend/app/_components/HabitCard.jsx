'use client'

import { useRouter } from 'next/navigation'

export default function HabitCard({ title, weeks, percent, times }) {
  const router = useRouter()

  const handleViewTask = () => {
    router.push(`/habits/${title}`)
  }

  return (
    <div className="mb-10 flex h-[300px] w-full flex-col justify-between rounded-md bg-white p-8 shadow-sm">
      <div className="mb-6 text-2xl font-bold">{title}</div>

      <ul className="mb-8 flex justify-between text-sm">
        <li className="flex flex-col items-center justify-center">
          <span className="inter text-3xl font-[700]">{weeks}</span>
          <span className="text-xl text-[#9A9FA5]">週</span>
        </li>

        <li className="flex flex-col items-center justify-center">
          <span className="inter text-3xl font-[700]">
            {percent}
            <span className="ml-1 text-xl font-[700] text-[#9A9FA5]">%</span>
          </span>
          <span className="text-xl text-[#9A9FA5]">達成率</span>
        </li>

        <li className="flex flex-col items-center justify-center">
          <span className="inter text-3xl font-[700]">{times}</span>
          <span className="text-xl text-[#9A9FA5]">次數</span>
        </li>
      </ul>

      {/* <button
        onClick={handleViewTask}
        className="w-full cursor-pointer rounded-tl-xl rounded-br-xl bg-[#3D8D7A] py-3 text-xl font-[600] text-white shadow-lg transition hover:scale-101 hover:bg-[#509887] active:scale-99"
      >
        查看任務
      </button> */}

      <button
        onClick={handleViewTask}
        className="w-full cursor-pointer rounded-tl-xl rounded-br-xl py-3 text-xl font-[600] text-white shadow-lg transition hover:scale-101 hover:brightness-110 active:scale-99"
        style={{
          background: 'linear-gradient(135deg, #3D8D7A 0%, #A3D1C6 100%)',
        }}
      >
        查看任務
      </button>
    </div>
  )
}
