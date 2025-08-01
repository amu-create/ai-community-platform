import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// 로딩 컴포넌트
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const LoadingSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
);

// 동적 임포트 헬퍼
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || LoadingSpinner,
    ssr: options?.ssr ?? true,
  });
}

// 이미지 레이지 로딩을 위한 Intersection Observer 훅
import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return { ref, isIntersecting };
}

// 디바운스 훅
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 쓰로틀 훅
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeElapsed = now - lastUpdated.current;

    if (timeElapsed >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - timeElapsed);

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}
