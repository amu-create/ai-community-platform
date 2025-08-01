'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BookmarkButton } from '@/components/resources/BookmarkButton'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/components/ui/use-toast'
import { 
  ExternalLink, 
  Calendar, 
  Eye, 
  ThumbsUp,
  BookmarkX,
  Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface BookmarkedResource {
  id: string
  title: string
  description: string
  url: string
  type: string
  level: string
  view_count: number
  vote_count: number
  bookmark_count: number
  created_at: string
  bookmarkedAt: string
  author: {
    username: string
    full_name: string
    avatar_url: string
  }
}

export default function BookmarksPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [resources, setResources] = useState<BookmarkedResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')
  const limit = 12

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    // Reset when sort changes
    setPage(1)
    setResources([])
    setHasMore(true)
    fetchBookmarks(1, true)
  }, [user, sortBy])

  const fetchBookmarks = async (pageNum: number = page, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true)
      }
      
      const response = await fetch(`/api/bookmarks?page=${pageNum}&limit=${limit}`)
      if (!response.ok) throw new Error('Failed to fetch bookmarks')
      
      const data = await response.json()
      
      if (reset) {
        setResources(data.resources)
      } else {
        setResources(prev => [...prev, ...data.resources])
      }
      
      // Check if there are more pages
      setHasMore(pageNum < data.pagination.totalPages)
      
    } catch (error) {
      toast({
        title: '오류가 발생했습니다',
        description: '북마크를 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMoreData = useCallback(() => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBookmarks(nextPage)
  }, [page])

  const handleRemoveBookmark = async (resourceId: string) => {
    setResources(prev => prev.filter(r => r.id !== resourceId))
  }

  const sortedResources = [...resources].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime()
    } else {
      return new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime()
    }
  })

  const getTypeColor = (type: string) => {
    const colors = {
      article: 'bg-blue-100 text-blue-800',
      video: 'bg-red-100 text-red-800',
      course: 'bg-purple-100 text-purple-800',
      tool: 'bg-green-100 text-green-800',
      book: 'bg-yellow-100 text-yellow-800',
      tutorial: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
      all: 'bg-gray-100 text-gray-800'
    }
    return colors[level as keyof typeof colors] || colors.all
  }

  if (!user) {
    return null
  }

  const ResourceCard = ({ resource }: { resource: BookmarkedResource }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            <Badge className={getTypeColor(resource.type)} variant="secondary">
              {resource.type}
            </Badge>
            <Badge className={getLevelColor(resource.level)} variant="secondary">
              {resource.level}
            </Badge>
          </div>
          <BookmarkButton
            resourceId={resource.id}
            isBookmarked={true}
            bookmarkCount={resource.bookmark_count}
            showCount={false}
            size="sm"
            onBookmarkToggle={() => handleRemoveBookmark(resource.id)}
          />
        </div>
        <CardTitle className="line-clamp-2">
          <Link href={`/resources/${resource.id}`} className="hover:underline">
            {resource.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {resource.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {resource.view_count}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {resource.vote_count}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(resource.bookmarkedAt), {
              addSuffix: true,
              locale: ko
            })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={resource.author.avatar_url || '/default-avatar.png'}
              alt={resource.author.username}
              className="h-6 w-6 rounded-full"
            />
            <span className="text-sm">
              {resource.author.full_name || resource.author.username}
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            asChild
          >
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">내 북마크</h1>
        <p className="text-muted-foreground">
          나중에 다시 보고 싶은 학습 리소스를 저장해두세요
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            최신순
          </Button>
          <Button
            variant={sortBy === 'oldest' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('oldest')}
          >
            오래된순
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          총 {resources.length}개의 북마크
        </div>
      </div>

      {/* Content */}
      {isLoading && resources.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookmarkX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">북마크가 없습니다</h3>
            <p className="text-muted-foreground mb-4">
              관심있는 학습 리소스를 북마크에 추가해보세요
            </p>
            <Button onClick={() => router.push('/resources')}>
              리소스 둘러보기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <InfiniteScroll
          dataLength={sortedResources.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
          endMessage={
            <p className="text-center text-muted-foreground py-4">
              모든 북마크를 불러왔습니다.
            </p>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  )
}
