'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { PiPlusBold, PiCopyBold } from 'react-icons/pi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

export default function AddFriendDialog({ onRequestSent }) {
  const [open, setOpen] = useState(false)
  const [myCode, setMyCode] = useState(null)
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)

  // 好友碼由後端惰性產生，開啟 dialog 時才取得
  const handleOpenChange = async (nextOpen) => {
    setOpen(nextOpen)
    if (nextOpen && !myCode) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/friends/me/code`, {
          credentials: 'include',
        })
        const data = await res.json()
        if (data.success) setMyCode(data.data.friend_code)
      } catch (err) {
        console.error('取得好友碼錯誤:', err)
      }
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(myCode)
      toast.success('已複製好友碼')
    } catch {
      toast.error('複製失敗，請手動選取複製')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!code.trim()) return

    setSending(true)
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || '送出邀請失敗')
      }
      toast.success(data.message || '邀請已送出')
      setCode('')
      setOpen(false)
      onRequestSent?.()
    } catch (err) {
      toast.error(err.message || '送出邀請失敗，請稍後再試')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="treebit">
          <PiPlusBold />
          加好友
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>加好友</DialogTitle>
          <DialogDescription>
            把你的好友碼傳給朋友，或輸入朋友的好友碼送出邀請。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              我的好友碼
            </p>
            <div className="border-border mt-2 flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="font-outfit text-2xl font-bold tracking-widest">
                {myCode || '...'}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!myCode}
                aria-label="複製好友碼"
                className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer rounded-lg p-2 text-lg transition disabled:opacity-50"
              >
                <PiCopyBold />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <p className="text-muted-foreground text-sm font-medium">
              輸入朋友的好友碼
              <span aria-hidden="true" className="text-destructive ml-0.5">
                *
              </span>
            </p>
            <div className="mt-2 flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={8}
                className="font-outfit h-11 flex-1 uppercase"
              />
              <Button
                type="submit"
                variant="treebit"
                disabled={sending}
                className="h-11 px-5 py-0"
              >
                {sending ? '送出中...' : '送出邀請'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
