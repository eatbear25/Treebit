export default function HabitHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xl font-bold">
        2個習慣
        <button className="cursor-pointer text-3xl transition hover:opacity-75">
          +
        </button>
      </div>

      <div>
        <button>
          <img src="../gear.svg" alt="設定" />
        </button>
      </div>
    </div>
  )
}
