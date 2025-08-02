'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { FollowButton } from '@/components/FollowButton'
import { Users, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuthStore } from '@/store/authStore'

interface SuggestedUser {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  followers_count: number
}

export function SuggestedFollows() {
  const [users, setUsers] = useState<SuggestedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const user = useAuthStore((state) => state.user)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        // 팔로우하지 않은 인기 사용자 추천
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, bio, followers_count')
          .neq('id', user.id)
          .order('followers_count', { ascending: false })
          .limit(5)

        if (error) throw error

        // 현재 팔로우 중인 사용자 확인
        const { data: followingData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)

        const followingIds = new Set(followingData?.map(f => f.following_id) || [])
        
        // 팔로우하지 않은 사용자만 필터링
        const suggestedUsers = data?.filter(u => !followingIds.has(u.id)).slice(0, 3) || []
        setUsers(suggestedUsers)
      } catch (error) {
        console.error('추천 사용자 불러오기 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestedUsers()
  }, [user, supabase])

  if (!user || isLoading || users.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          추천 팔로우
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((suggestedUser) => (
            <div key={suggestedUser.id} className="flex items-center justify-between">
              <Link
                href={`/profile/${suggestedUser.username}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={suggestedUser.avatar_url || undefined} />
                  <AvatarFallback>
                    {suggestedUser.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">@{suggestedUser.username}</p>
                  {suggestedUser.bio && (
                    <p className="text-xs text-muted-foreground truncate">{suggestedUser.bio}</p>
                  )}
                </div>
              </Link>
              <FollowButton
                userId={suggestedUser.id}
                size="sm"
                showIcon={false}
                variant="outline"
              />
            </div>
          ))}
        </div>
        
        <Link href="/explore/users">
          <Button variant="ghost" className="w-full mt-4" size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            더 많은 사용자 찾기
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}