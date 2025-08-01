'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FollowButton } from '@/components/FollowButton'
import { CalendarIcon, LinkIcon, MapPinIcon, Settings } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { UserLevelDisplay } from '@/components/levels/user-level-display'

interface ProfileHeaderProps {
  profile: {
    id: string
    username: string
    avatar_url: string | null
    bio: string | null
    website: string | null
    location: string | null
    followers_count: number
    following_count: number
    created_at: string
  }
  isOwnProfile: boolean
  isFollowing: boolean
  postsCount: number
}

export function ProfileHeader({ profile, isOwnProfile, isFollowing, postsCount }: ProfileHeaderProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="text-2xl">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">@{profile.username}</h1>
                  <UserLevelDisplay userId={profile.id} compact />
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground mt-1">{profile.bio}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <Link href="/settings/profile">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      프로필 편집
                    </Button>
                  </Link>
                ) : (
                  <FollowButton
                    userId={profile.id}
                    initialIsFollowing={isFollowing}
                    size="sm"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>{new URL(profile.website).hostname}</span>
                </a>
              )}
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {format(new Date(profile.created_at), 'yyyy년 M월', { locale: ko })}에 가입
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <Link
                href={`/profile/${profile.username}/following`}
                className="hover:underline"
              >
                <span className="font-bold">{profile.following_count}</span>
                <span className="text-muted-foreground"> 팔로잉</span>
              </Link>
              <Link
                href={`/profile/${profile.username}/followers`}
                className="hover:underline"
              >
                <span className="font-bold">{profile.followers_count}</span>
                <span className="text-muted-foreground"> 팔로워</span>
              </Link>
              <div>
                <span className="font-bold">{postsCount}</span>
                <span className="text-muted-foreground"> 게시물</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}