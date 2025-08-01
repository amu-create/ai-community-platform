'use client';

import { useState, useCallback } from 'react';
import { AppError, parseApiError } from '@/lib/error';
import { logger } from '@/lib/error/logger';
import { useToast } from '@/components/ui/use-toast';

interface UseApiOptions {
  showToast?: boolean;
  onSuccess?: () => void;
  onError?: (error: AppError) => void;
}

export function useApiCall<T = any>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { toast } = useToast();

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess();
      }
      
      return result;
    } catch (err) {
      const appError = err instanceof AppError ? err : parseApiError(err);
      setError(appError);
      
      // 에러 로깅
      logger.error('API call failed', appError);
      
      // 토스트 표시
      if (options.showToast !== false) {
        toast({
          variant: 'destructive',
          title: '오류 발생',
          description: appError.message,
        });
      }
      
      if (options.onError) {
        options.onError(appError);
      }
      
      throw appError;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, options, toast]);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  };
}

// 자동 재시도 훅
export function useRetryableApiCall<T = any>(
  apiCall: () => Promise<T>,
  options: UseApiOptions & { maxRetries?: number; retryDelay?: number } = {}
) {
  const { maxRetries = 3, retryDelay = 1000, ...apiOptions } = options;
  const [retryCount, setRetryCount] = useState(0);

  const retryableApiCall = useCallback(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await apiCall();
        setRetryCount(0);
        return result;
      } catch (error) {
        lastError = error as Error;
        setRetryCount(i);
        
        if (i < maxRetries) {
          // 지수 백오프
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, i))
          );
        }
      }
    }
    
    throw lastError;
  }, [apiCall, maxRetries, retryDelay]);

  const api = useApiCall(retryableApiCall, apiOptions);

  return {
    ...api,
    retryCount,
  };
}

// 폴링 훅
export function usePollingApiCall<T = any>(
  apiCall: () => Promise<T>,
  interval: number = 5000,
  options: UseApiOptions & { enabled?: boolean } = {}
) {
  const [isPolling, setIsPolling] = useState(false);
  const api = useApiCall(apiCall, options);

  const startPolling = useCallback(() => {
    setIsPolling(true);
    
    const poll = async () => {
      if (!isPolling) return;
      
      try {
        await api.execute();
      } catch (error) {
        // 폴링 중 에러는 로그만
        logger.warn('Polling error', error as Error);
      }
      
      if (isPolling) {
        setTimeout(poll, interval);
      }
    };
    
    poll();
  }, [api, interval, isPolling]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (options.enabled && !isPolling) {
      startPolling();
    } else if (!options.enabled && isPolling) {
      stopPolling();
    }
    
    return () => {
      stopPolling();
    };
  }, [options.enabled, isPolling, startPolling, stopPolling]);

  return {
    ...api,
    isPolling,
    startPolling,
    stopPolling,
  };
}

// 무한 스크롤용 API 훅
export function useInfiniteApiCall<T = any>(
  apiCall: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: UseApiOptions = {}
) {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const api = useApiCall(() => apiCall(page), options);

  const loadMore = useCallback(async () => {
    if (!hasMore || api.isLoading) return;
    
    try {
      const result = await api.execute();
      if (result) {
        setAllData(prev => [...prev, ...result.data]);
        setHasMore(result.hasMore);
        setPage(prev => prev + 1);
      }
    } catch (error) {
      // 에러는 useApiCall에서 처리됨
    }
  }, [api, hasMore, page]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    api.reset();
  }, [api]);

  return {
    data: allData,
    loadMore,
    isLoading: api.isLoading,
    error: api.error,
    hasMore,
    reset,
  };
}

// Import useEffect
import { useEffect } from 'react';
