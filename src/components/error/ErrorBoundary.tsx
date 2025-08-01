'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/error/logger';
import { getErrorMessage, getErrorRecoveryAction } from '@/lib/error/handlers';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      // 기본 에러 UI
      return <DefaultErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

// 기본 에러 UI 컴포넌트
function DefaultErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const message = getErrorMessage(error);
  const recoveryAction = getErrorRecoveryAction(error);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="mt-4 text-xl font-semibold text-center text-gray-900 dark:text-white">
            문제가 발생했습니다
          </h1>
          
          <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
            {message}
          </p>

          {/* 개발 환경에서는 에러 스택 표시 */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-md">
              <summary className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                에러 상세 정보
              </summary>
              <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </button>

            {recoveryAction ? (
              <button
                onClick={recoveryAction.action}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {recoveryAction.label}
              </button>
            ) : (
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로 가기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 비동기 에러 바운더리
export function AsyncErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: (error: Error, reset: () => void) => ReactNode;
}) {
  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

// 페이지별 에러 바운더리
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <div className="container mx-auto px-4 py-8">
          <DefaultErrorFallback error={error} reset={reset} />
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

// 섹션별 에러 바운더리
export function SectionErrorBoundary({ 
  children,
  name 
}: { 
  children: ReactNode;
  name: string;
}) {
  return (
    <ErrorBoundary
      onError={(error) => {
        logger.error(`Error in section: ${name}`, error);
      }}
      fallback={(error, reset) => (
        <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-sm text-red-800 dark:text-red-200">
              이 섹션을 불러오는 중 문제가 발생했습니다.
            </p>
          </div>
          <button
            onClick={reset}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            다시 시도
          </button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
