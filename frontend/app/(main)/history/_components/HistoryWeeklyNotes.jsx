import { formatTimestampToTaiwanYMD } from '@/lib/utils'

export default function HistoryWeeklyNotes({ notes }) {
  return (
    <div className="rounded-2xl bg-card shadow-sm">
      <div className="p-5 lg:p-6">
        <h2 className="mb-6 text-xl font-bold text-primary">每週記事</h2>

        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-border p-4 transition-shadow hover:shadow-sm"
              >
                <div className="tnum mb-2 text-sm text-muted-foreground">
                  <div>{formatTimestampToTaiwanYMD(note.created_at)}</div>
                </div>
                <div className="text-foreground">{note.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            本週沒有記事
          </div>
        )}
      </div>
    </div>
  )
}
