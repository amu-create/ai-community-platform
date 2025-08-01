'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UserLevelBadgeProps {
  level: number;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  className?: string;
}

const levelColors = {
  1: { bg: 'bg-gray-500', text: 'text-white', border: 'border-gray-600' },
  2: { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600' },
  3: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600' },
  4: { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
  5: { bg: 'bg-yellow-500', text: 'text-white', border: 'border-yellow-600' },
  6: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
  7: { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600' },
  8: { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600' },
};

const levelTitles = {
  1: 'AI 초보자',
  2: 'AI 탐험가',
  3: 'AI 학습자',
  4: 'AI 실무자',
  5: 'AI 전문가',
  6: 'AI 마스터',
  7: 'AI 구루',
  8: 'AI 레전드',
};

export function UserLevelBadge({
  level,
  title,
  size = 'md',
  showTitle = true,
  className,
}: UserLevelBadgeProps) {
  const colors = levelColors[level as keyof typeof levelColors] || levelColors[1];
  const displayTitle = title || levelTitles[level as keyof typeof levelTitles] || 'AI 초보자';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      className={cn(
        colors.bg,
        colors.text,
        colors.border,
        'border font-semibold',
        sizeClasses[size],
        className
      )}
      variant="default"
    >
      Lv.{level}
      {showTitle && <span className="ml-1">{displayTitle}</span>}
    </Badge>
  );
}