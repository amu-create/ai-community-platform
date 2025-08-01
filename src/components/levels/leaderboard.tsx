'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'

interface LeaderboardUser {
  user_id: string
  username: string
  full_name: string
  avatar_url: string
  total_points: number
  current_level: number
  level_title: string
  badge_color: string
  rank: number
  points_this_period: number
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[]
  current_user_rank: LeaderboardUser | null
}

export function Leaderboard() {
  const [timeframe, setTimeframe] = useState<'all' | 'monthly' | 'weekly'>('all')
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/levels/leaderboard?timeframe=${timeframe}&limit=20`)
      if (!response.ok) throw new Error('Failed to fetch leaderboard')
      
      const data = await response.json()
      setData(data)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    }
  }

  const renderLeaderboardItem = (user: LeaderboardUser, index: number) => {
    const isCurrentUser = data?.current_user_rank?.user_id === user.user_id

    return (
      <motion.div
        key={user.user_id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
          isCurrentUser 
            ? 'bg-primary/10 border-2 border-primary' 
            : 'hover:bg-accent'
        }`}
      >
        <div className="w-12 flex justify-center">
          {getRankIcon(user.rank)}
        </div>

        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar_url} alt={user.username} />
          <AvatarFallback>
            {user.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium">
              {user.full_name || user.username}
            </p>
            <div 
              className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: user.badge_color }}
            >
              Lv.{user.current_level}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {user.level_title}
          </p>
        </div>

        <div className="text-right">
          <p className="font-semibold">
            {timeframe === 'all' 
              ? user.total_points.toLocaleString()
              : user.points_this_period.toLocaleString()
            }
          </p>
          <p className="text-xs text-muted-foreground">포인트</p>
        </div>
      </motion.div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          리더보드
        </CardTitle>
        <CardDescription>
          가장 활발한 사용자들을 확인해보세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="monthly">이번 달</TabsTrigger>
            <TabsTrigger value="weekly">이번 주</TabsTrigger>
          </TabsList>

          <TabsContent value={timeframe} className="space-y-2 mt-4">
            {loading ? (
              // 로딩 스켈레톤
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="w-12 h-5" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : (
              <>
                {/* 리더보드 목록 */}
                {data?.leaderboard.map((user, index) => 
                  renderLeaderboardItem(user, index)
                )}

                {/* 현재 사용자 순위 (리더보드에 없는 경우) */}
                {data?.current_user_rank && 
                 !data.leaderboard.find(u => u.user_id === data.current_user_rank?.user_id) && (
                  <div className="pt-4 mt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">내 순위</p>
                    {renderLeaderboardItem(data.current_user_rank, 20)}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
