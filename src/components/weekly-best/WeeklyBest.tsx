'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Star, MessageSquare, Bookmark, TrendingUp, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklyBestData {
  weekStart: string;
  weekEnd: string;
  bestResources: any[];
  bestPosts: any[];
  topContributors: any[];
  stats: {
    newResources: number;
    newPosts: number;
    activeUsers: number;
    totalEngagement: number;
  };
}

export function WeeklyBest() {
  const [data, setData] = useState<WeeklyBestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyBest();
  }, []);

  const fetchWeeklyBest = async () => {
    try {
      const response = await fetch('/api/weekly-best');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {error || '데이터를 불러올 수 없습니다'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">주간 베스트</CardTitle>
                <CardDescription>
                  {format(new Date(data.weekStart), 'M월 d일', { locale: ko })} - 
                  {format(new Date(data.weekEnd), 'M월 d일', { locale: ko })}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>매주 월요일 업데이트</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {data.stats.newResources}
              </div>
              <div className="text-sm text-muted-foreground">새 리소스</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {data.stats.newPosts}
              </div>
              <div className="text-sm text-muted-foreground">새 포스트</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {data.stats.activeUsers}
              </div>
              <div className="text-sm text-muted-foreground">활성 사용자</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.stats.totalEngagement}
              </div>
              <div className="text-sm text-muted-foreground">총 참여도</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 콘텐츠 */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resources">베스트 리소스</TabsTrigger>
          <TabsTrigger value="posts">베스트 포스트</TabsTrigger>
          <TabsTrigger value="contributors">TOP 기여자</TabsTrigger>
        </TabsList>

        {/* 베스트 리소스 */}
        <TabsContent value="resources" className="space-y-4">
          {data.bestResources.map((resource, index) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Link href={`/resources/${resource.id}`} className="hover:underline">
                      <h3 className="font-semibold text-lg">{resource.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">{resource.categories?.name}</Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{resource.avgRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({resource.ratingCount})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-4 w-4 text-blue-500" />
                        <span>{resource.bookmarkCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={resource.profiles?.avatar_url} />
                        <AvatarFallback>
                          {resource.profiles?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/profile/${resource.profiles?.username}`}
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        {resource.profiles?.full_name || resource.profiles?.username}
                      </Link>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">{resource.score}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">점수</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* 베스트 포스트 */}
        <TabsContent value="posts" className="space-y-4">
          {data.bestPosts.map((post, index) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Link href={`/posts/${post.id}`} className="hover:underline">
                      <h3 className="font-semibold text-lg">{post.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant={post.type === 'question' ? 'default' : 'secondary'}>
                        {post.type === 'question' ? '질문' : '토론'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span>{post.commentCount} 댓글</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span>{post.voteCount} 투표</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>
                          {post.profiles?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Link
                        href={`/profile/${post.profiles?.username}`}
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        {post.profiles?.full_name || post.profiles?.username}
                      </Link>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-semibold">{post.score}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">점수</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* TOP 기여자 */}
        <TabsContent value="contributors" className="space-y-4">
          {data.topContributors.map((user, index) => (
            <Card key={user.user_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link
                      href={`/profile/${user.username}`}
                      className="font-semibold text-lg hover:underline"
                    >
                      {user.full_name || user.username}
                    </Link>
                    <div className="text-sm text-muted-foreground">@{user.username}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="font-semibold">{user.resource_count}</div>
                      <div className="text-xs text-muted-foreground">리소스</div>
                    </div>
                    <div>
                      <div className="font-semibold">{user.post_count}</div>
                      <div className="text-xs text-muted-foreground">포스트</div>
                    </div>
                    <div>
                      <div className="font-semibold">{user.comment_count}</div>
                      <div className="text-xs text-muted-foreground">댓글</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {user.total_score}
                      </div>
                      <div className="text-xs text-muted-foreground">총점</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
