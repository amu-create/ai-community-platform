'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserLevelBadge } from './UserLevelBadge';
import { LevelProgressBar } from './LevelProgressBar';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

interface UserLevelCardProps {
  userId: string;
  username: string;
  avatarUrl?: string;
  level: number;
  totalPoints: number;
  levelProgress: number;
  levelDefinition?: {
    min_points: number;
    max_points: number | null;
    title: string;
    badge_color: string;
    perks: string[];
  };
  nextLevelDefinition?: {
    min_points: number;
    title: string;
  };
}

export function UserLevelCard({
  userId,
  username,
  avatarUrl,
  level,
  totalPoints,
  levelProgress,
  levelDefinition,
  nextLevelDefinition,
}: UserLevelCardProps) {
  const currentLevelMin = levelDefinition?.min_points || 0;
  const nextLevelMin = nextLevelDefinition?.min_points || currentLevelMin + 1000;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">레벨 & 포인트</CardTitle>
          <UserLevelBadge level={level} size="lg" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">총 포인트</span>
            <span className="font-semibold flex items-center gap-1">
              <Trophy className="h-4 w-4 text-yellow-500" />
              {totalPoints.toLocaleString()}
            </span>
          </div>
          
          <LevelProgressBar
            currentPoints={totalPoints}
            currentLevelMin={currentLevelMin}
            nextLevelMin={nextLevelMin}
          />
          
          {nextLevelDefinition && (
            <p className="text-xs text-muted-foreground text-center">
              다음 레벨까지 {(nextLevelMin - totalPoints).toLocaleString()} 포인트
            </p>
          )}
        </div>

        {levelDefinition?.perks && levelDefinition.perks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Star className="h-4 w-4" />
              레벨 혜택
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {levelDefinition.perks.map((perk, index) => (
                <li key={index} className="flex items-start gap-1">
                  <Target className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t">
          <a
            href={`/users/${userId}/achievements`}
            className="text-xs text-primary hover:underline flex items-center gap-1 justify-center"
          >
            <TrendingUp className="h-3 w-3" />
            업적 & 활동 기록 보기
          </a>
        </div>
      </CardContent>
    </Card>
  );
}