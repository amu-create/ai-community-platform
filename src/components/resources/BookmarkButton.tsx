'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useResourceStore } from '@/store/resourceStore'
import { useToast } from '@/components/ui/use-toast'

interface BookmarkButtonProps {
  resourceId: string
  isBookmarked?: boolean
  bookmarkCount?: number
  showCount?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  className?: string
  onBookmarkToggle?: (isBookmarked: boolean) => void
}

export function BookmarkButton({
  resourceId,
  isBookmarked: initialBookmarked = false,
  bookmarkCount: initialCount = 0,
  showCount = true,
  size = 'default',
  variant = 'ghost',
  className,
  onBookmarkToggle
}: BookmarkButtonProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { toggleBookmark } = useResourceStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [bookmarkCount, setBookmarkCount] = useState(initialCount)

  const handleToggleBookmark = async () => {
    if (!user) {
      toast({
        title: '로그인이 필요합니다',
        description: '북마크를 사용하려면 먼저 로그인해주세요.',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }

    setIsLoading(true)
    const newBookmarkedState = !isBookmarked

    // Optimistic update
    setIsBookmarked(newBookmarkedState)
    setBookmarkCount(prev => newBookmarkedState ? prev + 1 : Math.max(0, prev - 1))
    toggleBookmark(resourceId)

    try {
      const response = await fetch(`/api/bookmarks${!newBookmarkedState ? `?resourceId=${resourceId}` : ''}`, {
        method: newBookmarkedState ? 'POST' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: newBookmarkedState ? JSON.stringify({ resourceId }) : undefined,
      })

      if (!response.ok) {
        throw new Error('Failed to update bookmark')
      }

      toast({
        title: newBookmarkedState ? '북마크에 추가되었습니다' : '북마크가 제거되었습니다',
        duration: 2000,
      })

      onBookmarkToggle?.(newBookmarkedState)
    } catch (error) {
      // Revert optimistic update on error
      setIsBookmarked(!newBookmarkedState)
      setBookmarkCount(prev => !newBookmarkedState ? prev + 1 : Math.max(0, prev - 1))
      toggleBookmark(resourceId)
      
      toast({
        title: '오류가 발생했습니다',
        description: '북마크 업데이트에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    default: 'h-9 px-3 text-sm',
    lg: 'h-10 px-4'
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isLoading}
      className={cn(
        'gap-1.5',
        sizeClasses[size],
        isBookmarked && variant === 'ghost' && 'text-yellow-600 hover:text-yellow-700',
        className
      )}
    >
      {isBookmarked ? (
        <BookmarkCheck className={cn(iconSizes[size], 'fill-current')} />
      ) : (
        <Bookmark className={iconSizes[size]} />
      )}
      {showCount && bookmarkCount > 0 && (
        <span className="font-medium">{bookmarkCount}</span>
      )}
    </Button>
  )
}
