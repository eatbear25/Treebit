'use client'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export default function NoteItem({ note, onEditNote, onDeleteNote }) {
  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 text-sm text-gray-500">
            {note.created_at?.slice(0, 10).replace(/-/g, '/')}
          </div>
          <div className="text-gray-800">{note.content}</div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="cursor-pointer rounded p-1 hover:bg-gray-100">
              <span className="text-gray-400">⋯</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEditNote} className="cursor-pointer">
              編輯
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDeleteNote}
              className="cursor-pointer text-red-500"
            >
              刪除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
