import HistoryCard from './HistoryCard'

export default function HistoryList({ habits, onRestore, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {habits.map((habit) => (
        <HistoryCard
          key={habit.id}
          {...habit}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
