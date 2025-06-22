'use client'

import { useAuth } from '@/contexts/AuthContext'
import HabitHeader from '@/app/_components/HabitHeader'
import HabitList from '@/app/_components/HabitList'
import Loader from '@/app/_components/Loader'

export default function Habits() {
  const { loading, isAuthenticated } = useAuth()

  if (loading)
    return (
      <div className="flex justify-center pt-20">
        <Loader />
      </div>
    )

  if (!loading && isAuthenticated)
    return (
      <>
        <HabitHeader />
        <HabitList />
      </>
    )
}
