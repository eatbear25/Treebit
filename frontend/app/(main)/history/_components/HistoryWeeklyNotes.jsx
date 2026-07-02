import { formatTimestampToTaiwanYMD } from '@/lib/utils'

export default function HistoryWeeklyNotes({ notes }) {
  return (
    <div className="bg-card rounded-2xl shadow-sm">
      <div className="p-5 lg:p-6">
        <h2 className="mb-6 text-lg font-bold">每週記事</h2>

        {notes.length > 0 ? (
          <div className="divide-border divide-y">
            {notes.map((note) => (
              <div key={note.id} className="py-4 first:pt-0 last:pb-0">
                <p className="font-outfit tnum text-muted-foreground text-xs">
                  {formatTimestampToTaiwanYMD(note.created_at)}
                </p>
                <p className="text-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-10 text-center">
            這一週沒有記事
          </div>
        )}
      </div>
    </div>
  )
}
