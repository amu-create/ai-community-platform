'use client';

import { useState, useEffect } from 'react';
import { weeklyBestService, type WeeklyBestResource, type WeeklyBestPost, type WeeklyStats } from '@/services/weekly-best';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Eye, 
  ThumbsUp, 
  Bookmark, 
  MessageSquare,
  ExternalLink,
  Calendar,
  TrendingUp,
  Users,
  Award,
  Flame
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export function WeeklyBestContent() {
  const [resources, setResources] = useState<WeeklyBestResource[]>([]);
  const [posts, setPosts] = useState<WeeklyBestPost[]>([]);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resources');
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    fetchWeeklyBest();
  }, []);

  const fetchWeeklyBest = async () => {
    try {
      const [resourceData, postData, statsData, dates] = await Promise.all([
        weeklyBestService.getWeeklyBestResources(),
        weeklyBestService.getWeeklyBestPosts(),
        weeklyBestService.getWeeklyStats(),
        weeklyBestService.getDateRange(),
      ]);

      setResources(resourceData);
      setPosts(postData);
      setStats(statsData);
      setDateRange(dates.formatted);
    } catch (error) {
      console.error('Failed to fetch weekly best:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-5 w-5 text-orange-600" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return (
      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
        <Flame className="h-3 w-3 mr-1" />
        1위
      </Badge>
    );
    if (rank === 2) return <Badge variant="secondary">2위</Badge>;
    if (rank === 3) return <Badge variant="outline">3위</Badge>;
    return null;
  };

  const getResourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      article: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      video: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      course: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      tool: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      book: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    };
    return colors[type] || colors.other;
  };

  const getResourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      article: '아티클',
      video: '비디오',
      course: '강좌',
      tool: '도구',
      book: '도서',
      other: '기타',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range & Stats */}
      {dateRange && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">집계 기간:</span>
              <span className="font-medium">{dateRange.start} ~ {dateRange.end}</span>
            </div>
            {stats && (
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">리소스:</span>
                  <span className="font-medium">{stats.totalResources}개</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">포스트:</span>
                  <span className="font-medium">{stats.totalPosts}개</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Top Contributors */}
      {stats?.topContributors && stats.topContributors.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">이번 주 최고 기여자</h3>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {stats.topContributors.map((contributor, index) => (
              <Link
                key={contributor.user_id}
                href={`/profile/${contributor.username}`}
                className="flex flex-col items-center gap-2 min-w-[80px] group"
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-offset-background ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <AvatarImage src={contributor.avatar_url || undefined} />
                    <AvatarFallback>
                      {contributor.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Trophy className="h-2.5 w-2.5 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-center truncate w-full">
                  {contributor.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  {contributor.contribution_count}개 기여
                </span>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="resources">
            <Bookmark className="h-4 w-4 mr-2" />
            리소스 TOP 10
          </TabsTrigger>
          <TabsTrigger value="posts">
            <MessageSquare className="h-4 w-4 mr-2" />
            포스트 TOP 10
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4 mt-6">
          {resources.length > 0 ? (
            resources.map((resource, index) => (
              <Card 
                key={resource.id} 
                className={cn(
                  "p-6 hover:shadow-lg transition-all",
                  index === 0 && "border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10"
                )}
              >
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            <Link 
                              href={`/resources/${resource.content_id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {resource.title}
                            </Link>
                          </h3>
                          {getRankBadge(index + 1)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      </div>
                      <Badge className={cn("ml-2", getResourceTypeColor(resource.type))}>
                        {getResourceTypeLabel(resource.type)}
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
                            {resource.view_count.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {resource.vote_count}
                          </span>
                          {resource.bookmark_count !== undefined && (
                            <span className="flex items-center gap-1">
                              <Bookmark className="h-4 w-4" />
                              {resource.bookmark_count}
                            </span>
                          )}
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
              <Card 
                key={post.id} 
                className={cn(
                  "p-6 hover:shadow-lg transition-all",
                  index === 0 && "border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50/50 to-orange-50/50 dark:from-yellow-900/10 dark:to-orange-900/10"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    {getRankIcon(index + 1)}
                    <span className="text-xs text-muted-foreground mt-1">
                      {post.score}점
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">
                        <Link 
                          href={`/community/posts/${post.content_id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      {getRankBadge(index + 1)}
                    </div>
                    
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
                            {post.view_count.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            {post.vote_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.comment_count}
                          </span>
                          {post.bookmark_count !== undefined && (
                            <span className="flex items-center gap-1">
                              <Bookmark className="h-4 w-4" />
                              {post.bookmark_count}
                            </span>
                          )}
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
    </div>
  );
}
