'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { toast } from 'sonner'

import { PiArrowBendUpLeft } from 'react-icons/pi'
import Loader from '@/app/_components/Loader'
import { getWeekDates } from '@/lib/utils'
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
  const [isWeekDataLoading, setIsWeekDataLoading] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const API_BASE_URL =
    process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

  const fetchHabit = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}`, {
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
  }, [habitId, API_BASE_URL])

  const fetchAllWeeks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}/weeks`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setAllWeeks(data.data)

        // 計算當前週的索引（使用台灣時區）
        const now = new Date()
        console.log('===== 計算當前週 =====')
        console.log('現在時間:', now)

        const currentWeekIdx = data.data.findIndex((week) => {
          // 取得 start_date 的日期部分（忽略時間）
          const startDateStr = week.start_date.split('T')[0] // "2026-01-05"
          const startDate = new Date(startDateStr + 'T00:00:00+08:00') // 台灣時區

          const endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + 6) // 週結束日期
          endDate.setHours(23, 59, 59, 999) // 設定為當天最後一刻

          console.log(`第 ${week.week_number} 週:`, {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            isInRange: now >= startDate && now <= endDate,
          })

          return now >= startDate && now <= endDate
        })

        console.log('找到的週次索引:', currentWeekIdx)

        // 如果找到當前週，設定索引；否則使用最後一週
        if (currentWeekIdx !== -1) {
          setCurrentWeekIndex(currentWeekIdx)
        } else {
          // 如果當前日期不在任何週期內，使用最後一週
          console.log('沒找到當前週，使用最後一週')
          setCurrentWeekIndex(data.data.length - 1)
        }
      }
    } catch (err) {
      console.error('獲取週次資料錯誤:', err)
      setError('載入週次資料失敗')
    }
  }, [habitId, API_BASE_URL])

  const fetchCurrentWeekTasks = useCallback(
    async (weekId) => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/habits/weeks/${weekId}/tasks`,
          {
            credentials: 'include',
          }
        )
        const data = await res.json()
        if (data.success) {
          setTasks(data.data)
        }
      } catch (err) {
        console.error('獲取任務資料錯誤:', err)
      }
    },
    [API_BASE_URL]
  )

  const fetchCurrentWeekNotes = useCallback(
    async (weekId) => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/habits/weeks/${weekId}/notes`,
          {
            credentials: 'include',
          }
        )
        const data = await res.json()
        if (data.success) {
          setWeeklyNotes(data.data)
        }
      } catch (err) {
        console.error('獲取筆記資料錯誤:', err)
      }
    },
    [API_BASE_URL]
  )

  const fetchCurrentWeekLogs = async (weekId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/habits/weeks/${weekId}/logs`,
        {
          credentials: 'include',
        }
      )
      const data = await res.json()
      if (data.success) {
        const logsMap = {}
        data.data.forEach((log) => {
          const taskId = Number(log.task_id)
          if (!logsMap[taskId]) {
            logsMap[taskId] = {}
          }

          // 資料庫儲存的日期已經是 YYYY-MM-DD 格式，直接使用即可
          const dateStr = log.date.split('T')[0]

          // PostgreSQL boolean 經 JSON 回傳為 true/false
          logsMap[taskId][dateStr] = log.is_completed === true
        })

        setTaskLogs(logsMap)
      }
    } catch (err) {
      console.error('獲取打卡記錄錯誤:', err)
    }
  }

  const getCurrentWeekDates = () => getWeekDates(currentWeekData?.start_date)

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
      // 初始載入時不關閉 loading，等週次資料也載入完成
      if (!isInitialLoad) {
        setLoading(false)
      }
    }

    if (habitId) {
      loadData()
    }
  }, [habitId, fetchHabit, fetchAllWeeks, isInitialLoad])

  useEffect(() => {
    if (allWeeks.length > 0 && currentWeekIndex < allWeeks.length) {
      const currentWeek = allWeeks[currentWeekIndex]
      setCurrentWeekData(currentWeek)

      const loadCurrentWeekData = async () => {
        // 只在切換週次時顯示載入狀態，初始載入時不顯示
        if (!isInitialLoad) {
          setIsWeekDataLoading(true)
        }
        await fetchCurrentWeekTasks(currentWeek.id)
        await fetchCurrentWeekNotes(currentWeek.id)
        await fetchCurrentWeekLogs(currentWeek.id)
        setIsWeekDataLoading(false)

        // 初始載入完成後，關閉主要的 loading 狀態
        if (isInitialLoad) {
          setLoading(false)
          setIsInitialLoad(false)
        }
      }

      loadCurrentWeekData()
    }
  }, [
    allWeeks,
    currentWeekIndex,
    fetchCurrentWeekTasks,
    fetchCurrentWeekNotes,
    fetchCurrentWeekLogs,
    isInitialLoad,
  ])

  const handleToggleTask = async (taskId, dayIndex) => {
    const weekDates = getCurrentWeekDates()
    if (!weekDates[dayIndex]) return

    const date = weekDates[dayIndex].full
    const currentStatus = taskLogs[taskId]?.[date] || false
    const newStatus = !currentStatus

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/habits/tasks/${taskId}/logs`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            date,
            is_completed: newStatus,
          }),
        }
      )

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
      const res = await fetch(
        `${API_BASE_URL}/api/habits/weeks/${currentWeekData.id}/tasks`,
        {
          method: 'POST',
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
        `${API_BASE_URL}/api/habits/weeks/${currentWeekData.id}/tasks/${taskId}`,
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
      const res = await fetch(`${API_BASE_URL}/api/habits/tasks/${taskId}`, {
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
      const res = await fetch(
        `${API_BASE_URL}/api/habits/weeks/${currentWeekData.id}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            content: content.trim(),
          }),
        }
      )

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
        `${API_BASE_URL}/api/habits/weeks/${currentWeekData.id}/notes/${noteId}`,
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
        // 重新獲取筆記以確保時間正確
        await fetchCurrentWeekNotes(currentWeekData.id)
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
        `${API_BASE_URL}/api/habits/weeks/${currentWeekData.id}/notes/${noteId}`,
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

  if (loading || isWeekDataLoading) {
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
