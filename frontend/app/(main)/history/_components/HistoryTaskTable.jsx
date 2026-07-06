import { PiCheckBold } from 'react-icons/pi'

export default function HistoryTaskTable({ tasks, weekDays }) {
  return (
    <div className="bg-card mb-8 rounded-2xl shadow-sm">
      <div className="p-5 lg:p-6">
        <h2 className="mb-6 text-lg font-bold">每日任務</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-sm">
                <th className="border-border bg-card sticky left-0 z-10 w-48 border-r p-1 text-left font-semibold md:px-4 md:py-3">
                  任務
                </th>
                {weekDays.map((day, index) => (
                  <th
                    key={index}
                    className="font-outfit tnum w-16 px-2 py-3 text-center font-medium whitespace-nowrap"
                  >
                    {day}
                  </th>
                ))}
                <th className="w-16 px-2 py-3 text-center font-medium whitespace-nowrap">
                  目標
                </th>
                <th className="w-16 px-2 py-3 text-center font-medium whitespace-nowrap">
                  完成
                </th>
                <th className="w-20 px-2 py-3 text-center font-medium whitespace-nowrap">
                  達成率
                </th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => {
                const rate = Math.min(
                  100,
                  Math.round((task.completedCount / task.targetDays) * 100)
                )
                return (
                  <tr key={task.id} className="border-border border-b">
                    <td className="border-border bg-card sticky left-0 z-10 max-w-[180px] min-w-[120px] border-r p-1 md:p-4">
                      <span className="break-words whitespace-normal">
                        {task.name}
                      </span>
                    </td>
                    {task.completedDays.map((isCompleted, dayIndex) => (
                      <td
                        key={dayIndex}
                        className="px-5 py-4 text-center md:px-3"
                      >
                        <div
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${
                            isCompleted
                              ? 'bg-brand-600 dark:text-brand-50 text-white'
                              : 'border-border border-2'
                          }`}
                        >
                          {isCompleted && <PiCheckBold />}
                        </div>
                      </td>
                    ))}
                    <td className="tnum text-muted-foreground px-2 py-4 text-center font-medium whitespace-nowrap">
                      {task.targetDays}
                    </td>
                    <td className="tnum text-foreground px-2 py-4 text-center font-medium whitespace-nowrap">
                      {task.completedCount}
                    </td>
                    <td className="px-2 py-4 text-center whitespace-nowrap">
                      <span
                        className={`tnum ${
                          rate === 100
                            ? 'text-brand-700 font-semibold'
                            : 'text-foreground font-medium'
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="text-muted-foreground py-10 text-center">
            這一週沒有任務紀錄
          </div>
        )}
      </div>
    </div>
  )
}
