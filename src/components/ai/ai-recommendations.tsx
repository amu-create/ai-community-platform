'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Sparkles,
  RefreshCw,
  ChevronRight,
  Clock,
  BarChart
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { toast } from 'sonner'
import Link from 'next/link'

interface AIRecommendation {
  topics: string[]
  categories: string[]
  action_plans: {
    title: string
    description: string
    duration: string
  }[]
  resources: {
    id: string
    title: string
    description: string
    category: string
    tags: string[]
    difficulty_level: string
    profiles: {
      username: string
      avatar_url: string | null
    }
  }[]
  learning_path?: {
    current_stage: string
    next_milestone: string
    estimated_time: string
  }
}

export function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<AIRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchRecommendations()
    }
  }, [user])

  const fetchRecommendations = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general' })
      })

      if (!response.ok) throw new Error('Failed to fetch recommendations')

      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      toast.error('추천을 불러오는데 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const refreshRecommendations = async () => {
    setRefreshing(true)
    await fetchRecommendations()
    setRefreshing(false)
    toast.success('추천이 업데이트되었습니다')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!recommendations) {
    return null
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">AI 맞춤 추천</CardTitle>
              <CardDescription>
                당신의 학습 패턴을 분석한 맞춤형 추천입니다
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRecommendations}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs defaultValue="topics" className="w-full">
          <TabsList className="w-full rounded-none border-b">
            <TabsTrigger value="topics" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              학습 주제
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex-1">
              <BookOpen className="h-4 w-4 mr-2" />
              추천 리소스
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex-1">
              <Target className="h-4 w-4 mr-2" />
              실행 계획
            </TabsTrigger>
          </TabsList>

          <TabsContent value="topics" className="p-6 space-y-4">
            <div className="space-y-3">
              {recommendations.topics?.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{topic}</h4>
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>

            {recommendations.learning_path && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg border">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  학습 경로
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">현재 단계:</span>
                    <span className="font-medium">{recommendations.learning_path.current_stage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">다음 목표:</span>
                    <span className="font-medium">{recommendations.learning_path.next_milestone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">예상 시간:</span>
                    <span className="font-medium">{recommendations.learning_path.estimated_time}</span>
                  </div>
                </div>
                <Progress value={65} className="mt-3" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="resources" className="p-6">
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {recommendations.resources?.map((resource) => (
                  <Link
                    key={resource.id}
                    href={`/resources/${resource.id}`}
                    className="block"
                  >
                    <div className="p-4 rounded-lg border hover:border-primary/50 transition-all hover:shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium line-clamp-1">{resource.title}</h4>
                        <Badge variant="secondary" className="ml-2">
                          {resource.difficulty_level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {resource.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={resource.profiles.avatar_url || '/default-avatar.png'}
                            alt={resource.profiles.username}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-xs text-muted-foreground">
                            {resource.profiles.username}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {resource.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="plan" className="p-6 space-y-4">
            {recommendations.action_plans?.map((plan, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{plan.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      {plan.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{plan.duration}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                이 계획은 AI가 당신의 학습 패턴을 분석하여 생성했습니다.
                <br />
                실행하면서 자유롭게 조정해주세요!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
