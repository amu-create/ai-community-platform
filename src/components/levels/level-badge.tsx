'use client'

import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LevelBadgeProps {
  level: number
  title: string
  color: string
  size?: 'sm' | 'md' | 'lg'
  showTitle?: boolean
  className?: string
}

export function LevelBadge({ 
  level, 
  title, 
  color, 
  size = 'md',
  showTitle = true,
  className 
}: LevelBadgeProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-12 w-12 text-base'
  }

  const badgeSizeClasses = {
    sm: 'gap-1 px-2 py-0.5 text-xs',
    md: 'gap-1.5 px-3 py-1 text-sm',
    lg: 'gap-2 px-4 py-1.5 text-base'
  }

  return (
    <div 
      className={cn(
        "inline-flex items-center rounded-full font-medium text-white",
        badgeSizeClasses[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      <Trophy className={cn("shrink-0", sizeClasses[size])} />
      <span>Lv.{level}</span>
      {showTitle && <span className="opacity-90">{title}</span>}
    </div>
  )
}
