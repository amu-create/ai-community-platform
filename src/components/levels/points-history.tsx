'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Activity, TrendingUp, Zap, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface PointStat {
  action_type: string
  action_count: number
  total_points: number
  last_earned: string
}

interface RecentPoint {
  id: string
  action_type: string
  points: number
  description: string
  created_at: string
}

interface PointsHistoryData {
  point_stats: PointStat[]
  recent_points: RecentPoint[]
}

const ACTION_TYPE_LABELS: Record<string, string> = {
  create_resource: '리소스 생성',
  create_post: '포스트 작성',
  receive_like: '좋아요 받기',
  receive_comment: '댓글 받기',
  bookmark_resource: '북마크',
  follow_user: '팔로우',
  daily_login: '일일 로그인',
  achievement: '업적 달성',
  complete_learning_path: '학습 경로 완료'
}

const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

export function PointsHistory({ userId }: { userId?: string }) {
  const [data, setData] = useState<PointsHistoryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPointsHistory()
  }, [userId])

  const fetchPointsHistory = async () => {
    try {
      const url = userId 
        ? `/api/levels?userId=${userId}`
        : '/api/levels'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch points history')
      
      const data = await response.json()
      setData({
        point_stats: data.point_stats || [],
        recent_points: data.recent_points || []
      })
    } catch (error) {
      console.error('Error fetching points history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>포인트 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  // 차트 데이터 준비
  const barChartData = data.point_stats.map(stat => ({
    name: ACTION_TYPE_LABELS[stat.action_type] || stat.action_type,
    포인트: stat.total_points,
    횟수: stat.action_count
  }))

  const pieChartData = data.point_stats.map((stat, index) => ({
    name: ACTION_TYPE_LABELS[stat.action_type] || stat.action_type,
    value: stat.total_points,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 포인트 획득 분포 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            활동별 포인트
          </CardTitle>
          <CardDescription>
            어떤 활동으로 포인트를 획득했는지 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="포인트" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 포인트 비율 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            포인트 구성
          </CardTitle>
          <CardDescription>
            전체 포인트의 구성 비율
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 최근 포인트 획득 내역 */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            최근 포인트 획득 내역
          </CardTitle>
          <CardDescription>
            최근에 획득한 포인트 목록
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.recent_points.map((point) => (
              <div 
                key={point.id}
                className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {point.description || ACTION_TYPE_LABELS[point.action_type] || point.action_type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(point.created_at), 'PPP', { locale: ko })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    +{point.points}
                  </p>
                  <p className="text-xs text-muted-foreground">포인트</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
