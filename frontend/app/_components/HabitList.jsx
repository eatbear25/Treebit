import HabitCard from './HabitCard'

export default function HabitList({ habits, onHabitsChanged }) {
  // const habits = [
  //   { title: '學吉他', weeks: 10, percent: 70, times: 12 },
  //   { title: '喝水 300cc', weeks: 10, percent: 88, times: 20 },
  // ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {habits.map((habit, index) => (
        <div key={index} className="">
          <HabitCard {...habit} onHabitsChanged={onHabitsChanged} />
        </div>
      ))}
    </div>
  )
}
