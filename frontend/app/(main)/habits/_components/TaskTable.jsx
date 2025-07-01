import TaskRow from './TaskRow'

export default function TaskTable({
  tasks,
  weekDays,
  onToggleTask,
  onAddTask,
}) {
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
                <TaskRow
                  key={task.id}
                  task={task}
                  weekDays={weekDays}
                  onToggleTask={onToggleTask}
                />
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onAddTask}
          className="mt-6 flex cursor-pointer items-center gap-2 rounded-md border border-gray-400 px-4 py-2 transition hover:bg-gray-100 hover:text-gray-700 active:scale-97"
        >
          <span className="text-lg">+</span>
          <span>新增任務</span>
        </button>
      </div>
    </div>
  )
}
