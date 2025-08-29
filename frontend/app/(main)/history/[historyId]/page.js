'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PiArrowBendUpLeft } from 'react-icons/pi'
import Loader from '@/app/_components/Loader'
import { formatDateToLocalYMD } from '@/lib/utils'

import HistoryHabitHeader from '../_components/HistoryHabitHeader'
import HistoryTaskTable from '../_components/HistoryTaskTable'
import HistoryWeeklyNotes from '../_components/HistoryWeeklyNotes'

// 主要的歷史習慣追蹤頁面
export default function HabitHistoryTracker() {
  const params = useParams()
  const historyId = params.historyId
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

  const API_BASE_URL =
    process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

  const fetchHabit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${historyId}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setHabit(data.data)
      } else {
        console.error('獲取習慣失敗:', data)
        setError(data.message || '找不到該習慣')
      }
    } catch (err) {
      console.error('獲取習慣資訊錯誤:', err)
      setError('載入習慣資訊失敗')
    }
  }

  const fetchAllWeeks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${historyId}/weeks`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setAllWeeks(data.data)
      } else {
        console.error('獲取週次失敗:', data)
        setError(data.message || '載入週次資料失敗')
      }
    } catch (err) {
      console.error('獲取週次資料錯誤:', err)
      setError('載入週次資料失敗')
    }
  }

  const fetchCurrentWeekTasks = async (weekId) => {
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
  }

  const fetchCurrentWeekNotes = async (weekId) => {
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
  }

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

          const dateStr = formatDateToLocalYMD(log.date)

          logsMap[taskId][dateStr] = log.is_completed === 1
        })

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

      const fullDate = formatDateToLocalYMD(date.toISOString())

      weekDates.push({
        short: `${date.getMonth() + 1}/${date.getDate()}`,
        full: fullDate,
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

    if (historyId) {
      loadData()
    }
  }, [historyId]) // eslint-disable-line react-hooks/exhaustive-deps

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
    router.push('/history')
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
      <div className="flex h-screen items-center justify-center">{error}</div>
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
    <div className="mx-auto max-w-6xl">
      <HistoryHabitHeader
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

      <HistoryTaskTable tasks={formattedTasks} weekDays={weekDays} />

      <HistoryWeeklyNotes notes={weeklyNotes} />

      <div className="my-6 flex justify-end">
        <button
          className="flex cursor-pointer items-center gap-2 text-right text-lg text-gray-600 hover:opacity-80"
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
