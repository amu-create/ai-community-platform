import Link from 'next/link'
import { Brain } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Community
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              AI 학습의 새로운 기준을 만들어가는 커뮤니티
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">플랫폼</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/resources" className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                  학습 리소스
                </Link>
              </li>
              <li>
                <Link href="/learning-paths" className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                  학습 경로
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                  커뮤니티
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">회사</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                  소개
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">법적 고지</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors">
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            &copy; 2025 AI Community Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
