import { Metadata } from 'next'
import { generateSEO } from '@/lib/seo/config'

export const metadata: Metadata = generateSEO({
  title: 'AI 학습 경로',
  description: '체계적인 AI 학습을 위한 맞춤형 학습 경로. 초급부터 고급까지 단계별로 구성된 커리큘럼을 제공합니다.',
  keywords: ['AI 학습 경로', 'AI 커리큘럼', 'AI 로드맵', '머신러닝 학습 계획', '딥러닝 커리큘럼'],
})
