'use client';

import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIRecommendations } from '@/components/ai/AIRecommendations';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { SuggestedFollows } from '@/components/dashboard/SuggestedFollows';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock,
  Target,
  Award
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DashboardContentProps {
  user: User;
  profile: any;
}

interface DashboardStats {
  totalResources: number;
  totalPosts: number;
  completedPaths: number;
  enrolledPaths: number;
  totalBookmarks: number;
  streak: number;
}

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalResources: 0,
    totalPosts: 0,
    completedPaths: 0,
    enrolledPaths: 0,
    totalBookmarks: 0,
    streak: 0,
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    const supabase = createClient();
    
    // Get user stats
    const [resources, posts, enrollments, bookmarks] = await Promise.all([
      supabase.from('resources').select('id', { count: 'exact' }).eq('author_id', user.id),
      supabase.from('posts').select('id', { count: 'exact' }).eq('author_id', user.id),
      supabase.from('user_enrollments').select('*').eq('user_id', user.id),
      supabase.from('bookmarks').select('id', { count: 'exact' }).eq('user_id', user.id),
    ]);

    const completed = enrollments.data?.filter(e => e.status === 'completed').length || 0;
    const enrolled = enrollments.data?.filter(e => e.status === 'active').length || 0;

    setStats({
      totalResources: resources.count || 0,
      totalPosts: posts.count || 0,
      completedPaths: completed,
      enrolledPaths: enrolled,
      totalBookmarks: bookmarks.count || 0,
      streak: 7, // Placeholder - would calculate based on activity
    });
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.full_name || profile?.username || 'Learner'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and discover new learning opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Learning Paths
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolledPaths}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedPaths} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Resources Created
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResources}</div>
              <p className="text-xs text-muted-foreground">
                Shared with community
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Community Posts
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                Discussions started
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Learning Streak
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak} days</div>
              <p className="text-xs text-muted-foreground">
                Keep it going! 🔥
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Learning Journey</CardTitle>
                    <CardDescription>
                      Continue where you left off
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stats.enrolledPaths > 0 ? (
                        <p className="text-sm text-muted-foreground">
                          You have {stats.enrolledPaths} active learning paths
                        </p>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            No active learning paths yet
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Explore learning paths to get started
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>
                      Your activity summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Bookmarked Resources</span>
                        <span className="font-medium">{stats.totalBookmarks}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Completed Paths</span>
                        <span className="font-medium">{stats.completedPaths}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Skill Level</span>
                        <span className="font-medium">{profile?.skill_level || 'Not set'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your latest actions on the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Activity feed coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="progress">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Progress</CardTitle>
                    <CardDescription>
                      Track your advancement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Progress tracking coming soon...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Recommendations Sidebar */}
          <div className="space-y-6">
            <AIRecommendations />
            
            <SuggestedFollows />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  No recent resources yet
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </>
  );
}
