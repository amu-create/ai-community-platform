'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Trophy, 
  Eye, 
  ThumbsUp, 
  Bookmark, 
  MessageSquare,
  ExternalLink,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WeeklyBestResource {
  id: string;
  content_id: string;
  score: number;
  title: string;
  description: string;
  url: string;
  type: string;
  created_by: string;
  username: string;
  avatar_url: string | null;
  view_count: number;
  vote_count: number;
}

interface WeeklyBestPost {
  id: string;
  content_id: string;
  score: number;
  title: string;
  content: string;
  created_by: string;
  username: string;
  avatar_url: string | null;
  view_count: number;
  vote_count: number;
  comment_count: number;
}

export function WeeklyBestContent() {
  const [resources, setResources] = useState<WeeklyBestResource[]>([]);
  const [posts, setPosts] = useState<WeeklyBestPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources');
  const supabase = createClient();

  useEffect(() => {
    fetchWeeklyBest();
  }, []);

  const fetchWeeklyBest = async () => {
    try {
      // 리소스 베스트
      const { data: resourceData, error: resourceError } = await supabase
        .from('weekly_best_resources')
        .select('*')
        .order('score', { ascending: false });

      if (resourceError) throw resourceError;

      // 포스트 베스트
      const { data: postData, error: postError } = await supabase
        .from('weekly_best_posts')
        .select('*')
        .order('score', { ascending: false });

      if (postError) throw postError;

      setResources(resourceData || []);
      setPosts(postData || []);
    } catch (error) {
      console.error('Failed to fetch weekly best:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-600" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getResourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      tutorial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      article: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      video: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      course: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      tool: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      book: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="resources">
          <Bookmark className="h-4 w-4 mr-2" />
          리소스
        </TabsTrigger>
        <TabsTrigger value="posts">
          <MessageSquare className="h-4 w-4 mr-2" />
          포스트
        </TabsTrigger>
      </TabsList>

      <TabsContent value="resources" className="space-y-4 mt-6">
        {resources.length > 0 ? (
          resources.map((resource, index) => (
            <Card key={resource.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {getRankIcon(index + 1)}
                  <span className="text-xs text-muted-foreground mt-1">
                    {resource.score}점
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        <Link 
                          href={`/resources/${resource.content_id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {resource.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                    </div>
                    <Badge className={getResourceTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Link 
                        href={`/profile/${resource.username}`}
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={resource.avatar_url || undefined} />
                          <AvatarFallback>
                            {resource.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{resource.username}</span>
                      </Link>
                      
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {resource.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {resource.vote_count}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        방문
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              이번 주 베스트 리소스가 아직 선정되지 않았습니다
            </p>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="posts" className="space-y-4 mt-6">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  {getRankIcon(index + 1)}
                  <span className="text-xs text-muted-foreground mt-1">
                    {post.score}점
                  </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    <Link 
                      href={`/community/posts/${post.content_id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Link 
                        href={`/profile/${post.username}`}
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.avatar_url || undefined} />
                          <AvatarFallback>
                            {post.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{post.username}</span>
                      </Link>
                      
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {post.view_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {post.vote_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {post.comment_count}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link href={`/community/posts/${post.content_id}`}>
                        자세히 보기
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              이번 주 베스트 포스트가 아직 선정되지 않았습니다
            </p>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
}
