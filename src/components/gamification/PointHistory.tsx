'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  MessageSquare, 
  BookOpen, 
  Heart, 
  Share2, 
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PointHistory {
  id: string;
  action_type: string;
  points: number;
  description: string;
  created_at: string;
}

interface ActivityStats {
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_bookmarks: number;
  resources_created: number;
  posts_created: number;
}

interface PointHistoryProps {
  userId: string;
}

const actionIcons = {
  create_resource: BookOpen,
  create_post: MessageSquare,
  receive_like: Heart,
  receive_comment: MessageSquare,
  receive_share: Share2,
  receive_view: Eye,
  daily_login: Calendar,
  achievement: Trophy,
};

const actionColors = {
  create_resource: 'text-blue-500',
  create_post: 'text-green-500',
  receive_like: 'text-red-500',
  receive_comment: 'text-purple-500',
  receive_share: 'text-orange-500',
  receive_view: 'text-gray-500',
  daily_login: 'text-yellow-500',
  achievement: 'text-pink-500',
};

export function PointHistory({ userId }: PointHistoryProps) {
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    fetchPointHistory();
    fetchActivityStats();
  }, [userId]);

  const fetchPointHistory = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/points/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch point history:', error);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch activity stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupHistoryByDate = (items: PointHistory[]) => {
    const grouped: { [key: string]: PointHistory[] } = {};
    
    items.forEach(item => {
      const date = format(new Date(item.created_at), 'yyyy-MM-dd');
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });

    return grouped;
  };

  const groupedHistory = groupHistoryByDate(history);

  return (
    <Card>
      <CardHeader>
        <CardTitle>포인트 & 활동</CardTitle>
        <CardDescription>
          포인트 획득 내역과 활동 통계를 확인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">포인트 내역</TabsTrigger>
            <TabsTrigger value="stats">활동 통계</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {Object.entries(groupedHistory).map(([date, items]) => {
                const dailyTotal = items.reduce((sum, item) => sum + item.points, 0);
                
                return (
                  <div key={date} className="space-y-2 mb-6">
                    <div className="flex items-center justify-between text-sm text-muted-foreground sticky top-0 bg-background py-2">
                      <span>
                        {format(new Date(date), 'M월 d일 (EEEE)', { locale: ko })}
                      </span>
                      <span className="font-semibold">
                        +{dailyTotal} 포인트
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {items.map((item) => {
                        const Icon = actionIcons[item.action_type as keyof typeof actionIcons] || Trophy;
                        const colorClass = actionColors[item.action_type as keyof typeof actionColors] || 'text-gray-500';
                        
                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`h-5 w-5 ${colorClass}`} />
                              <div>
                                <p className="text-sm font-medium">{item.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(item.created_at), 'HH:mm')}
                                </p>
                              </div>
                            </div>
                            <Badge variant={item.points > 0 ? 'default' : 'secondary'}>
                              {item.points > 0 ? '+' : ''}{item.points}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              
              {history.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  아직 포인트 내역이 없습니다
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">콘텐츠 생성</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">리소스</span>
                        <span className="font-semibold">{stats.resources_created}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">포스트</span>
                        <span className="font-semibold">{stats.posts_created}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">참여도</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">조회수</span>
                        <span className="font-semibold">{stats.total_views.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">좋아요</span>
                        <span className="font-semibold">{stats.total_likes}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">상호작용</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">댓글</span>
                        <span className="font-semibold">{stats.total_comments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">공유</span>
                        <span className="font-semibold">{stats.total_shares}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">저장</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">북마크</span>
                        <span className="font-semibold">{stats.total_bookmarks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}