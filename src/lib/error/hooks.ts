'use client';

import { useState, useCallback, useEffect } from 'react';
import { AppError, parseApiError } from '@/lib/error';
import { logger } from '@/lib/error/logger';
import { useRouter } from 'next/navigation';

// API 에러 처리 훅
export function useApiError() {
  const [error, setError] = useState<AppError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleError = useCallback((error: unknown) => {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else if (error instanceof Error) {
      appError = new AppError(error.message);
    } else if (typeof error === 'object' && error !== null) {
      appError = parseApiError(error);
    } else {
      appError = new AppError('알 수 없는 오류가 발생했습니다');
    }

    setError(appError);

    // 인증 에러의 경우 로그인 페이지로 리디렉션
    if (appError.code === 'AUTHENTICATION_ERROR') {
      router.push(`/auth/signin?redirect=${window.location.pathname}`);
    }

    // 에러 로깅
    logger.error('API Error in component', appError);

    return appError;
  }, [router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const execute = useCallback(async <T,>(
    promise: Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await promise;
      return result;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    execute,
  };
}

// 에러 토스트 훅
export function useErrorToast() {
  const showError = useCallback((message: string, duration: number = 5000) => {
    // 토스트 라이브러리가 있다면 사용, 없으면 기본 alert
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message);
    }
    
    logger.warn('Error toast shown', { message });
  }, []);

  const showApiError = useCallback((error: AppError) => {
    showError(error.message);
  }, [showError]);

  return { showError, showApiError };
}

// 글로벌 에러 핸들러 훅
export function useGlobalErrorHandler() {
  useEffect(() => {
    // 처리되지 않은 Promise 거부 처리
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', event.reason as Error);
      event.preventDefault();
    };

    // 글로벌 에러 처리
    const handleError = (event: ErrorEvent) => {
      logger.error('Global error', new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
}

// 재시도 로직 훅
export function useRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    onRetry,
  } = options;

  const retry = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      let lastError: Error;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await fn(...args);
        } catch (error) {
          lastError = error as Error;

          if (attempt < maxRetries) {
            const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
            
            if (onRetry) {
              onRetry(attempt + 1, lastError);
            }

            logger.info(`Retrying after ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
            
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      throw lastError!;
    },
    [fn, maxRetries, delay, backoff, onRetry]
  );

  return retry;
}

// 에러 복구 훅
export function useErrorRecovery() {
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 3;

  const canRecover = attempts < maxAttempts;

  const recover = useCallback(() => {
    if (canRecover) {
      setAttempts(prev => prev + 1);
      window.location.reload();
    }
  }, [canRecover]);

  const reset = useCallback(() => {
    setAttempts(0);
  }, []);

  return {
    attempts,
    canRecover,
    recover,
    reset,
  };
}
