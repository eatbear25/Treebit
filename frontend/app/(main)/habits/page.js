'use client'

import HabitHeader from '@/app/(main)/habits/_components/HabitListHeader'
import HabitList from '@/app/(main)/habits/_components/HabitList'
import AuthGuard from '@/app/_components/AuthGuard'
import { useEffect, useState } from 'react'
import Loader from '@/app/_components/Loader'

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(false)

  // 獲取習慣列表的函數
  const fetchHabits = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits`, {
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
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <img src="/icon.svg" alt="" className="w-16 opacity-90" />
              <p className="text-lg font-medium">還沒有任何習慣</p>
              <p className="text-sm text-muted-foreground">
                點右上角的「＋」，種下你的第一顆種子
              </p>
            </div>
          ) : (
            <HabitList habits={habits} onHabitsChanged={refreshHabits} />
          )}
        </>
      )}
    </AuthGuard>
  )
}
