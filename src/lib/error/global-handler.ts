'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/error/logger';
import { AppError } from '@/lib/errors';

// 전역 에러 핸들러 설정
export function useGlobalErrorHandler() {
  useEffect(() => {
    // 처리되지 않은 Promise 거부 처리
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      logger.error('Unhandled Promise Rejection', error, {
        type: 'unhandledRejection',
        promise: event.promise.toString(),
      });

      // 개발 환경에서는 기본 동작 유지
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
        
        // 사용자에게 알림
        if (error instanceof AppError && error.isOperational) {
          // 운영상 에러는 토스트로 표시
          showErrorToast(error.message);
        } else {
          // 시스템 에러는 일반적인 메시지
          showErrorToast('문제가 발생했습니다. 페이지를 새로고침해주세요.');
        }
      }
    };

    // 처리되지 않은 에러 처리
    const handleError = (event: ErrorEvent) => {
      logger.error('Unhandled Error', new Error(event.message), {
        type: 'unhandledError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });

      // 개발 환경에서는 기본 동작 유지
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
        showErrorToast('예상치 못한 오류가 발생했습니다.');
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
}

// 에러 토스트 표시 (실제 구현은 토스트 라이브러리 사용)
function showErrorToast(message: string) {
  // TODO: 실제 토스트 라이브러리로 교체
  console.error('Error Toast:', message);
  
  // 임시 alert
  if (typeof window !== 'undefined') {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }
}

// API 클라이언트용 에러 처리
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      
      if (errorData.error) {
        throw new AppError(
          errorData.error.message || '서버 오류가 발생했습니다',
          errorData.error.statusCode || response.status,
          true,
          errorData.error.code,
          errorData.error.details
        );
      }
    }
    
    throw new AppError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.status < 500
    );
  }
  
  return response.json();
}

// 에러 리포팅 (Sentry 등 외부 서비스 연동용)
export function reportError(error: Error, context?: Record<string, any>) {
  // 프로덕션 환경에서만 리포팅
  if (process.env.NODE_ENV === 'production') {
    // TODO: Sentry 등 에러 리포팅 서비스 연동
    logger.error('Error reported to monitoring service', error, context);
  }
}

// 네트워크 에러 재시도 로직
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    factor = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // 재시도 불가능한 에러는 바로 throw
      if (error instanceof AppError && error.statusCode < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(lastError, attempt);
        }
        
        logger.warn(`Retrying after error (attempt ${attempt}/${maxRetries})`, {
          error: lastError.message,
          delay,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }
  }

  throw lastError!;
}
