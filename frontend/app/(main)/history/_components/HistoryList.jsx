import HistoryCard from '../_components/HistoryCard'

export default function HistoryList({
  habits,
  onHabitsChanged,
  onRestore,
  onDelete,
}) {
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
