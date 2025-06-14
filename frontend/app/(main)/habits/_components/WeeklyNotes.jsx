import NoteItem from './NoteItem'

export default function WeeklyNotes({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) {
  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <h2 className="mb-6 text-xl font-bold text-[#3D8D7A]">每週記事</h2>

        <div className="space-y-4">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEditNote={onEditNote}
              onDeleteNote={onDeleteNote}
            />
          ))}
        </div>

        <button
          onClick={onAddNote}
          className="mt-6 flex cursor-pointer items-center gap-2 rounded-md border border-gray-400 px-4 py-2 transition hover:bg-gray-100 hover:text-gray-700 active:scale-97"
        >
          <span className="text-lg">+</span>
          <span>新增記事</span>
        </button>
      </div>
    </div>
  )
}
