'use client'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { formatTimestampToTaiwanYMD } from '@/lib/utils'

export default function NoteItem({ note, onEditNote, onDeleteNote }) {
  return (
    <div className="rounded-lg border border-border p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="tnum mb-2 text-sm text-muted-foreground">
            <div>{formatTimestampToTaiwanYMD(note.created_at)}</div>
          </div>
          <div className="text-foreground">{note.content}</div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer rounded-lg p-1 transition hover:bg-muted">
              <span className="text-muted-foreground">⋯</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditNote} className="cursor-pointer">
              編輯
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDeleteNote}
              className="cursor-pointer text-destructive"
            >
              刪除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
