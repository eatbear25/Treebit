'use client'

import HabitHeader from '@/app/(main)/habits/_components/HabitListHeader'
import HabitList from '@/app/(main)/habits/_components/HabitList'
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
        <>
          {habits.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-lg text-gray-500">目前沒有任何習慣</div>
            </div>
          ) : (
            <HabitList habits={habits} onHabitsChanged={refreshHabits} />
          )}
        </>
      )}
    </AuthGuard>
  )
}
