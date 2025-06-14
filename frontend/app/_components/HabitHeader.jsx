import { PiGearBold } from 'react-icons/pi'

export default function HabitHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-1 text-xl font-bold">
        2個習慣
        <button className="cursor-pointer rounded-lg px-3 py-1 text-3xl transition hover:bg-[#C8CACD] active:scale-95">
          +
        </button>
      </div>

      <div>
        <button className="cursor-pointer rounded-lg p-2 text-3xl transition hover:bg-[#C8CACD] active:scale-95">
          <PiGearBold />
        </button>
      </div>
    </div>
  )
}
