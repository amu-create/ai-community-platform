'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UseInfiniteScrollOptions<T> {
  initialData: T[];
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  pageSize?: number;
  dependencies?: any[];
  onError?: (error: Error) => void;
  storeScrollPosition?: boolean;
}

export function useInfiniteScroll<T>({
  initialData,
  fetchMore,
  pageSize = 20,
  dependencies = [],
  onError,
  storeScrollPosition = true,
}: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const router = useRouter();

  // 스크롤 위치 저장 및 복원
  useEffect(() => {
    if (!storeScrollPosition) return;

    // 컴포넌트가 마운트될 때 저장된 스크롤 위치 복원
    const savedPosition = sessionStorage.getItem('scroll-position');
    if (savedPosition) {
      const { path, position } = JSON.parse(savedPosition);
      if (path === window.location.pathname) {
        window.scrollTo(0, position);
      }
      sessionStorage.removeItem('scroll-position');
    }

    // 언마운트 시 스크롤 위치 저장
    return () => {
      sessionStorage.setItem(
        'scroll-position',
        JSON.stringify({
          path: window.location.pathname,
          position: window.scrollY,
        })
      );
    };
  }, [storeScrollPosition]);

  // 의존성이 변경되면 리셋
  useEffect(() => {
    setItems(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [...dependencies, initialData]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || error) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const { data, hasMore: moreAvailable } = await fetchMore(nextPage);

      if (!isMountedRef.current) return;

      if (data.length === 0) {
        setHasMore(false);
      } else {
        setItems((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(moreAvailable && data.length === pageSize);
      }
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const error = err as Error;
      setError(error);
      onError?.(error);
      console.error('Failed to load more items:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [page, hasMore, isLoading, error, fetchMore, pageSize, onError]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, hasMore: moreAvailable } = await fetchMore(1);
      
      if (!isMountedRef.current) return;
      
      setItems(data);
      setPage(1);
      setHasMore(moreAvailable && data.length === pageSize);
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchMore, pageSize, onError]);

  const retry = useCallback(() => {
    setError(null);
    loadMore();
  }, [loadMore]);

  return {
    items,
    hasMore,
    isLoading,
    error,
    loadMore,
    refresh,
    retry,
    setItems,
  };
}

// 가상 스크롤을 위한 훅
interface UseVirtualScrollOptions {
  itemCount: number;
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  overscan?: number;
  scrollElement?: HTMLElement | null;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
  scrollElement,
}: UseVirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = scrollElement || window;
    scrollElementRef.current = element as HTMLElement;

    const handleScroll = () => {
      const top = element === window 
        ? window.scrollY 
        : (element as HTMLElement).scrollTop;
      setScrollTop(top);
    };

    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [scrollElement]);

  const getItemHeight = useCallback(
    (index: number) => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );

  // 보이는 아이템 범위 계산
  const calculateVisibleRange = useCallback(() => {
    let accumulatedHeight = 0;
    let startIndex = 0;
    let endIndex = itemCount - 1;

    // 시작 인덱스 찾기
    for (let i = 0; i < itemCount; i++) {
      const height = getItemHeight(i);
      if (accumulatedHeight + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      accumulatedHeight += height;
    }

    // 끝 인덱스 찾기
    accumulatedHeight = 0;
    for (let i = startIndex; i < itemCount; i++) {
      if (accumulatedHeight > scrollTop + containerHeight) {
        endIndex = Math.min(itemCount - 1, i + overscan);
        break;
      }
      accumulatedHeight += getItemHeight(i);
    }

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemCount, overscan, getItemHeight]);

  const { startIndex, endIndex } = calculateVisibleRange();

  // 전체 높이 계산
  const totalHeight = Array.from({ length: itemCount }, (_, i) => 
    getItemHeight(i)
  ).reduce((sum, height) => sum + height, 0);

  // 오프셋 계산
  const offsetY = Array.from({ length: startIndex }, (_, i) => 
    getItemHeight(i)
  ).reduce((sum, height) => sum + height, 0);

  return {
    visibleRange: [startIndex, endIndex] as const,
    totalHeight,
    offsetY,
    scrollTop,
  };
}
