'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { PiArrowBendUpLeft } from 'react-icons/pi'
import Loader from '@/app/_components/Loader'

import HistoryHabitHeader from '../_components/HistoryHabitHeader'
import HistoryTaskTable from '../_components/HistoryTaskTable'
import HistoryWeeklyNotes from '../_components/HistoryWeeklyNotes'

// 歷史版本的習慣標題組件（只顯示，不能操作）
// function HistoryHabitHeader({
//   challengeName,
//   totalWeeks,
//   currentWeek,
//   weekRange,
//   onPreviousWeek,
//   onNextWeek,
//   canGoPrevious,
//   canGoNext,
//   currentWeekIndex,
// }) {
//   return (
//     <div className="mb-6">
//       <div className="mb-4 flex items-center justify-between">
//         <div className="flex items-center gap-4">
//           <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
//             <span className="text-xl text-green-600">📚</span>
//           </div>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">
//               {challengeName}
//             </h1>
//             <p className="text-gray-600">共 {totalWeeks} 週 (歷史記錄)</p>
//           </div>
//         </div>
//       </div>

//       <div className="flex items-center justify-between">
//         <button
//           onClick={onPreviousWeek}
//           disabled={!canGoPrevious}
//           className={`rounded-lg px-4 py-2 ${
//             canGoPrevious
//               ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               : 'cursor-not-allowed bg-gray-50 text-gray-400'
//           }`}
//         >
//           ← 上一週
//         </button>

//         <div className="text-center">
//           <div className="text-lg font-semibold text-gray-800">
//             {currentWeek}
//           </div>
//           <div className="text-sm text-gray-600">{weekRange}</div>
//         </div>

//         <button
//           onClick={onNextWeek}
//           disabled={!canGoNext}
//           className={`rounded-lg px-4 py-2 ${
//             canGoNext
//               ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               : 'cursor-not-allowed bg-gray-50 text-gray-400'
//           }`}
//         >
//           下一週 →
//         </button>
//       </div>
//     </div>
//   )
// }

// 歷史版本的任務表格（只顯示，不能操作）
// function HistoryTaskTable({ tasks, weekDays }) {
//   return (
//     <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
//       <div className="p-6">
//         <h2 className="mb-4 text-xl font-semibold text-gray-800">
//           每日任務 (歷史記錄)
//         </h2>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-gray-100">
//                 <th className="px-4 py-3 text-left font-medium text-gray-600">
//                   習慣
//                 </th>
//                 {weekDays.map((day, index) => (
//                   <th
//                     key={index}
//                     className="min-w-[60px] px-2 py-3 text-center font-medium text-gray-600"
//                   >
//                     {day}
//                   </th>
//                 ))}
//                 <th className="px-4 py-3 text-center font-medium text-gray-600">
//                   目標次數
//                 </th>
//                 <th className="px-4 py-3 text-center font-medium text-gray-600">
//                   達成次數
//                 </th>
//                 <th className="px-4 py-3 text-center font-medium text-gray-600">
//                   本週達成率
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {tasks.map((task) => (
//                 <tr
//                   key={task.id}
//                   className="hover:bg-gray-25 border-b border-gray-50"
//                 >
//                   <td className="px-4 py-4">
//                     <span className="font-medium text-gray-800">
//                       {task.name}
//                     </span>
//                   </td>
//                   {task.completedDays.map((isCompleted, dayIndex) => (
//                     <td key={dayIndex} className="px-2 py-4 text-center">
//                       <div className="flex justify-center">
//                         <div
//                           className={`flex h-6 w-6 items-center justify-center rounded border-2 ${
//                             isCompleted
//                               ? 'border-green-500 bg-green-500'
//                               : 'border-gray-300 bg-white'
//                           }`}
//                         >
//                           {isCompleted && (
//                             <svg
//                               className="h-4 w-4 text-white"
//                               fill="none"
//                               stroke="currentColor"
//                               viewBox="0 0 24 24"
//                             >
//                               <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M5 13l4 4L19 7"
//                               />
//                             </svg>
//                           )}
//                         </div>
//                       </div>
//                     </td>
//                   ))}
//                   <td className="px-4 py-4 text-center text-gray-600">
//                     {task.targetDays}
//                   </td>
//                   <td className="px-4 py-4 text-center text-gray-600">
//                     {task.completedCount}
//                   </td>
//                   <td className="px-4 py-4 text-center">
//                     <span
//                       className={`font-medium ${
//                         task.completedCount >= task.targetDays
//                           ? 'text-green-600'
//                           : 'text-orange-600'
//                       }`}
//                     >
//                       {Math.round(
//                         (task.completedCount / task.targetDays) * 100
//                       )}
//                       %
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {tasks.length === 0 && (
//           <div className="py-8 text-center text-gray-500">這週沒有任務記錄</div>
//         )}
//       </div>
//     </div>
//   )
// }

// 歷史版本的每週筆記（只顯示，不能操作）
// function HistoryWeeklyNotes({ notes }) {
//   const formatDate = (dateString) => {
//     const date = new Date(dateString)
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     return `${year}/${month}/${day}`
//   }

//   return (
//     <div className="mb-6 rounded-lg border border-gray-200 bg-white shadow-sm">
//       <div className="p-6">
//         <h2 className="mb-4 text-xl font-semibold text-gray-800">
//           每週記事 (歷史記錄)
//         </h2>

//         {notes.length > 0 ? (
//           <div className="space-y-4">
//             {notes.map((note) => (
//               <div
//                 key={note.id}
//                 className="rounded-lg border border-gray-100 p-4"
//               >
//                 <div className="mb-2 flex items-start justify-between">
//                   <span className="text-sm text-gray-500">
//                     {formatDate(note.created_at)}
//                     {note.updated_at !== note.created_at &&
//                       ` (已編輯: ${formatDate(note.updated_at)})`}
//                   </span>
//                 </div>
//                 <div className="whitespace-pre-wrap text-gray-800">
//                   {note.content}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="py-8 text-center text-gray-500">這週沒有記事</div>
//         )}
//       </div>
//     </div>
//   )
// }

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

  const API_BASE = 'http://localhost:3001/api/habits'

  const fetchHabit = async () => {
    try {
      const res = await fetch(`${API_BASE}/${historyId}`, {
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
      const res = await fetch(`${API_BASE}/${historyId}/weeks`, {
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
