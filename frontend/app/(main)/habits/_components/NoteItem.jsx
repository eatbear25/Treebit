'use client'

import { PiDotsThreeBold } from 'react-icons/pi'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { formatTimestampToTaiwanYMD } from '@/lib/utils'

export default function NoteItem({ note, onEditNote, onDeleteNote }) {
  return (
    <div className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <p className="font-outfit tnum text-muted-foreground text-xs">
          {formatTimestampToTaiwanYMD(note.created_at)}
        </p>
        <p className="text-foreground mt-1.5 leading-relaxed whitespace-pre-wrap">
          {note.content}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="記事操作"
            className="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer rounded-lg p-1.5 transition"
          >
            <PiDotsThreeBold />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEditNote} className="cursor-pointer">
            編輯
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDeleteNote}
            className="text-destructive cursor-pointer"
          >
            刪除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
