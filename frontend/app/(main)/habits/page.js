'use client'

import HabitHeader from '@/app/_components/HabitHeader'
import HabitList from '@/app/_components/HabitList'
import AuthGuard from '@/app/_components/AuthGuard'

export default function Habits() {
  return (
    <AuthGuard>
      <HabitHeader />
      <HabitList />
    </AuthGuard>
  )
}
