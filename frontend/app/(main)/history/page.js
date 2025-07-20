'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/app/_components/AuthGuard'
import Loader from '@/app/_components/Loader'
import HistoryList from './_components/HistoryList'
import { toast } from 'sonner'

export default function History() {
  const [archivedHabits, setArchivedHabits] = useState([])
  const [loading, setLoading] = useState(false)

  // 獲取封存習慣列表
  const fetchArchivedHabits = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:3001/api/habits/archived', {
        credentials: 'include',
      })
      const json = await res.json()
      if (json.success) {
        setArchivedHabits(json.data)
      } else {
        console.error(json.message)
      }
    } catch (error) {
      console.error('fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 恢復習慣
  const restoreHabit = async (habitId) => {
    try {
      const res = await fetch(
        `http://localhost:3001/api/habits/${habitId}/restore`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      )
      const json = await res.json()
      if (json.success) {
        toast.success('習慣已恢復')
        fetchArchivedHabits() // 重新獲取列表
      } else {
        toast.error(json.message)
      }
    } catch (error) {
      console.error('restore error:', error)
      toast.error('恢復失敗')
    }
  }

  // 永久刪除習慣
  const deleteHabit = async (habitId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await res.json()
      if (json.success) {
        toast.success('習慣已永久刪除')
        fetchArchivedHabits() // 重新獲取列表
      } else {
        toast.error(json.message)
      }
    } catch (error) {
      console.error('delete error:', error)
      toast.error('刪除失敗')
    }
  }

  useEffect(() => {
    fetchArchivedHabits()
  }, [])

  return (
    <AuthGuard>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-6 flex h-12 items-center">
          <h1 className="text-xl font-bold">歷史習慣</h1>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : archivedHabits.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-lg text-gray-500">沒有封存的習慣</div>
          </div>
        ) : (
          <HistoryList
            habits={archivedHabits}
            onHabitsChanged={fetchArchivedHabits}
            onRestore={restoreHabit}
            onDelete={deleteHabit}
          />
        )}
      </div>
    </AuthGuard>
  )
}
