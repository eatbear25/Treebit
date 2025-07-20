'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/app/_components/AuthGuard'
import Loader from '@/app/_components/Loader'

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
        alert('習慣已恢復')
        fetchArchivedHabits() // 重新獲取列表
      } else {
        alert(json.message)
      }
    } catch (error) {
      console.error('restore error:', error)
      alert('恢復失敗')
    }
  }

  // 永久刪除習慣
  const deleteHabit = async (habitId) => {
    if (!confirm('確定要永久刪除此習慣嗎？此操作無法恢復。')) {
      return
    }

    try {
      const res = await fetch(`http://localhost:3001/api/habits/${habitId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const json = await res.json()
      if (json.success) {
        alert('習慣已永久刪除')
        fetchArchivedHabits() // 重新獲取列表
      } else {
        alert(json.message)
      }
    } catch (error) {
      console.error('delete error:', error)
      alert('刪除失敗')
    }
  }

  useEffect(() => {
    fetchArchivedHabits()
  }, [])

  return (
    <AuthGuard>
      <div className="container mx-auto min-h-screen p-4">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">歷史習慣</h1>
          <p className="text-gray-600">
            已封存的習慣 ({archivedHabits.length})
          </p>
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
          <div className="space-y-4">
            {archivedHabits.map((habit) => (
              <div
                key={habit.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold text-gray-800">
                      {habit.title}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>總週數: {habit.total_weeks} 週</p>
                      <p>
                        建立時間:{' '}
                        {new Date(habit.created_at).toLocaleDateString()}
                      </p>
                      <p>
                        封存時間:{' '}
                        {new Date(habit.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => restoreHabit(habit.id)}
                      className="rounded bg-green-500 px-3 py-1 text-sm text-white transition-colors hover:bg-green-600"
                    >
                      恢復
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="rounded bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
