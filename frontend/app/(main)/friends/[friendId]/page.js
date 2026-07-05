'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { PiCaretLeftBold } from 'react-icons/pi'

import AuthGuard from '@/app/_components/AuthGuard'
import Loader from '@/app/_components/Loader'
import HabitCard from '@/app/(main)/habits/_components/HabitCard'
import AvatarInitial from '../_components/AvatarInitial'

const API_BASE_URL =
  process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001'

export default function FriendHabits() {
  const params = useParams()
  const friendId = params.friendId

  const [friend, setFriend] = useState(null)
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFriendHabits = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/friends/${friendId}/habits`,
          { credentials: 'include' }
        )
        const data = await res.json()
        if (data.success) {
          setFriend(data.data.friend)
          setHabits(data.data.habits)
        } else {
          setError(data.message || '找不到該好友')
        }
      } catch (err) {
        console.error('取得好友習慣錯誤:', err)
        setError('載入失敗，請稍後再試')
      } finally {
        setLoading(false)
      }
    }
    if (friendId) fetchFriendHabits()
  }, [friendId])

  if (loading) {
    return (
      <AuthGuard>
        <div className="flex justify-center">
          <Loader />
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-xl font-bold">{error}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            對方可能已將你移除，或這位好友不存在。
          </p>
          <Link
            href="/friends"
            className="bg-brand-700 hover:bg-brand-800 mt-6 rounded-tl-xl rounded-br-xl px-6 py-2.5 text-sm font-semibold text-white transition active:scale-[0.98]"
          >
            回好友列表
          </Link>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <Link
        href="/friends"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1 text-sm font-medium transition-colors"
      >
        <PiCaretLeftBold />
        返回好友列表
      </Link>

      <div className="mb-8 flex items-center gap-4">
        <AvatarInitial name={friend?.username} className="h-14 w-14 text-xl" />
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{friend?.username}</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            分享中 <span className="tnum">{habits.length}</span> 個習慣
          </p>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="border-border flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center">
          <img src="/icon.svg" alt="" className="w-14 opacity-90" />
          <p className="mt-5 text-lg font-bold">
            {friend?.username} 還沒有分享任何習慣
          </p>
          <p className="text-muted-foreground mt-2 max-w-xs text-sm">
            等對方把習慣設為好友可見，就會出現在這裡。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              {...habit}
              readOnly
              detailHref={`/friends/${friendId}/habits/${habit.id}`}
            />
          ))}
        </div>
      )}
    </AuthGuard>
  )
}
