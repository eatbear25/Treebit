import { formatDateToLocalYMD } from '@/lib/utils'

export default function ({ notes }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="p-5 lg:p-6">
        <h2 className="mb-6 text-xl font-bold text-[#3D8D7A]">每週記事</h2>

        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm"
              >
                <div className="mb-2 text-sm text-gray-500">
                  <div>{formatDateToLocalYMD(note.created_at)}</div>
                </div>
                <div className="text-gray-800">{note.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">本週沒有記事</div>
        )}
      </div>
    </div>
  )
}
