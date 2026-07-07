'use client'

import { useEffect, useState } from 'react'
import AuthGuard from '@/app/_components/AuthGuard'
import Loader from '@/app/_components/Loader'
import HistoryList from './_components/HistoryList'
import { toast } from 'sonner'

import { API_BASE_URL } from '@/lib/api'

export default function History() {
  const [archivedHabits, setArchivedHabits] = useState([])
  const [loading, setLoading] = useState(false)

  // 獲取封存習慣列表
  const fetchArchivedHabits = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/archived`, {
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
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}/restore`, {
        method: 'PATCH',
        credentials: 'include',
      })
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
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold md:text-3xl">歷史紀錄</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            已封存 <span className="tnum">{archivedHabits.length}</span> 個習慣
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader />
          </div>
        ) : archivedHabits.length === 0 ? (
          <div className="border-border flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center">
            <img src="/icon.svg" alt="" className="w-14 opacity-90" />
            <p className="mt-5 text-lg font-bold">還沒有封存的習慣</p>
            <p className="text-muted-foreground mt-2 max-w-xs text-sm">
              完成或暫停的習慣封存後，成果會收藏在這裡
            </p>
          </div>
        ) : (
          <HistoryList
            habits={archivedHabits}
            onRestore={restoreHabit}
            onDelete={deleteHabit}
          />
        )}
      </div>
    </AuthGuard>
  )
}
