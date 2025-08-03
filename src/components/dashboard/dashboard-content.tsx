'use client'

import { motion } from 'framer-motion'
import { 
  BookOpen, 
  TrendingUp, 
  Users, 
  Trophy,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  Calendar,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AIRecommendations } from '@/components/ai/ai-recommendations'

const stats = [
  {
    title: '학습 시간',
    value: '24.5',
    unit: '시간',
    change: '+12%',
    trend: 'up',
    icon: Clock,
    color: 'from-purple-600 to-purple-400',
  },
  {
    title: '완료한 과정',
    value: '8',
    unit: '개',
    change: '+2',
    trend: 'up',
    icon: BookOpen,
    color: 'from-blue-600 to-blue-400',
  },
  {
    title: '커뮤니티 기여',
    value: '156',
    unit: '포인트',
    change: '+28%',
    trend: 'up',
    icon: Users,
    color: 'from-green-600 to-green-400',
  },
  {
    title: '현재 레벨',
    value: '12',
    unit: 'Lv',
    change: '다음 레벨까지 230 XP',
    trend: 'neutral',
    icon: Trophy,
    color: 'from-yellow-600 to-yellow-400',
  },
]

const recentActivities = [
  {
    id: 1,
    user: '김개발',
    action: 'PyTorch 기초 과정을 완료했습니다',
    time: '2시간 전',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  },
  {
    id: 2,
    user: '이머신',
    action: 'NLP 고급 과정에서 질문을 남겼습니다',
    time: '3시간 전',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  },
  {
    id: 3,
    user: '박딥러닝',
    action: '새로운 학습 리소스를 공유했습니다',
    time: '5시간 전',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  },
]

const upcomingTasks = [
  {
    id: 1,
    title: 'Transformer 아키텍처 이해하기',
    course: 'NLP 마스터 과정',
    deadline: '내일',
    progress: 75,
  },
  {
    id: 2,
    title: 'CNN 실습 프로젝트',
    course: '컴퓨터 비전 기초',
    deadline: '3일 후',
    progress: 30,
  },
  {
    id: 3,
    title: '강화학습 입문',
    course: 'RL 기초 과정',
    deadline: '1주일 후',
    progress: 0,
  },
]

export function DashboardContent() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          안녕하세요, 사용자님! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          오늘도 AI 학습 여정을 함께해요. 현재 진행률이 아주 좋습니다!
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-12 -mt-12`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-1">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.unit}</div>
                </div>
                <div className="flex items-center mt-2">
                  {stat.trend === 'up' && (
                    <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  {stat.trend === 'down' && (
                    <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <p className="text-xs text-muted-foreground">
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Learning Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                학습 진행 상황
              </CardTitle>
              <CardDescription>
                현재 진행 중인 과정들의 진행률입니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.course} • {task.deadline}
                      </p>
                    </div>
                    <span className="text-sm font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                최근 활동
              </CardTitle>
              <CardDescription>
                커뮤니티의 최신 소식을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.avatar} alt={activity.user} />
                      <AvatarFallback>{activity.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>님이{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Progress Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              주간 학습 통계
            </CardTitle>
            <CardDescription>
              이번 주 학습 활동을 한눈에 확인하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              <Calendar className="h-12 w-12 mr-4" />
              <div className="text-center">
                <p className="text-2xl font-bold">12시간 35분</p>
                <p className="text-sm">이번 주 총 학습 시간</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Recommendations - 새로 추가 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <AIRecommendations />
      </motion.div>
    </div>
  )
}
