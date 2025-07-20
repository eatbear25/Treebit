import HistoryCard from '../_components/HistoryCard'

export default function HistoryList({
  habits,
  onHabitsChanged,
  onRestore,
  onDelete,
}) {
  // const habits = [
  //   { title: '學吉他', weeks: 10, percent: 70, times: 12 },
  //   { title: '喝水 300cc', weeks: 10, percent: 88, times: 20 },
  // ]

  // return (
  //   <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  //     {habits.map((habit, index) => (
  //       <div key={index} className="">
  //         {/* <HabitCard {...habit} onHabitsChanged={onHabitsChanged} /> */}
  //       </div>
  //     ))}
  //   </div>
  // )

  // return (
  //   <div className="space-y-4">
  //     {habits.map((habit) => (
  //       <div
  //         key={habit.id}
  //         className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
  //       >
  //         <div className="flex items-start justify-between">
  //           <div className="flex-1">
  //             <h3 className="mb-2 font-semibold text-gray-800">
  //               {habit.title}
  //             </h3>
  //             <div className="space-y-1 text-sm text-gray-600">
  //               <p>總週數: {habit.total_weeks} 週</p>
  //               <p>
  //                 建立時間: {new Date(habit.created_at).toLocaleDateString()}
  //               </p>
  //               <p>
  //                 封存時間: {new Date(habit.updated_at).toLocaleDateString()}
  //               </p>
  //             </div>
  //           </div>
  //           <div className="ml-4 flex gap-2">
  //             <button
  //               onClick={() => restoreHabit(habit.id)}
  //               className="rounded bg-green-500 px-3 py-1 text-sm text-white transition-colors hover:bg-green-600"
  //             >
  //               恢復
  //             </button>
  //             <button
  //               onClick={() => deleteHabit(habit.id)}
  //               className="rounded bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
  //             >
  //               刪除
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     ))}
  //   </div>
  // )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {habits.map((habit, index) => (
        <div key={index} className="">
          <HistoryCard
            {...habit}
            onHabitsChanged={onHabitsChanged}
            onRestore={onRestore}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  )
}
