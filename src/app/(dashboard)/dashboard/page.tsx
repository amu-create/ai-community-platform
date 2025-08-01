'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Award,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { AIInsightsWidget } from '@/components/ai/ai-insights-widget';
import { UserLevelDisplay } from '@/components/levels/user-level-display';
import { Leaderboard } from '@/components/levels/leaderboard';

interface DashboardStats {
  totalResources: number;
  userContributions: number;
  userBookmarks: number;
  userLevel: number;
  userExperience: number;
  experienceToNextLevel: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalResources: 0,
    userContributions: 0,
    userBookmarks: 0,
    userLevel: 1,
    userExperience: 0,
    experienceToNextLevel: 100
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadDashboardStats();
  }, [user]);

  const loadDashboardStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // 전체 리소스 수
      const { count: totalResources } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      // 사용자가 작성한 리소스 수
      const { count: userContributions } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

      // 사용자가 북마크한 리소스 수
      const { count: userBookmarks } = await supabase
        .from('resource_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // 사용자 프로필 정보
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('level, experience')
        .eq('id', user.id)
        .single();

      // 다음 레벨까지 필요한 경험치 계산
      const experienceToNextLevel = (profile?.level || 1) * 100;

      setStats({
        totalResources: totalResources || 0,
        userContributions: userContributions || 0,
        userBookmarks: userBookmarks || 0,
        userLevel: profile?.level || 1,
        userExperience: profile?.experience || 0,
        experienceToNextLevel
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const experienceProgress = (stats.userExperience / stats.experienceToNextLevel) * 100;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* 환영 메시지 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          안녕하세요, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}님! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          오늘도 AI 학습을 함께 시작해보세요.
        </p>
      </div>

      {/* 레벨 & 경험치 */}
      <div className="mb-8">
        <UserLevelDisplay userId={user?.id} />
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              전체 리소스
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              커뮤니티에서 공유된 리소스
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              내 기여
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userContributions}</div>
            <p className="text-xs text-muted-foreground">
              내가 공유한 리소스
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              북마크
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.userBookmarks}</div>
            <p className="text-xs text-muted-foreground">
              저장한 리소스
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* AI 추천 위젯 추가 */}
        <AIInsightsWidget />
        
        {/* 리더보드 */}
        <Leaderboard />
      </div>
      
      {/* 액션 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 액션 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>리소스 둘러보기</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              커뮤니티가 추천하는 AI 학습 자료를 찾아보세요.
            </p>
            <Link href="/resources">
              <Button className="w-full">
                리소스 보러가기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>리소스 공유하기</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              유용한 AI 학습 자료를 커뮤니티와 공유해주세요.
            </p>
            <Link href="/resources/new">
              <Button variant="outline" className="w-full">
                새 리소스 추가
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>커뮤니티 참여하기</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              다른 사용자들과 AI 학습 경험을 공유하세요.
            </p>
            <Link href="/community">
              <Button variant="outline" className="w-full">
                커뮤니티 가기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
