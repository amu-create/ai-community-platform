'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserLevelDisplay } from '@/components/levels/user-level-display'
import { Leaderboard } from '@/components/levels/leaderboard'
import { PointsHistory } from '@/components/levels/points-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Activity, TrendingUp } from 'lucide-react'

export default function LevelsPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">레벨 & 포인트</h1>
        <p className="text-muted-foreground">
          활동을 통해 포인트를 획득하고 레벨을 올려보세요
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            개요
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            포인트 내역
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            리더보드
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 내 레벨 정보 */}
          <UserLevelDisplay />

          {/* 포인트 획득 방법 */}
          <Card>
            <CardHeader>
              <CardTitle>포인트 획득 방법</CardTitle>
              <CardDescription>
                다양한 활동을 통해 포인트를 획득할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">콘텐츠 생성</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 리소스 생성: 50 포인트</li>
                      <li>• 포스트 작성: 30 포인트</li>
                      <li>• 학습 경로 완료: 200 포인트</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">커뮤니티 활동</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 좋아요 받기: 5 포인트</li>
                      <li>• 댓글 받기: 10 포인트</li>
                      <li>• 공유 받기: 15 포인트</li>
                      <li>• 팔로우하기: 5 포인트</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 레벨 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>레벨 시스템</CardTitle>
              <CardDescription>
                포인트를 모아 레벨을 올리고 특별한 혜택을 받으세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { level: 1, title: 'Novice', points: '0-99', color: '#6B7280' },
                  { level: 2, title: 'Learner', points: '100-299', color: '#3B82F6' },
                  { level: 3, title: 'Contributor', points: '300-599', color: '#10B981' },
                  { level: 4, title: 'Expert', points: '600-999', color: '#8B5CF6' },
                  { level: 5, title: 'Master', points: '1000-1999', color: '#F59E0B' },
                  { level: 6, title: 'Guru', points: '2000-3999', color: '#EF4444' },
                  { level: 7, title: 'Sage', points: '4000-7999', color: '#EC4899' },
                  { level: 8, title: 'Legend', points: '8000+', color: '#FFD700' },
                ].map((level) => (
                  <div key={level.level} className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: level.color }}
                    >
                      {level.level}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{level.title}</p>
                      <p className="text-sm text-muted-foreground">{level.points} 포인트</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <PointsHistory />
        </TabsContent>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
