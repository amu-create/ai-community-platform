'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PostListProps {
  userId: string
  type: 'posts' | 'replies' | 'likes'
}

interface Post {
  id: string
  content: string
  created_at: string
  author: {
    username: string
    avatar_url: string | null
  }
}

export function PostList({ userId, type }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)
      
      try {
        let query
        
        if (type === 'posts') {
          query = supabase
            .from('posts')
            .select(`
              id,
              content,
              created_at,
              author:profiles!posts_author_id_fkey(username, avatar_url)
            `)
            .eq('author_id', userId)
            .is('parent_id', null)
            .order('created_at', { ascending: false })
        } else if (type === 'replies') {
          query = supabase
            .from('posts')
            .select(`
              id,
              content,
              created_at,
              author:profiles!posts_author_id_fkey(username, avatar_url)
            `)
            .eq('author_id', userId)
            .not('parent_id', 'is', null)
            .order('created_at', { ascending: false })
        } else {
          // likes - 추후 구현
          setPosts([])
          setIsLoading(false)
          return
        }

        const { data, error } = await query

        if (error) throw error
        
        // Transform data to fix author type
        const transformedData = (data || []).map((post: any) => ({
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          author: Array.isArray(post.author) ? post.author[0] : post.author
        }))
        
        setPosts(transformedData)
      } catch (error) {
        console.error('게시물 불러오기 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [userId, type, supabase])

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {type === 'posts' && '아직 작성한 게시물이 없습니다'}
        {type === 'replies' && '아직 작성한 답글이 없습니다'}
        {type === 'likes' && '아직 좋아요한 게시물이 없습니다'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-4">
            <Link href={`/posts/${post.id}`} className="block hover:bg-accent/50 -m-4 p-4 rounded-lg transition-colors">
              <div className="text-sm text-muted-foreground mb-2">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: ko 
                })}
              </div>
              <p className="whitespace-pre-wrap">{post.content}</p>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}