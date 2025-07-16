'use client'

import HabitHeader from '@/app/_components/HabitHeader'
import HabitList from '@/app/_components/HabitList'
import AuthGuard from '@/app/_components/AuthGuard'
import { useEffect, useState } from 'react'
import Loader from '@/app/_components/Loader'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(false)

  // 獲取習慣列表的函數
  const fetchHabits = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/habits', {
        credentials: 'include',
      })
      const json = await res.json()
      if (json.success) {
        setHabits(json.data)
      } else {
        console.error(json.message)
      }
    } catch (error) {
      console.error('fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始載入
  useEffect(() => {
    fetchHabits()
  }, [])

  const refreshHabits = () => {
    fetchHabits()
  }

  return (
    <AuthGuard>
      <HabitHeader habitsNum={habits.length} onHabitAdded={refreshHabits} />
      {loading ? (
        <div className="flex justify-center">
          <Loader />
        </div>
      ) : (
        <HabitList habits={habits} onHabitsChanged={refreshHabits} />
      )}
    </AuthGuard>
  )
}
