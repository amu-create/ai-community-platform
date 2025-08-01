'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  TrendingUp,
  Activity,
  BarChart3,
  Shield
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminDashboardData } from '@/app/actions/admin';
import { AdminStats, UserActivity, TopContent, UserGrowth } from '@/types/admin';
import StatsCards from './components/StatsCards';
import ActivityChart from './components/ActivityChart';
import GrowthChart from './components/GrowthChart';
import TopContentTable from './components/TopContentTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface AdminDashboardProps {
  userRole: 'admin' | 'moderator';
}

export default function AdminDashboard({ userRole }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [topContent, setTopContent] = useState<TopContent[]>([]);
  const [growth, setGrowth] = useState<UserGrowth[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminDashboardData();
      
      setStats(data.stats);
      setActivity(data.activity);
      setTopContent(data.topContent);
      setGrowth(data.growth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="text-sm text-muted-foreground">
          Logged in as: <span className="font-semibold">{userRole}</span>
        </div>
      </div>

      {/* 통계 카드 */}
      {stats && <StatsCards stats={stats} />}

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Activity (30 days)
            </CardTitle>
            <CardDescription>Daily activity across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityChart data={activity} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth
            </CardTitle>
            <CardDescription>Monthly user registration trends</CardDescription>
          </CardHeader>
          <CardContent>
            <GrowthChart data={growth} />
          </CardContent>
        </Card>
      </div>

      {/* 탭 섹션 */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Top Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Performing Content
              </CardTitle>
              <CardDescription>
                Most viewed and engaged content across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TopContentTable content={topContent} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users" className="text-primary hover:underline">
                Go to User Management →
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle>Content Moderation</CardTitle>
              <CardDescription>Review reported content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Moderation tools coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings panel coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
