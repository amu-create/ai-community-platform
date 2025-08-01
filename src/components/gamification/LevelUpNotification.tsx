'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Trophy, Star, Zap } from 'lucide-react';
import { UserLevelBadge } from './UserLevelBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LevelUpNotificationProps {
  newLevel: number;
  newTitle: string;
  perks?: string[];
  onClose?: () => void;
}

export function LevelUpNotification({
  newLevel,
  newTitle,
  perks = [],
  onClose,
}: LevelUpNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 10000); // 10초 후 자동 닫기

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className={cn(
        'relative bg-background border rounded-lg p-8 max-w-md w-full shadow-2xl transform transition-all duration-300',
        isVisible ? 'scale-100' : 'scale-95'
      )}>
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Trophy className="h-20 w-20 text-yellow-500 animate-bounce" />
                <Zap className="h-8 w-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              레벨 업!
            </h2>
            
            <div className="flex justify-center">
              <UserLevelBadge level={newLevel} title={newTitle} size="lg" />
            </div>
          </div>

          {perks.length > 0 && (
            <div className="space-y-2 text-left bg-muted/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                새로운 혜택
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                {perks.map((perk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500">•</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={onClose} className="w-full">
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}