'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Trophy, TrendingUp, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

interface LevelInfo {
  level: number
  min_points: number
  max_points: number | null
  title: string
  badge_color: string
  perks: string[]
}

interface UserLevelData {
  profile: {
    id: string
    username: string
    full_name: string
    avatar_url: string
    total_points: number
    current_level: number
    level_progress: number
    level_info: LevelInfo
  }
  next_level: {
    current_level: number
    current_points: number
    points_to_next_level: number
    next_level_title: string
    progress_percentage: number
  } | null
}

interface UserLevelDisplayProps {
  userId?: string
  compact?: boolean
  showProgress?: boolean
}

export function UserLevelDisplay({ 
  userId, 
  compact = false,
  showProgress = true 
}: UserLevelDisplayProps) {
  const [levelData, setLevelData] = useState<UserLevelData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLevelData()
  }, [userId])

  const fetchLevelData = async () => {
    try {
      const url = userId 
        ? `/api/levels?userId=${userId}`
        : '/api/levels'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch level data')
      
      const data = await response.json()
      setLevelData(data)
    } catch (error) {
      console.error('Error fetching level data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  if (!levelData) return null

  const { profile, next_level } = levelData

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: profile.level_info.badge_color }}
        >
          <Trophy className="h-3 w-3" />
          <span>Lv.{profile.current_level}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {profile.level_info.title}
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border p-6 space-y-4"
    >
      {/* 레벨 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
            style={{ backgroundColor: profile.level_info.badge_color }}
          >
            {profile.current_level}
          </div>
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {profile.level_info.title}
              <Trophy className="h-5 w-5 text-yellow-500" />
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile.total_points.toLocaleString()} 포인트
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            {profile.total_points.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">총 포인트</p>
        </div>
      </div>

      {/* 진행도 */}
      {showProgress && next_level && next_level.points_to_next_level > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              다음 레벨까지
            </span>
            <span className="font-medium">
              {next_level.points_to_next_level.toLocaleString()} 포인트
            </span>
          </div>
          <Progress 
            value={next_level.progress_percentage} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground text-center">
            {next_level.next_level_title}까지 {Math.round(next_level.progress_percentage)}% 완료
          </p>
        </div>
      )}

      {/* 특전 */}
      {profile.level_info.perks && profile.level_info.perks.length > 0 && (
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            레벨 특전
          </h4>
          <ul className="space-y-1">
            {profile.level_info.perks.map((perk, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
