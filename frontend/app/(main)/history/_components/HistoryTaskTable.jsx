export default function HistoryTaskTable({ tasks, weekDays }) {
  return (
    <div className="mb-8 rounded-lg bg-white shadow-sm">
      <div className="p-5 lg:p-6">
        <h2 className="mb-6 text-xl font-bold text-[#3D8D7A]">每日任務</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="sticky left-0 z-10 w-48 border-r border-gray-200 bg-white p-1 text-left font-bold md:px-4 md:py-3">
                  習慣
                </th>
                {weekDays.map((day, index) => (
                  <th
                    key={index}
                    className="w-16 px-2 py-3 text-center font-medium whitespace-nowrap"
                  >
                    {day}
                  </th>
                ))}
                <th className="w-20 px-2 py-3 text-center font-medium whitespace-nowrap">
                  目標次數
                </th>
                <th className="w-20 px-2 py-3 text-center font-medium whitespace-nowrap">
                  達成次數
                </th>
                <th className="w-24 px-2 py-3 text-center font-medium whitespace-nowrap">
                  本週達成率
                </th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="sticky left-0 z-10 max-w-[180px] min-w-[120px] border-r border-gray-200 bg-white p-1 md:p-4">
                    <span className="break-words whitespace-normal">
                      {task.name}
                    </span>
                  </td>
                  {task.completedDays.map((isCompleted, dayIndex) => (
                    <td
                      key={dayIndex}
                      className="px-5 py-4 text-center md:px-3"
                    >
                      <div className="flex justify-center">
                        <div
                          className={`flex h-7 w-7 cursor-not-allowed items-center justify-center rounded border-2 ${
                            isCompleted
                              ? 'bg-[#317162] text-white'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isCompleted && (
                            <svg
                              className="h-4 w-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="px-2 py-4 text-center font-medium whitespace-nowrap text-gray-700">
                    {task.targetDays}
                  </td>
                  <td className="px-2 py-4 text-center font-medium whitespace-nowrap text-gray-700">
                    {task.completedCount}
                  </td>
                  <td className="px-2 py-4 text-center">
                    <span
                      className={`font-medium ${
                        task.completedCount >= task.targetDays
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {Math.round(
                        (task.completedCount / task.targetDays) * 100
                      )}
                      %
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tasks.length === 0 && (
          <div className="py-8 text-center text-gray-500">本週沒有任務紀錄</div>
        )}
      </div>
    </div>
  )
}
