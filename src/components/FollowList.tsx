'use client'

import { useFollowList } from '@/hooks/useFollowList'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FollowButton } from '@/components/FollowButton'
import { Loader2, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

interface FollowListProps {
  userId: string
  type: 'followers' | 'following'
}

export function FollowList({ userId, type }: FollowListProps) {
  const { users, isLoading, error, hasMore, loadMore } = useFollowList({ userId, type })
  const { ref, inView } = useInView({ threshold: 0 })

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore()
    }
  }, [inView, hasMore, isLoading, loadMore])

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  if (!isLoading && users.length === 0) {
    return (
      <div className="text-center py-8">
        <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          {type === 'followers' ? '아직 팔로워가 없습니다' : '아직 팔로우하는 사용자가 없습니다'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Link href={`/profile/${user.username}`} className="flex items-center space-x-3 flex-1">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                  <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">@{user.username}</p>
                  {user.bio && (
                    <p className="text-sm text-muted-foreground truncate">{user.bio}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span>{user.followers_count} 팔로워</span>
                    <span>{user.following_count} 팔로잉</span>
                  </div>
                </div>
              </Link>
              <FollowButton
                userId={user.id}
                initialIsFollowing={user.is_following}
                size="sm"
                showIcon={false}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {hasMore && !isLoading && (
        <div ref={ref} className="py-4 text-center">
          <Button variant="ghost" onClick={loadMore}>
            더 보기
          </Button>
        </div>
      )}
    </div>
  )
}