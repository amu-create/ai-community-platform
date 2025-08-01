import Link from 'next/link';
import { AlertCircle, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          
          <h1 className="mt-6 text-6xl font-bold text-gray-900 dark:text-white">
            404
          </h1>
          
          <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
            페이지를 찾을 수 없습니다
          </h2>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 가기
            </Link>

            <Link
              href="/search"
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Search className="w-4 h-4 mr-2" />
              검색하기
            </Link>
          </div>

          {/* 인기 페이지 링크 */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              인기 페이지
            </p>
            <div className="space-y-2">
              <Link
                href="/resources"
                className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                AI 리소스
              </Link>
              <Link
                href="/posts"
                className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                커뮤니티 게시판
              </Link>
              <Link
                href="/dashboard"
                className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                대시보드
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
