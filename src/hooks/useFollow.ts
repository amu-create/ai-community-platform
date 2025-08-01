import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseFollowProps {
  userId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function useFollow({ userId, initialIsFollowing = false, onFollowChange }: UseFollowProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 팔로우 상태 확인
  useEffect(() => {
    if (!userId) return;

    const checkFollowStatus = async () => {
      try {
        const response = await fetch(`/api/follows/check?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error('팔로우 상태 확인 실패:', error);
      }
    };

    checkFollowStatus();
  }, [userId]);

  const toggleFollow = async () => {
    if (isLoading) return;

    setIsLoading(true);
    const previousState = isFollowing;

    try {
      if (isFollowing) {
        // 언팔로우
        const response = await fetch(`/api/follows?followingId=${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('언팔로우 실패');
        }

        setIsFollowing(false);
        onFollowChange?.(false);
        toast({
          title: '언팔로우했습니다',
          description: '더 이상 이 사용자의 활동을 팔로우하지 않습니다.',
        });
      } else {
        // 팔로우
        const response = await fetch('/api/follows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ followingId: userId }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || '팔로우 실패');
        }

        setIsFollowing(true);
        onFollowChange?.(true);
        toast({
          title: '팔로우했습니다',
          description: '이제 이 사용자의 활동을 팔로우합니다.',
        });
      }
    } catch (error) {
      setIsFollowing(previousState);
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '처리 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    isLoading,
    toggleFollow,
  };
}