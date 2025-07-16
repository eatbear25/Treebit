'use client'

import { useState } from 'react'
import NoteItem from './NoteItem'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

export default function WeeklyNotes({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
}) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToEdit, setNoteToEdit] = useState(null)
  const [noteToDelete, setNoteToDelete] = useState(null)

  const noteSchema = z.object({
    content: z
      .string({ message: '內容為必填欄位' })
      .min(2, { message: '內容至少需 2 個字' }),
  })

  const addForm = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: '',
    },
  })

  const editForm = useForm({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: '',
    },
  })

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await onAddNote(values.content)
      setOpen(false)
      addForm.reset()
    } catch (err) {
      console.error(err)
      toast.error('新增記事失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubmit = async (values) => {
    if (!noteToEdit) return

    setLoading(true)
    try {
      const message = await onEditNote(noteToEdit.id, values.content)
      toast.success(message)
      setEditOpen(false)
      setNoteToEdit(null)
      editForm.reset()
    } catch (err) {
      console.error(err)
      toast.error('編輯記事失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return

    try {
      const message = await onDeleteNote(noteToDelete.id)
      toast.success(message)
      setDeleteDialogOpen(false)
      setNoteToDelete(null)
    } catch (err) {
      console.error(err)
      toast.error('刪除記事失敗')
    }
  }

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="p-5 lg:p-6">
        <h2 className="mb-6 text-xl font-bold text-[#3D8D7A]">每週記事</h2>

        <div className="space-y-4">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onEditNote={() => {
                setNoteToEdit(note)
                editForm.setValue('content', note.content)
                setEditOpen(true)
              }}
              onDeleteNote={() => {
                setNoteToDelete(note)
                setDeleteDialogOpen(true)
              }}
            />
          ))}
        </div>

        {/* 新增記事 Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              onClick={() => {
                setOpen(true)
                addForm.reset({ content: '' })
              }}
              className="mt-6 flex cursor-pointer items-center gap-2 rounded-md border border-gray-400 px-4 py-2 transition hover:bg-gray-100 hover:text-gray-700 active:scale-97"
            >
              <span className="text-lg">+</span>
              <span>新增記事</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>新增記事</DialogTitle>
              <DialogDescription>
                輸入這週的心得或備註，完成後請點擊新增。
              </DialogDescription>
            </DialogHeader>

            <Form {...addForm}>
              <form
                onSubmit={addForm.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={addForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>記事內容</FormLabel>
                      <FormControl>
                        <Input placeholder="請輸入記事內容" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      關閉
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>
                    {loading ? '新增中...' : '新增'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 編輯記事 Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>編輯記事</DialogTitle>
              <DialogDescription>
                修改這則記事內容後，請點擊保存。
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(handleEditSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={editForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>記事內容</FormLabel>
                      <FormControl>
                        <Input placeholder="請輸入記事內容" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      關閉
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={loading}>
                    {loading ? '儲存中...' : '保存'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* 刪除確認 Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>確定要刪除這則記事嗎？</DialogTitle>
              <DialogDescription>刪除後無法恢復。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={handleConfirmDelete}>確定刪除</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
