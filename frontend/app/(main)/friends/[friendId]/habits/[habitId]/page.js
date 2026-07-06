'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PiCaretLeftBold } from 'react-icons/pi'

import AuthGuard from '@/app/_components/AuthGuard'
import Loader from '@/app/_components/Loader'
import { getGrowthStage } from '@/app/_components/GrowthStageIcon'
import { getWeekDates } from '@/lib/utils'
import HabitHeader from '@/app/(main)/habits/_components/HabitHeader'
import HabitStats from '@/app/(main)/habits/_components/HabitStats'
import TaskTable from '@/app/(main)/habits/_components/TaskTable'
import AvatarInitial from '../../../_components/AvatarInitial'

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

// 好友習慣的唯讀詳情：後端一次回傳整包（habit + weeks + tasks + logs + stats），
// 週次切換為純前端操作，不再逐週打 API
export default function FriendHabitViewer() {
  const params = useParams()
  const { friendId, habitId } = params

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/friends/habits/${habitId}`,
          { credentials: 'include' }
        )
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        } else {
          setError(json.message || '找不到該習慣')
        }
      } catch (err) {
        console.error('取得好友習慣詳情錯誤:', err)
        setError('載入失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }
    if (habitId) fetchDetail()
  }, [habitId])

  // logs 整理成 { taskId: { 'YYYY-MM-DD': true } }，供打卡格查表
  const logsByTask = useMemo(() => {
    const map = {}
    for (const log of data?.logs || []) {
      if (!map[log.task_id]) map[log.task_id] = {}
      map[log.task_id][log.date] = log.is_completed === true
    }
    return map
  }, [data])

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center">
          <Loader />
        </div>
      </AuthGuard>
    )
  }

  if (error || !data) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-xl font-bold">{error || '找不到資料'}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            對方可能已取消分享，或你們已不是好友。
          </p>
          <Link
            href="/friends"
            className="bg-brand-700 hover:bg-brand-800 dark:text-brand-50 mt-6 rounded-tl-xl rounded-br-xl px-6 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            回好友列表
          </Link>
        </div>
      </AuthGuard>
    )
  }

  const { habit, weeks, tasks, stats } = data
  const currentWeekData = weeks[currentWeekIndex]
  const weekDates = getWeekDates(currentWeekData?.start_date)
  const weekDays = weekDates.map((d) => d.short)
  const weekRange =
    weekDates.length > 0 ? `${weekDates[0].short} - ${weekDates[6].short}` : ''

  const formattedTasks = tasks
    .filter((task) => task.habit_week_id === currentWeekData?.id)
    .map((task) => {
      const completedDays = weekDates.map(
        (date) => logsByTask[task.id]?.[date.full] || false
      )
      return {
        id: task.id,
        name: task.name,
        completedDays,
        targetDays: task.target_days,
        completedCount: completedDays.filter(Boolean).length,
      }
    })

  // 本週達成進度：各任務以目標次數封頂（同自己的詳情頁）
  const weekDone = formattedTasks.reduce(
    (sum, t) => sum + Math.min(t.completedCount, t.targetDays),
    0
  )
  const weekTarget = formattedTasks.reduce((sum, t) => sum + t.targetDays, 0)

  const stage = getGrowthStage(
    Number(stats?.completed_logs) || 0,
    Number(stats?.total_target_days) || 0,
    Number(stats?.weeks_with_tasks) || 0,
    habit.total_weeks
  )

  return (
    <AuthGuard>
      <Link
        href={`/friends/${friendId}`}
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1 text-sm font-medium transition-colors"
      >
        <PiCaretLeftBold />
        返回 {habit.owner_username} 的習慣
      </Link>

      <div className="mb-4 flex items-center gap-2">
        <AvatarInitial
          name={habit.owner_username}
          className="h-6 w-6 text-xs"
        />
        <p className="text-muted-foreground text-sm">
          {habit.owner_username} 分享的習慣 · 僅供查看
        </p>
      </div>

      <HabitHeader
        challengeName={habit.title}
        totalWeeks={habit.total_weeks}
        currentWeek={`第 ${currentWeekIndex + 1} 週`}
        weekRange={weekRange}
        onPreviousWeek={() =>
          currentWeekIndex > 0 && setCurrentWeekIndex(currentWeekIndex - 1)
        }
        onNextWeek={() =>
          currentWeekIndex < weeks.length - 1 &&
          setCurrentWeekIndex(currentWeekIndex + 1)
        }
        canGoPrevious={currentWeekIndex > 0}
        canGoNext={currentWeekIndex < weeks.length - 1}
        currentWeekIndex={currentWeekIndex}
        stage={stage}
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

      <TaskTable tasks={formattedTasks} weekDays={weekDays} readOnly />
    </AuthGuard>
  )
}
