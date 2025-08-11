'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'

import { PiArrowBendUpLeft } from 'react-icons/pi'
import Loader from '@/app/_components/Loader'
import HabitHeader from '../_components/HabitHeader'
import TaskTable from '../_components/TaskTable'
import WeeklyNotes from '../_components/WeeklyNotes'

export default function HabitTracker() {
  const params = useParams()
  const habitId = params.habitId
  const router = useRouter()

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [habit, setHabit] = useState(null)
  const [allWeeks, setAllWeeks] = useState([])
  const [currentWeekData, setCurrentWeekData] = useState(null)
  const [tasks, setTasks] = useState([])
  const [weeklyNotes, setWeeklyNotes] = useState([])
  const [taskLogs, setTaskLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isWeekDataLoading, setIsWeekDataLoading] = useState(true)

  const API_BASE = 'http://localhost:3001/api/habits'

  const fetchHabit = async () => {
    try {
      const res = await fetch(`${API_BASE}/${habitId}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setHabit(data.data)
      } else {
        setError('找不到該習慣')
      }
    } catch (err) {
      console.error('獲取習慣資訊錯誤:', err)
      setError('載入習慣資訊失敗')
    }
  }

  const fetchAllWeeks = async () => {
    try {
      const res = await fetch(`${API_BASE}/${habitId}/weeks`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setAllWeeks(data.data)
      }
    } catch (err) {
      console.error('獲取週次資料錯誤:', err)
      setError('載入週次資料失敗')
    }
  }

  const fetchCurrentWeekTasks = async (weekId) => {
    try {
      const res = await fetch(`${API_BASE}/weeks/${weekId}/tasks`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setTasks(data.data)
      }
    } catch (err) {
      console.error('獲取任務資料錯誤:', err)
    }
  }

  const fetchCurrentWeekNotes = async (weekId) => {
    try {
      const res = await fetch(`${API_BASE}/weeks/${weekId}/notes`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setWeeklyNotes(data.data)
      }
    } catch (err) {
      console.error('獲取筆記資料錯誤:', err)
    }
  }

  const fetchCurrentWeekLogs = async (weekId) => {
    try {
      const res = await fetch(`${API_BASE}/weeks/${weekId}/logs`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        console.log('獲取的打卡記錄:', data.data)

        const logsMap = {}
        data.data.forEach((log) => {
          const taskId = Number(log.task_id)
          if (!logsMap[taskId]) {
            logsMap[taskId] = {}
          }

          const tzDate = new Date(log.date)
          tzDate.setHours(tzDate.getHours() + 8)

          const year = tzDate.getFullYear()
          const month = String(tzDate.getMonth() + 1).padStart(2, '0')
          const day = String(tzDate.getDate()).padStart(2, '0')

          const dateStr = `${year}-${month}-${day}`

          logsMap[taskId][dateStr] = log.is_completed === 1
        })

        console.log('轉換後的打卡記錄:', logsMap)
        setTaskLogs(logsMap)
      }
    } catch (err) {
      console.error('獲取打卡記錄錯誤:', err)
    }
  }

  const getCurrentWeekDates = () => {
    if (!currentWeekData) return []

    const startDate = new Date(currentWeekData.start_date)
    const weekDates = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')

      weekDates.push({
        short: `${date.getMonth() + 1}/${date.getDate()}`,
        full: `${year}-${month}-${day}`,
      })
    }

    return weekDates
  }

  const getFormattedTasks = () => {
    const weekDates = getCurrentWeekDates()

    return tasks.map((task) => {
      const completedDays = weekDates.map((date) => {
        const isCompleted = taskLogs[task.id]?.[date.full] || false
        return isCompleted
      })

      const completedCount = completedDays.filter(Boolean).length

      return {
        id: task.id,
        name: task.name,
        completedDays,
        targetDays: task.target_days,
        completedCount,
      }
    })
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchHabit(), fetchAllWeeks()])
      setLoading(false)
    }

    if (habitId) {
      loadData()
    }
  }, [habitId])

  useEffect(() => {
    if (allWeeks.length > 0 && currentWeekIndex < allWeeks.length) {
      const currentWeek = allWeeks[currentWeekIndex]
      setCurrentWeekData(currentWeek)

      const loadCurrentWeekData = async () => {
        setIsWeekDataLoading(true)
        await fetchCurrentWeekTasks(currentWeek.id)
        await fetchCurrentWeekNotes(currentWeek.id)
        await fetchCurrentWeekLogs(currentWeek.id)
        setIsWeekDataLoading(false)
      }

      loadCurrentWeekData()
    }
  }, [allWeeks, currentWeekIndex])

  const handleToggleTask = async (taskId, dayIndex) => {
    const weekDates = getCurrentWeekDates()
    if (!weekDates[dayIndex]) return

    const date = weekDates[dayIndex].full
    const currentStatus = taskLogs[taskId]?.[date] || false
    const newStatus = !currentStatus

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}/logs`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          date,
          is_completed: newStatus,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setTaskLogs((prev) => ({
          ...prev,
          [taskId]: {
            ...prev[taskId],
            [date]: newStatus,
          },
        }))
      } else {
        console.error('更新打卡失敗:', data.message)
      }
    } catch (err) {
      console.error('更新打卡錯誤:', err)
    }
  }

  // 任務 CRUD
  const handleAddTask = async (values) => {
    if (!currentWeekData) return

    try {
      const res = await fetch(`${API_BASE}/weeks/${currentWeekData.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: values.name,
          target_days: parseInt(values.target_days),
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('新增任務成功！')
        await fetchCurrentWeekTasks(currentWeekData.id)
        await fetchCurrentWeekLogs(currentWeekData.id)
      } else {
        toast.error(data.message || '新增任務失敗')
      }
    } catch (err) {
      console.error('新增任務錯誤:', err)
      toast.error('新增任務失敗，請稍後再試')
    }
  }

  const handleEditTask = async (taskId, values) => {
    if (!currentWeekData) return

    try {
      const res = await fetch(
        `${API_BASE}/weeks/${currentWeekData.id}/tasks/${taskId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: values.name,
            target_days: parseInt(values.target_days),
          }),
        }
      )

      const data = await res.json()
      if (data.success) {
        toast.success(data.message || '編輯任務成功！')
        await fetchCurrentWeekTasks(currentWeekData.id)
        await fetchCurrentWeekLogs(currentWeekData.id)
        return data.message || '編輯任務成功！'
      } else {
        toast.error(data.message || '編輯任務失敗')
        throw new Error(data.message || '編輯任務失敗')
      }
    } catch (err) {
      console.error('編輯任務錯誤:', err)
      toast.error('編輯任務失敗，請稍後再試')
      throw err
    }
  }

  const handleDeleteTask = async (taskId) => {
    // if (!confirm('確定要刪除這個任務嗎？')) return

    if (!currentWeekData) return

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const data = await res.json()

      if (data.success) {
        toast.success('刪除任務成功！')
        await fetchCurrentWeekTasks(currentWeekData.id)
        await fetchCurrentWeekLogs(currentWeekData.id)
      } else {
        toast.error(data.message || '刪除任務失敗')
      }
    } catch (err) {
      console.error('刪除任務錯誤:', err)
      toast.error('刪除任務失敗，請稍後再試')
    }
  }

  // 記事 CRUD
  const handleAddNote = async (content) => {
    if (!currentWeekData) return

    try {
      const res = await fetch(`${API_BASE}/weeks/${currentWeekData.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: content.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message || '新增記事成功！')

        await fetchCurrentWeekNotes(currentWeekData.id)
      } else {
        toast.error(data.message || '新增記事失敗')
        throw new Error(data.message || '新增記事失敗')
      }
    } catch (err) {
      console.error('新增記事錯誤:', err)
      throw err
    }
  }

  const handleEditNote = async (noteId, newContent) => {
    if (!currentWeekData) return

    try {
      const res = await fetch(
        `${API_BASE}/weeks/${currentWeekData.id}/notes/${noteId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            content: newContent,
          }),
        }
      )

      const data = await res.json()
      if (data.success) {
        setWeeklyNotes((prev) =>
          prev.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  content: newContent,
                  updated_at: new Date().toISOString(),
                }
              : n
          )
        )
        return data.message || '編輯記事成功！'
      } else {
        throw new Error(data.message || '編輯記事失敗')
      }
    } catch (err) {
      console.error('編輯筆記錯誤:', err)
      throw err
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!currentWeekData) return

    try {
      const res = await fetch(
        `${API_BASE}/weeks/${currentWeekData.id}/notes/${noteId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )

      const data = await res.json()
      if (data.success) {
        setWeeklyNotes((prev) => prev.filter((n) => n.id !== noteId))
        return data.message || '刪除記事成功！'
      } else {
        throw new Error(data.message || '刪除記事失敗')
      }
    } catch (err) {
      console.error('刪除記事錯誤:', err)
      throw err
    }
  }

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1)
    }
  }

  const goToNextWeek = () => {
    if (currentWeekIndex < allWeeks.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1)
    }
  }

  const handleGoBack = () => {
    router.push('/habits')
  }

  if (loading) {
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-xl font-bold">
        {error}
      </div>
    )
  }

  if (!habit || !currentWeekData) {
    return (
      <div className="flex h-screen items-center justify-center">
        找不到資料
      </div>
    )
  }

  if (isWeekDataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        載入本週資料中...
      </div>
    )
  }

  const weekDates = getCurrentWeekDates()
  const weekDays = weekDates.map((d) => d.short)
  const currentWeek = `第 ${currentWeekIndex + 1} 週`
  const weekRange =
    weekDates.length > 0 ? `${weekDates[0].short} - ${weekDates[6].short}` : ''
  const formattedTasks = getFormattedTasks()

  return (
    <div>
      <HabitHeader
        challengeName={habit.title}
        totalWeeks={habit.total_weeks}
        currentWeek={currentWeek}
        weekRange={weekRange}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        canGoPrevious={currentWeekIndex > 0}
        canGoNext={currentWeekIndex < allWeeks.length - 1}
        currentWeekIndex={currentWeekIndex}
      />

      <TaskTable
        tasks={formattedTasks}
        weekDays={weekDays}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
      />

      <WeeklyNotes
        notes={weeklyNotes}
        onAddNote={handleAddNote}
        onEditNote={handleEditNote}
        onDeleteNote={handleDeleteNote}
      />

      <div className="my-6 flex justify-end">
        <button
          className="flex cursor-pointer items-center gap-2 text-right text-lg hover:opacity-80"
          onClick={handleGoBack}
        >
          返回上一頁
          <span className="text-2xl font-bold">
            <PiArrowBendUpLeft />
          </span>
        </button>
      </div>
    </div>
  )
}
