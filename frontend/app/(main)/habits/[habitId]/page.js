'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { PiArrowBendUpLeft } from 'react-icons/pi'

import HabitHeader from '../_components/HabitHeader'
import TaskTable from '../_components/TaskTable'
import WeeklyNotes from '../_components/WeeklyNotes'

export default function HabitTracker({ challengeStartDate = '2025-06-12' }) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const totalWeeks = 10
  const challengeName = '學吉他'

  const router = useRouter()

  const handleGoBack = () => {
    router.push('/habits')
  }

  // ! 假資料，之後替代
  const [tasksByWeek, setTasksByWeek] = useState({
    0: [
      {
        id: 1,
        name: '畫畫30分鐘',
        completedDays: [true, false, true, true, true, false, false],
        targetDays: 4,
        completedCount: 4,
      },
      {
        id: 2,
        name: '學習繪畫技巧每天至少20分鐘學習繪畫技巧每天至少20分鐘畫技巧每天至少20分鐘',
        completedDays: [true, true, true, false, false, false, false],
        targetDays: 7,
        completedCount: 3,
      },
      {
        id: 3,
        name: '運動',
        completedDays: [true, false, true, false, false, false, false],
        targetDays: 7,
        completedCount: 2,
      },
    ],
  })

  const [weeklyNotesByWeek, setWeeklyNotesByWeek] = useState({
    0: [
      {
        id: 1,
        date: '2025-06-11',
        content: '這禮拜要記得企鵝造型',
      },
    ],
  })

  // 計算當前週的日期範圍
  const getCurrentWeekDates = () => {
    const startDate = new Date(challengeStartDate)
    const currentWeekStart = new Date(startDate)
    currentWeekStart.setDate(startDate.getDate() + currentWeekIndex * 7)

    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      weekDates.push({
        short: `${date.getMonth() + 1}/${date.getDate()}`,
        full: date.toISOString().split('T')[0],
      })
    }

    return weekDates
  }

  const weekDates = getCurrentWeekDates()
  const weekDays = weekDates.map((d) => d.short)
  const currentWeek = `第 ${currentWeekIndex + 1} 週`
  const weekRange = `${weekDates[0].short} - ${weekDates[6].short}`

  const getCurrentWeekTasks = () => {
    return tasksByWeek[currentWeekIndex] || []
  }

  const getCurrentWeekNotes = () => {
    return weeklyNotesByWeek[currentWeekIndex] || []
  }

  const tasks = getCurrentWeekTasks()
  const weeklyNotes = getCurrentWeekNotes()

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1)
    }
  }

  const goToNextWeek = () => {
    if (currentWeekIndex < totalWeeks - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1)

      if (!tasksByWeek[currentWeekIndex + 1]) {
        const newWeekTasks = tasksByWeek[0].map((task) => ({
          ...task,
          completedDays: [false, false, false, false, false, false, false],
          completedCount: 0,
        }))

        setTasksByWeek((prev) => ({
          ...prev,
          [currentWeekIndex + 1]: newWeekTasks,
        }))
      }
    }
  }

  const handleToggleTask = (taskId, dayIndex) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const newCompletedDays = [...task.completedDays]
        newCompletedDays[dayIndex] = !newCompletedDays[dayIndex]
        const newCompletedCount = newCompletedDays.filter(Boolean).length
        return {
          ...task,
          completedDays: newCompletedDays,
          completedCount: newCompletedCount,
        }
      }
      return task
    })

    setTasksByWeek((prev) => ({
      ...prev,
      [currentWeekIndex]: updatedTasks,
    }))
  }

  const handleAddTask = () => {
    console.log('增加新任務')
  }

  const handleAddNote = () => {
    console.log('增加筆記')
  }

  const handleEditNote = (noteId) => {
    console.log('編輯筆記:', noteId)
  }

  const handleDeleteNote = (noteId) => {
    console.log('刪除筆記:', noteId)
  }

  return (
    <div>
      <HabitHeader
        challengeName={challengeName}
        totalWeeks={totalWeeks}
        currentWeek={currentWeek}
        weekRange={weekRange}
        onPreviousWeek={goToPreviousWeek}
        onNextWeek={goToNextWeek}
        canGoPrevious={currentWeekIndex > 0}
        canGoNext={currentWeekIndex < totalWeeks - 1}
        currentWeekIndex={currentWeekIndex}
      />

      <TaskTable
        tasks={tasks}
        weekDays={weekDays}
        onToggleTask={handleToggleTask}
        onAddTask={handleAddTask}
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
