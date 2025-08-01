'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              심각한 오류가 발생했습니다
            </h1>
            <p className="text-gray-600 mb-6">
              애플리케이션에 심각한 문제가 발생했습니다. 
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <div className="space-y-3">
              <button
                onClick={reset}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                홈으로 가기
              </button>
            </div>
            {error.digest && (
              <p className="mt-4 text-xs text-gray-500 text-center">
                오류 ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
