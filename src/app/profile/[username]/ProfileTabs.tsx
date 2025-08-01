'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Heart, MessageSquare } from 'lucide-react'
import { PostList } from './PostList'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface ProfileTabsProps {
  userId: string
  username: string
}

export function ProfileTabs({ userId, username }: ProfileTabsProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get('tab') || 'posts'

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('tab', value)
    router.push(`/profile/${username}?${params.toString()}`)
  }

  return (
    <Tabs value={tab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="posts">
          <FileText className="h-4 w-4 mr-2" />
          게시물
        </TabsTrigger>
        <TabsTrigger value="replies">
          <MessageSquare className="h-4 w-4 mr-2" />
          답글
        </TabsTrigger>
        <TabsTrigger value="likes">
          <Heart className="h-4 w-4 mr-2" />
          좋아요
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="mt-6">
        <PostList userId={userId} type="posts" />
      </TabsContent>

      <TabsContent value="replies" className="mt-6">
        <PostList userId={userId} type="replies" />
      </TabsContent>

      <TabsContent value="likes" className="mt-6">
        <PostList userId={userId} type="likes" />
      </TabsContent>
    </Tabs>
  )
}