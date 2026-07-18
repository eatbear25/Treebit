'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PiDotsThreeBold, PiUsersThree } from 'react-icons/pi'

import AuthGuard from '@/app/_components/AuthGuard'
import Loader from '@/app/_components/Loader'
import AddFriendDialog from './_components/AddFriendDialog'
import AvatarInitial from './_components/AvatarInitial'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import { API_BASE_URL } from '@/lib/api'
import { useFriendRequests } from '@/contexts/FriendRequestsContext'

// 選中 tab 用「白卡浮起」呈現（design-system：不用淡綠底疊暖白）
const tabTriggerClass =
  'cursor-pointer px-4 data-[state=active]:bg-card data-[state=active]:text-brand-700 data-[state=active]:font-semibold data-[state=active]:shadow-sm'

export default function Friends() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingFriend, setRemovingFriend] = useState(null)
  // 邀請清單放在 context，跟 Sidebar 紅點共用同一份資料
  const { requests, refreshRequests } = useFriendRequests()

  const fetchFriends = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/friends`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (data.success) setFriends(data.data)
    } catch (err) {
      console.error('取得好友列表錯誤:', err)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchFriends(), refreshRequests()])
      setLoading(false)
    }
    loadData()
  }, [fetchFriends, refreshRequests])

  const handleRequestAction = async (requestId, action) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/friends/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ action }),
        }
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || '操作失敗')
      }
      toast.success(data.message)
      // 接受邀請會改變好友列表，兩者一起更新
      await Promise.all([fetchFriends(), refreshRequests()])
    } catch (err) {
      toast.error(err.message || '操作失敗，請稍後再試')
    }
  }

  const handleRemoveFriend = async () => {
    if (!removingFriend) return
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/friends/${removingFriend.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      )
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || '移除好友失敗')
      }
      toast.success(data.message || '已移除好友')
      setRemovingFriend(null)
      fetchFriends()
    } catch (err) {
      toast.error(err.message || '移除好友失敗，請稍後再試')
    }
  }

  return (
    <AuthGuard>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">好友</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            <span className="tnum">{friends.length}</span> 位好友
          </p>
        </div>
        <AddFriendDialog onRequestSent={refreshRequests} />
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Loader />
        </div>
      ) : (
        <Tabs defaultValue="friends">
          <TabsList className="h-10">
            <TabsTrigger value="friends" className={tabTriggerClass}>
              好友
            </TabsTrigger>
            <TabsTrigger value="requests" className={tabTriggerClass}>
              待確認邀請
              {requests.length > 0 && (
                <span className="bg-destructive tnum flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold text-white">
                  {requests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4">
            {friends.length === 0 ? (
              <div className="border-border flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center">
                <PiUsersThree className="text-muted-foreground/60 text-5xl" />
                <p className="mt-5 text-lg font-bold">還沒有好友</p>
                <p className="text-muted-foreground mt-2 max-w-xs text-sm">
                  把你的好友碼傳給朋友，一起養成習慣。
                </p>
              </div>
            ) : (
              <div className="bg-card divide-border divide-y rounded-2xl shadow-sm">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4 p-4 md:px-6"
                  >
                    <Link
                      href={`/friends/${friend.id}`}
                      className="group flex min-w-0 flex-1 items-center gap-4"
                    >
                      <AvatarInitial name={friend.username} />
                      <div className="min-w-0">
                        <p className="group-hover:text-brand-700 truncate font-semibold transition-colors">
                          {friend.username}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-sm">
                          {Number(friend.shared_habits) > 0 ? (
                            <>
                              分享{' '}
                              <span className="tnum">
                                {friend.shared_habits}
                              </span>{' '}
                              個習慣
                            </>
                          ) : (
                            '尚未分享習慣'
                          )}
                        </p>
                      </div>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          aria-label="好友操作"
                          className="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 cursor-pointer rounded-lg p-2 text-xl transition"
                        >
                          <PiDotsThreeBold />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={() => setRemovingFriend(friend)}
                        >
                          移除好友
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            {requests.length === 0 ? (
              <div className="border-border flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-20 text-center">
                <p className="text-lg font-bold">目前沒有新的邀請</p>
                <p className="text-muted-foreground mt-2 max-w-xs text-sm">
                  朋友輸入你的好友碼後，邀請會出現在這裡。
                </p>
              </div>
            ) : (
              <div className="bg-card divide-border divide-y rounded-2xl shadow-sm">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 md:px-6"
                  >
                    <AvatarInitial name={request.username} />
                    <p className="min-w-0 flex-1 truncate font-semibold">
                      {request.username}
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="treebit"
                        size="sm"
                        onClick={() =>
                          handleRequestAction(request.id, 'accept')
                        }
                      >
                        接受
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground cursor-pointer"
                        onClick={() =>
                          handleRequestAction(request.id, 'decline')
                        }
                      >
                        婉拒
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* 移除好友確認 */}
      <AlertDialog
        open={removingFriend !== null}
        onOpenChange={(open) => !open && setRemovingFriend(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              確定要移除好友「{removingFriend?.username}」嗎？
            </AlertDialogTitle>
            <AlertDialogDescription>
              移除後，你們將無法再看到彼此分享的習慣。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFriend}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              確定移除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthGuard>
  )
}
