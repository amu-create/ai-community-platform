'use client'

import { useState, useEffect, useCallback } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { FollowButton } from '@/components/FollowButton'
import { Search, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuthStore } from '@/store/authStore'

interface User {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  followers_count: number
  following_count: number
  is_following?: boolean
}

export default function ExplorUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const { user } = useAuthStore()
  const supabase = createClientComponentClient()
  const limit = 20

  // Reset when search query changes
  useEffect(() => {
    setPage(0)
    setUsers([])
    setHasMore(true)
    fetchUsers(0, true)
  }, [debouncedSearchQuery, user])

  const fetchUsers = async (pageNum: number = page, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true)
    }

    try {
      let query = supabase
        .from('profiles')
        .select('id, username, avatar_url, bio, followers_count, following_count')
        .order('followers_count', { ascending: false })
        .range(pageNum * limit, (pageNum + 1) * limit - 1)

      if (debouncedSearchQuery) {
        query = query.ilike('username', `%${debouncedSearchQuery}%`)
      }

      if (user) {
        query = query.neq('id', user.id)
      }

      const { data, error } = await query

      if (error) throw error

      // 더 이상 데이터가 없으면
      if (!data || data.length < limit) {
        setHasMore(false)
      }

      // 현재 사용자가 팔로우하는지 확인
      if (user && data && data.length > 0) {
        const userIds = data.map(u => u.id)
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds)

        const followingSet = new Set(followingData?.map(f => f.following_id) || [])
        
        data.forEach((userData: any) => {
          userData.is_following = followingSet.has(userData.id)
        })
      }

      if (reset) {
        setUsers(data || [])
      } else {
        setUsers(prev => [...prev, ...(data || [])])
      }
    } catch (error) {
      console.error('사용자 목록 불러오기 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMoreData = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchUsers(nextPage)
  }, [page, debouncedSearchQuery])

  const UserCard = ({ userData }: { userData: User }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Link
            href={`/profile/${userData.username}`}
            className="flex items-start gap-3 flex-1"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={userData.avatar_url || undefined} />
              <AvatarFallback>
                {userData.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium">@{userData.username}</p>
              {userData.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {userData.bio}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <span>{userData.followers_count} 팔로워</span>
                <span>{userData.following_count} 팔로잉</span>
              </div>
            </div>
          </Link>
          {user && user.id !== userData.id && (
            <FollowButton
              userId={userData.id}
              initialIsFollowing={userData.is_following}
              size="sm"
              showIcon={false}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            사용자 탐색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="사용자 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading && users.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {searchQuery ? '검색 결과가 없습니다' : '표시할 사용자가 없습니다'}
          </CardContent>
        </Card>
      ) : (
        <InfiniteScroll
          dataLength={users.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
          endMessage={
            <p className="text-center text-muted-foreground py-4">
              모든 사용자를 불러왔습니다.
            </p>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((userData) => (
              <UserCard key={userData.id} userData={userData} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}
