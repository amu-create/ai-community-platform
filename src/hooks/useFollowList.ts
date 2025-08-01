import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}

interface UseFollowListProps {
  userId: string;
  type: 'followers' | 'following';
  pageSize?: number;
}

interface FollowListResult {
  users: User[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useFollowList({ userId, type, pageSize = 20 }: UseFollowListProps): FollowListResult {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const fetchFollowList = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/follows?userId=${userId}&type=${type}&page=${pageNum}&limit=${pageSize}`
      );

      if (!response.ok) {
        throw new Error('팔로우 목록을 불러올 수 없습니다');
      }

      const data = await response.json();
      
      if (append) {
        setUsers(prev => [...prev, ...data.data]);
      } else {
        setUsers(data.data);
      }
      
      setTotalPages(data.totalPages);
      setHasMore(pageNum < data.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다';
      setError(message);
      toast({
        title: '오류',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, type, pageSize, toast]);

  useEffect(() => {
    fetchFollowList(1);
  }, [fetchFollowList]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFollowList(nextPage, true);
    }
  }, [isLoading, hasMore, page, fetchFollowList]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchFollowList(1);
  }, [fetchFollowList]);

  return {
    users,
    isLoading,
    error,
    page,
    totalPages,
    hasMore,
    loadMore,
    refresh,
  };
}