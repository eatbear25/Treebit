'use client'

import { HabitForm } from './HabitForm'

export default function HabitHeader({ habitsNum, onHabitAdded }) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">我的習慣</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          進行中 <span className="tnum">{habitsNum}</span> 個習慣
        </p>
      </div>

      <HabitForm onHabitAdded={onHabitAdded} />
    </div>
  )
}
