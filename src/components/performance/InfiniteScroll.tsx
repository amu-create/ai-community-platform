'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useIntersectionObserver } from '@/lib/performance';
import { LoadingSpinner } from '@/lib/performance';

interface InfiniteScrollProps {
  children: React.ReactNode;
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  threshold?: number;
  rootMargin?: string;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onError?: () => void;
  error?: boolean;
  scrollableTarget?: string; // ID of scrollable container
  initialScrollTo?: number;
  preserveScrollPosition?: boolean;
}

export function InfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  isLoading = false,
  threshold = 0.1,
  rootMargin = '100px',
  loadingComponent,
  endMessage,
  errorComponent,
  onError,
  error = false,
  scrollableTarget,
  initialScrollTo = 0,
  preserveScrollPosition = true,
}: InfiniteScrollProps) {
  const loadMoreRef = useRef<(() => void) | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const isFirstRender = useRef(true);
  
  // 스크롤 위치 복원
  useEffect(() => {
    if (preserveScrollPosition && isFirstRender.current && initialScrollTo > 0) {
      const scrollElement = scrollableTarget 
        ? document.getElementById(scrollableTarget)
        : window;
      
      if (scrollElement) {
        if (scrollElement === window) {
          window.scrollTo(0, initialScrollTo);
        } else {
          (scrollElement as HTMLElement).scrollTop = initialScrollTo;
        }
      }
      isFirstRender.current = false;
    }
  }, [initialScrollTo, preserveScrollPosition, scrollableTarget]);
  
  // 로드 함수 래핑
  loadMoreRef.current = useCallback(() => {
    if (!isLoading && hasMore && !error) {
      onLoadMore();
    }
  }, [isLoading, hasMore, error, onLoadMore]);

  // Intersection Observer 설정
  const observerOptions = {
    threshold,
    rootMargin,
    root: scrollableTarget ? document.getElementById(scrollableTarget) : null,
  };

  const { ref, isIntersecting } = useIntersectionObserver(observerOptions);

  // 트리거가 보이면 더 로드
  useEffect(() => {
    if (isIntersecting && loadMoreRef.current) {
      loadMoreRef.current();
    }
  }, [isIntersecting]);

  // 에러 발생 시 재시도 버튼
  const ErrorRetry = () => (
    <div className="w-full py-8 text-center">
      <p className="text-red-500 mb-4">
        {errorComponent || '데이터를 불러오는 중 오류가 발생했습니다.'}
      </p>
      <button
        onClick={onError}
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        다시 시도
      </button>
    </div>
  );

  return (
    <div ref={containerRef as any}>
      {children}
      
      {/* 로딩/종료/에러 상태 */}
      <div ref={ref as any} className="w-full py-4">
        {error && onError ? (
          <ErrorRetry />
        ) : isLoading ? (
          loadingComponent || <LoadingSpinner />
        ) : (
          !hasMore && !isLoading && endMessage
        )}
      </div>
    </div>
  );
}

// 가상 스크롤 컴포넌트 (대량 데이터용)
interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number | ((index: number, item: T) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerHeight?: number | string;
  onScroll?: (scrollTop: number) => void;
  scrollToIndex?: number;
  estimatedItemSize?: number;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  className = '',
  containerHeight = 600,
  onScroll,
  scrollToIndex,
  estimatedItemSize = 100,
  getItemKey,
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const itemHeightCache = useRef<Map<number, number>>(new Map());

  // 아이템 높이 가져오기 (캐싱 포함)
  const getItemHeight = useCallback(
    (index: number) => {
      if (typeof itemHeight === 'number') return itemHeight;
      
      const cached = itemHeightCache.current.get(index);
      if (cached) return cached;
      
      const height = itemHeight(index, items[index]);
      itemHeightCache.current.set(index, height);
      return height;
    },
    [itemHeight, items]
  );

  // 특정 인덱스로 스크롤
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollElementRef.current) {
      let offsetTop = 0;
      for (let i = 0; i < scrollToIndex; i++) {
        offsetTop += getItemHeight(i);
      }
      scrollElementRef.current.scrollTop = offsetTop;
    }
  }, [scrollToIndex, getItemHeight]);

  const handleScroll = useCallback(() => {
    if (scrollElementRef.current) {
      const newScrollTop = scrollElementRef.current.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    }
  }, [onScroll]);

  // 보이는 아이템 계산
  const containerHeightNum = typeof containerHeight === 'string' 
    ? parseInt(containerHeight) 
    : containerHeight;

  const startIndex = Math.max(
    0, 
    Math.floor(scrollTop / estimatedItemSize) - overscan
  );
  
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeightNum) / estimatedItemSize) + overscan
  );

  // 정확한 위치 계산
  let accumulatedHeight = 0;
  let actualStartIndex = 0;
  let actualEndIndex = items.length;

  for (let i = 0; i < items.length; i++) {
    const height = getItemHeight(i);
    if (accumulatedHeight + height > scrollTop && actualStartIndex === 0) {
      actualStartIndex = Math.max(0, i - overscan);
    }
    if (accumulatedHeight > scrollTop + containerHeightNum) {
      actualEndIndex = Math.min(items.length, i + overscan);
      break;
    }
    accumulatedHeight += height;
  }

  const visibleItems = items.slice(actualStartIndex, actualEndIndex);
  const totalHeight = items.reduce((sum, _, i) => sum + getItemHeight(i), 0);
  
  let offsetY = 0;
  for (let i = 0; i < actualStartIndex; i++) {
    offsetY += getItemHeight(i);
  }

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = actualStartIndex + index;
            const key = getItemKey ? getItemKey(item, actualIndex) : actualIndex;
            const height = getItemHeight(actualIndex);
            
            return (
              <div key={key} style={{ height }}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}