import { generateSEO } from '@/lib/seo/config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  ...generateSEO({
    title: '소개',
    description: 'AI Community Platform은 AI를 학습하고 지식을 공유하며 함께 성장하는 커뮤니티입니다.',
  }),
}

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">AI Community Platform 소개</h1>
      
      <div className="prose prose-lg max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">우리의 미션</h2>
          <p className="text-gray-600 dark:text-gray-300">
            AI Community Platform은 모든 사람이 AI를 쉽게 배우고, 지식을 공유하며, 
            함께 성장할 수 있는 열린 공간을 만들어갑니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">주요 기능</h2>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li>• 체계적인 AI 학습 경로 제공</li>
            <li>• 실시간 커뮤니티 지원 및 멘토링</li>
            <li>• 최신 AI 트렌드와 리소스 공유</li>
            <li>• 레벨 시스템을 통한 성장 추적</li>
            <li>• AI 프로젝트 협업 공간</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">커뮤니티 가치</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">개방성</h3>
              <p className="text-gray-600 dark:text-gray-300">
                모든 수준의 학습자를 환영합니다
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">공유</h3>
              <p className="text-gray-600 dark:text-gray-300">
                지식은 나눌수록 커집니다
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">성장</h3>
              <p className="text-gray-600 dark:text-gray-300">
                함께 배우고 성장합니다
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">혁신</h3>
              <p className="text-gray-600 dark:text-gray-300">
                새로운 아이디어를 실현합니다
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">문의하기</h2>
          <p className="text-gray-600 dark:text-gray-300">
            궁금한 점이나 제안사항이 있으시면 언제든지 연락주세요.
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            이메일: contact@aicommunity.com
          </p>
        </section>
      </div>
    </div>
  )
}
