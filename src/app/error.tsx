'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/error/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅
    logger.error('Global error page triggered', error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            문제가 발생했습니다
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          {error.digest && (
            <p className="mt-1 text-xs text-gray-500">
              오류 코드: {error.digest}
            </p>
          )}
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </button>
          
          <a
            href="/"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </a>
        </div>

        {/* 개발 환경에서 에러 상세 표시 */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 p-4 bg-gray-100 rounded-lg">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
              에러 상세 정보 (개발 환경)
            </summary>
            <div className="mt-2">
              <p className="text-xs text-gray-600 font-mono break-all">
                {error.message}
              </p>
              {error.stack && (
                <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
