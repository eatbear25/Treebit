import HabitCard from './HabitCard'

export default function HabitList({ habits, onHabitsChanged }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          {...habit}
          onHabitsChanged={onHabitsChanged}
        />
      ))}
    </div>
  )
}
