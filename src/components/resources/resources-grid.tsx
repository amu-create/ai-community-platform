'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, BookOpen, Video, FileText, Link2, Star, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Resource {
  id: string
  title: string
  description: string
  type: 'article' | 'video' | 'course' | 'tool'
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  views: number
  duration?: string
  author: string
  authorAvatar: string
  createdAt: Date
  tags: string[]
  isFavorite: boolean
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'PyTorch로 시작하는 딥러닝 입문',
    description: '초보자를 위한 PyTorch 기초부터 실전까지 완벽 가이드',
    type: 'course',
    category: 'Deep Learning',
    level: 'beginner',
    rating: 4.8,
    views: 1523,
    duration: '8시간',
    author: '김교수',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kim',
    createdAt: new Date('2025-07-15'),
    tags: ['PyTorch', '딥러닝', '신경망'],
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Transformer 아키텍처 완벽 이해',
    description: 'Attention is All You Need 논문부터 최신 트렌드까지',
    type: 'article',
    category: 'NLP',
    level: 'advanced',
    rating: 4.9,
    views: 892,
    author: '이연구원',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee',
    createdAt: new Date('2025-07-20'),
    tags: ['Transformer', 'NLP', 'Attention'],
    isFavorite: false,
  },
  {
    id: '3',
    title: 'LangChain 실전 활용법',
    description: 'LLM을 활용한 애플리케이션 개발 가이드',
    type: 'video',
    category: 'LLM',
    level: 'intermediate',
    rating: 4.7,
    views: 2341,
    duration: '45분',
    author: '박개발',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=park',
    createdAt: new Date('2025-07-25'),
    tags: ['LangChain', 'LLM', 'ChatGPT'],
    isFavorite: true,
  },
]

const typeIcons = {
  article: FileText,
  video: Video,
  course: BookOpen,
  tool: Link2,
}

const typeColors = {
  article: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  video: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  course: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  tool: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
}

const levelColors = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
}

export function ResourcesGrid() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedSort, setSelectedSort] = useState<string>('popular')

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          학습 리소스
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          AI 학습에 필요한 최고의 리소스를 찾아보세요
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="리소스 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            필터
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="타입" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 타입</SelectItem>
              <SelectItem value="article">아티클</SelectItem>
              <SelectItem value="video">비디오</SelectItem>
              <SelectItem value="course">강좌</SelectItem>
              <SelectItem value="tool">도구</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="레벨" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 레벨</SelectItem>
              <SelectItem value="beginner">초급</SelectItem>
              <SelectItem value="intermediate">중급</SelectItem>
              <SelectItem value="advanced">고급</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">인기순</SelectItem>
              <SelectItem value="recent">최신순</SelectItem>
              <SelectItem value="rating">평점순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-1" />
            트렌딩
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="h-4 w-4 mr-1" />
            즐겨찾기
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-1" />
            최근 본
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* Resources Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockResources.map((resource, index) => {
              const TypeIcon = typeIcons[resource.type]
              
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${typeColors[resource.type]}`}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Star
                            className={`h-4 w-4 ${
                              resource.isFavorite
                                ? 'fill-yellow-500 text-yellow-500'
                                : ''
                            }`}
                          />
                        </Button>
                      </div>
                      <CardTitle className="line-clamp-2 mt-3">
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className={levelColors[resource.level]}>
                          {resource.level === 'beginner' && '초급'}
                          {resource.level === 'intermediate' && '중급'}
                          {resource.level === 'advanced' && '고급'}
                        </Badge>
                        <Badge variant="secondary">
                          {resource.category}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span>{resource.rating}</span>
                        </div>
                        <span>{resource.views.toLocaleString()} 조회</span>
                        {resource.duration && (
                          <span>{resource.duration}</span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="flex items-center gap-2 w-full">
                        <img
                          src={resource.authorAvatar}
                          alt={resource.author}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="text-sm text-muted-foreground">
                          {resource.author}
                        </span>
                        <span className="text-sm text-muted-foreground ml-auto">
                          {new Date(resource.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
