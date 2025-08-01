'use client'

import { Button } from '@/components/ui/button'
import { useFollow } from '@/hooks/useFollow'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  userId: string
  initialIsFollowing?: boolean
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export function FollowButton({
  userId,
  initialIsFollowing = false,
  variant = 'default',
  size = 'default',
  className,
  showIcon = true,
  onFollowChange,
}: FollowButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { isFollowing, isLoading, toggleFollow } = useFollow({
    userId,
    initialIsFollowing,
    onFollowChange,
  })

  const handleClick = () => {
    if (!user) {
      router.push('/login')
      return
    }
    toggleFollow()
  }

  // 자기 자신인 경우 버튼을 표시하지 않음
  if (user?.id === userId) {
    return null
  }

  return (
    <Button
      variant={isFollowing ? 'outline' : variant}
      size={size}
      className={cn(
        'transition-all duration-200',
        isFollowing && 'hover:bg-destructive hover:text-destructive-foreground hover:border-destructive',
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserMinus className="h-4 w-4 mr-2" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )
          )}
          {size !== 'icon' && (isFollowing ? '언팔로우' : '팔로우')}
        </>
      )}
    </Button>
  )
}