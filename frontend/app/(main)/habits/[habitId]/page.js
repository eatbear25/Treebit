'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import Link from 'next/link'
import { PiCaretLeftBold, PiDotsThreeBold, PiUsersThree } from 'react-icons/pi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Loader from '@/app/_components/Loader'
import { getGrowthStage } from '@/app/_components/GrowthStageIcon'
import {
  getWeekDates,
  getTaiwanTodayYMD,
  formatDateToLocalYMD,
  addDaysToYMD,
} from '@/lib/utils'
import { API_BASE_URL } from '@/lib/api'
import HabitHeader from '../_components/HabitHeader'
import HabitStats from '../_components/HabitStats'
import TaskTable from '../_components/TaskTable'
import WeeklyNotes from '../_components/WeeklyNotes'

export default function HabitTracker() {
  const params = useParams()
  const habitId = params.habitId

  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [habit, setHabit] = useState(null)
  const [allWeeks, setAllWeeks] = useState([])
  const [currentWeekData, setCurrentWeekData] = useState(null)
  const [tasks, setTasks] = useState([])
  const [weeklyNotes, setWeeklyNotes] = useState([])
  const [taskLogs, setTaskLogs] = useState({})
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isWeekDataLoading, setIsWeekDataLoading] = useState(false)
  // 用 ref 追蹤初次載入：它只在 effect 的非同步流程中做判斷，
  // 不參與 render，改成 state 反而會讓它變動時觸發 effect 重跑、重複打 API
  const isInitialLoadRef = useRef(true)

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
  }, [habitId])

  // 整體統計（累計完成、目標總次數），打卡後同步更新
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}/stats`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('獲取統計資料錯誤:', err)
    }
  }, [habitId])

  const fetchAllWeeks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/habits/${habitId}/weeks`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) {
        setAllWeeks(data.data)

        // 計算當前週的索引：以台灣時區的今天做純字串比較，避免瀏覽器時區位移
        const todayYMD = getTaiwanTodayYMD()

        const currentWeekIdx = data.data.findIndex((week) => {
          const start = formatDateToLocalYMD(week.start_date)
          const end = addDaysToYMD(start, 6)
          return todayYMD >= start && todayYMD <= end
        })

        // 如果找到當前週，設定索引；否則使用最後一週
        if (currentWeekIdx !== -1) {
          setCurrentWeekIndex(currentWeekIdx)
        } else {
          // 如果當前日期不在任何週期內，使用最後一週
          setCurrentWeekIndex(data.data.length - 1)
        }
      }
    } catch (err) {
      console.error('獲取週次資料錯誤:', err)
      setError('載入週次資料失敗')
    }
  }, [habitId])

  const fetchCurrentWeekTasks = useCallback(async (weekId) => {
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
  }, [])

  const fetchCurrentWeekNotes = useCallback(async (weekId) => {
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
  }, [])

  const fetchCurrentWeekLogs = useCallback(async (weekId) => {
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
  }, [])

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
      await Promise.all([fetchHabit(), fetchAllWeeks(), fetchStats()])
      // 初始載入時不關閉 loading，等週次資料也載入完成
      if (!isInitialLoadRef.current) {
        setLoading(false)
      }
    }

    if (habitId) {
      loadData()
    }
  }, [habitId, fetchHabit, fetchAllWeeks, fetchStats])

  useEffect(() => {
    if (allWeeks.length > 0 && currentWeekIndex < allWeeks.length) {
      const currentWeek = allWeeks[currentWeekIndex]
      setCurrentWeekData(currentWeek)

      const loadCurrentWeekData = async () => {
        // 只在切換週次時顯示載入狀態，初始載入時不顯示
        if (!isInitialLoadRef.current) {
          setIsWeekDataLoading(true)
        }
        // 三支互不依賴，並行載入
        await Promise.all([
          fetchCurrentWeekTasks(currentWeek.id),
          fetchCurrentWeekNotes(currentWeek.id),
          fetchCurrentWeekLogs(currentWeek.id),
        ])
        setIsWeekDataLoading(false)

        // 初始載入完成後，關閉主要的 loading 狀態
        if (isInitialLoadRef.current) {
          setLoading(false)
          isInitialLoadRef.current = false
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
  ])

  const handleToggleTask = async (taskId, dayIndex) => {
    const weekDates = getCurrentWeekDates()
    if (!weekDates[dayIndex]) return

    const date = weekDates[dayIndex].full
    const currentStatus = taskLogs[taskId]?.[date] || false
    const newStatus = !currentStatus

    // 樂觀更新：點擊立即打勾，API 失敗時再還原
    setTaskLogs((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [date]: newStatus,
      },
    }))

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
      if (!res.ok || !data.success) {
        throw new Error(data.message || '更新打卡失敗')
      }
      // 打卡後同步更新整體統計
      fetchStats()
    } catch (err) {
      console.error('更新打卡錯誤:', err)
      // 還原打勾狀態
      setTaskLogs((prev) => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [date]: currentStatus,
        },
      }))
      toast.error('打卡失敗，請稍後再試')
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
        await Promise.all([
          fetchCurrentWeekTasks(currentWeekData.id),
          fetchCurrentWeekLogs(currentWeekData.id),
        ])
        fetchStats()
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
        await Promise.all([
          fetchCurrentWeekTasks(currentWeekData.id),
          fetchCurrentWeekLogs(currentWeekData.id),
        ])
        fetchStats()
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
        await Promise.all([
          fetchCurrentWeekTasks(currentWeekData.id),
          fetchCurrentWeekLogs(currentWeekData.id),
        ])
        fetchStats()
      } else {
        toast.error(data.message || '刪除任務失敗')
      }
    } catch (err) {
      console.error('刪除任務錯誤:', err)
      toast.error('刪除任務失敗，請稍後再試')
    }
  }

  // 拖曳排序：先樂觀更新本地順序，再送後端；失敗時還原成伺服器順序
  const handleReorderTasks = async (orderedIds) => {
    if (!currentWeekData) return

    setTasks((prev) =>
      [...prev].sort(
        (a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id)
      )
    )

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/habits/weeks/${currentWeekData.id}/tasks-order`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ task_ids: orderedIds }),
        }
      )
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.message || '更新排序失敗')
      }
    } catch (err) {
      console.error('更新任務排序錯誤:', err)
      toast.error('更新排序失敗')
      await fetchCurrentWeekTasks(currentWeekData.id)
    }
  }

  // 匯入上週任務（逐筆建立到本週）
  const handleImportTasks = async (tasksToImport) => {
    if (!currentWeekData || tasksToImport.length === 0) return

    try {
      for (const task of tasksToImport) {
        const res = await fetch(
          `${API_BASE_URL}/api/habits/weeks/${currentWeekData.id}/tasks`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              name: task.name,
              target_days: task.target_days,
            }),
          }
        )
        const data = await res.json()
        if (!data.success) {
          throw new Error(data.message || '匯入任務失敗')
        }
      }

      toast.success(`已匯入 ${tasksToImport.length} 個任務`)
      await fetchCurrentWeekTasks(currentWeekData.id)
      await fetchCurrentWeekLogs(currentWeekData.id)
      fetchStats()
    } catch (err) {
      console.error('匯入任務錯誤:', err)
      toast.error(err.message || '匯入任務失敗，請稍後再試')
      throw err
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

  if (loading || isWeekDataLoading) {
    return (
      <div className="flex justify-center">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <img src="/icon.svg" alt="" className="w-14 opacity-90" />
        <p className="mt-5 text-xl font-bold">{error}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          這個習慣可能已被刪除，或你沒有查看權限。
        </p>
        <Link
          href="/habits"
          className="bg-brand-700 hover:bg-brand-800 dark:text-brand-50 mt-6 rounded-tl-xl rounded-br-xl px-6 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
        >
          回習慣管理
        </Link>
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

  const isShared = habit.visibility === 'friends'

  const handleToggleVisibility = async () => {
    const next = isShared ? 'private' : 'friends'
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/habits/${habitId}/visibility`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ visibility: next }),
        }
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || '更新可見性失敗')
      }
      setHabit((prev) => ({ ...prev, visibility: next }))
      toast.success(data.message)
    } catch (err) {
      console.error('更新可見性錯誤:', err)
      toast.error(err.message || '更新可見性失敗，請稍後再試')
    }
  }

  const habitMenu = (
    <div className="flex shrink-0 items-center gap-1">
      {isShared && (
        <span
          title="好友可見"
          className="bg-brand-50 text-brand-700 flex h-8 w-8 items-center justify-center rounded-full text-lg"
        >
          <PiUsersThree />
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="更多操作"
            className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-2 text-xl transition"
          >
            <PiDotsThreeBold />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={handleToggleVisibility}
          >
            {isShared ? '取消分享' : '分享給好友'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  const weekDates = getCurrentWeekDates()
  const weekDays = weekDates.map((d) => d.short)
  const currentWeek = `第 ${currentWeekIndex + 1} 週`
  const weekRange =
    weekDates.length > 0 ? `${weekDates[0].short} - ${weekDates[6].short}` : ''
  const formattedTasks = getFormattedTasks()

  // 本週達成進度：各任務以目標次數封頂，超打不灌水
  const weekDone = formattedTasks.reduce(
    (sum, t) => sum + Math.min(t.completedCount, t.targetDays),
    0
  )
  const weekTarget = formattedTasks.reduce((sum, t) => sum + t.targetDays, 0)

  // 樹的成長階段（依整趟旅程的估計總目標，非只算已建任務的週）
  const stage = getGrowthStage(
    Number(stats?.completed_logs) || 0,
    Number(stats?.total_target_days) || 0,
    Number(stats?.weeks_with_tasks) || 0,
    habit.total_weeks
  )

  // 上一週的週次 id（供「匯入上週任務」使用；第一週為 null）
  const prevWeekId =
    currentWeekIndex > 0 ? allWeeks[currentWeekIndex - 1]?.id : null

  return (
    <div>
      <Link
        href="/habits"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1 text-sm font-medium transition-colors"
      >
        <PiCaretLeftBold />
        返回習慣列表
      </Link>

      <HabitHeader
        challengeName={habit.title}
        goal={habit.goal}
        totalWeeks={habit.total_weeks}
        currentWeek={currentWeek}
        weekRange={weekRange}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        canGoPrevious={currentWeekIndex > 0}
        canGoNext={currentWeekIndex < allWeeks.length - 1}
        currentWeekIndex={currentWeekIndex}
        stage={stage}
        menu={habitMenu}
      />

      <HabitStats
        currentWeek={currentWeekIndex + 1}
        totalWeeks={habit.total_weeks}
        weekDone={weekDone}
        weekTarget={weekTarget}
        totalCompleted={Number(stats?.completed_logs) || 0}
        totalTarget={Number(stats?.total_target_days) || 0}
        currentStreak={Number(stats?.current_streak) || 0}
      />

      <TaskTable
        tasks={formattedTasks}
        weekDays={weekDays}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
        onDeleteTask={handleDeleteTask}
        onEditTask={handleEditTask}
        onReorderTasks={handleReorderTasks}
        onImportTasks={handleImportTasks}
        prevWeekId={prevWeekId}
      />

      <WeeklyNotes
        notes={weeklyNotes}
        onAddNote={handleAddNote}
        onEditNote={handleEditNote}
        onDeleteNote={handleDeleteNote}
      />
    </div>
  )
}
