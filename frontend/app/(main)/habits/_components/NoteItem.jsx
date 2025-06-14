export default function NoteItem({ note, onEditNote, onDeleteNote }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 text-sm text-gray-500">{note.date}</div>
          <div className="text-gray-800">{note.content}</div>
        </div>
        <button
          onClick={() => onEditNote(note.id)}
          className="rounded p-1 hover:bg-gray-100"
        >
          <span className="text-gray-400">⋯</span>
        </button>
      </div>
    </div>
  )
}
