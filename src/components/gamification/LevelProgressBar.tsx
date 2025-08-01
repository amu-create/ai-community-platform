'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LevelProgressBarProps {
  currentPoints: number;
  currentLevelMin: number;
  nextLevelMin: number;
  showText?: boolean;
  className?: string;
}

export function LevelProgressBar({
  currentPoints,
  currentLevelMin,
  nextLevelMin,
  showText = true,
  className,
}: LevelProgressBarProps) {
  const levelPoints = currentPoints - currentLevelMin;
  const requiredPoints = nextLevelMin - currentLevelMin;
  const progress = Math.min((levelPoints / requiredPoints) * 100, 100);

  return (
    <div className={cn('space-y-1', className)}>
      {showText && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{levelPoints.toLocaleString()} / {requiredPoints.toLocaleString()}</span>
          <span>{Math.floor(progress)}%</span>
        </div>
      )}
      <Progress value={progress} className="h-2" />
    </div>
  );
}