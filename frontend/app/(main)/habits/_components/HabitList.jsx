import HabitCard from './HabitCard'

export default function HabitList({ habits, onHabitsChanged }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {habits.map((habit) => (
        <div key={habit.id}>
          <HabitCard {...habit} onHabitsChanged={onHabitsChanged} />
        </div>
      ))}
    </div>
  )
}
